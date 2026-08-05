"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { useCapabilities } from "@/config/access";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useApplicantPhotograph } from "@/modules/admin/applicants/photograph";
import { documentsApi } from "../documents.api";
import { canSeeFamily } from "../documents.families";
import {
  documentQueryKeys,
  documentWorkspacesKey,
  documentsByApplicantPrefix,
} from "../documents.queryKeys";
import { DocumentUnavailable } from "../components/DocumentUnavailable";
import { useSignatures } from "../hooks/useSignatures";
import { getDefaultDocumentContent } from "../utils/defaultDocumentContent";
import { getDefaultLabel } from "../documentTypeConfig";
import { confirmLeaveWithUnsavedChanges } from "../hooks/useUnsavedChangesGuard";
import { isEditableStatus } from "../documents.status";
import type {
  DocumentEditorContextValue,
  DocumentReadOnlyReason,
} from "./DocumentEditorProvider.types";
import type {
  Document,
  DocumentContent,
  DocumentStatusValue,
  DocumentType,
} from "../documents.types";

const DocumentEditorContext = createContext<DocumentEditorContextValue | null>(
  null,
);

export function useDocumentEditor() {
  const ctx = useContext(DocumentEditorContext);
  if (!ctx) {
    throw new Error(
      "useDocumentEditor must be used within DocumentEditorProvider",
    );
  }
  return ctx;
}

interface DocumentEditorProviderProps {
  /** Applicant workspace mode — lists every live document for one applicant. */
  applicantId?: string | null;
  /** Standalone mode — a single document with no applicant owner. */
  standaloneDocumentId?: string | null;
  children: ReactNode;
}

/**
 * Loads a workspace's documents (or a single standalone document) and owns every editor
 * mutation. The backend list omits `content`, so the workspace query fetches each document's
 * detail — workspaces are per-applicant and small (`documents/INTEGRATION.md` §4).
 */
export function DocumentEditorProvider({
  applicantId = null,
  standaloneDocumentId = null,
  children,
}: DocumentEditorProviderProps) {
  const queryClient = useQueryClient();
  const printableContentRef = useRef<HTMLDivElement>(null);
  const isStandalone = !applicantId && !!standaloneDocumentId;

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(
    standaloneDocumentId,
  );
  const [activeHistoricalLog, setActiveHistoricalLog] =
    useState<DocumentEditorContextValue["activeHistoricalLog"]>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<DocumentType | null>(
    null,
  );
  const [editFieldsModalOpen, setEditFieldsModalOpen] = useState(false);
  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [hasPendingEdits, setHasPendingEdits] = useState(false);

  const capabilities = useCapabilities();
  const canEdit = capabilities.documentWrite;

  // The family scope is part of the key: a viewer who may not see the bank
  // families gets a different document set, and without this an admin and a staff
  // session in the same tab after a re-login would share one cache entry.
  const scope = { bankFamilies: capabilities.documentBankFamilies };
  const scopeKey = applicantId
    ? documentQueryKeys.list({ applicant: applicantId, ...scope })
    : documentQueryKeys.list({
        standalone: standaloneDocumentId ?? "",
        ...scope,
      });

  const documentsQuery = useQuery({
    queryKey: scopeKey,
    queryFn: async (): Promise<Document[]> => {
      if (applicantId) {
        const items = await documentsApi.listByApplicant(applicantId);
        // Filter BEFORE the detail fetches: this both hides the pages and avoids
        // issuing N requests that a scoped viewer would be refused anyway.
        const visible = items.filter((item) =>
          canSeeFamily(capabilities, item.family),
        );
        return Promise.all(visible.map((item) => documentsApi.get(item.id)));
      }
      if (standaloneDocumentId) {
        const doc = await documentsApi.get(standaloneDocumentId);
        // A disallowed family reads as "not found", never as "exists but hidden" —
        // the distinction is itself the disclosure.
        return canSeeFamily(capabilities, doc.family) ? [doc] : [];
      }
      return [];
    },
  });
  const documents = useMemo(
    () => documentsQuery.data ?? [],
    [documentsQuery.data],
  );
  const isLoadingDocuments = documentsQuery.isLoading;

  const summaryQuery = useQuery({
    queryKey: ["documents", "applicant-summary", applicantId],
    queryFn: () => documentsApi.fetchApplicantSummary(applicantId as string),
    enabled: !!applicantId,
  });
  // The photograph is a file, not a field on the applicant, so it is resolved
  // alongside the summary rather than inside it and merged here. Every template
  // that prints a portrait reads it from `studentFullData`, so this is the one
  // place the editor fetches it.
  const photograph = useApplicantPhotograph(applicantId);
  const studentFullData = useMemo(
    () =>
      summaryQuery.data
        ? { ...summaryQuery.data, photoUrl: photograph.url ?? undefined }
        : null,
    [summaryQuery.data, photograph.url],
  );

  const { data: signatures = [] } = useSignatures();

  const activeDocument = useMemo(
    () => documents.find((d) => d.id === activeDocumentId) ?? null,
    [documents, activeDocumentId],
  );

  const documentsRef = useRef(documents);
  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  // Every document write invalidates the same two DERIVED views: the workspaces
  // roll-up, and the per-applicant list rows that the applicant-detail Documents
  // panel and the applicants list's OpenDocumentButton share. Missing the second
  // one leaves that button telling an operator an applicant has no documents
  // seconds after they created the first.
  const invalidateDerivedViews = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: documentWorkspacesKey() });
    if (applicantId) {
      queryClient.invalidateQueries({
        queryKey: documentsByApplicantPrefix(applicantId),
      });
    }
  }, [queryClient, applicantId]);

  const writeDocumentToCache = useCallback(
    (updated: Document) => {
      queryClient.setQueryData(scopeKey, (old: Document[] | undefined) =>
        old?.map((d) => (d.id === updated.id ? updated : d)),
      );
    },
    [queryClient, scopeKey],
  );

  const appendDocumentToCache = useCallback(
    (doc: Document) => {
      queryClient.setQueryData(scopeKey, (old: Document[] | undefined) => {
        if (!old) return [doc];
        if (old.some((d) => d.id === doc.id)) return old;
        return [...old, doc];
      });
      setActiveDocumentId(doc.id);
    },
    [queryClient, scopeKey],
  );

  // ── Content updates ──────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: DocumentContent }) =>
      documentsApi.update(id, { content }),
    onSuccess: (doc) => {
      writeDocumentToCache(doc);
      invalidateDerivedViews();
      setHasPendingEdits(false);
    },
    onError: (error) => {
      notifications.show({
        title: "Could not save changes",
        message: getApiErrorMessage(error),
        color: "red",
      });
    },
  });

  const updateDocumentContent = useCallback(
    (documentId: string, content: DocumentContent) => {
      if (!canEdit) return;
      const doc = documentsRef.current.find((d) => d.id === documentId);
      if (!doc) return;
      setHasPendingEdits(true);
      // `content` replaces WHOLESALE — the complete object is sent every save.
      updateMutation.mutate({ id: documentId, content });
    },
    [updateMutation, canEdit],
  );

  // Render-only content update (bank Customizations panel): reflect in the local cache so the
  // preview/print pick it up, but never persist.
  const updateDocumentContentLocal = useCallback(
    (documentId: string, content: DocumentContent) => {
      const doc = documentsRef.current.find((d) => d.id === documentId);
      if (!doc) return;
      writeDocumentToCache({ ...doc, content });
    },
    [writeDocumentToCache],
  );

  // ── Create ────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: documentsApi.create,
    onSuccess: (doc) => {
      appendDocumentToCache(doc);
      invalidateDerivedViews();
      notifications.show({
        title: "Page added",
        message: doc.label,
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Failed to add page",
        message: getApiErrorMessage(error),
        color: "red",
      });
    },
  });

  const familyForType = useCallback((type: DocumentType) => {
    if (type.startsWith("bank-"))
      return type.endsWith("-statement")
        ? ("bank_statement" as const)
        : ("bank_certificate" as const);
    if (type.startsWith("woda-")) return "woda" as const;
    if (type.startsWith("lor-")) return "lor" as const;
    if (type.startsWith("moi-")) return "moi" as const;
    return "student" as const;
  }, []);

  const quickCreateDocument = useCallback(
    (type: DocumentType) => {
      if (!canEdit || !applicantId) return;
      createMutation.mutate({
        applicantId,
        family: familyForType(type),
        templateKey: type,
        label: getDefaultLabel(type),
        content: getDefaultDocumentContent(type),
      });
    },
    [createMutation, applicantId, familyForType, canEdit],
  );

  const createDocumentWithContent = useCallback(
    (type: DocumentType, content: DocumentContent, label?: string) => {
      if (!canEdit || !applicantId) return;
      createMutation.mutate({
        applicantId,
        family: familyForType(type),
        templateKey: type,
        label: label ?? getDefaultLabel(type),
        content,
      });
    },
    [createMutation, applicantId, familyForType, canEdit],
  );

  const addDocumentToList = useCallback(
    (doc: Document) => appendDocumentToCache(doc),
    [appendDocumentToCache],
  );

  // A bank certificate and statement are created together. No DELETE exists, so a failed
  // statement rolls the certificate back by archiving it (with a reason) rather than deleting.
  const createBankPairMutation = useMutation({
    mutationFn: async (slugKey: string) => {
      if (!applicantId) throw new Error("Bank pairs require an applicant");
      const certificateType = `bank-${slugKey}-certificate` as DocumentType;
      const statementType = `bank-${slugKey}-statement` as DocumentType;
      const certificate = await documentsApi.create({
        applicantId,
        family: "bank_certificate",
        templateKey: certificateType,
        label: getDefaultLabel(certificateType),
        content: getDefaultDocumentContent(certificateType),
      });
      try {
        const statement = await documentsApi.create({
          applicantId,
          family: "bank_statement",
          templateKey: statementType,
          label: getDefaultLabel(statementType),
          content: getDefaultDocumentContent(statementType),
        });
        return { certificate, statement };
      } catch (error) {
        await documentsApi
          .archive(
            certificate.id,
            "Automatic rollback: bank pair creation failed",
          )
          .catch(() => {});
        throw error;
      }
    },
    onSuccess: ({ certificate, statement }) => {
      appendDocumentToCache(certificate);
      appendDocumentToCache(statement);
      setActiveDocumentId(certificate.id);
      invalidateDerivedViews();
      notifications.show({
        title: "Bank pages added",
        message: `${certificate.label} & ${statement.label}`,
        color: "green",
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: scopeKey });
      notifications.show({
        title: "Failed to add bank pages",
        message: "Please try again.",
        color: "red",
      });
    },
  });

  const createBankPair = useCallback(
    (slugKey: string) => {
      if (!canEdit) return;
      createBankPairMutation.mutate(slugKey);
    },
    [createBankPairMutation, canEdit],
  );

  // ── Status / archive / restore ──────────────────────────────────────────

  const statusMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: DocumentStatusValue }) =>
      documentsApi.changeStatus(id, value),
    onSuccess: (updated) => {
      writeDocumentToCache(updated);
      invalidateDerivedViews();
    },
    onError: (error) => {
      notifications.show({
        title: "Action not allowed",
        message: getApiErrorMessage(error),
        color: "red",
      });
    },
  });

  const setDocumentStatus = useCallback(
    (value: DocumentStatusValue) => {
      if (!canEdit || !activeDocumentId) return;
      statusMutation.mutate({ id: activeDocumentId, value });
    },
    [statusMutation, activeDocumentId, canEdit],
  );

  const archiveMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      documentsApi.archive(id, reason),
    onSuccess: (updated) => {
      writeDocumentToCache(updated);
      invalidateDerivedViews();
      notifications.show({
        title: "Document archived",
        message: updated.label,
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Could not archive",
        message: getApiErrorMessage(error),
        color: "red",
      });
    },
  });

  const archiveActiveDocument = useCallback(
    (reason: string) => {
      if (!canEdit || !activeDocumentId) return;
      archiveMutation.mutate({ id: activeDocumentId, reason });
    },
    [archiveMutation, activeDocumentId, canEdit],
  );

  const restoreMutation = useMutation({
    mutationFn: (id: string) => documentsApi.restore(id),
    onSuccess: (updated) => {
      writeDocumentToCache(updated);
      invalidateDerivedViews();
      notifications.show({
        title: "Document restored",
        message: updated.label,
        color: "green",
      });
    },
  });

  const restoreActiveDocument = useCallback(() => {
    if (!canEdit || !activeDocumentId) return;
    restoreMutation.mutate(activeDocumentId);
  }, [restoreMutation, activeDocumentId, canEdit]);

  // ── Selection / modals / unsaved-changes ─────────────────────────────────

  useEffect(() => {
    if (documents.length > 0 && !activeDocumentId) {
      const cert = documents.find((d) => d.type === "student-certificate");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveDocumentId(cert?.id ?? documents[0].id);
    }
  }, [documents, activeDocumentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveHistoricalLog(null);
  }, [activeDocumentId]);

  const openCreateModal = useCallback(
    (type: DocumentType) => {
      if (!canEdit) return;
      setCreateModalType(type);
      setCreateModalOpen(true);
    },
    [canEdit],
  );

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    setCreateModalType(null);
  }, []);

  // Opening is a write affordance; closing must always work, or a reader could be
  // trapped in a modal that opened before their capability resolved.
  const setEditFieldsModalOpenGuarded = useCallback(
    (open: boolean) => {
      if (open && !canEdit) return;
      setEditFieldsModalOpen(open);
    },
    [canEdit],
  );

  const markUnsavedChanges = useCallback(() => setHasPendingEdits(true), []);

  const hasUnsavedChanges = hasPendingEdits || updateMutation.isPending;

  const confirmLeave = useCallback(
    (onConfirm: () => void) => {
      if (!hasUnsavedChanges) {
        onConfirm();
        return;
      }
      confirmLeaveWithUnsavedChanges(onConfirm);
    },
    [hasUnsavedChanges],
  );

  const beginPrintAll = useCallback(() => setIsPrintingAll(true), []);
  const endPrintAll = useCallback(() => setIsPrintingAll(false), []);

  // ── The one read-only decision ───────────────────────────────────────────
  //
  // Role, status and history stay separate INPUTS; this is the only place they
  // are combined. `activeDocument.isEditable` is the server's own opinion — folding
  // it in here finally gives that mapped-but-unused field a job, and means a backend
  // that starts refusing edits needs no frontend change.
  const isActiveDocumentEditable =
    canEdit &&
    !!activeDocument &&
    !activeHistoricalLog &&
    isEditableStatus(activeDocument.status) &&
    activeDocument.isEditable !== false;

  // Precedence is deliberate: "you have view-only access" outranks "this document is
  // archived", because it is the fact that would still hold on a live document.
  const readOnlyReason: DocumentReadOnlyReason = !canEdit
    ? "role"
    : activeHistoricalLog
      ? "historical"
      : activeDocument && !isEditableStatus(activeDocument.status)
        ? "archived"
        : null;

  const value: DocumentEditorContextValue = {
    applicantId,
    canEdit,
    isActiveDocumentEditable,
    readOnlyReason,
    isStandalone,
    studentFullData,
    documents,
    isLoadingDocuments,
    activeDocumentId,
    activeDocument,
    setActiveDocumentId,
    activeHistoricalLog,
    setActiveHistoricalLog,
    signatures,
    createModalOpen,
    createModalType,
    openCreateModal,
    closeCreateModal,
    editFieldsModalOpen,
    setEditFieldsModalOpen: setEditFieldsModalOpenGuarded,
    updateDocumentContent,
    updateDocumentContentLocal,
    addDocumentToList,
    quickCreateDocument,
    createDocumentWithContent,
    createBankPair,
    isCreatingDocument:
      createMutation.isPending || createBankPairMutation.isPending,
    setDocumentStatus,
    archiveActiveDocument,
    restoreActiveDocument,
    isRunningStatusAction:
      statusMutation.isPending ||
      archiveMutation.isPending ||
      restoreMutation.isPending,
    isPrintingAll,
    beginPrintAll,
    endPrintAll,
    printableContentRef,
    hasUnsavedChanges,
    markUnsavedChanges,
    confirmLeave,
  };

  // The editor can't render anything truthful without the document list, so a load failure is
  // terminal rather than a half-populated editor. A 404 is deliberately ambiguous (unknown
  // applicant vs. forbidden actor) — the copy from `getApiErrorMessage` never says the record
  // was deleted. Declared after every hook so the hook order stays stable.
  const loadError = documentsQuery.error;
  if (loadError) {
    return (
      <DocumentUnavailable
        message={getApiErrorMessage(loadError)}
        onRetry={() => {
          void documentsQuery.refetch();
        }}
      />
    );
  }

  return (
    <DocumentEditorContext.Provider value={value}>
      {children}
    </DocumentEditorContext.Provider>
  );
}

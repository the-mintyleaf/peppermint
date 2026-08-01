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
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useApplicantPhotograph } from "@/modules/admin/applicants/photograph";
import { documentsApi } from "../documents.api";
import {
  documentQueryKeys,
  documentWorkspacesKey,
} from "../documents.queryKeys";
import { DocumentUnavailable } from "../components/DocumentUnavailable";
import { useSignatures } from "../hooks/useSignatures";
import { getDefaultDocumentContent } from "../utils/defaultDocumentContent";
import { getDefaultLabel } from "../documentTypeConfig";
import { confirmLeaveWithUnsavedChanges } from "../hooks/useUnsavedChangesGuard";
import type { DocumentEditorContextValue } from "./DocumentEditorProvider.types";
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

  const scopeKey = applicantId
    ? documentQueryKeys.list({ applicant: applicantId })
    : documentQueryKeys.list({ standalone: standaloneDocumentId ?? "" });

  const documentsQuery = useQuery({
    queryKey: scopeKey,
    queryFn: async (): Promise<Document[]> => {
      if (applicantId) {
        const items = await documentsApi.listByApplicant(applicantId);
        return Promise.all(items.map((item) => documentsApi.get(item.id)));
      }
      if (standaloneDocumentId) {
        return [await documentsApi.get(standaloneDocumentId)];
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
      queryClient.invalidateQueries({ queryKey: documentWorkspacesKey() });
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
      const doc = documentsRef.current.find((d) => d.id === documentId);
      if (!doc) return;
      setHasPendingEdits(true);
      // `content` replaces WHOLESALE — the complete object is sent every save.
      updateMutation.mutate({ id: documentId, content });
    },
    [updateMutation],
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
      queryClient.invalidateQueries({ queryKey: documentWorkspacesKey() });
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
      if (!applicantId) return;
      createMutation.mutate({
        applicantId,
        family: familyForType(type),
        templateKey: type,
        label: getDefaultLabel(type),
        content: getDefaultDocumentContent(type),
      });
    },
    [createMutation, applicantId, familyForType],
  );

  const createDocumentWithContent = useCallback(
    (type: DocumentType, content: DocumentContent, label?: string) => {
      if (!applicantId) return;
      createMutation.mutate({
        applicantId,
        family: familyForType(type),
        templateKey: type,
        label: label ?? getDefaultLabel(type),
        content,
      });
    },
    [createMutation, applicantId, familyForType],
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
      queryClient.invalidateQueries({ queryKey: documentWorkspacesKey() });
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
    (slugKey: string) => createBankPairMutation.mutate(slugKey),
    [createBankPairMutation],
  );

  // ── Status / archive / restore ──────────────────────────────────────────

  const statusMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: DocumentStatusValue }) =>
      documentsApi.changeStatus(id, value),
    onSuccess: (updated) => {
      writeDocumentToCache(updated);
      queryClient.invalidateQueries({ queryKey: documentWorkspacesKey() });
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
      if (!activeDocumentId) return;
      statusMutation.mutate({ id: activeDocumentId, value });
    },
    [statusMutation, activeDocumentId],
  );

  const archiveMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      documentsApi.archive(id, reason),
    onSuccess: (updated) => {
      writeDocumentToCache(updated);
      queryClient.invalidateQueries({ queryKey: documentWorkspacesKey() });
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
      if (!activeDocumentId) return;
      archiveMutation.mutate({ id: activeDocumentId, reason });
    },
    [archiveMutation, activeDocumentId],
  );

  const restoreMutation = useMutation({
    mutationFn: (id: string) => documentsApi.restore(id),
    onSuccess: (updated) => {
      writeDocumentToCache(updated);
      queryClient.invalidateQueries({ queryKey: documentWorkspacesKey() });
      notifications.show({
        title: "Document restored",
        message: updated.label,
        color: "green",
      });
    },
  });

  const restoreActiveDocument = useCallback(() => {
    if (!activeDocumentId) return;
    restoreMutation.mutate(activeDocumentId);
  }, [restoreMutation, activeDocumentId]);

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

  const openCreateModal = useCallback((type: DocumentType) => {
    setCreateModalType(type);
    setCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    setCreateModalType(null);
  }, []);

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

  const value: DocumentEditorContextValue = {
    applicantId,
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
    setEditFieldsModalOpen,
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

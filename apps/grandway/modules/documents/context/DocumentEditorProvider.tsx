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
import { getDefaultLabel, getTemplateVersion } from "../documentTypeConfig";
import { findBankPartner } from "../utils/documentTypeMenu";
import { describeContentSaveError } from "../utils/contentFieldErrors";
import { confirmLeaveWithUnsavedChanges } from "../hooks/useUnsavedChangesGuard";
import {
  STATUS_META,
  isEditableStatus,
  isLiveDocument,
} from "../documents.status";
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
  // Separate from `canEdit` on purpose — the workspaces roll-up has its own
  // capability, and `DocHeader`'s close button targets that screen.
  const canOpenWorkspaces = capabilities.documentWorkspaces;

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
        // Archived included — the pages list's Archived group (and Restore) is
        // built from these; the backend hides them unless asked since 1.2.0.
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
        if (!canSeeFamily(capabilities, doc.family)) {
          // THROW, don't return [] — an empty list renders the ordinary empty
          // editor ("No documents to show"), which looks broken rather than
          // deliberate. Throwing routes it to the same terminal DocumentUnavailable
          // screen a real 404 gets, which is the point: a disallowed family must be
          // indistinguishable from a document that isn't there, since the
          // distinction is itself the disclosure.
          throw new Error("Document not found.");
        }
        return [doc];
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
  // `null` only once the lookup has settled on "no photograph" — a certificate
  // saved while it is still loading keeps the id it already had.
  const photoFileId =
    photograph.file?.id ?? (photograph.isMissing ? null : undefined);
  const studentFullData = useMemo(
    () =>
      summaryQuery.data
        ? {
            ...summaryQuery.data,
            photoUrl: photograph.url ?? undefined,
            photoFileId,
          }
        : null,
    [summaryQuery.data, photograph.url, photoFileId],
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
      // A certificate body the backend refuses names its fields; the open form
      // marks them, but the Customizations panel has no form, so say them here.
      notifications.show({
        title: "Could not save changes",
        message: describeContentSaveError(error),
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

  // The same save, awaitable: rejects with the API error so the form that asked
  // for it can stay open and mark the refused fields. The toast still fires.
  const { mutateAsync: updateContentAsync } = updateMutation;
  const saveDocumentContent = useCallback(
    async (documentId: string, content: DocumentContent) => {
      if (!canEdit) return;
      const doc = documentsRef.current.find((d) => d.id === documentId);
      if (!doc) return;
      setHasPendingEdits(true);
      await updateContentAsync({ id: documentId, content });
    },
    [updateContentAsync, canEdit],
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
        message: describeContentSaveError(error),
        color: "red",
      });
    },
  });
  const { mutate: createDocument, mutateAsync: createDocumentAsync } =
    createMutation;

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
      createDocument({
        applicantId,
        family: familyForType(type),
        templateKey: type,
        label: getDefaultLabel(type),
        content: getDefaultDocumentContent(type),
        templateVersion: getTemplateVersion(type),
      });
    },
    [createDocument, applicantId, familyForType, canEdit],
  );

  // Resolves once the page exists; rejects with the API error so a create form
  // can stay open on a refused body (see `DocumentFormProps.onSubmit`).
  const createDocumentWithContent = useCallback(
    async (type: DocumentType, content: DocumentContent, label?: string) => {
      if (!canEdit || !applicantId) return;
      await createDocumentAsync({
        applicantId,
        family: familyForType(type),
        templateKey: type,
        label: label ?? getDefaultLabel(type),
        content,
        templateVersion: getTemplateVersion(type),
      });
    },
    [createDocumentAsync, applicantId, familyForType, canEdit],
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

  // A bank certificate and its statement are removed and restored together, the
  // way they were created — the menu can never re-add one half on its own.
  const withBankPartner = useCallback(
    (id: string): string[] => {
      const doc = documents.find((d) => d.id === id);
      const partner = doc ? findBankPartner(doc, documents) : null;
      return partner ? [id, partner.id] : [id];
    },
    [documents],
  );

  const archiveMutation = useMutation({
    mutationFn: async ({ ids, reason }: { ids: string[]; reason: string }) => {
      const archived: Document[] = [];
      for (const id of ids)
        archived.push(await documentsApi.archive(id, reason));
      return archived;
    },
    onSuccess: (archived) => {
      archived.forEach((doc) => writeDocumentToCache(doc));
      invalidateDerivedViews();
      notifications.show({
        title: "Document removed",
        message: `${archived.map((d) => d.label).join(" & ")} moved to Archived in the pages list.`,
        color: "green",
      });
    },
    onError: (error) => {
      // Re-read the list: with a pair, the first half may already have gone.
      void queryClient.invalidateQueries({ queryKey: scopeKey });
      notifications.show({
        title: "Could not remove",
        message: getApiErrorMessage(error),
        color: "red",
      });
    },
  });

  const archiveActiveDocument = useCallback(
    (reason: string) => {
      if (!canEdit || !activeDocumentId) return;
      archiveMutation.mutate({
        ids: withBankPartner(activeDocumentId),
        reason,
      });
    },
    [archiveMutation, activeDocumentId, canEdit, withBankPartner],
  );

  const restoreMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const restored: Document[] = [];
      for (const id of ids) restored.push(await documentsApi.restore(id));
      return restored;
    },
    onSuccess: (restored) => {
      restored.forEach((doc) => writeDocumentToCache(doc));
      invalidateDerivedViews();
      // Restore returns each document to the status it had when removed, so
      // say which — a Ready certificate coming back as Ready is not obvious.
      notifications.show({
        title: "Document restored",
        message: restored
          .map((d) => `${d.label} is back as ${STATUS_META[d.status].label}`)
          .join("; "),
        color: "green",
      });
    },
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: scopeKey });
      notifications.show({
        title: "Could not restore",
        message: getApiErrorMessage(error),
        color: "red",
      });
    },
  });

  const restoreActiveDocument = useCallback(() => {
    if (!canEdit || !activeDocumentId) return;
    restoreMutation.mutate(withBankPartner(activeDocumentId));
  }, [restoreMutation, activeDocumentId, canEdit, withBankPartner]);

  // ── Selection / modals / unsaved-changes ─────────────────────────────────

  useEffect(() => {
    if (documents.length > 0 && !activeDocumentId) {
      // Open on a live page; a removed document is only opened on purpose.
      const live = documents.filter(isLiveDocument);
      const cert = live.find((d) => d.type === "student-certificate");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveDocumentId(cert?.id ?? live[0]?.id ?? documents[0].id);
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
  //
  // `locked` is the fourth case and exists to keep the promise the predicate above
  // makes: it folds in `isEditable` so a backend that starts refusing edits needs no
  // frontend change. Without a matching reason here, that backend change would strip
  // every edit affordance and explain nothing. Today `is_editable` is documented as
  // the exact negation of `status === "archived"`, so this branch is unreachable —
  // which is precisely why it must be written now rather than when it fires.
  const readOnlyReason: DocumentReadOnlyReason = !canEdit
    ? "role"
    : activeHistoricalLog
      ? "historical"
      : activeDocument && !isEditableStatus(activeDocument.status)
        ? "archived"
        : activeDocument && activeDocument.isEditable === false
          ? "locked"
          : null;

  const value: DocumentEditorContextValue = {
    applicantId,
    canEdit,
    canOpenWorkspaces,
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
    saveDocumentContent,
    isSavingContent: updateMutation.isPending,
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

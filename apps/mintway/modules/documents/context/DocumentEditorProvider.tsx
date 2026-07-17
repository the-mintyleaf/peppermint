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
import { documentsApi } from "../documents.api";
import { documentQueryKeys } from "../documents.queryKeys";
import { useSignatures } from "../hooks/useSignatures";
import { getDefaultDocumentContent } from "../utils/defaultDocumentContent";
import { getDefaultLabel } from "../documentTypeConfig";
import { confirmLeaveWithUnsavedChanges } from "../hooks/useUnsavedChangesGuard";
import type { DocumentEditorContextValue } from "./DocumentEditorProvider.types";
import type {
  Document,
  DocumentContent,
  DocumentStatusAction,
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

/** Pull the backend error code out of an Axios error envelope, if present. */
function getErrorCode(error: unknown): string | undefined {
  const data = (
    error as { response?: { data?: { error?: { code?: string } } } }
  )?.response?.data;
  return data?.error?.code;
}

interface DocumentEditorProviderProps {
  applicantId: string;
  children: ReactNode;
}

export function DocumentEditorProvider({
  applicantId,
  children,
}: DocumentEditorProviderProps) {
  const queryClient = useQueryClient();
  const printableContentRef = useRef<HTMLDivElement>(null);

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeHistoricalLog, setActiveHistoricalLog] =
    useState<DocumentEditorContextValue["activeHistoricalLog"]>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<DocumentType | null>(
    null,
  );
  const [editFieldsModalOpen, setEditFieldsModalOpen] = useState(false);
  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [hasPendingEdits, setHasPendingEdits] = useState(false);

  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: documentQueryKeys.list(applicantId),
    queryFn: () => documentsApi.listByApplicant(applicantId),
  });

  const { data: studentFullData } = useQuery({
    queryKey: documentQueryKeys.prefill(applicantId),
    queryFn: async () => {
      const prefill = await documentsApi.fetchPrefill(applicantId);
      return documentsApi.prefillToSummary(applicantId, prefill);
    },
  });

  const { data: signatures = [] } = useSignatures();

  const activeDocument = useMemo(
    () => documents.find((d) => d.id === activeDocumentId) ?? null,
    [documents, activeDocumentId],
  );

  // Latest-documents ref so event-handler callbacks read fresh data without a stale closure.
  const documentsRef = useRef(documents);
  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  const writeDocumentToCache = useCallback(
    (updated: Document) => {
      queryClient.setQueryData(
        documentQueryKeys.list(applicantId),
        (old: Document[] | undefined) =>
          old?.map((d) => (d.id === updated.id ? updated : d)),
      );
    },
    [queryClient, applicantId],
  );

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      type,
      content,
      recordVersion,
    }: {
      id: string;
      type: DocumentType;
      content: DocumentContent;
      recordVersion: number;
    }) => {
      try {
        return {
          doc: await documentsApi.update(id, { type, content, recordVersion }),
          conflict: false,
        };
      } catch (error) {
        // Stale version → reload the document and retry with the fresh version so the
        // operator's autosaved edit is preserved. Flag it so onSuccess can notify (not silent).
        if (getErrorCode(error) === "APPLICANT_DOCUMENT_VERSION_CONFLICT") {
          const fresh = await documentsApi.get(id);
          return {
            doc: await documentsApi.update(id, {
              type,
              content,
              recordVersion: fresh.recordVersion,
            }),
            conflict: true,
          };
        }
        throw error;
      }
    },
    onSuccess: ({ doc, conflict }) => {
      writeDocumentToCache(doc);
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.revisions(doc.id),
      });
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.workspaces(),
      });
      setHasPendingEdits(false);
      if (conflict) {
        notifications.show({
          title: "Document had changed",
          message:
            "It was updated elsewhere — your change was re-applied on top.",
          color: "yellow",
        });
      }
    },
    onError: (error) => {
      const code = getErrorCode(error);
      notifications.show({
        title: "Could not save changes",
        message:
          code === "APPLICANT_DOCUMENT_NOT_EDITABLE"
            ? "This document is finalized and can no longer be edited."
            : "Please try again.",
        color: "red",
      });
    },
  });

  // Auto-select a document once the list loads (prefer the certificate). Guarded so it only
  // runs while nothing is selected — deriving during render isn't possible here because the
  // selection must survive across list refetches.
  useEffect(() => {
    if (applicantId && documents.length > 0 && !activeDocumentId) {
      const cert = documents.find((d) => d.type === "student-certificate");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveDocumentId(cert?.id ?? documents[0].id);
    }
  }, [applicantId, documents, activeDocumentId]);

  // Clear the previewed history entry whenever the active document changes.
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

  const markUnsavedChanges = useCallback(() => {
    setHasPendingEdits(true);
  }, []);

  const updateDocumentContent = useCallback(
    (documentId: string, content: DocumentContent) => {
      const doc = documentsRef.current.find((d) => d.id === documentId);
      if (!doc) return;
      setHasPendingEdits(true);
      updateMutation.mutate({
        id: documentId,
        type: doc.type,
        content,
        recordVersion: doc.recordVersion,
      });
    },
    [updateMutation],
  );

  // Render-only content update for the bank Customizations panel: reflect the change in the
  // local cache so the preview/print pick it up, but never persist or create a revision.
  // These are print-layout tweaks (header padding), not saved edits — no snapshot on each change.
  const updateDocumentContentLocal = useCallback(
    (documentId: string, content: DocumentContent) => {
      const doc = documentsRef.current.find((d) => d.id === documentId);
      if (!doc) return;
      writeDocumentToCache({ ...doc, content });
    },
    [writeDocumentToCache],
  );

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

  const removeDocumentFromList = useCallback(
    (documentId: string) => {
      if (activeDocumentId === documentId) {
        const remaining = documentsRef.current.filter(
          (d) => d.id !== documentId,
        );
        setActiveDocumentId(remaining[0]?.id ?? null);
      }
    },
    [activeDocumentId],
  );

  const appendDocumentToCache = useCallback(
    (doc: Document) => {
      queryClient.setQueryData(
        documentQueryKeys.list(applicantId),
        (old: Document[] | undefined) => {
          if (!old) return [doc];
          if (old.some((d) => d.id === doc.id)) return old;
          return [...old, doc];
        },
      );
      setActiveDocumentId(doc.id);
    },
    [queryClient, applicantId],
  );

  const addDocumentToList = useCallback(
    (doc: Document) => {
      appendDocumentToCache(doc);
    },
    [appendDocumentToCache],
  );

  const createMutation = useMutation({
    mutationFn: documentsApi.create,
    onSuccess: (doc) => {
      appendDocumentToCache(doc);
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.workspaces(),
      });
      notifications.show({
        title: "Page added",
        message: doc.label,
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Failed to add page",
        message: "Please try again.",
        color: "red",
      });
    },
  });

  const quickCreateDocument = useCallback(
    (type: DocumentType) => {
      createMutation.mutate({
        applicantId,
        type,
        label: getDefaultLabel(type),
        content: getDefaultDocumentContent(type),
      });
    },
    [createMutation, applicantId],
  );

  const createDocumentWithContent = useCallback(
    (type: DocumentType, content: DocumentContent, label?: string) => {
      createMutation.mutate({
        applicantId,
        type,
        label: label ?? getDefaultLabel(type),
        content,
      });
    },
    [createMutation, applicantId],
  );

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: DocumentStatusAction;
    }) => documentsApi.runAction(id, action),
    onSuccess: (updated, { action }) => {
      writeDocumentToCache(updated);
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.workspaces(),
      });
      notifications.show({
        title: `Document ${action === "finalize" ? "finalized" : action}d`,
        message: updated.label,
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Action not allowed",
        message:
          getErrorCode(error) === "APPLICANT_DOCUMENT_STATUS_INVALID"
            ? "This status change is not valid for the current document state."
            : "Please try again.",
        color: "red",
      });
    },
  });

  const runStatusAction = useCallback(
    (action: DocumentStatusAction) => {
      if (!activeDocumentId) return;
      statusMutation.mutate({ id: activeDocumentId, action });
    },
    [statusMutation, activeDocumentId],
  );

  const beginPrintAll = useCallback(() => setIsPrintingAll(true), []);
  const endPrintAll = useCallback(() => setIsPrintingAll(false), []);

  const value: DocumentEditorContextValue = {
    applicantId,
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
    removeDocumentFromList,
    addDocumentToList,
    quickCreateDocument,
    createDocumentWithContent,
    isCreatingDocument: createMutation.isPending,
    runStatusAction,
    isRunningStatusAction: statusMutation.isPending,
    isPrintingAll,
    beginPrintAll,
    endPrintAll,
    printableContentRef,
    hasUnsavedChanges,
    markUnsavedChanges,
    confirmLeave,
  };

  return (
    <DocumentEditorContext.Provider value={value}>
      {children}
    </DocumentEditorContext.Provider>
  );
}

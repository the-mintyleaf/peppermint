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
import { useMutation, useQuery, useQueryClient } from "@zetsel/ui";
import { documentsApi } from "../documents.api";
import { documentQueryKeys } from "../documents.queryKeys";
import { useSignatures } from "../hooks/useSignatures";
import type { DocumentEditorContextValue } from "./DocumentEditorProvider.types";
import type { Document, DocumentContent, DocumentType } from "../documents.types";

const DocumentEditorContext = createContext<DocumentEditorContextValue | null>(null);

export function useDocumentEditor() {
  const ctx = useContext(DocumentEditorContext);
  if (!ctx) {
    throw new Error("useDocumentEditor must be used within DocumentEditorProvider");
  }
  return ctx;
}

interface DocumentEditorProviderProps {
  studentId: string;
  children: ReactNode;
}

export function DocumentEditorProvider({ studentId, children }: DocumentEditorProviderProps) {
  const queryClient = useQueryClient();
  const printableContentRef = useRef<HTMLDivElement>(null);

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeHistoricalLog, setActiveHistoricalLog] = useState<DocumentEditorContextValue["activeHistoricalLog"]>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState<DocumentType | null>(null);

  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: documentQueryKeys.list(studentId),
    queryFn: () => documentsApi.listByStudent(studentId),
  });

  const { data: studentFullData } = useQuery({
    queryKey: documentQueryKeys.studentFull(studentId),
    queryFn: () => documentsApi.fetchStudentFullData(studentId),
  });

  const { data: signatures = [] } = useSignatures();

  const activeDocument = useMemo(
    () => documents.find((d) => d.id === activeDocumentId) ?? null,
    [documents, activeDocumentId]
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: DocumentContent }) =>
      documentsApi.update(id, { content }),
    onSuccess: (updated) => {
      queryClient.setQueryData(documentQueryKeys.list(studentId), (old: Document[] | undefined) =>
        old?.map((d) => (d.id === updated.id ? updated : d))
      );
    },
  });

  useEffect(() => {
    if (studentId && documents.length > 0 && !activeDocumentId) {
      const cert = documents.find((d) => d.type === "student-certificate");
      setActiveDocumentId(cert?.id ?? documents[0].id);
    }
  }, [studentId, documents, activeDocumentId]);

  useEffect(() => {
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

  const updateDocumentContent = useCallback(
    (documentId: string, content: DocumentContent) => {
      updateMutation.mutate({ id: documentId, content });
    },
    [updateMutation]
  );

  const removeDocumentFromList = useCallback(
    (documentId: string) => {
      if (activeDocumentId === documentId) {
        const remaining = documents.filter((d) => d.id !== documentId);
        setActiveDocumentId(remaining[0]?.id ?? null);
      }
    },
    [activeDocumentId, documents]
  );

  const addDocumentToList = useCallback((doc: Document) => {
    setActiveDocumentId(doc.id);
  }, []);

  const value: DocumentEditorContextValue = {
    studentId,
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
    updateDocumentContent,
    removeDocumentFromList,
    addDocumentToList,
    printableContentRef,
  };

  return (
    <DocumentEditorContext.Provider value={value}>{children}</DocumentEditorContext.Provider>
  );
}

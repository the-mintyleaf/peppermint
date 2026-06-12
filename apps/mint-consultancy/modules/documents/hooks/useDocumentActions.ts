"use client";

import { useCallback, useState, type RefObject } from "react";
import { notifications, useMutation, useQueryClient } from "@zetsel/ui";
import { documentsApi } from "../documents.api";
import { documentQueryKeys } from "../documents.queryKeys";
import { triggerPrint } from "../utils/print.utils";
import type { Document, DocumentContent, PrintLogSnapshot } from "../documents.types";

interface UseDocumentActionsOptions {
  studentId: string;
  documents: Document[];
  activeDocument: Document | null;
  printableContentRef: RefObject<HTMLDivElement | null>;
  onDocumentRemoved: (documentId: string) => void;
}

export function useDocumentActions({
  studentId,
  documents,
  activeDocument,
  printableContentRef,
  onDocumentRemoved,
}: UseDocumentActionsOptions) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const createLogMutation = useMutation({
    mutationFn: ({
      documentId,
      snapshot,
      type,
    }: {
      documentId: string;
      snapshot: PrintLogSnapshot;
      type: Document["type"];
    }) => documentsApi.createPrintLog(documentId, snapshot, type),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.printLogs(documentId) });
    },
  });

  const removeMutation = useMutation({
    mutationFn: documentsApi.remove,
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.list(studentId) });
      onDocumentRemoved(documentId);
      notifications.show({ title: "Document removed", color: "green" });
    },
    onError: () => {
      notifications.show({ title: "Failed to remove document", color: "red" });
    },
  });

  const buildSnapshot = useCallback(
    (doc: Document): PrintLogSnapshot => ({
      content: doc.content,
      config: {},
    }),
    []
  );

  const handlePrintCurrent = useCallback(async () => {
    if (!activeDocument) return;
    try {
      await createLogMutation.mutateAsync({
        documentId: activeDocument.id,
        snapshot: buildSnapshot(activeDocument),
        type: activeDocument.type,
      });
      triggerPrint();
      notifications.show({ title: "Print log saved", color: "green" });
    } catch {
      notifications.show({ title: "Failed to save print log", color: "red" });
    }
  }, [activeDocument, buildSnapshot, createLogMutation]);

  const handlePrintAll = useCallback(async () => {
    if (documents.length === 0) return;
    try {
      for (const doc of documents) {
        await createLogMutation.mutateAsync({
          documentId: doc.id,
          snapshot: buildSnapshot(doc),
          type: doc.type,
        });
      }
      triggerPrint();
      notifications.show({ title: "All print logs saved", color: "green" });
    } catch {
      notifications.show({ title: "Failed to save print logs", color: "red" });
    }
  }, [documents, buildSnapshot, createLogMutation]);

  const handleRemoveDocument = useCallback(
    async (documentId: string) => {
      setIsDeleting(true);
      try {
        await removeMutation.mutateAsync(documentId);
      } finally {
        setIsDeleting(false);
      }
    },
    [removeMutation]
  );

  const handleSaveHistory = useCallback(async () => {
    if (!activeDocument) return;
    try {
      await createLogMutation.mutateAsync({
        documentId: activeDocument.id,
        snapshot: buildSnapshot(activeDocument),
        type: activeDocument.type,
      });
      notifications.show({ title: "History saved", color: "green" });
    } catch {
      notifications.show({ title: "Failed to save history", color: "red" });
    }
  }, [activeDocument, buildSnapshot, createLogMutation]);

  return {
    isDeleting,
    handlePrintCurrent,
    handlePrintAll,
    handleSaveHistory,
    handleRemoveDocument,
    isSavingHistory: createLogMutation.isPending,
  };
}

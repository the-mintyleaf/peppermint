"use client";

import { useCallback, type RefObject } from "react";
import { notifications, useMutation, useQueryClient } from "@peppermint/ui";
import { documentsApi } from "../documents.api";
import {
  documentQueryKeys,
  documentMutationKeys,
} from "../documents.queryKeys";
import { triggerPrint } from "../utils/print.utils";
import { getBankPartnerType } from "../utils/documentTypeMenu";
import { computeBankStatement } from "../utils/bankStatement";
import { currencyInWords } from "../utils/numberToWords";
import type {
  BankCertificateContent,
  BankStatementContent,
  CreatePrintEventInput,
  Document,
} from "../documents.types";

interface UseDocumentActionsOptions {
  applicantId: string;
  documents: Document[];
  activeDocument: Document | null;
  printableContentRef: RefObject<HTMLDivElement | null>;
  onDocumentRemoved: (documentId: string) => void;
  /** Renders every page then prints (see DocumentContent); falls back to a plain print. */
  beginPrintAll?: () => void;
}

/**
 * Build the print-event payload for a document. The backend stores frontend-computed derived
 * values verbatim (§16.4); for bank documents we compute the running balances / amount-in-words
 * so the evidentiary snapshot matches what was rendered.
 */
function buildPrintInput(doc: Document): CreatePrintEventInput {
  let derivedValuesSnapshot: Record<string, unknown> = {};

  if (doc.type.endsWith("-statement")) {
    derivedValuesSnapshot = computeBankStatement(
      doc.content as BankStatementContent,
    ) as unknown as Record<string, unknown>;
  } else if (
    doc.type.endsWith("-certificate") &&
    doc.type.startsWith("bank-")
  ) {
    const content = doc.content as BankCertificateContent;
    const balance = Number(content.statement_total_balance ?? 0) || 0;
    const usdRate = Number(content.statement_usdrate ?? 0) || 0;
    derivedValuesSnapshot = {
      statement_total_balance_words: currencyInWords(balance),
      statement_total_balance_words_usd: currencyInWords(
        usdRate > 0 ? balance / usdRate : 0,
        "US Dollars",
        "Cents",
      ),
    };
  }

  return {
    revisionNumber: doc.currentRevisionNumber,
    contentSnapshot: doc.content,
    derivedValuesSnapshot,
    printStatus: "rendered",
  };
}

export function useDocumentActions({
  applicantId,
  documents,
  activeDocument,
  onDocumentRemoved,
  beginPrintAll,
}: UseDocumentActionsOptions) {
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: ({
      documentId,
      input,
    }: {
      documentId: string;
      input: CreatePrintEventInput;
    }) => documentsApi.createPrintEvent(documentId, input),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.printEvents(documentId),
      });
    },
  });

  // Accepts one or two ids so a bank certificate + statement are archived together (§combo).
  const removeMutation = useMutation({
    mutationKey: documentMutationKeys.remove(),
    mutationFn: (documentIds: string[]) =>
      Promise.all(documentIds.map((id) => documentsApi.remove(id))),
    onSuccess: (_, documentIds) => {
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.list(applicantId),
      });
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.workspaces(),
      });
      documentIds.forEach(onDocumentRemoved);
      notifications.show({
        title:
          documentIds.length > 1 ? "Documents removed" : "Document removed",
        message:
          documentIds.length > 1
            ? "The bank certificate and statement were archived."
            : "The document was archived.",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Failed to remove document",
        message: "Please try again.",
        color: "red",
      });
    },
  });

  const handlePrintCurrent = useCallback(async () => {
    if (!activeDocument) return;
    try {
      await createEventMutation.mutateAsync({
        documentId: activeDocument.id,
        input: buildPrintInput(activeDocument),
      });
      triggerPrint();
    } catch {
      notifications.show({
        title: "Failed to record print",
        message: "Please try again.",
        color: "red",
      });
    }
  }, [activeDocument, createEventMutation]);

  const handlePrintAll = useCallback(async () => {
    if (documents.length === 0) return;
    try {
      for (const doc of documents) {
        await createEventMutation.mutateAsync({
          documentId: doc.id,
          input: buildPrintInput(doc),
        });
      }
      // Render every page into the print output before printing so the browser dialog
      // matches the recorded events. Falls back to printing the active page only.
      if (beginPrintAll) {
        beginPrintAll();
      } else {
        triggerPrint();
      }
    } catch {
      notifications.show({
        title: "Failed to record prints",
        message: "Please try again.",
        color: "red",
      });
    }
  }, [documents, createEventMutation, beginPrintAll]);

  const handleRemoveDocument = useCallback(
    async (documentId: string) => {
      const doc = documents.find((d) => d.id === documentId);
      const partnerType = doc ? getBankPartnerType(doc.type) : null;
      const partner = partnerType
        ? documents.find((d) => d.type === partnerType)
        : null;
      const ids = partner ? [documentId, partner.id] : [documentId];
      await removeMutation.mutateAsync(ids);
    },
    [documents, removeMutation],
  );

  const handleSaveHistory = useCallback(async () => {
    if (!activeDocument) return;
    try {
      await createEventMutation.mutateAsync({
        documentId: activeDocument.id,
        input: buildPrintInput(activeDocument),
      });
      notifications.show({
        title: "History saved",
        message: "A snapshot of the current version was saved.",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Failed to save history",
        message: "Please try again.",
        color: "red",
      });
    }
  }, [activeDocument, createEventMutation]);

  return {
    isDeleting: removeMutation.isPending,
    handlePrintCurrent,
    handlePrintAll,
    handleSaveHistory,
    handleRemoveDocument,
    isSavingHistory: createEventMutation.isPending,
  };
}

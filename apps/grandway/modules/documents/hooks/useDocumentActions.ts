"use client";

import { useCallback, type RefObject } from "react";
import { notifications, useMutation, useQueryClient } from "@peppermint/ui";
import { documentHistoryApi } from "../documentHistory.api";
import {
  documentSnapshotsKey,
  documentTimelineKey,
} from "../documents.queryKeys";
import { triggerPrint } from "../utils/print.utils";
import { computeBankStatement } from "../utils/bankStatement";
import { currencyInWords } from "../utils/numberToWords";
import type {
  BankCertificateContent,
  BankStatementContent,
  Document,
} from "../documents.types";

interface UseDocumentActionsOptions {
  documents: Document[];
  activeDocument: Document | null;
  printableContentRef: RefObject<HTMLDivElement | null>;
  /** Renders every page then prints (see DocumentContent); falls back to a plain print. */
  beginPrintAll?: () => void;
}

/**
 * Build the `render_context` for a snapshot capture. The backend copies `content` (input
 * fields) itself; we attach the frontend-computed derived values under `computed` so the
 * frozen snapshot matches exactly what was rendered (`document_history/INTEGRATION.md` §4).
 */
function buildRenderContext(doc: Document): Record<string, unknown> {
  let computed: Record<string, unknown> = {};

  if (doc.type.endsWith("-statement")) {
    computed = computeBankStatement(
      doc.content as BankStatementContent,
    ) as unknown as Record<string, unknown>;
  } else if (
    doc.type.endsWith("-certificate") &&
    doc.type.startsWith("bank-")
  ) {
    const content = doc.content as BankCertificateContent;
    const balance = Number(content.statement_total_balance ?? 0) || 0;
    const usdRate = Number(content.statement_usdrate ?? 0) || 0;
    computed = {
      statement_total_balance_words: currencyInWords(balance),
      statement_total_balance_words_usd: currencyInWords(
        usdRate > 0 ? balance / usdRate : 0,
        "US Dollars",
        "Cents",
      ),
    };
  }

  return { computed, template_key: doc.templateKey };
}

export function useDocumentActions({
  documents,
  activeDocument,
  beginPrintAll,
}: UseDocumentActionsOptions) {
  const queryClient = useQueryClient();

  const captureMutation = useMutation({
    mutationFn: ({ doc, note }: { doc: Document; note?: string }) =>
      documentHistoryApi.capture(doc.id, {
        renderContext: buildRenderContext(doc),
        captureNote: note,
      }),
    onSuccess: (_, { doc }) => {
      queryClient.invalidateQueries({ queryKey: documentSnapshotsKey(doc.id) });
      queryClient.invalidateQueries({ queryKey: documentTimelineKey(doc.id) });
    },
  });

  const handlePrintCurrent = useCallback(async () => {
    if (!activeDocument) return;
    try {
      await captureMutation.mutateAsync({ doc: activeDocument });
      triggerPrint();
    } catch {
      notifications.show({
        title: "Failed to record print",
        message: "Please try again.",
        color: "red",
      });
    }
  }, [activeDocument, captureMutation]);

  const handlePrintAll = useCallback(async () => {
    if (documents.length === 0) return;
    try {
      for (const doc of documents) {
        await captureMutation.mutateAsync({ doc });
      }
      if (beginPrintAll) beginPrintAll();
      else triggerPrint();
    } catch {
      notifications.show({
        title: "Failed to record prints",
        message: "Please try again.",
        color: "red",
      });
    }
  }, [documents, captureMutation, beginPrintAll]);

  const handleSaveHistory = useCallback(async () => {
    if (!activeDocument) return;
    try {
      await captureMutation.mutateAsync({ doc: activeDocument });
      notifications.show({
        title: "Snapshot saved",
        message: "A snapshot of the current version was captured.",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Failed to save snapshot",
        message: "Please try again.",
        color: "red",
      });
    }
  }, [activeDocument, captureMutation]);

  return {
    handlePrintCurrent,
    handlePrintAll,
    handleSaveHistory,
    isSavingHistory: captureMutation.isPending,
  };
}

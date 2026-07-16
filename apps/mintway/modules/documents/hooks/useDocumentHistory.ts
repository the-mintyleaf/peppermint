"use client";

import { useMemo } from "react";
import {
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { documentsApi } from "../documents.api";
import { documentQueryKeys } from "../documents.queryKeys";
import type { ActiveHistoricalEntry } from "../context/DocumentEditorProvider.types";
import type { Document } from "../documents.types";

/**
 * Unified, newest-first document history for the sidebar: saved revisions (created on every
 * content save) merged with print events, plus a `restore` action. There is no separate
 * revisions page — everything surfaces here inline.
 */
export function useDocumentHistory(
  applicantId: string,
  documentId: string | null,
) {
  const queryClient = useQueryClient();

  const revisionsQuery = useQuery({
    queryKey: documentQueryKeys.revisions(documentId),
    queryFn: () => documentsApi.listRevisions(documentId as string),
    enabled: !!documentId,
  });

  const printEventsQuery = useQuery({
    queryKey: documentQueryKeys.printEvents(documentId),
    queryFn: () => documentsApi.listPrintEvents(documentId as string),
    enabled: !!documentId,
  });

  const entries = useMemo<ActiveHistoricalEntry[]>(() => {
    const revisionEntries: ActiveHistoricalEntry[] = (
      revisionsQuery.data ?? []
    ).map((rev) => ({
      id: `rev-${rev.id}`,
      kind: "revision",
      type: rev.documentTypeSnapshot,
      snapshot: { content: rev.contentSnapshot },
      at: rev.createdAt,
      revisionNumber: rev.revisionNumber,
    }));

    const printEntries: ActiveHistoricalEntry[] = (printEventsQuery.data ?? [])
      .filter((evt) => evt.snapshot.contentSnapshot !== undefined)
      .map((evt) => ({
        id: `print-${evt.id}`,
        kind: "print",
        type: evt.type,
        snapshot: {
          content: evt.snapshot.contentSnapshot as Document["content"],
          config: evt.snapshot.derivedValuesSnapshot,
        },
        at: evt.printedAt,
      }));

    return [...revisionEntries, ...printEntries].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );
  }, [revisionsQuery.data, printEventsQuery.data]);

  const restoreMutation = useMutation({
    mutationFn: (revisionNumber: number) =>
      documentsApi.restoreRevision(documentId as string, revisionNumber),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        documentQueryKeys.list(applicantId),
        (old: Document[] | undefined) =>
          old?.map((d) => (d.id === updated.id ? updated : d)),
      );
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.revisions(updated.id),
      });
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.workspaces(),
      });
      notifications.show({
        title: "Version restored",
        message: "A new revision was created from the selected version.",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Failed to restore version",
        message: "Please try again.",
        color: "red",
      });
    },
  });

  return {
    entries,
    isLoading: revisionsQuery.isLoading || printEventsQuery.isLoading,
    restore: restoreMutation.mutate,
    isRestoring: restoreMutation.isPending,
  };
}

"use client";

import {
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { documentHistoryApi } from "../documentHistory.api";
import {
  documentQueryKeys,
  documentSnapshotsKey,
  documentTimelineKey,
  documentWorkspacesKey,
} from "../documents.queryKeys";
import type { HistoricalSnapshot } from "../documents.types";

/**
 * A document's print history for the History sidebar: immutable `document_history` snapshots
 * (each recoverable) and the print/reprint/recovery timeline. Replaces mintway's
 * revisions+print-events model — grandway keeps no per-edit revision chain; only printed
 * bodies survive (`documents/INTEGRATION.md` §9).
 */
export function useDocumentHistory(documentId: string | null) {
  const queryClient = useQueryClient();

  const snapshotsQuery = useQuery({
    queryKey: documentSnapshotsKey(documentId ?? ""),
    queryFn: () => documentHistoryApi.listSnapshots(documentId as string),
    enabled: !!documentId,
  });

  const timelineQuery = useQuery({
    queryKey: documentTimelineKey(documentId ?? ""),
    queryFn: () => documentHistoryApi.listTimeline(documentId as string),
    enabled: !!documentId,
  });

  /** Fetch a snapshot's frozen body so it can be previewed in place of the live document. */
  async function loadSnapshotPreview(
    snapshotId: string,
  ): Promise<HistoricalSnapshot> {
    const detail = await documentHistoryApi.getSnapshot(snapshotId);
    return { content: detail.content, config: detail.renderContext };
  }

  const recoverMutation = useMutation({
    mutationFn: (snapshotId: string) => documentHistoryApi.recover(snapshotId),
    onSuccess: () => {
      // recover writes the snapshot body forward into the document; refetch rather than
      // trust a cached copy (it surfaces here as an ordinary `document_updated` event).
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: documentWorkspacesKey() });
      if (documentId) {
        queryClient.invalidateQueries({
          queryKey: documentSnapshotsKey(documentId),
        });
        queryClient.invalidateQueries({
          queryKey: documentTimelineKey(documentId),
        });
      }
      notifications.show({
        title: "Version recovered",
        message: "The selected snapshot was written back into the document.",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Could not recover version",
        message: "The document may be archived. Please try again.",
        color: "red",
      });
    },
  });

  const reprintMutation = useMutation({
    mutationFn: (snapshotId: string) => documentHistoryApi.reprint(snapshotId),
    onSuccess: () => {
      if (documentId) {
        queryClient.invalidateQueries({
          queryKey: documentTimelineKey(documentId),
        });
      }
      notifications.show({
        title: "Reprint recorded",
        message: "A reprint event was added to the timeline.",
        color: "green",
      });
    },
  });

  return {
    snapshots: snapshotsQuery.data ?? [],
    timeline: timelineQuery.data ?? [],
    isLoading: snapshotsQuery.isLoading || timelineQuery.isLoading,
    loadSnapshotPreview,
    recover: recoverMutation.mutate,
    isRecovering: recoverMutation.isPending,
    reprint: reprintMutation.mutate,
    isReprinting: reprintMutation.isPending,
  };
}

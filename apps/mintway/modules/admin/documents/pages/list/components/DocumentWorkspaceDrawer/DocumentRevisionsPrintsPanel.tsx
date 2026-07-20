"use client";

import {
  Badge,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  dayjs,
  useQuery,
} from "@peppermint/ui";
import { documentsApi, documentQueryKeys } from "@/modules/documents";
import type { PrintStatus } from "@/modules/documents";
import { QueryErrorState } from "@/components/QueryErrorState";

interface DocumentRevisionsPrintsPanelProps {
  documentId: string;
  /** Gate the queries so nothing fetches until the accordion item is expanded. */
  enabled: boolean;
}

const PRINT_STATUS_COLORS: Record<PrintStatus, string> = {
  rendered: "blue",
  print_initiated: "cyan",
  artifact_downloaded: "green",
  failed: "red",
};

function fmt(value: string): string {
  const d = dayjs(value);
  return d.isValid() ? d.fromNow() : value;
}

export function DocumentRevisionsPrintsPanel({
  documentId,
  enabled,
}: DocumentRevisionsPrintsPanelProps) {
  const revisions = useQuery({
    queryKey: documentQueryKeys.revisions(documentId),
    queryFn: () => documentsApi.listRevisions(documentId),
    enabled,
  });
  const prints = useQuery({
    queryKey: documentQueryKeys.printEvents(documentId),
    queryFn: () => documentsApi.listPrintEvents(documentId),
    enabled,
  });

  if (revisions.isLoading || prints.isLoading) {
    return (
      <Group justify="center" py="md">
        <Loader size="sm" />
      </Group>
    );
  }

  if (revisions.isError || prints.isError) {
    return (
      <QueryErrorState
        message="Couldn't load revisions & prints."
        onRetry={() => {
          revisions.refetch();
          prints.refetch();
        }}
        isRetrying={revisions.isRefetching || prints.isRefetching}
      />
    );
  }

  const revisionList = revisions.data ?? [];
  const printList = prints.data ?? [];

  // A print event links its revision by id; the readable "#n" lives on the revision
  // itself, so resolve it here rather than trying to derive a number from the id.
  const revisionNumberById = new Map(
    revisionList.map((rev) => [rev.id, rev.revisionNumber]),
  );

  return (
    <Stack gap="sm">
      <Divider
        label={`Revisions (${revisionList.length})`}
        labelPosition="left"
      />
      {revisionList.length === 0 ? (
        <Text size="xs" c="dimmed">
          No revisions yet.
        </Text>
      ) : (
        revisionList.map((rev) => (
          <Group key={rev.id} justify="space-between" wrap="nowrap" gap="sm">
            <Group gap="xs" wrap="nowrap">
              <Badge size="xs" variant="light" color="gray">
                #{rev.revisionNumber}
              </Badge>
              <Text size="xs" c={rev.changeReason ? undefined : "dimmed"}>
                {rev.changeReason || "No reason given"}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
              {fmt(rev.createdAt)}
            </Text>
          </Group>
        ))
      )}

      <Divider label={`Prints (${printList.length})`} labelPosition="left" />
      {printList.length === 0 ? (
        <Text size="xs" c="dimmed">
          No prints yet.
        </Text>
      ) : (
        printList.map((print) => (
          <Group key={print.id} justify="space-between" wrap="nowrap" gap="sm">
            <Group gap="xs" wrap="nowrap">
              <Badge
                size="xs"
                variant="light"
                color={PRINT_STATUS_COLORS[print.printStatus]}
              >
                {print.printStatus.replace(/_/g, " ")}
              </Badge>
              {print.revisionId != null &&
              revisionNumberById.has(print.revisionId) ? (
                <Text size="xs" c="dimmed">
                  rev #{revisionNumberById.get(print.revisionId)}
                </Text>
              ) : null}
            </Group>
            <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
              {fmt(print.printedAt)}
            </Text>
          </Group>
        ))
      )}
    </Stack>
  );
}

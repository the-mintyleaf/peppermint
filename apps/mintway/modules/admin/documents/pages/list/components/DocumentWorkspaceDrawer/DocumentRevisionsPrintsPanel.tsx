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
import {
  documentsApi,
  documentQueryKeys,
  humanizeChangedFields,
} from "@/modules/documents";
import type { DocumentRevision, PrintStatus } from "@/modules/documents";
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

/**
 * Past this many field names the list stops being scannable and starts being a wall — the
 * remainder collapses to a count, which still answers "was this a small fix or a rewrite?".
 */
const MAX_VISIBLE_CHANGED_FIELDS = 6;

/**
 * One revision: what changed, why, and when. `changedFields` carries field *names* only
 * (`document-revision.md` §1) — a name list is the honest diff at this density; a
 * value-level diff would need both snapshots and a viewer this drawer has no room for.
 * Rendered only when the server recorded names: an empty list means none were recorded,
 * and a "not recorded" caption on every row would be noise, not information.
 */
function RevisionRow({ revision }: { revision: DocumentRevision }) {
  const changed = humanizeChangedFields(revision.changedFields);
  const visible = changed.slice(0, MAX_VISIBLE_CHANGED_FIELDS);
  const overflow = changed.length - visible.length;

  return (
    <Stack gap={4}>
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Group gap="xs" wrap="nowrap">
          <Badge size="xs" variant="light" color="gray">
            #{revision.revisionNumber}
          </Badge>
          <Text size="xs" c={revision.changeReason ? undefined : "dimmed"}>
            {revision.changeReason || "No reason given"}
          </Text>
        </Group>
        <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
          {fmt(revision.createdAt)}
        </Text>
      </Group>
      {changed.length > 0 && (
        <Group gap={4} wrap="wrap" pl={4}>
          <Text size="xs" c="dimmed">
            Changed:
          </Text>
          {visible.map((field) => (
            <Badge key={field} size="xs" variant="default" tt="none">
              {field}
            </Badge>
          ))}
          {overflow > 0 && (
            <Text size="xs" c="dimmed">
              +{overflow} more
            </Text>
          )}
        </Group>
      )}
    </Stack>
  );
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
        revisionList.map((rev) => <RevisionRow key={rev.id} revision={rev} />)
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
              {print.revisionId != null ? (
                <Text size="xs" c="dimmed">
                  {revisionNumberById.has(print.revisionId)
                    ? `rev #${revisionNumberById.get(print.revisionId)}`
                    : // The revisions list is capped, so an older linked revision
                      // may be outside it. Say so rather than render nothing —
                      // this is print evidence, and dropping the attribution
                      // silently is worse than admitting it isn't loaded.
                      "rev (not in loaded history)"}
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

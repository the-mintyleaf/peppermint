"use client";

import { Loader, Stack, Text, dayjs } from "@peppermint/ui";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useApplicantHistory } from "../../../applicants.hooks";

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Read-only, server-written, backed by the central audit log — `summary` is
 * the primary label per entry; `changes` renders from→to when present.
 * Nested-collection events carry only a **count** in `metadata`, never the
 * replaced values — this is not a diff viewer
 * (`docs/backend/applicants/INTEGRATION.md` §4). Same rendering approach as
 * `LeadHistoryPanel`.
 */
export function ApplicantHistoryPanel({
  applicantId,
}: {
  applicantId: string;
}) {
  const { data, isLoading, isError, isRefetching, refetch } =
    useApplicantHistory(applicantId);
  const entries = data?.data ?? [];
  const truncated = (data?.meta.total ?? 0) > entries.length;

  if (isLoading) return <Loader size="sm" />;

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load history."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  if (entries.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        No history yet.
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {entries.map((entry) => {
        const changeEntries = Object.entries(entry.changes);
        return (
          <Stack key={entry.id} gap={2}>
            <Text size="xs" c="dimmed">
              {dayjs(entry.created_at).format("MMM D, YYYY h:mm A")} ·{" "}
              {entry.actor_label || `(${entry.actor_type})`}
            </Text>
            <Text size="xs" fw={500}>
              {entry.summary || entry.action.replace(/_/g, " ")}
            </Text>
            {entry.reason ? (
              <Text size="xs" c="dimmed">
                Reason: {entry.reason}
              </Text>
            ) : null}
            {changeEntries.map(([field, change]) => (
              <Text key={field} size="xs" c="dimmed">
                {field}: {renderValue(change.from)} → {renderValue(change.to)}
              </Text>
            ))}
          </Stack>
        );
      })}
      {truncated ? (
        <Text size="xs" c="dimmed">
          Showing the {entries.length} most recent entries.
        </Text>
      ) : null}
    </Stack>
  );
}

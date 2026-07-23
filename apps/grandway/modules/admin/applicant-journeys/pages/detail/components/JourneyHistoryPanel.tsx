"use client";

import { Loader, Stack, Text, dayjs } from "@peppermint/ui";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useJourneyHistory } from "../../../applicantJourneys.hooks";

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Read-only, server-written, backed by the central audit log — `summary` is
 * the primary label per entry; `changes` is from→to detail. Closure/
 * deferment **reasons** live on the journey record, not the history entry —
 * the Overview panel is where those show
 * (`docs/backend/applicant-journeys/FLOWS.md` "Review a journey's history").
 */
export function JourneyHistoryPanel({ journeyId }: { journeyId: string }) {
  const { data, isLoading, isError, isRefetching, refetch } =
    useJourneyHistory(journeyId);
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

"use client";

import { Loader, Stack, Text } from "@peppermint/ui";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useOfferHistory } from "../../../offers.hooks";
import { formatDateTime } from "../../../offers.utils";

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Read-only, server-written, backed by the central audit log. Includes
 * condition events (`metadata.condition_id`) — never a separate log — and is
 * never empty for an existing offer. `summary` is the primary label; `changes`
 * is the from→to detail.
 */
export function OfferHistoryPanel({ offerId }: { offerId: string }) {
  const { data, isLoading, isError, isRefetching, refetch } =
    useOfferHistory(offerId);
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
              {formatDateTime(entry.created_at)} ·{" "}
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

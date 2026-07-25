"use client";

import { Button, Loader, Stack, Text, dayjs } from "@peppermint/ui";
import { useClientHistory } from "../../../../clients.hooks";

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Read-only, server-written, backed by the central audit log — newest-first
 * (§7). `summary` is the primary label per entry; `changes` is advisory detail.
 * A contact-number change appears only as the marker
 * `{ from: "replaced", to: "N number(s)" }` — no before/after list is
 * recoverable (§4), and the generic renderer shows exactly that.
 */
export function ClientHistoryPanel({ clientId }: { clientId: string }) {
  const { data, isLoading, isError, refetch } = useClientHistory(clientId);
  const entries = data?.data ?? [];
  const truncated = (data?.meta.total ?? 0) > entries.length;

  if (isLoading) return <Loader size="sm" />;

  if (isError) {
    return (
      <Stack align="center" gap="xs" py="xl">
        <Text size="sm" c="dimmed" ta="center">
          Couldn&apos;t load history.
        </Text>
        <Button size="xs" variant="default" onClick={() => refetch()}>
          Try again
        </Button>
      </Stack>
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

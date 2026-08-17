"use client";

import { useState } from "react";
import { Button, Group, Loader, Stack, Text } from "@peppermint/ui";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useReminderHistory } from "../../reminders.hooks";
import {
  REMINDER_HISTORY_ACTION_ICONS,
  REMINDER_HISTORY_ACTION_LABELS,
} from "../../reminders.labels";
import { formatBs } from "../../reminders.utils";
import type { ReminderHistoryEntry } from "../../reminders.types";
import type { ReminderHistoryProps } from "./ReminderHistory.types";

/**
 * `changes` values arrive **already stringified** on both sides — the contract
 * is explicit about it — so they are rendered as text and never coerced back
 * into a date or a number.
 */
function ChangeLine({ entry }: { entry: ReminderHistoryEntry }) {
  const fields = Object.entries(entry.changes);
  if (fields.length === 0) return null;
  return (
    <Text size="xs" c="dimmed">
      {fields
        .map(([field, change]) => `${field}: ${change.from} → ${change.to}`)
        .join(" · ")}
    </Text>
  );
}

/**
 * A reminder's lifecycle trail, collapsed by default.
 *
 * The concept names this as a screen in its own right — "Reminders are
 * operational memory; the consultancy should be able to tell why a reminder
 * existed even after the date has passed" — and it is the only place the
 * optional `reason` given on complete/dismiss is ever visible, since that value
 * is recorded on the history event and never on the reminder itself.
 *
 * **Collapsed by default and `enabled`-gated**, so a panel of twenty reminders
 * costs zero history requests until someone asks a question about one.
 *
 * Output-contract states: **empty** "No history recorded yet." (a fresh
 * reminder has exactly one creation event, so this is rare but honest) ·
 * **loading** `Loader` · **request-failed** `QueryErrorState` with retry ·
 * **permission-denied** N/A, the host panel is already gated · **read-only**
 * inherent — history is append-only and has no controls · **archived record**
 * a closed reminder's history is the main reason to read it.
 */
export function ReminderHistory({ reminderId }: ReminderHistoryProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, isRefetching, refetch } =
    useReminderHistory(reminderId, open);

  return (
    <Stack gap={6}>
      <Group justify="flex-start">
        <Button
          size="compact-xs"
          variant="subtle"
          color="gray"
          leftSection={
            open ? (
              <CaretDownIcon size={12} aria-hidden />
            ) : (
              <CaretRightIcon size={12} aria-hidden />
            )
          }
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? "Hide history" : "History"}
        </Button>
      </Group>

      {open ? (
        <Stack gap={6} pl="sm">
          {isLoading ? <Loader size="xs" /> : null}

          {isError ? (
            <QueryErrorState
              message="Couldn't load this reminder's history."
              onRetry={() => refetch()}
              isRetrying={isRefetching}
            />
          ) : null}

          {!isLoading && !isError && (data?.data.length ?? 0) === 0 ? (
            <Text size="xs" c="dimmed">
              No history recorded yet.
            </Text>
          ) : null}

          {data?.data.map((entry) => {
            const Icon = REMINDER_HISTORY_ACTION_ICONS[entry.action];
            return (
              <Stack key={entry.id} gap={2}>
                <Group gap={6} wrap="nowrap">
                  {/* Decorative — the adjacent text carries the same label. */}
                  {Icon ? <Icon size={12} aria-hidden /> : null}
                  <Text size="xs" fw={500}>
                    {REMINDER_HISTORY_ACTION_LABELS[entry.action] ??
                      entry.action}
                  </Text>
                  <Text size="xs" c="dimmed">
                    · {entry.actor_label || "System"} ·{" "}
                    {formatBs(entry.created_at_bs) || entry.created_at}
                  </Text>
                </Group>
                <ChangeLine entry={entry} />
                {/* The only place a complete/dismiss reason is ever readable —
                    it lives on the event, never on the reminder. */}
                {entry.reason ? (
                  <Text size="xs" c="dimmed">
                    Reason: {entry.reason}
                  </Text>
                ) : null}
              </Stack>
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
}

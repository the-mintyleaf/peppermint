"use client";

import { useState } from "react";
import {
  Box,
  Group,
  Loader,
  Paper,
  Text,
  ThemeIcon,
  Timeline,
  UnstyledButton,
  dayjs,
} from "@peppermint/ui";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useReminderHistory } from "../../reminders.hooks";
import {
  REMINDER_CHANGE_FIELD_LABELS,
  REMINDER_HISTORY_ACTION_COLORS,
  REMINDER_HISTORY_ACTION_ICONS,
  REMINDER_HISTORY_ACTION_LABELS,
} from "../../reminders.labels";
import { formatBs } from "../../reminders.utils";
import type { ReminderHistoryEntry } from "../../reminders.types";
import type { ReminderHistoryProps } from "./ReminderHistory.types";

/**
 * A single `field: from → to` line.
 *
 * Both sides arrive **already stringified** — the contract is explicit — so
 * they are rendered as text and never coerced back into a date. An empty side
 * becomes an em dash rather than a blank, so "set for the first time" and
 * "cleared" are distinguishable.
 */
function ChangeRow({
  field,
  change,
}: {
  field: string;
  change: { from: string; to: string };
}) {
  return (
    <Group gap={6} wrap="nowrap" align="baseline">
      <Text size="xs" c="dimmed" style={{ flex: "none" }}>
        {REMINDER_CHANGE_FIELD_LABELS[field] ?? field}
      </Text>
      <Text size="xs" td="line-through" c="dimmed">
        {change.from || "—"}
      </Text>
      <Text size="xs" c="dimmed" style={{ flex: "none" }}>
        →
      </Text>
      <Text size="xs" fw={500}>
        {change.to || "—"}
      </Text>
    </Group>
  );
}

function HistoryEntry({ entry }: { entry: ReminderHistoryEntry }) {
  const changes = Object.entries(entry.changes ?? {});
  const bs = formatBs(entry.created_at_bs);
  const when = dayjs(entry.created_at);

  return (
    <Timeline.Item
      bullet={
        <ThemeIcon
          variant="light"
          radius="xl"
          size={22}
          color={REMINDER_HISTORY_ACTION_COLORS[entry.action] ?? "gray"}
        >
          {(() => {
            const Icon = REMINDER_HISTORY_ACTION_ICONS[entry.action];
            return Icon ? (
              <Icon size={12} aria-hidden />
            ) : (
              <ClockCounterClockwiseIcon size={12} aria-hidden />
            );
          })()}
        </ThemeIcon>
      }
      title={
        <Text size="xs" fw={600}>
          {REMINDER_HISTORY_ACTION_LABELS[entry.action] ?? entry.action}
        </Text>
      }
    >
      {/* Who and when, on one quiet line under the event name. */}
      <Text size="xs" c="dimmed">
        {entry.actor_label || "System"} · {when.format("MMM D, YYYY")} ·{" "}
        {when.format("h:mm A")}
        {bs ? ` · ${bs} BS` : ""}
      </Text>

      {changes.length > 0 || entry.reason ? (
        <Paper
          mt={6}
          p={8}
          radius="sm"
          bg="var(--mantine-color-default-hover)"
          withBorder={false}
        >
          {changes.map(([field, change]) => (
            <ChangeRow key={field} field={field} change={change} />
          ))}
          {/* The ONLY place a complete/dismiss reason is ever readable — it
              lives on the audit event, never on the reminder itself. */}
          {entry.reason ? (
            <Text size="xs" fs="italic" mt={changes.length > 0 ? 4 : 0}>
              “{entry.reason}”
            </Text>
          ) : null}
        </Paper>
      ) : null}
    </Timeline.Item>
  );
}

/**
 * A reminder's lifecycle trail, collapsed by default.
 *
 * The concept names this as a screen in its own right — "reminders are
 * operational memory; the consultancy should be able to tell why a reminder
 * existed even after the date has passed" — and it is the only place the
 * optional `reason` given on complete/dismiss is ever visible.
 *
 * **A timeline, not the shared `HistoryTable`.** That table is the right form
 * for a full-width profile tab, but it sets `minWidth={560}` and would force
 * horizontal scrolling inside every reminder card in a narrow profile column.
 * A reminder's history is also short and strictly sequential — set, maybe
 * moved, then closed — which is exactly what a timeline reads best.
 *
 * **Collapsed by default and `enabled`-gated**, so a panel of twenty reminders
 * costs zero history requests until someone asks a question about one.
 *
 * Output-contract states: **empty** "No history recorded yet." · **loading**
 * `Loader` · **request-failed** `QueryErrorState` with retry ·
 * **permission-denied** N/A, the host panel is already gated · **read-only**
 * inherent — history is append-only and has no controls · **archived record** a
 * closed reminder's history is the main reason to read it.
 */
export function ReminderHistory({ reminderId }: ReminderHistoryProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, isRefetching, refetch } =
    useReminderHistory(reminderId, open);

  const entries = data?.data ?? [];

  return (
    <Box>
      {/* A quiet disclosure, not a button-shaped lever: the history is context,
          and a solid control here would compete with Complete/Dismiss below. */}
      <UnstyledButton
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <Group gap={4} wrap="nowrap">
          {open ? (
            <CaretDownIcon size={10} aria-hidden />
          ) : (
            <CaretRightIcon size={10} aria-hidden />
          )}
          <Text size="xs" c="dimmed" fw={500}>
            {open ? "Hide history" : "History"}
          </Text>
        </Group>
      </UnstyledButton>

      {open ? (
        <Box mt="xs">
          {isLoading ? <Loader size="xs" /> : null}

          {isError ? (
            <QueryErrorState
              message="Couldn't load this reminder's history."
              onRetry={() => refetch()}
              isRetrying={isRefetching}
            />
          ) : null}

          {!isLoading && !isError && entries.length === 0 ? (
            <Text size="xs" c="dimmed">
              No history recorded yet.
            </Text>
          ) : null}

          {entries.length > 0 ? (
            /* Newest first, matching the server's order — so `active` is the
               number of items drawn as "done" from the top, i.e. all of them.
               The rail is decoration over a list that is already chronological;
               it must not imply progress toward a goal. */
            <Timeline
              bulletSize={22}
              lineWidth={1}
              active={entries.length}
              color="gray"
            >
              {entries.map((entry) => (
                <HistoryEntry key={entry.id} entry={entry} />
              ))}
            </Timeline>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

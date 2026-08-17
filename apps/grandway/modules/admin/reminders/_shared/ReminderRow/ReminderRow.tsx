"use client";

import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  modals,
} from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { CalendarPlusIcon } from "@phosphor-icons/react/dist/csr/CalendarPlus";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import {
  DUE_BUCKET_LABELS,
  REMINDER_STATUS_COLORS,
  REMINDER_STATUS_LABELS,
} from "../../reminders.labels";
import { useCompleteReminder, useDismissReminder } from "../../reminders.hooks";
import {
  dueBucket,
  formatBs,
  formatDueDate,
  formatDueDistance,
} from "../../reminders.utils";
import { ReminderHistory } from "../ReminderHistory";
import type { ReminderRowProps } from "./ReminderRow.types";

/**
 * Urgency is a property of the **date**, not the status — so the due badge is
 * coloured and the status pill is not. An open reminder due next month is the
 * healthy, normal state of this feature; colouring every open row would make a
 * well-kept panel look like a problem.
 */
const DUE_BUCKET_COLORS = {
  overdue: "red",
  today: "orange",
  upcoming: "gray",
  closed: "gray",
} as const;

/**
 * One reminder, reused by the record panel and any other list of reminders.
 *
 * Each rendered row is its own component instance and calls its own mutation
 * hooks directly — the established pattern in this app (see `NotificationRow`)
 * — so a parent list passes data, not callbacks, for the lifecycle actions.
 *
 * **There is no delete control and there never will be**: this API has no
 * `DELETE` on any endpoint. A reminder ends `completed` or `dismissed` and
 * stays readable forever, which is the point — it is operational memory.
 *
 * Output-contract states: **empty** N/A (a row always has data) · **loading**
 * per-action pending buttons, with the sibling action disabled so two writes
 * can't race · **request-failed** the mutation's resolved toast; the row stays
 * put and the action is retryable · **permission-denied** N/A, the host panel
 * gates on `caps.reminders` and this module has no read/write split ·
 * **read-only** a closed row renders its facts with no action group at all ·
 * **archived record** that same closed rendering — the row never disappears ·
 * **conflicting edits** a colleague closing it first is a 409 whose message
 * says so, and the panel's invalidation refetches the true state · **recovery
 * path** completion and dismissal are both recorded in the reminder's history,
 * and "set a new reminder" is the forward path the confirm names.
 */
export function ReminderRow({
  reminder,
  today,
  onReschedule,
}: ReminderRowProps) {
  const complete = useCompleteReminder(reminder.id);
  const dismiss = useDismissReminder(reminder.id);

  const bucket = dueBucket(reminder, today);
  const isOpen = reminder.status === "active";
  const isPending = complete.isPending || dismiss.isPending;
  const bsDisplay = formatBs(reminder.due_date_bs);

  /**
   * Dismissing is irreversible — there is no un-dismiss and no reopen anywhere
   * in this module — so it always confirms, and the confirmation says what the
   * recovery path actually is (a new reminder), rather than implying none.
   */
  const handleDismiss = () => {
    modals.openConfirmModal({
      title: "Dismiss this reminder?",
      children:
        "This is permanent — a reminder can't be reopened. If the follow-up still needs doing later, set a new reminder instead.",
      labels: { confirm: "Dismiss", cancel: "Keep it" },
      confirmProps: { color: "red" },
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      // The panel this row sits in can itself be inside a modal (the
      // applicants list opens it that way), so the confirm has to outrank it.
      zIndex: 500,
      onConfirm: () => dismiss.mutate(),
    });
  };

  return (
    <Paper withBorder p="sm" radius="sm">
      <Stack gap={6}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" wrap="wrap">
            {/* Status is a fact: words + colour + a fixed position, never colour alone. */}
            <StatusBadge
              value={reminder.status}
              colorMap={REMINDER_STATUS_COLORS}
              labelMap={REMINDER_STATUS_LABELS}
            />
            {/* The due badge only appears while the reminder is open — an
                "overdue" flag on a completed follow-up is a lie about work
                that was actually done. */}
            {isOpen ? (
              <Badge
                size="xs"
                variant="light"
                color={DUE_BUCKET_COLORS[bucket]}
              >
                {DUE_BUCKET_LABELS[bucket]}
              </Badge>
            ) : null}
          </Group>
          {/* The date is the row's scanning anchor, so it holds one fixed
              position top-right and is not repeated in the meta line below. */}
          <Text size="xs" fw={500} style={{ whiteSpace: "nowrap" }}>
            {formatDueDate(reminder.due_date)}
          </Text>
        </Group>

        <Text size="sm">{reminder.note}</Text>

        <Text size="xs" c="dimmed">
          {/* Bikram Sambat is rendered from the server's `display` string — a
              client never assembles a BS date from its parts. */}
          {bsDisplay ? `${bsDisplay} BS · ` : ""}
          {isOpen
            ? formatDueDistance(reminder.due_date, today)
            : `${REMINDER_STATUS_LABELS[reminder.status].toLowerCase()} by ${reminder.closed_by_username ?? "someone"}`}
          {" · set by "}
          {reminder.created_by_username}
        </Text>

        {/* Collapsed by default, so a panel of twenty reminders costs zero
            history requests until someone asks a question about one. It is also
            the only place a complete/dismiss reason is ever readable. */}
        <ReminderHistory reminderId={reminder.id} />

        {isOpen ? (
          /* Destructive action (Dismiss) sits far left, spatially separated
             from the safe ones on the right — never adjacent to Complete. */
          <Group justify="space-between" gap="xs">
            <Box>
              <Button
                size="compact-xs"
                variant="subtle"
                color="red"
                leftSection={<XCircleIcon size={12} aria-hidden />}
                onClick={handleDismiss}
                loading={dismiss.isPending}
                disabled={isPending}
              >
                Dismiss
              </Button>
            </Box>
            <Group gap="xs">
              {onReschedule ? (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  leftSection={<CalendarPlusIcon size={12} aria-hidden />}
                  onClick={() => onReschedule(reminder)}
                  disabled={isPending}
                >
                  Reschedule
                </Button>
              ) : null}
              <Button
                size="compact-xs"
                variant="light"
                leftSection={<CheckIcon size={12} aria-hidden />}
                onClick={() => complete.mutate()}
                loading={complete.isPending}
                disabled={isPending}
              >
                Complete
              </Button>
            </Group>
          </Group>
        ) : null}
      </Stack>
    </Paper>
  );
}

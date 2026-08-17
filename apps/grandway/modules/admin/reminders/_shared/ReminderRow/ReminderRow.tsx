"use client";

import {
  ActionIcon,
  Badge,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  modals,
} from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { CalendarPlusIcon } from "@phosphor-icons/react/dist/csr/CalendarPlus";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import {
  DUE_BUCKET_LABELS,
  REMINDER_STATUS_COLORS,
  REMINDER_STATUS_ICONS,
  REMINDER_STATUS_LABELS,
} from "../../reminders.labels";
import { REMINDER_LAYER } from "../../reminders.constants";
import { useCompleteReminder, useDismissReminder } from "../../reminders.hooks";
import {
  dueBucket,
  formatBs,
  formatDueDate,
  formatDueDistance,
} from "../../reminders.utils";
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
 * One reminder: **icon · content · actions**, left to right.
 *
 * The leading icon carries the status glyph tinted by *urgency*, so a column of
 * cards is scannable before a single word is read — red means overdue, amber
 * due today, gray healthy or closed. The content column then reads top-down as
 * one sentence of context: what the follow-up is, who set it and on what, then
 * where it sits in time. Actions sit right, out of the reading path.
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
 * per-action pending buttons, with the siblings disabled so two writes can't
 * race · **request-failed** the mutation's resolved toast; the row stays put
 * and the action is retryable · **permission-denied** N/A, the host panel gates
 * on `caps.reminders` and this module has no read/write split · **read-only** a
 * closed row renders its facts with no action group at all · **archived
 * record** that same closed rendering — the row never disappears ·
 * **conflicting edits** a colleague closing it first is a 409 whose message
 * says so, and the panel refetches · **recovery path** completion and dismissal
 * are both recorded in the audit log, and "set a new reminder" is the forward
 * path the confirm names.
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
  const StatusIcon = REMINDER_STATUS_ICONS[reminder.status];
  // The icon takes the DUE tone while open and goes neutral once closed —
  // urgency is a property of an open follow-up, and a completed one that
  // happened to be late should not still shout.
  const iconColor = isOpen
    ? DUE_BUCKET_COLORS[bucket]
    : REMINDER_STATUS_COLORS[reminder.status];

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
      zIndex: REMINDER_LAYER.confirm,
      onConfirm: () => dismiss.mutate(),
    });
  };

  return (
    <Paper withBorder p="sm" radius="md">
      <Group align="flex-start" wrap="nowrap" gap="sm">
        {/* ── Icon ─────────────────────────────────────────────────────── */}
        <ThemeIcon variant="light" color={iconColor} size={34} radius="md">
          <StatusIcon size={18} aria-hidden />
        </ThemeIcon>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          {/* Title — the note IS the reminder; everything else is metadata. */}
          <Text size="sm" fw={500} lineClamp={2}>
            {reminder.note}
          </Text>

          {/* Quick details: who set it, and what it hangs off. */}
          <Text size="xs" c="dimmed">
            Set by {reminder.created_by_username} ·{" "}
            {reminder.owner_type === "applicant" ? "Applicant" : "Client"}
          </Text>

          {/* Status, dates, and how long until (or since) it fires. */}
          <Group gap={6} wrap="wrap">
            <StatusBadge
              value={reminder.status}
              colorMap={REMINDER_STATUS_COLORS}
              labelMap={REMINDER_STATUS_LABELS}
            />
            {isOpen ? (
              <Badge
                size="xs"
                variant="light"
                color={DUE_BUCKET_COLORS[bucket]}
              >
                {DUE_BUCKET_LABELS[bucket]} ·{" "}
                {formatDueDistance(reminder.due_date, today)}
              </Badge>
            ) : null}
            <Text size="xs" c="dimmed">
              {formatDueDate(reminder.due_date)}
              {/* Bikram Sambat comes from the server's `display` string — a
                  client never assembles a BS date from its parts. */}
              {bsDisplay ? ` · ${bsDisplay} BS` : ""}
              {!isOpen
                ? ` · ${REMINDER_STATUS_LABELS[reminder.status].toLowerCase()} by ${reminder.closed_by_username ?? "someone"}`
                : ""}
            </Text>
          </Group>
        </Stack>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        {isOpen ? (
          <Group gap={4} wrap="nowrap" style={{ flex: "none" }}>
            <Tooltip label="Mark complete" withArrow>
              <ActionIcon
                variant="light"
                color="green"
                size="md"
                aria-label="Mark this reminder complete"
                onClick={() => complete.mutate()}
                loading={complete.isPending}
                disabled={isPending}
              >
                <CheckIcon size={16} aria-hidden />
              </ActionIcon>
            </Tooltip>

            {onReschedule ? (
              <Tooltip label="Reschedule" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="md"
                  aria-label="Reschedule this reminder"
                  onClick={() => onReschedule(reminder)}
                  disabled={isPending}
                >
                  <CalendarPlusIcon size={16} aria-hidden />
                </ActionIcon>
              </Tooltip>
            ) : null}

            {/* The irreversible one, held apart by a rule rather than sitting
                flush against Complete — an icon group is a small target and a
                mis-click here cannot be undone. */}
            <Divider orientation="vertical" mx={2} />
            <Tooltip label="Dismiss" withArrow>
              <ActionIcon
                variant="subtle"
                color="red"
                size="md"
                aria-label="Dismiss this reminder"
                onClick={handleDismiss}
                loading={dismiss.isPending}
                disabled={isPending}
              >
                <XCircleIcon size={16} aria-hidden />
              </ActionIcon>
            </Tooltip>
          </Group>
        ) : null}
      </Group>
    </Paper>
  );
}

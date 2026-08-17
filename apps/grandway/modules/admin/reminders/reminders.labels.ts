"use client";

import { BellRingingIcon } from "@phosphor-icons/react/dist/csr/BellRinging";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { CalendarPlusIcon } from "@phosphor-icons/react/dist/csr/CalendarPlus";
import type { Icon } from "@phosphor-icons/react";
import type { ReminderHistoryAction, ReminderStatus } from "./reminders.types";

/** The three lifecycle states (§5). Two of them are terminal. */
export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  active: "Open",
  completed: "Completed",
  dismissed: "Dismissed",
};

/**
 * `active` is deliberately **neutral, not a warning colour**. An open reminder
 * is the normal state of the feature — urgency belongs to the due date, which
 * `dueBucket()` derives per render, not to the status pill. Colouring every
 * open row amber would make a panel of healthy future follow-ups look alarming.
 *
 * `dismissed` is gray rather than red: dropping a follow-up is a legitimate
 * outcome, not a failure.
 */
export const REMINDER_STATUS_COLORS: Record<ReminderStatus, string> = {
  active: "blue",
  completed: "green",
  dismissed: "gray",
};

export const REMINDER_STATUS_ICONS: Record<ReminderStatus, Icon> = {
  active: BellRingingIcon,
  completed: CheckCircleIcon,
  dismissed: ProhibitIcon,
};

/**
 * The five audit actions (§5). `reminder_rescheduled` and `reminder_updated`
 * are a **real distinction** the backend draws — the date moved vs. only the
 * note changed — so they get separate labels rather than a shared "Updated".
 */
export const REMINDER_HISTORY_ACTION_LABELS: Record<
  ReminderHistoryAction,
  string
> = {
  reminder_created: "Reminder set",
  reminder_rescheduled: "Rescheduled",
  reminder_updated: "Note updated",
  reminder_completed: "Completed",
  reminder_dismissed: "Dismissed",
};

export const REMINDER_HISTORY_ACTION_ICONS: Record<
  ReminderHistoryAction,
  Icon
> = {
  reminder_created: PlusCircleIcon,
  reminder_rescheduled: CalendarPlusIcon,
  reminder_updated: PencilSimpleIcon,
  reminder_completed: CheckCircleIcon,
  reminder_dismissed: ProhibitIcon,
};

/**
 * Per-action tint for the history timeline — recognition over recall, so the
 * shape of a reminder's life is readable before any of the words are.
 *
 * Creation is blue (it happened), a reschedule is grape (it moved), a note fix
 * is gray (nothing material changed), completion is green and dismissal gray.
 * Dismissal is deliberately **not** red: dropping a follow-up is a legitimate
 * outcome, not a failure, and a red rail would read as one.
 */
export const REMINDER_HISTORY_ACTION_COLORS: Record<
  ReminderHistoryAction,
  string
> = {
  reminder_created: "blue",
  reminder_rescheduled: "grape",
  reminder_updated: "gray",
  reminder_completed: "green",
  reminder_dismissed: "gray",
};

/**
 * Field names as they read in a change line. The audit payload uses column
 * names; a reader should not have to translate `due_date` in their head.
 */
export const REMINDER_CHANGE_FIELD_LABELS: Record<string, string> = {
  due_date: "Due date",
  note: "Note",
  status: "Status",
  closed_at: "Closed",
};

/** Human labels for the due buckets `dueBucket()` derives (not a server enum). */
export const DUE_BUCKET_LABELS = {
  overdue: "Overdue",
  today: "Due today",
  upcoming: "Upcoming",
  closed: "Closed",
} as const;

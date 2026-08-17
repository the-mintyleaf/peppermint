"use client";

import { BellRingingIcon } from "@phosphor-icons/react/dist/csr/BellRinging";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import type { Icon } from "@phosphor-icons/react";
import type { ReminderStatus } from "./reminders.types";

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

/** Human labels for the due buckets `dueBucket()` derives (not a server enum). */
export const DUE_BUCKET_LABELS = {
  overdue: "Overdue",
  today: "Due today",
  upcoming: "Upcoming",
  closed: "Closed",
} as const;

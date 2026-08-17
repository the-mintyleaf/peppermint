import type { Reminder } from "../../reminders.types";

export interface ReminderRowProps {
  reminder: Reminder;
  /**
   * Nepal's today, passed down so every row in a list buckets against **one**
   * clock. Rows computing it independently could straddle midnight NPT and
   * split a page inconsistently — one row "due today", the next "overdue".
   */
  today: string;
  /** Opens the reschedule modal for this row. Omit on a read-only surface. */
  onReschedule?: (reminder: Reminder) => void;
}

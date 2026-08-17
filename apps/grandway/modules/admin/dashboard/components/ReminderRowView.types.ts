import type { Reminder } from "@/modules/admin/reminders/reminders.types";

export interface ReminderRowViewProps {
  reminder: Reminder;
  /** Nepal's today, passed down so every row reads against one clock. */
  today: string;
  /** Mantine colour for the due badge, derived by the caller via `dashboard.tone.ts`. */
  tone: string;
}

import type { Reminder, ReminderOwner } from "../../reminders.types";

/**
 * The two things this form ever writes. Deliberately narrower than `Reminder`:
 * the owner is never edited (immutable after create) and every lifecycle field
 * is server-set, so neither can reach a request body through this type.
 */
export interface ReminderFormValues extends Record<string, unknown> {
  /** `YYYY-MM-DD`. `null` only while the field is untouched — the schema rejects it. */
  due_date: string | null;
  note: string;
}

export interface ReminderFormModalProps {
  opened: boolean;
  onClose: () => void;
  /**
   * Which record the new reminder hangs off. Required in create mode, ignored
   * in edit mode — the owner is immutable, so an edit never sends one.
   */
  owner: ReminderOwner;
  /**
   * Passing a reminder switches the modal to reschedule/correct mode. Omit for
   * create. **Only an `active` reminder can be edited** — a closed one is a 409,
   * so callers must not open this for a terminal row.
   */
  reminder?: Reminder;
}

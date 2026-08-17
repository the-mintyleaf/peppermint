import type { ReminderOwner } from "../../reminders.types";

export interface RecordRemindersPanelProps {
  /**
   * The record these reminders hang off — `{ applicant: id }` or
   * `{ client: id }`, exactly one.
   *
   * The same object reaches both the list filter (`?applicant=`/`?client=`)
   * and the create body, so a host screen states its identity once. The union
   * is what makes "exactly one owner" a compile-time guarantee rather than a
   * 400 `REMINDERS_OWNER_REQUIRED` at runtime.
   */
  owner: ReminderOwner;
}

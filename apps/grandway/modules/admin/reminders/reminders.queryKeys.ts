import { createQueryKeys } from "@peppermint/admin";

export const reminderQueryKeys = createQueryKeys("reminders.reminders");

/**
 * `/history/` is a different resource shape from the reminder row, but it is
 * genuinely scoped to one reminder — so it nests under that reminder's detail
 * key rather than claiming a top-level slot. Invalidating
 * `reminderQueryKeys.detail(id)` therefore refreshes the row and its history
 * together, which is what every mutation on that reminder wants.
 */
export const reminderHistoryKey = (id: string) =>
  [...reminderQueryKeys.detail(id), "history"] as const;

/**
 * The dashboard's due-work card reads `/api/v1/reminders/` directly rather than
 * through `/api/v1/dashboard/` (that contract has no reminder section at all).
 * It gets its own cache slot instead of a `reminderQueryKeys.list(...)` key
 * because it is a *different question* — "what is due across the whole office"
 * rather than "what is on this record" — and it must survive a record panel's
 * filters changing.
 *
 * It is still invalidated by every reminder mutation: completing a follow-up
 * from an applicant screen has to move the dashboard count too.
 */
export const dueRemindersKey = () => ["reminders.due"] as const;

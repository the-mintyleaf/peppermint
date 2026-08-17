// Module barrel.
//
// Cross-module consumers (ApplicantDetail, ClientDetailDrawer, the dashboard)
// import the CONCRETE file they need — `@/modules/admin/reminders/_shared/...`
// — not this barrel, per the app doc's cycle rule. This file exists for
// in-module imports and for the small surface the dashboard genuinely shares.
//
// `remove`/`deleteReminder` is deliberately absent and must stay that way:
// there is no DELETE endpoint anywhere in this module.

// `fetchReminderHistory` / `useReminderHistory` / `reminderHistoryKey` and the
// `ReminderHistoryEntry` shape are kept as the module's typed coverage of
// `GET /<id>/history/`, but **nothing renders them today** — the reminder card
// deliberately carries no history (it is a scanning surface, not an archive).
// If a history view returns, the data layer is already correct; it needs a
// component and its own action label/icon vocabulary back.
export {
  completeReminder,
  createReminder,
  dismissReminder,
  fetchReminderHistory,
  getReminder,
  listReminders,
  updateReminder,
} from "./reminders.api";

export { REMINDER_LAYER } from "./reminders.constants";

export {
  dueRemindersKey,
  reminderHistoryKey,
  reminderQueryKeys,
} from "./reminders.queryKeys";

export {
  useCompleteReminder,
  useCreateReminder,
  useDismissReminder,
  useReminder,
  useReminderHistory,
  useReminderList,
  useUpdateReminder,
} from "./reminders.hooks";

export {
  changedUpdateFields,
  dueBucket,
  formatBs,
  formatDueDate,
  formatDueDistance,
  nepalToday,
  sortRemindersForPanel,
} from "./reminders.utils";
export type { ReminderDueBucket } from "./reminders.utils";

export {
  DUE_BUCKET_LABELS,
  REMINDER_STATUS_COLORS,
  REMINDER_STATUS_ICONS,
  REMINDER_STATUS_LABELS,
} from "./reminders.labels";

export type {
  BsDate,
  Reminder,
  ReminderActionPayload,
  ReminderCreatePayload,
  ReminderHistoryAction,
  ReminderHistoryActorType,
  ReminderHistoryEntry,
  ReminderListFilters,
  ReminderOwner,
  ReminderOwnerType,
  ReminderStatus,
  ReminderUpdatePayload,
} from "./reminders.types";

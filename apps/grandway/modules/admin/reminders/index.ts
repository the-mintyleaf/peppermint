// Module barrel.
//
// Cross-module consumers (ApplicantDetail, ClientDetailDrawer, the dashboard)
// import the CONCRETE file they need — `@/modules/admin/reminders/_shared/...`
// — not this barrel, per the app doc's cycle rule. This file exists for
// in-module imports and for the small surface the dashboard genuinely shares.
//
// `remove`/`deleteReminder` is deliberately absent and must stay that way:
// there is no DELETE endpoint anywhere in this module.

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
  REMINDER_HISTORY_ACTION_ICONS,
  REMINDER_HISTORY_ACTION_LABELS,
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

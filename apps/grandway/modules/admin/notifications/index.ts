export { ModuleNotificationCentre } from "./pages/centre/NotificationCentre";
export { RecordAlertsPanel } from "./_shared/RecordAlertsPanel";

// Public API for cross-module reuse — the bell badge (later phase, wired into
// Admin.tsx/admin-nav.ts by the orchestrator) and any detail screen embedding
// `RecordAlertsPanel`. Internal siblings import concrete files, not this barrel.
export { useNotificationSummary } from "./notifications.hooks";
export { notificationQueryKeys, summaryKey } from "./notifications.queryKeys";
export {
  NOTIFICATION_TYPE_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from "./notifications.labels";
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  DueBucket,
  FeedSummary,
  NotificationListFilters,
} from "./notifications.types";

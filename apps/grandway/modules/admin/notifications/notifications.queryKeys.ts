import { createQueryKeys } from "@peppermint/admin";
import type { NotificationSummaryParams } from "./notifications.types";

export const notificationQueryKeys = createQueryKeys(
  "notifications.notifications",
);

/**
 * `FeedSummary` is a different resource shape entirely from the feed row —
 * its own cache slot, not nested under `notificationQueryKeys` (so
 * invalidating `notificationQueryKeys.all` never accidentally misses it, and
 * vice versa; every mutation invalidates both explicitly).
 */
export const summaryKey = (params?: NotificationSummaryParams) =>
  params
    ? (["notifications.summary", params] as const)
    : (["notifications.summary"] as const);

import type { Notification } from "../../notifications.types";

export interface NotificationRowProps {
  notification: Notification;
  /** Hide the due-bucket badge when the parent already groups rows by bucket (the inbox). Defaults to shown. */
  showDueBucketBadge?: boolean;
}

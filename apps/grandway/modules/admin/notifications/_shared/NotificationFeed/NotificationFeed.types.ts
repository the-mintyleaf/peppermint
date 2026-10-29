import type { NotificationCategory } from "../../notifications.types";

export interface NotificationFeedProps {
  /**
   * Narrow the inbox to these categories (sent as `?category=a,b`). Empty or
   * omitted means every category ("All").
   */
  categories?: NotificationCategory[];
  /** Human name of the tab, used in the empty state ("No active alerts in Leads."). Omit for the unfiltered inbox. */
  scopeLabel?: string;
}

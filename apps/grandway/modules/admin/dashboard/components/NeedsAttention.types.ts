import type { DashboardTab } from "../dashboard.tabs";
import type { DashboardFilters } from "../dashboard.types";

export interface NeedsAttentionProps {
  filters: DashboardFilters;
  /** Opens the tab that carries the rows behind an alert. */
  onOpenTab: (tab: DashboardTab) => void;
}

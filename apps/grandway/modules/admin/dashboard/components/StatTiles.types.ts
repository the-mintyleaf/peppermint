import type { DashboardTab } from "../dashboard.tabs";
import type { DashboardFilters } from "../dashboard.types";

export interface StatTilesProps {
  filters: DashboardFilters;
  /** Opens the tab holding the rows behind an alert tile. */
  onOpenTab: (tab: DashboardTab) => void;
}

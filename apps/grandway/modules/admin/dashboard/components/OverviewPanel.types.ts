import type { DashboardTab } from "../dashboard.tabs";
import type { DashboardFilters } from "../dashboard.types";

export interface OverviewPanelProps {
  filters: DashboardFilters;
  /** Opens the tab that carries the full detail behind a summary card. */
  onOpenTab: (tab: DashboardTab) => void;
}

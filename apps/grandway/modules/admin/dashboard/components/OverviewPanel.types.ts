import type { DashboardTab } from "../dashboard.tabs";
import type { DashboardFilters } from "../dashboard.types";

export interface OverviewPanelProps {
  filters: DashboardFilters;
  /** Opens the tab that carries the full detail behind a summary card. */
  onOpenTab: (tab: DashboardTab) => void;
  /** Sets the header's country filter — the country cards scope the page by activating a card. */
  onSelectCountry: (countryId: string) => void;
}

export interface OverviewSectionProps {
  filters: DashboardFilters;
  onOpenTab: (tab: DashboardTab) => void;
}

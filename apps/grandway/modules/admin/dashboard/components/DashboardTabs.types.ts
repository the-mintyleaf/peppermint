import type { ReactNode } from "react";
import type { DashboardTab } from "../dashboard.tabs";

export interface DashboardTabsProps {
  value: DashboardTab;
  onChange: (value: DashboardTab) => void;
  /** The `Tabs.Panel`s. Kept as children so the list and the panels stay inside one `Tabs` context (aria-controls, arrow-key roving). */
  children: ReactNode;
}

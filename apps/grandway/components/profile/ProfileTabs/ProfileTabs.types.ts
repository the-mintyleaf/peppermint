import type { ReactNode } from "react";

export interface ProfileTab {
  /** Stable tab key. */
  value: string;
  label: string;
  /** Optional count shown as a badge on the tab (e.g. journeys 3). */
  count?: number;
  /** Optional leading Phosphor icon. */
  icon?: ReactNode;
  panel: ReactNode;
}

export interface ProfileTabsProps {
  tabs: ProfileTab[];
  /** Defaults to the first tab's value. */
  defaultValue?: string;
}

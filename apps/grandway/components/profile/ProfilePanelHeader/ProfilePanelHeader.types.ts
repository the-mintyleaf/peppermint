import type { ReactNode } from "react";

export interface ProfilePanelHeaderProps {
  /** The panel's own title — the page-level anchor inside a tab. */
  title: string;
  /** Optional one-line context under the title. */
  description?: string;
  /** Optional count shown beside the title as a quiet badge (a fact, not a lever). */
  count?: number;
  /** Trailing slot on the title line — search, primary action, external link. */
  action?: ReactNode;
}

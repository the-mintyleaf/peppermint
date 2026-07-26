import type { ReactNode } from "react";

export interface PreviewTab {
  /** Stable tab id (Mantine Tabs value). */
  value: string;
  /** Tab label. */
  label: string;
  /** The real total for this queue (INTEGRATION.md: from `total`, not `items.length`). */
  total: number;
  /** Whether more rows exist beyond the ≤10 preview (drives "see all"). */
  hasMore: boolean;
  /** Link to the owning app's list. */
  seeAllHref: string;
  /** Rendered rows (already mapped to row views), or an empty array. */
  rows: ReactNode[];
  /** Message shown when the queue is empty. */
  emptyMessage: string;
  /** Optional dimmed note above the rows (e.g. a filter caveat). */
  caption?: string;
}

export interface PreviewTabsProps {
  tabs: PreviewTab[];
  /** Accessible label for the tablist. */
  ariaLabel: string;
}

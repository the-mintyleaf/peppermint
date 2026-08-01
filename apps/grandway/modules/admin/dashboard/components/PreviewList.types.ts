import type { ReactNode } from "react";

export interface PreviewListProps {
  /** Already-rendered rows — at most the ≤10 the API previews. */
  rows: ReactNode[];
  /** The REAL total from the payload, never `rows.length`. */
  total: number;
  /** `has_more` from the payload — drives the "see all" link, not a length check. */
  hasMore: boolean;
  seeAllHref: string;
  /** Shown instead of rows when the queue is empty — an empty queue is healthy. */
  emptyMessage: string;
  /** A caveat about how to read this queue (e.g. "ignores the country filter"). */
  caption?: string;
}

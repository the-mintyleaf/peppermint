import type { ReactNode } from "react";
import type { Preview } from "../dashboard.types";

export interface WorklistPreviewCardProps<TRow> {
  title: string;
  preview: Preview<TRow>;
  getRowKey: (row: TRow) => string;
  renderRow: (row: TRow) => ReactNode;
  emptyMessage: string;
  /** "See all" destination — omitted when there is no owning list view to send the user to. */
  seeAllHref?: string;
  /** e.g. "Ignores the country filter" — rendered as a small dimmed caption under the title. */
  caption?: string;
}

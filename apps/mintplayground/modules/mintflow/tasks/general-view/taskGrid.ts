import type { CSSProperties } from "react";
import type { VisibleColumns } from "../Tasks.types";

// Builds the list grid template from the toggled columns. Name + List are
// always shown; Priority / Due / Assignee collapse out entirely (track removed,
// not just hidden) so header and rows stay aligned. Column widths come from the
// CSS variables declared on `.table` in TaskTable.module.css.
export function taskGridStyle(columns: VisibleColumns): CSSProperties {
  return {
    gridTemplateColumns: [
      "var(--col-left)",
      "var(--col-name)",
      columns.priority ? "var(--col-priority)" : null,
      "var(--col-list)",
      columns.due ? "var(--col-due)" : null,
      columns.assignee ? "var(--col-assignee)" : null,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

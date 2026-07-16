import type { CSSProperties } from "react";

export interface TopCaseProps {
  /** Mobile shows the % inline in the header; desktop adds a "Progress" footer. */
  variant: "mobile" | "desktop";
  /** Grid placement / sizing overrides. */
  style?: CSSProperties;
}

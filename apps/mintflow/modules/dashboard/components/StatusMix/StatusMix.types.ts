import type { CSSProperties } from "react";

export interface StatusMixProps {
  /** Total case count, e.g. "163". */
  total: string;
  /** Segment ratios [Ongoing, On-Next, Done]. */
  mix: [number, number, number];
  /** Raw counts matching each segment. */
  legend: [string, string, string];
  /** Grid placement / sizing overrides. */
  style?: CSSProperties;
}

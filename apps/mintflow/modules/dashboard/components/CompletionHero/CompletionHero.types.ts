import type { CSSProperties } from "react";

export interface CompletionHeroProps {
  /** Completion rate string, e.g. "87%". */
  completion: string;
  /** Progress fill ratio 0–1. */
  ring: number;
  /** Trend string shown in green, e.g. "+12%". */
  trend: string;
  /** Big number font size (46 mobile, 58 desktop). */
  numberSize?: number;
  /** Grid placement / sizing overrides. */
  style?: CSSProperties;
}

import type { BsDate } from "../applicant.types";

export interface BsDateTextProps {
  /** The AD value — the source of truth, and the only one ever sent back. */
  value?: string | null;
  /** The response-only Bikram Sambat sibling, when the endpoint emits one. */
  bs?: BsDate | null;
  /** Which BS script to show. Defaults to the English transliteration. */
  script?: "en" | "np";
  /**
   * Show the time alongside the AD date. Needed for genuine datetime fields —
   * on an interaction log or a consent capture, the time of day is information,
   * not noise. The BS sibling carries no time, so it stays date-only.
   */
  withTime?: boolean;
  size?: "xs" | "sm";
  /** Rendered when both values are absent. */
  fallback?: string;
}

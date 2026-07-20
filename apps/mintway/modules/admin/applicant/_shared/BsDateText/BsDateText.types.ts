import type { BsDate } from "../applicant.types";

export interface BsDateTextProps {
  /** The AD value — the source of truth, and the only one ever sent back. */
  value?: string | null;
  /** The response-only Bikram Sambat sibling, when the endpoint emits one. */
  bs?: BsDate | null;
  /** Which BS script to show. Defaults to the English transliteration. */
  script?: "en" | "np";
  size?: "xs" | "sm";
  /** Rendered when both values are absent. */
  fallback?: string;
}

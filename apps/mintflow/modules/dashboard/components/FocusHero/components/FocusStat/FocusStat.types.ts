import type { ReactNode } from "react";

export interface FocusStatProps {
  /** Big-number readout (may include a muted suffix, e.g. "1/3"). */
  value: ReactNode;
  label: string;
  /** Optional accent color for the number (defaults to ink). */
  color?: string;
}

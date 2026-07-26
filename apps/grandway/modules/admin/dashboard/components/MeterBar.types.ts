import type { ReactNode } from "react";

export interface MeterBarProps {
  /** Left-hand row label. */
  label: ReactNode;
  /** The raw value the bar represents. */
  value: number;
  /** Scale the fill against this (usually the max across sibling rows). */
  max: number;
  /** Mantine color name or hex. Defaults to a neutral gray for pure quantities. */
  color?: string;
  /** Emphasise this row with the brand accent (reserved for the leading row). */
  emphasize?: boolean;
  /** Override the number shown on the right (e.g. a suffix, or a preformatted string). */
  display?: ReactNode;
  /** Fixed label column width in px, so a group of bars aligns. */
  labelWidth?: number;
  /** When true, dim the row (used for a zero/negligible value). */
  muted?: boolean;
  /** Optional link — wraps the whole row (used by the "Needs attention" alerts). */
  href?: string;
}

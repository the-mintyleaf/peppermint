import type { ReactNode } from "react";

export interface DetailCardProps {
  /** Section label rendered in the card header. */
  title: string;
  /** Phosphor glyph naming the concept this card groups. */
  icon: ReactNode;
  /** Optional trailing element in the header (e.g. a badge or link). */
  action?: ReactNode;
  children: ReactNode;
}

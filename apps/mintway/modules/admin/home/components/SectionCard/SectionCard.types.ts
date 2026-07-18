import type { ReactNode } from "react";

/** A titled group wrapper — space-first grouping, one local anchor per region. */
export interface SectionCardProps {
  title: string;
  /** Optional right-aligned adornment (e.g. a "View all" link). */
  action?: ReactNode;
  children: ReactNode;
}

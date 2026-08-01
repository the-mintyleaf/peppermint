import type { ReactNode } from "react";

export interface SectionBandProps {
  /** The band's name, in the operator's vocabulary ("Leads", not "Lead management"). */
  title: string;
  /** The question this band answers, or the caveat on reading it. */
  subtitle?: string;
  /** `Grid.Col`s. The band owns the 12-column grid; cards own their spans. */
  children: ReactNode;
}

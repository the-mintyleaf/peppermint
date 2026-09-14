import type { ReactNode } from "react";

export interface SectionBandProps {
  /**
   * The band's name, in the operator's vocabulary ("Leads", not "Lead
   * management"). Omit inside a tab panel — the tab label already names the
   * band, and repeating it puts the same word twice on one screen.
   */
  title?: string;
  /** The question this band answers, or the caveat on reading it. */
  subtitle?: string;
  /** `Grid.Col`s. The band owns the 12-column grid; cards own their spans. */
  children: ReactNode;
}

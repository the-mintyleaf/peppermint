import type { ReactNode } from "react";

export interface DetailSectionProps {
  /** Uppercase dimmed divider label — the section's quiet anchor. */
  title: string;
  children: ReactNode;
}

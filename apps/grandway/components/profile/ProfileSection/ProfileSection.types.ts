import type { ReactNode } from "react";

export interface ProfileSectionProps {
  /** Uppercase section label — the clear boundary between blocks of tab content. */
  title: string;
  /** Optional one-line context under the title. */
  description?: string;
  /** Trailing header slot — a search input, an "Add" button, a count badge. */
  action?: ReactNode;
  children: ReactNode;
}

import type { ReactNode } from "react";

export interface ProfileLayoutProps {
  /** Left column (5/12): the sticky identity/overview card. */
  sidebar: ReactNode;
  /** Right column (7/12): the tabs and their content. */
  children: ReactNode;
}

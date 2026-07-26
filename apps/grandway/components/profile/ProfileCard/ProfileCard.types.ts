import type { ReactNode } from "react";

export interface ProfileCardProps {
  /** When set, the whole card becomes a link (with a hover affordance). */
  href?: string;
  children: ReactNode;
}

import type { ReactNode } from "react";

export interface PropertyRowProps {
  /** Leading icon in the 104px label column. */
  icon: ReactNode;
  /** Label text (13px, muted). */
  label: string;
  /** Value area content. */
  children: ReactNode;
  /** When set, the whole row becomes a button (used by the pickers). */
  onClick?: () => void;
}

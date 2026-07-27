import type { ReactNode } from "react";

export interface ProfileListProps {
  /**
   * One node per record. A `Divider` is inserted between adjacent rows — never
   * above the first or below the last, so the list reads as one block rather
   * than as a boxed table.
   */
  children: ReactNode;
}

export interface ProfileListRowProps {
  /** The row's content — usually a `Group` of identity, facts, and a trailing menu. */
  children: ReactNode;
  /** Turns the whole row into a hoverable `next/link`. Omit for rows with their own controls. */
  href?: string;
}

import type { ReactNode } from "react";

/**
 * The compact card shell for the bento dashboard. A titled region with one local anchor
 * (the header row: accent icon + title) and a body slot. Grouping is space-first — the
 * accent lives in the icon chip, not a heavy border (DESIGN.md 1.2).
 */
export interface BentoCardProps {
  title: string;
  /** Optional accent glyph shown in a tinted chip left of the title. */
  icon?: ReactNode;
  /** Mantine theme color for the icon accent. Defaults to a neutral gray. */
  color?: string;
  /** Optional right-aligned adornment (e.g. a "View all" link). */
  action?: ReactNode;
  /** Grid-span class(es) that place this card in the bento grid. */
  className?: string;
  children: ReactNode;
}

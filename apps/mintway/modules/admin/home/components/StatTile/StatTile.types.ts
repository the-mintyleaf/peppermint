import type { ReactNode } from "react";

/**
 * A single KPI stat fact. A tile is a *state* (a number), never an action — when `href`
 * is set the whole tile becomes a quiet navigation target, styled distinctly from the
 * action buttons in `QuickActions` (DESIGN.md 1.9).
 */
export interface StatTileProps {
  /** Short noun the number counts (e.g. "Interested"). */
  label: string;
  /** The count. `undefined` while loading or on error — the tile renders the matching state. */
  value: number | undefined;
  icon: ReactNode;
  /** Mantine theme color for the icon accent. Defaults to a neutral gray. */
  color?: string;
  /** Optional sub-label (e.g. "3 drafts"). */
  hint?: string;
  /** When set, the tile navigates here on click/Enter. */
  href?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

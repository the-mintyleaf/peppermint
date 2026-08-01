import type { ComponentType } from "react";

/**
 * Severity, not decoration. `critical`/`warning` mean an SLA is breached or at
 * risk; `routine` is outstanding work with no clock on it; `volume` is a
 * standing total that is never an alert.
 */
export type StatTileTone = "volume" | "critical" | "warning" | "routine";

export interface StatTileProps {
  label: string;
  /** `undefined` while loading; renders `—` (never `0`) when the fetch failed. */
  value: number | undefined;
  icon: ComponentType<{ size?: number; weight?: "regular" | "fill" }>;
  tone?: StatTileTone;
  /** Footer line under the figure — what the number counts over, or where it leads. */
  caption?: string;
  isPending?: boolean;
  isError?: boolean;
  /** Makes the tile a button. Omit for a tile with no destination. */
  onActivate?: () => void;
  /** Accessible name for the `onActivate` control (e.g. "42 overdue checklist items. Open Today."). */
  activateLabel?: string;
}

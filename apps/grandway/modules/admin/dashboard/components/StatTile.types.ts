import type { ComponentType } from "react";
import type { FigureTone } from "../dashboard.tone";

export interface StatTileProps {
  label: string;
  /** `undefined` while loading; renders `—` (never `0`) when the fetch failed. */
  value: number | undefined;
  icon: ComponentType<{ size?: number; weight?: "regular" | "fill" }>;
  /**
   * Derived per render from the figure itself (`toneForAlert`/`toneForShare`) —
   * never a fixed colour chosen at the call site.
   */
  tone?: FigureTone;
  /** Footer line under the figure — what the number counts over, or where it leads. */
  caption?: string;
  /** `sm` fits a 2/12 column; `lg` is the figure a card exists to show. */
  size?: "sm" | "lg";
  isPending?: boolean;
  isError?: boolean;
  /** Makes the tile a button. Omit for a tile with no destination. */
  onActivate?: () => void;
  /** Accessible name for the `onActivate` control (e.g. "42 overdue checklist items. Open Today."). */
  activateLabel?: string;
}

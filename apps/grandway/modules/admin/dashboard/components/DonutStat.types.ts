import type { ReactNode } from "react";

export interface DonutStatItem {
  label: string;
  value: number;
  /** Mantine color name or hex. */
  color: string;
}

export interface DonutStatProps {
  items: DonutStatItem[];
  /** Big number in the ring centre (usually the total). */
  centerValue: ReactNode;
  /** Small caption under the centre value. */
  centerLabel: string;
  /** Ring diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  thickness?: number;
  /** Legend beside the ring (`horizontal`) or below it (`vertical`). */
  layout?: "horizontal" | "vertical";
}

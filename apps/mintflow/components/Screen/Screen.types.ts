import type { ReactNode } from "react";

export interface ScreenProps {
  children: ReactNode;
  /** Remove the centered max-width (dashboard desktop wants full width). */
  fluid?: boolean;
  /** Dark surface (dashboard). Defaults to the warm paper surface. */
  dark?: boolean;
  /** Explicit background override. */
  bg?: string;
  /** Max content width when not fluid. */
  maxWidth?: number;
  /** Horizontal padding (px). */
  px?: number;
}

import type { ReactNode } from "react";

export interface StatusPillProps {
  children: ReactNode;
  /** Foreground (text/dot) color. */
  fg?: string;
  /** Background tint. */
  bg?: string;
  /** Optional border color (outlined chip). */
  border?: string;
  /** Show a leading status dot in `fg` (or `dot`) color. */
  dot?: boolean | string;
  /** Render mono (uppercase-tracked) label instead of Space Grotesk. */
  mono?: boolean;
  fz?: string;
  radius?: number;
  px?: number;
  py?: number;
}

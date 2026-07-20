import type { CSSProperties } from "react";

export interface CrossMarkProps {
  /**
   * `md` marks a junction between two structural (solid) rules; `sm` marks a
   * junction where an interior (dotted) rule meets a structural one.
   */
  size?: "sm" | "md";
  /**
   * `line` is the default hairline. `accent` marks the one junction the eye
   * should land on; `on-accent` is for a mark sitting on the accent bar.
   */
  tone?: "line" | "accent" | "on-accent";
  /** Positioning class from the consuming module — supplies top/left/right/bottom. */
  className?: string;
  /** One-off offsets when a class would be overkill. */
  style?: CSSProperties;
}

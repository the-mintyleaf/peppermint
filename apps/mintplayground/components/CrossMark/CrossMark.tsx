"use client";

import { Box } from "@peppermint/ui";

import type { CrossMarkProps } from "./CrossMark.types";
import classes from "./CrossMark.module.css";

/**
 * A `+` drawn where two rules meet. In a language built entirely from hairlines,
 * a junction is the one place the structure is genuinely ambiguous — two 1px
 * lines crossing read as one bent line. The mark thickens the crossing just
 * enough to resolve it.
 *
 * It is decoration: always `aria-hidden`, and it carries no state. The parent
 * positions it by setting `top`/`left`/`right`/`bottom` through `className`;
 * this component centres itself on that coordinate.
 */
export function CrossMark({ tone = "line", className, style }: CrossMarkProps) {
  return (
    <Box
      aria-hidden
      data-tone={tone}
      className={className ? `${classes.cross} ${className}` : classes.cross}
      style={style}
    />
  );
}

"use client";

import { Box } from "@peppermint/ui";

import { tokens } from "@/config/design";
import type { ScreenProps } from "./Screen.types";
import classes from "./Screen.module.css";

/**
 * Standard content container for a Kamban screen: warm-paper (or dark) surface,
 * centered mobile-width column that clears the floating bottom nav, opting into
 * full width with `fluid` (the dashboard's desktop layout).
 */
export function Screen({
  children,
  fluid = false,
  dark = false,
  bg,
  maxWidth,
  px,
}: ScreenProps) {
  return (
    <Box
      className={classes.screen}
      style={{ background: bg ?? (dark ? tokens.tileDeep : tokens.paper) }}
    >
      <Box
        className={`${classes.inner}${fluid ? ` ${classes.fluid}` : ""}`}
        style={
          {
            "--screen-max": maxWidth ? `${maxWidth}px` : undefined,
            "--screen-px": px != null ? `${px}px` : undefined,
          } as React.CSSProperties
        }
      >
        {children}
      </Box>
    </Box>
  );
}

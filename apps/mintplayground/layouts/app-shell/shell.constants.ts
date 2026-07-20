/** Width of the nav column when expanded. */
export const NAV_WIDTH = 264;
/** Width of the nav column when collapsed to the desktop icon rail. */
export const NAV_WIDTH_COLLAPSED = 60;
/**
 * Width below which the nav column leaves the frame and becomes a drawer. Kept
 * as a raw media query because `useMediaQuery` takes a query rather than a
 * Mantine breakpoint name — it must stay in step with the `48em` media queries
 * in the shell's stylesheets.
 */
export const NAV_BREAKPOINT = "(min-width: 48em)";
/** Shown in the status rail's right-hand slot. */
export const SHELL_VERSION = "0.1.0";

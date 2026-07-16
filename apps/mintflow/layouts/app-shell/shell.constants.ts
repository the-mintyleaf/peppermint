import type { CSSProperties } from "react";

import { tokens } from "@/config/design";

/** Fixed width of the single icon rail. */
export const RAIL_WIDTH = 64;
/** Outer inset around the rail inside the AppShell navbar slot. */
export const SHELL_INSET = 6;
/** Height of the brand header block at the top of the rail. */
export const NAV_HEADER_HEIGHT = 48;

/**
 * The single dark rail card. mintflow's body is a light gray and the main
 * content sits on the warm-paper surface, so — unlike the admin `AdminShell`,
 * which leaves the rail transparent over a dark app background — this rail must
 * carry its own dark ink/tile surface.
 */
export const railCardStyle: CSSProperties = {
  backgroundColor: tokens.tile,
  borderRadius: tokens.radius.card,
  boxShadow: tokens.shadow.nav,
  overflow: "hidden",
};

import type { CSSProperties } from "react";

import { tokens } from "@/config/design";

/** Fixed width of the full (expanded) navigation panel. */
export const NAV_WIDTH = 280;
/** Width of the panel when collapsed to the desktop icon rail. */
export const NAV_WIDTH_COLLAPSED = 72;
/** Outer inset around the panel inside the AppShell navbar slot. */
export const SHELL_INSET = 8;
/** Height of the brand header block at the top of the panel. */
export const NAV_HEADER_HEIGHT = 56;

/**
 * The full nav panel card — a single always-open 280px sidebar (no icon-rail /
 * sub-nav split). The body is light and the content sits on the paper
 * surface, so the panel carries its own dark ink/tile surface.
 */
export const navCardStyle: CSSProperties = {
  backgroundColor: tokens.tile,
  borderRadius: tokens.radius.card,
  boxShadow: tokens.shadow.nav,
  overflow: "hidden",
};

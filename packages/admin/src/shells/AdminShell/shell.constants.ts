import type { CSSProperties } from "react";

export const SHELL_INSET = 6;
export const SHELL_GAP = 6;

export const MAIN_NAV_WIDTH = 64;
export const SUB_NAV_WIDTH = 280;
export const NAV_HEADER_HEIGHT = 48;

export const shellCardStyle: CSSProperties = {
  borderRadius: "var(--mantine-radius-default)",
  overflow: "hidden",
};

export function getNavbarWidth(showSubNav: boolean): number {
  const panels = showSubNav
    ? MAIN_NAV_WIDTH + SHELL_GAP + SUB_NAV_WIDTH
    : MAIN_NAV_WIDTH;

  return SHELL_INSET + panels;
}

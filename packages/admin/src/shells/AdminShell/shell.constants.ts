import type { CSSProperties } from "react";

export const SHELL_INSET = 8;
export const SHELL_GAP = 8;

export const MAIN_NAV_WIDTH = 60;
export const SUB_NAV_WIDTH = 280;
export const NAV_HEADER_HEIGHT = 60;

export const shellCardStyle: CSSProperties = {
  border: "1px solid var(--mantine-color-dark-6)",
  borderRadius: "var(--mantine-radius-lg)",
  overflow: "hidden",
};

export function getNavbarWidth(showSubNav: boolean): number {
  const panels = showSubNav
    ? MAIN_NAV_WIDTH + SHELL_GAP + SUB_NAV_WIDTH
    : MAIN_NAV_WIDTH;

  return SHELL_INSET + panels;
}

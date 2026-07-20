"use client";

import { useMediaQuery } from "@peppermint/ui";

import { useSidebarStore } from "./AppShell.store";
import { NAV_BREAKPOINT } from "./shell.constants";

/**
 * Effective collapsed state for the nav column. Collapse is a **desktop** concern
 * — below `NAV_BREAKPOINT` the column is a drawer and always renders in full.
 * Returns `false` until the store rehydrates so SSR and the first client paint
 * agree (no hydration mismatch).
 */
export function useRailCollapsed(): boolean {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const hasHydrated = useSidebarStore((s) => s.hasHydrated);
  const isDesktop = useMediaQuery(NAV_BREAKPOINT);
  return hasHydrated && collapsed && Boolean(isDesktop);
}

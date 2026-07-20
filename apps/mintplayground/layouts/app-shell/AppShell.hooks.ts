"use client";

import { useMediaQuery } from "@peppermint/ui";

import { useSidebarStore } from "./AppShell.store";

/**
 * Effective collapsed state for the nav panel. Collapse is a **desktop** concern
 * — below `sm` (48em) the panel is the Burger overlay and always renders in full.
 * Returns `false` until the store rehydrates so SSR and the first client paint
 * agree (no hydration mismatch).
 */
export function useRailCollapsed(): boolean {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const hasHydrated = useSidebarStore((s) => s.hasHydrated);
  const isDesktop = useMediaQuery("(min-width: 48em)");
  return hasHydrated && collapsed && Boolean(isDesktop);
}

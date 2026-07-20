"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  /** Whether the desktop nav panel is collapsed to the icon rail. */
  collapsed: boolean;
  /** True once persisted state has rehydrated on the client. */
  hasHydrated: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setHasHydrated: () => void;
}

/**
 * Persisted collapse state for the desktop nav panel. Consumers read the
 * effective value as `hasHydrated ? collapsed : false` so the server render and
 * the first client render both show the expanded panel (no hydration mismatch),
 * then flip to the stored value after rehydration.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      hasHydrated: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setHasHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "mintplayground-sidebar",
      // Only the user's choice is persisted — never the hydration flag.
      partialize: (state) => ({ collapsed: state.collapsed }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(),
    },
  ),
);

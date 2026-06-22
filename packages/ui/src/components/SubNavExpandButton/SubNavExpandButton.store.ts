"use client";

import { create } from "zustand";

interface SubNavStore {
  subNavCollapsed: boolean;
  collapse: () => void;
  expand: () => void;
}

export const useSubNavStore = create<SubNavStore>((set) => ({
  subNavCollapsed: false,
  collapse: () => set({ subNavCollapsed: true }),
  expand: () => set({ subNavCollapsed: false }),
}));

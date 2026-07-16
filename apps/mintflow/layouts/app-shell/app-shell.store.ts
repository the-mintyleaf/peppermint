import { create } from "zustand";

/**
 * Global UI state for the Kamban app shell. Currently owns the Create Task
 * sheet, which the ＋ action opens from any screen (bottom nav / icon rail).
 */
interface AppShellState {
  createTaskOpen: boolean;
  openCreateTask: () => void;
  closeCreateTask: () => void;
}

export const useAppShellStore = create<AppShellState>((set) => ({
  createTaskOpen: false,
  openCreateTask: () => set({ createTaskOpen: true }),
  closeCreateTask: () => set({ createTaskOpen: false }),
}));

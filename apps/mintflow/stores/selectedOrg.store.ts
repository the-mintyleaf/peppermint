import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SelectedOrgInfo {
  id: string;
  name: string;
  code: string;
  status: string;
  country_code: string;
}

interface SelectedOrgStore {
  org: SelectedOrgInfo | null;
  setOrg: (org: SelectedOrgInfo) => void;
  clearOrg: () => void;
}

export const useSelectedOrgStore = create<SelectedOrgStore>()(
  persist(
    (set) => ({
      org: null,
      setOrg: (org) => set({ org }),
      clearOrg: () => set({ org: null }),
    }),
    { name: "mintflow-selected-org" },
  ),
);

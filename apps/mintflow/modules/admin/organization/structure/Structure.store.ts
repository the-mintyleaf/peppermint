import { create } from "zustand";

import { computeSubtreeIds } from "./Structure.utils";
import type {
  DeactivateModalConfig,
  MoveModalConfig,
  UnitModalConfig,
} from "./Structure.types";

interface StructureState {
  selectedUnitId: string | null;
  drawerOpen: boolean;
  unitModal: UnitModalConfig;
  moveModal: MoveModalConfig;
  deactivateModal: DeactivateModalConfig;

  expandedUnitIds: string[];
  focusedBranchId: string | null;
  searchUnitId: string | null;
  /** Cached so expand/collapse-all and subtree lookups don't need the live edges prop threaded through every action. */
  edgeCache: Array<{ source: string; target: string }>;

  selectUnit: (id: string | null) => void;
  closeDrawer: () => void;
  openAddUnitModal: (parentId?: string, parentName?: string) => void;
  openEditUnitModal: (unitId: string) => void;
  closeUnitModal: () => void;
  openMoveModal: (unitId: string, unitName: string) => void;
  closeMoveModal: () => void;
  openDeactivateModal: (unitId: string, unitName: string) => void;
  closeDeactivateModal: () => void;

  expandUnit: (id: string) => void;
  collapseUnit: (id: string) => void;
  collapseAll: () => void;
  setExpandedUnitIds: (ids: string[]) => void;
  syncEdgeCache: (edges: Array<{ source: string; target: string }>) => void;

  setFocusedBranch: (id: string | null) => void;
  setSearchUnitId: (id: string | null) => void;
}

export const useStructureStore = create<StructureState>((set, get) => ({
  selectedUnitId: null,
  drawerOpen: false,
  unitModal: { open: false, mode: "add" },
  moveModal: { open: false },
  deactivateModal: { open: false },

  expandedUnitIds: [],
  focusedBranchId: null,
  searchUnitId: null,
  edgeCache: [],

  selectUnit: (id) => set({ selectedUnitId: id, drawerOpen: id !== null }),
  closeDrawer: () => set({ selectedUnitId: null, drawerOpen: false }),

  openAddUnitModal: (parentId, parentName) =>
    set({ unitModal: { open: true, mode: "add", parentId, parentName } }),
  openEditUnitModal: (unitId) =>
    set({ unitModal: { open: true, mode: "edit", editingUnitId: unitId } }),
  closeUnitModal: () => set({ unitModal: { open: false, mode: "add" } }),

  openMoveModal: (unitId, unitName) =>
    set({ moveModal: { open: true, unitId, unitName } }),
  closeMoveModal: () => set({ moveModal: { open: false } }),

  openDeactivateModal: (unitId, unitName) =>
    set({ deactivateModal: { open: true, unitId, unitName } }),
  closeDeactivateModal: () => set({ deactivateModal: { open: false } }),

  expandUnit: (id) => {
    const { expandedUnitIds } = get();
    if (expandedUnitIds.includes(id)) return;
    set({ expandedUnitIds: [...expandedUnitIds, id] });
  },

  collapseUnit: (id) => {
    const { expandedUnitIds, edgeCache, selectedUnitId } = get();
    const descendants = new Set(computeSubtreeIds(id, edgeCache));
    const updates: Partial<StructureState> = {
      expandedUnitIds: expandedUnitIds.filter((eid) => !descendants.has(eid)),
    };
    if (
      selectedUnitId &&
      selectedUnitId !== id &&
      descendants.has(selectedUnitId)
    ) {
      updates.selectedUnitId = id;
      updates.drawerOpen = true;
    }
    set(updates);
  },

  collapseAll: () => set({ expandedUnitIds: [], focusedBranchId: null }),

  setExpandedUnitIds: (ids) => set({ expandedUnitIds: ids }),
  syncEdgeCache: (edges) => set({ edgeCache: edges }),

  setFocusedBranch: (id) => set({ focusedBranchId: id }),
  setSearchUnitId: (id) => set({ searchUnitId: id }),
}));

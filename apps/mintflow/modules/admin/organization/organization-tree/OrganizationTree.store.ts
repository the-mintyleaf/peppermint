import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type {
  OrgNodeData,
  OrgNodeType,
  NodeModalConfig,
  FilterKey,
  ExpandStrategy,
  GroupData,
} from "./OrganizationTree.types";
import { computeSubtreeIds } from "./OrganizationTree.utils";

export type OrgFlowNode = Node<OrgNodeData, OrgNodeType>;
export type OrgFlowEdge = Edge & { data?: { relationshipType?: string } };

interface HistoryEntry {
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
}

interface OrgBuilderState {
  selectedNodeId: string | null;
  drawerOpen: boolean;
  activeDepartmentId: string | null;
  searchQuery: string;
  searchMatchIds: string[];
  nodeModal: NodeModalConfig;
  history: HistoryEntry[];
  historyIndex: number;
  saved: boolean;
  contextMenu: { x: number; y: number; nodeId: string } | null;

  expandedNodeIds: string[];
  expandedGroupIds: string[];
  focusedBranchId: string | null;
  viewMode: "explorer" | "fullmap";
  edgeCache: OrgFlowEdge[];

  activeFilters: FilterKey[];
  expandStrategy: ExpandStrategy;

  selectNode: (id: string | null) => void;
  closeDrawer: () => void;
  setActiveDepartment: (id: string | null) => void;
  setHighlightedNodeId: (id: string | null) => void;
  openAddModal: (nodeType: OrgNodeType, parentId?: string, parentName?: string) => void;
  openEditModal: (nodeId: string) => void;
  closeModal: () => void;
  setSearchQuery: (q: string) => void;
  setSearchMatchIds: (ids: string[]) => void;
  pushHistory: (nodes: OrgFlowNode[], edges: OrgFlowEdge[]) => void;
  undo: (setNodes: (n: OrgFlowNode[]) => void, setEdges: (e: OrgFlowEdge[]) => void) => void;
  redo: (setNodes: (n: OrgFlowNode[]) => void, setEdges: (e: OrgFlowEdge[]) => void) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  markSaved: () => void;
  markDirty: () => void;
  openContextMenu: (x: number, y: number, nodeId: string) => void;
  closeContextMenu: () => void;

  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  collapseAll: () => void;
  setFocusedBranch: (id: string | null) => void;
  setViewMode: (mode: "explorer" | "fullmap") => void;
  setExpandedNodeIds: (ids: string[]) => void;
  syncEdgeCache: (edges: OrgFlowEdge[]) => void;

  setFilter: (key: FilterKey, on: boolean) => void;
  clearFilters: () => void;
  setExpandStrategy: (strategy: ExpandStrategy) => void;
  reapplyExpandStrategy: () => void;

  expandGroup: (groupNodeId: string, nodes: OrgFlowNode[]) => void;
}

export const useOrgTreeStore = create<OrgBuilderState>((set, get) => ({
  selectedNodeId: null,
  drawerOpen: false,
  activeDepartmentId: null,
  searchQuery: "",
  searchMatchIds: [],
  nodeModal: { open: false, mode: "add" },
  history: [],
  historyIndex: -1,
  saved: true,
  contextMenu: null,

  expandedNodeIds: [],
  expandedGroupIds: [],
  focusedBranchId: null,
  viewMode: "explorer",
  edgeCache: [],

  activeFilters: [],
  expandStrategy: "direct",

  selectNode: (id) => set({ selectedNodeId: id, drawerOpen: id !== null }),
  closeDrawer: () => set({ selectedNodeId: null, drawerOpen: false }),
  setActiveDepartment: (id) => set({ activeDepartmentId: id }),
  setHighlightedNodeId: (id) => set({ selectedNodeId: id }),

  openAddModal: (nodeType, parentId, parentName) =>
    set({
      nodeModal: {
        open: true,
        mode: "add",
        nodeType,
        editingNodeId: undefined,
        pendingParentId: parentId,
        pendingParentName: parentName,
      },
    }),

  openEditModal: (nodeId) =>
    set({ nodeModal: { open: true, mode: "edit", editingNodeId: nodeId } }),

  closeModal: () =>
    set({
      nodeModal: {
        open: false,
        mode: "add",
        nodeType: undefined,
        editingNodeId: undefined,
        pendingParentId: undefined,
        pendingParentName: undefined,
      },
    }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchMatchIds: (ids) => set({ searchMatchIds: ids }),

  pushHistory: (nodes, edges) => {
    const { history, historyIndex } = get();
    const trimmed = history.slice(0, historyIndex + 1);
    const capped = trimmed.length >= 50 ? trimmed.slice(1) : trimmed;
    set({
      history: [...capped, { nodes: [...nodes], edges: [...edges] }],
      historyIndex: capped.length,
      saved: false,
    });
  },

  undo: (setNodes, setEdges) => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const prev = historyIndex - 1;
    const entry = history[prev];
    setNodes(entry.nodes);
    setEdges(entry.edges);
    set({ historyIndex: prev });
  },

  redo: (setNodes, setEdges) => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const next = historyIndex + 1;
    const entry = history[next];
    setNodes(entry.nodes);
    setEdges(entry.edges);
    set({ historyIndex: next });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  markSaved: () => set({ saved: true }),
  markDirty: () => set({ saved: false }),

  openContextMenu: (x, y, nodeId) => set({ contextMenu: { x, y, nodeId } }),
  closeContextMenu: () => set({ contextMenu: null }),

  expandNode: (id) => {
    const { expandedNodeIds, expandStrategy, edgeCache } = get();
    if (expandedNodeIds.includes(id)) return;

    if (expandStrategy === "full_branch") {
      const subtree = computeSubtreeIds(id, edgeCache);
      set({ expandedNodeIds: [...new Set([...expandedNodeIds, ...subtree])] });
    } else {
      set({ expandedNodeIds: [...expandedNodeIds, id] });
    }
  },

  collapseNode: (id) => {
    const { expandedNodeIds, edgeCache, selectedNodeId } = get();
    const descendants = new Set(computeSubtreeIds(id, edgeCache));
    const updates: Partial<OrgBuilderState> = {
      expandedNodeIds: expandedNodeIds.filter((eid) => !descendants.has(eid)),
    };
    if (selectedNodeId && selectedNodeId !== id && descendants.has(selectedNodeId)) {
      updates.selectedNodeId = id;
      updates.drawerOpen = true;
    }
    set(updates);
  },

  collapseAll: () => set({ expandedNodeIds: [], expandedGroupIds: [], focusedBranchId: null }),

  setFocusedBranch: (id) => set({ focusedBranchId: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setExpandedNodeIds: (ids) => set({ expandedNodeIds: ids }),

  syncEdgeCache: (edges) => set({ edgeCache: edges }),

  setFilter: (key, on) => {
    const { activeFilters } = get();
    if (on) {
      if (!activeFilters.includes(key)) set({ activeFilters: [...activeFilters, key] });
    } else {
      set({ activeFilters: activeFilters.filter((f) => f !== key) });
    }
  },

  clearFilters: () => set({ activeFilters: [] }),

  setExpandStrategy: (strategy) => set({ expandStrategy: strategy }),

  reapplyExpandStrategy: () => {
    const { expandedNodeIds, expandStrategy, edgeCache } = get();
    if (expandedNodeIds.length === 0) return;

    if (expandStrategy === "full_branch") {
      const allIds = new Set<string>(expandedNodeIds);
      for (const id of expandedNodeIds) {
        for (const desc of computeSubtreeIds(id, edgeCache)) allIds.add(desc);
      }
      set({ expandedNodeIds: [...allIds] });
    }
    // "direct" and unimplemented strategies: keep the current expanded set as-is
  },

  expandGroup: (groupNodeId, nodes) => {
    const node = nodes.find((n) => n.id === groupNodeId);
    if (!node || node.data.nodeType !== "group") return;
    const groupData = node.data as GroupData;
    const { expandedGroupIds } = get();
    if (!expandedGroupIds.includes(groupNodeId)) {
      set({ expandedGroupIds: [...expandedGroupIds, groupNodeId] });
    }
  },
}));

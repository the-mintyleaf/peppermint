import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type {
  OrgNodeData,
  OrgNodeType,
  NodeModalConfig,
} from "./organization.types";

export type OrgFlowNode = Node<OrgNodeData, OrgNodeType>;
export type OrgFlowEdge = Edge;

interface HistoryEntry {
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
}

interface OrgBuilderState {
  selectedNodeId: string | null;
  drawerOpen: boolean;
  searchQuery: string;
  showPeople: boolean;
  nodeModal: NodeModalConfig;
  history: HistoryEntry[];
  historyIndex: number;
  saved: boolean;
  contextMenu: { x: number; y: number; nodeId: string } | null;

  selectNode: (id: string | null) => void;
  closeDrawer: () => void;
  openAddModal: (nodeType: OrgNodeType) => void;
  openEditModal: (nodeId: string) => void;
  closeModal: () => void;
  setSearchQuery: (q: string) => void;
  toggleShowPeople: () => void;
  pushHistory: (nodes: OrgFlowNode[], edges: OrgFlowEdge[]) => void;
  undo: (
    setNodes: (n: OrgFlowNode[]) => void,
    setEdges: (e: OrgFlowEdge[]) => void,
  ) => void;
  redo: (
    setNodes: (n: OrgFlowNode[]) => void,
    setEdges: (e: OrgFlowEdge[]) => void,
  ) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  markSaved: () => void;
  markDirty: () => void;
  openContextMenu: (x: number, y: number, nodeId: string) => void;
  closeContextMenu: () => void;
}

export const useOrgBuilderStore = create<OrgBuilderState>((set, get) => ({
  selectedNodeId: null,
  drawerOpen: false,
  searchQuery: "",
  showPeople: true,
  nodeModal: { open: false, mode: "add" },
  history: [],
  historyIndex: -1,
  saved: true,
  contextMenu: null,

  selectNode: (id) => set({ selectedNodeId: id, drawerOpen: id !== null }),

  closeDrawer: () => set({ selectedNodeId: null, drawerOpen: false }),

  openAddModal: (nodeType) =>
    set({
      nodeModal: {
        open: true,
        mode: "add",
        nodeType,
        editingNodeId: undefined,
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
      },
    }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleShowPeople: () => set((s) => ({ showPeople: !s.showPeople })),

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
}));

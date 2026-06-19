"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Connection,
  type NodeMouseHandler,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { notifications } from "@peppermint/ui";
import { OrgNode } from "./components/nodes/OrgNode";
import { DepartmentNode } from "./components/nodes/DepartmentNode";
import { PersonNode } from "./components/nodes/PersonNode";
import { Toolbar } from "./components/Toolbar";
import { DepartmentDrawer } from "./components/DepartmentDrawer";
import { PersonDrawer } from "./components/PersonDrawer";
import { NodeFormModal } from "./components/NodeFormModal";
import { EmptyState } from "./components/EmptyState";
import { useOrgBuilderStore, type OrgFlowNode, type OrgFlowEdge } from "../../organization.store";
import type { OrgNodeData, DepartmentData, PersonData } from "../../organization.types";
import styles from "./OrganizationBuilder.module.css";

const nodeTypes = {
  org: OrgNode,
  department: DepartmentNode,
  person: PersonNode,
} as const;

const DEFAULT_EDGE_OPTIONS = {
  style: { strokeWidth: 2, stroke: "#94a3b8" },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
  animated: false,
};

function autoArrangeNodes(nodes: OrgFlowNode[], edges: OrgFlowEdge[]): OrgFlowNode[] {
  if (nodes.length === 0) return nodes;

  const NODE_W = 300;
  const NODE_H = 160;
  const H_GAP = 60;
  const V_GAP = 80;

  // Build adjacency: parent → children
  const children: Record<string, string[]> = {};
  const hasParent = new Set<string>();

  for (const edge of edges) {
    if (!children[edge.source]) children[edge.source] = [];
    children[edge.source].push(edge.target);
    hasParent.add(edge.target);
  }

  // Roots = nodes with no incoming edges
  const roots = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id);
  if (roots.length === 0) {
    // Fallback: lay out all nodes in a grid
    return nodes.map((n, i) => ({
      ...n,
      position: { x: (i % 4) * (NODE_W + H_GAP), y: Math.floor(i / 4) * (NODE_H + V_GAP) },
    }));
  }

  const positions: Record<string, { x: number; y: number }> = {};
  const visited = new Set<string>();

  function subtreeWidth(id: string): number {
    if (!children[id] || children[id].length === 0) return NODE_W;
    const childWidths = children[id].map(subtreeWidth);
    return Math.max(
      NODE_W,
      childWidths.reduce((acc, w) => acc + w + H_GAP, -H_GAP)
    );
  }

  function layout(id: string, x: number, y: number) {
    if (visited.has(id)) return;
    visited.add(id);
    positions[id] = { x, y };

    const kids = children[id] ?? [];
    if (kids.length === 0) return;

    const totalWidth = kids.map(subtreeWidth).reduce((a, w) => a + w + H_GAP, -H_GAP);
    let cx = x - totalWidth / 2;

    for (const kid of kids) {
      const kw = subtreeWidth(kid);
      layout(kid, cx + kw / 2, y + NODE_H + V_GAP);
      cx += kw + H_GAP;
    }
  }

  // Layout each root tree horizontally offset
  let rootX = 0;
  for (const root of roots) {
    const rw = subtreeWidth(root);
    layout(root, rootX + rw / 2, 0);
    rootX += rw + H_GAP * 2;
  }

  // Place any un-visited nodes (disconnected)
  let fallbackX = rootX + H_GAP;
  for (const n of nodes) {
    if (!positions[n.id]) {
      positions[n.id] = { x: fallbackX, y: 0 };
      fallbackX += NODE_W + H_GAP;
    }
  }

  return nodes.map((n) => ({ ...n, position: positions[n.id] ?? n.position }));
}

function OrganizationBuilderInner() {
  const {
    selectedNodeId,
    drawerOpen,
    searchQuery,
    showPeople,
    nodeModal,
    saved,
    closeDrawer,
    openAddModal,
    openEditModal,
    closeModal,
    setSearchQuery,
    toggleShowPeople,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    markSaved,
    markDirty,
    contextMenu,
    openContextMenu,
    closeContextMenu,
  } = useOrgBuilderStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<OrgFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<OrgFlowEdge>([]);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Track previous values for history on meaningful changes
  const prevNodesRef = useRef<OrgFlowNode[]>([]);
  const prevEdgesRef = useRef<OrgFlowEdge[]>([]);

  // Seed initial history entry
  useEffect(() => {
    pushHistory([], []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter nodes for search + showPeople
  const visibleNodes = nodes.filter((n) => {
    if (!showPeople && n.type === "person") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const data = n.data;
    if (data.nodeType === "person") return data.fullName.toLowerCase().includes(q);
    if (data.nodeType === "department") return data.name.toLowerCase().includes(q);
    if (data.nodeType === "org") return data.name.toLowerCase().includes(q);
    return true;
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: OrgFlowEdge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        ...DEFAULT_EDGE_OPTIONS,
      } as OrgFlowEdge;
      setEdges((eds) => addEdge(newEdge, eds));
      markDirty();
    },
    [setEdges, markDirty]
  );

  const onNodeClick: NodeMouseHandler<OrgFlowNode> = useCallback(
    (_event, node) => {
      useOrgBuilderStore.getState().selectNode(node.id);
    },
    []
  );

  const onNodeContextMenu: NodeMouseHandler<OrgFlowNode> = useCallback(
    (event, node) => {
      event.preventDefault();
      openContextMenu(event.clientX, event.clientY, node.id);
    },
    [openContextMenu]
  );

  const onPaneClick = useCallback(() => {
    closeDrawer();
    closeContextMenu();
  }, [closeDrawer, closeContextMenu]);

  const handleNodesChangeWithHistory = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      const hasMoveEnd = changes.some((c) => c.type === "position" && c.dragging === false);
      if (hasMoveEnd) {
        markDirty();
      }
    },
    [onNodesChange, markDirty]
  );

  const handleAddNode = useCallback(
    (data: OrgNodeData) => {
      const id = `node-${Date.now()}`;
      const center = { x: 200 + Math.random() * 300, y: 200 + Math.random() * 200 };
      const newNode: OrgFlowNode = {
        id,
        type: data.nodeType,
        position: center,
        data,
      };
      setNodes((ns) => {
        const updated = [...ns, newNode];
        pushHistory(updated, edges);
        return updated;
      });
      markDirty();
    },
    [setNodes, edges, pushHistory, markDirty]
  );

  const handleEditNode = useCallback(
    (data: OrgNodeData) => {
      if (!nodeModal.editingNodeId) return;
      setNodes((ns) => {
        const updated = ns.map((n) =>
          n.id === nodeModal.editingNodeId ? { ...n, data } : n
        );
        pushHistory(updated, edges);
        return updated;
      });
      markDirty();
    },
    [nodeModal.editingNodeId, setNodes, edges, pushHistory, markDirty]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((ns) => {
        const updated = ns.filter((n) => n.id !== nodeId);
        pushHistory(updated, edges);
        return updated;
      });
      setEdges((es) => es.filter((e) => e.source !== nodeId && e.target !== nodeId));
      closeDrawer();
      markDirty();
    },
    [setNodes, setEdges, edges, pushHistory, closeDrawer, markDirty]
  );

  const handleAutoArrange = useCallback(() => {
    setNodes((ns) => {
      const arranged = autoArrangeNodes(ns, edges);
      pushHistory(arranged, edges);
      return arranged;
    });
    setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 50);
    markDirty();
  }, [setNodes, edges, pushHistory, fitView, markDirty]);

  const handleSave = useCallback(() => {
    notifications.show({
      title: "Saved",
      message: "Organization structure saved successfully.",
      color: "teal",
    });
    markSaved();
  }, [markSaved]);

  const handleUndo = useCallback(() => {
    undo(
      (ns) => setNodes(ns),
      (es) => setEdges(es)
    );
  }, [undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    redo(
      (ns) => setNodes(ns),
      (es) => setEdges(es)
    );
  }, [redo, setNodes, setEdges]);

  const editingNode = nodeModal.editingNodeId
    ? nodes.find((n) => n.id === nodeModal.editingNodeId)
    : undefined;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Toolbar
        onZoomIn={() => zoomIn({ duration: 200 })}
        onZoomOut={() => zoomOut({ duration: 200 })}
        onFitView={() => fitView({ duration: 400, padding: 0.1 })}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAutoArrange={handleAutoArrange}
        onSave={handleSave}
        onTogglePeople={toggleShowPeople}
        canUndo={canUndo()}
        canRedo={canRedo()}
        saved={saved}
        showPeople={showPeople}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        nodeCount={nodes.length}
      />

      <ReactFlow
        nodes={visibleNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChangeWithHistory}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        minZoom={0.1}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
        style={{ background: "var(--mantine-color-gray-0, #f8fafc)" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="var(--mantine-color-gray-3, #cbd5e1)"
        />
        <Controls
          position="bottom-right"
          showZoom={false}
          showFitView={false}
          showInteractive
          style={{ bottom: 16, right: 16 }}
        />
        <MiniMap
          position="bottom-left"
          style={{
            bottom: 16,
            left: 16,
            border: "1px solid var(--mantine-color-default-border)",
            borderRadius: 8,
          }}
          nodeColor={(n) => {
            if (n.type === "org") return "#2563eb";
            if (n.type === "department") return "#7c3aed";
            return "#059669";
          }}
          maskColor="rgba(0,0,0,0.04)"
        />

      </ReactFlow>

      {nodes.length === 0 && <EmptyState />}

      {/* Context menu */}
      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={closeContextMenu}
        >
          {[
            { label: "Edit", action: () => openEditModal(contextMenu.nodeId), color: undefined },
            { label: "Add child department", action: () => openAddModal("department"), color: undefined },
            { label: "Add person", action: () => openAddModal("person"), color: undefined },
            { label: "Open details", action: () => useOrgBuilderStore.getState().selectNode(contextMenu.nodeId), color: undefined },
            { label: "Delete", action: () => handleDeleteNode(contextMenu.nodeId), danger: true },
          ].map(({ label, action, danger }) => (
            <div
              key={label}
              className={`${styles.contextMenuItem} ${danger ? styles.contextMenuDanger : ""}`}
              onClick={() => { action(); closeContextMenu(); }}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Department drawer */}
      {selectedNode && selectedNode.data.nodeType === "department" && (
        <DepartmentDrawer
          opened={drawerOpen}
          onClose={closeDrawer}
          nodeId={selectedNode.id}
          data={selectedNode.data as DepartmentData}
          onEdit={openEditModal}
          onDelete={handleDeleteNode}
          onAddPerson={() => openAddModal("person")}
          onAddChild={() => openAddModal("department")}
        />
      )}

      {/* Person drawer */}
      {selectedNode && selectedNode.data.nodeType === "person" && (
        <PersonDrawer
          opened={drawerOpen}
          onClose={closeDrawer}
          nodeId={selectedNode.id}
          data={selectedNode.data as PersonData}
          onEdit={openEditModal}
          onDelete={handleDeleteNode}
        />
      )}

      {/* Node form modal */}
      <NodeFormModal
        opened={nodeModal.open}
        onClose={closeModal}
        mode={nodeModal.mode}
        nodeType={nodeModal.mode === "add" ? nodeModal.nodeType : editingNode?.type}
        initialData={editingNode?.data}
        onSubmit={nodeModal.mode === "add" ? handleAddNode : handleEditNode}
      />
    </div>
  );
}

export function OrganizationBuilder() {
  return (
    <ReactFlowProvider>
      <OrganizationBuilderInner />
    </ReactFlowProvider>
  );
}

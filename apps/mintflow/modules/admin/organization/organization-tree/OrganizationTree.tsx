"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Badge,
  Button,
  ModuleHeader,
  notifications,
  Paper,
  TextInput,
} from "@peppermint/ui";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { OrgNode } from "./components/nodes/OrgNode";
import { DepartmentNode } from "./components/nodes/DepartmentNode";
import { PersonNode } from "./components/nodes/PersonNode";
import { GroupNode } from "./components/nodes/GroupNode";
import { Toolbar } from "./components/Toolbar";
import { InspectorPanel } from "./components/InspectorPanel";
import { NodeFormModal } from "./components/NodeFormModal";
import { EmptyState } from "./components/EmptyState";
import { BreadcrumbNav } from "./components/BreadcrumbNav";
import { FiltersPanel } from "./components/FiltersPanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { ImpactPreviewModal } from "./components/ImpactPreviewModal";
import {
  useOrgTreeStore,
  type OrgFlowNode,
  type OrgFlowEdge,
} from "./OrganizationTree.store";
import type {
  DepartmentData,
  OrgOfficeData,
} from "./OrganizationTree.types";
import { DUMMY_NODES, DUMMY_EDGES } from "./OrganizationTree.demoData";
import {
  useOrganizationGraph,
  useAddOrganizationNode,
  useUpdateOrganizationNode,
  useAddPersonNode,
  useAddPosition,
  useAddSite,
  useAddDelegation,
  useCreateUnit,
  useEnrichedGraph,
  useCanvasLayout,
  useNodeActions,
} from "./OrganizationTree.hooks";
import {
  DEFAULT_EDGE_OPTIONS,
  expandAncestors,
  nodeMatchesSearch,
} from "./OrganizationTree.utils";
import styles from "./OrganizationTree.module.css";

const nodeTypes = {
  org: OrgNode,
  department: DepartmentNode,
  person: PersonNode,
  group: GroupNode,
} as const;

function OrganizationTreeInner() {
  const { id: orgId = "" } = useParams<{ id: string }>();
  const { nodes: serverNodes, edges: serverEdges } =
    useOrganizationGraph(orgId);

  const {
    selectedNodeId,
    drawerOpen,
    activeDepartmentId,
    searchQuery,
    nodeModal,
    saved,
    closeDrawer,
    openAddModal,
    openEditModal,
    closeModal,
    setSearchQuery,
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
    setActiveDepartment,
    expandedNodeIds,
    focusedBranchId,
    viewMode,
    expandNode: storeExpandNode,
    collapseNode,
    collapseAll,
    expandAll,
    setFocusedBranch,
    setViewMode,
    setExpandedNodeIds,
    syncEdgeCache,
    activeFilters,
    setSearchMatchIds,
    selectNode,
  } = useOrgTreeStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<OrgFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<OrgFlowEdge>([]);
  const { fitView, zoomIn, zoomOut, setCenter, getNode } = useReactFlow();

  // ── Domain mutations ──────────────────────────────────────────────────────
  const addOrgMutation = useAddOrganizationNode(orgId);
  const updateOrgMutation = useUpdateOrganizationNode(orgId);
  const addPersonMutation = useAddPersonNode(orgId);
  const addPositionMutation = useAddPosition(orgId);
  const addSiteMutation = useAddSite(orgId);
  const addDelegationMutation = useAddDelegation(orgId);
  const createUnitMutation = useCreateUnit(orgId);

  // edgesRef / nodesRef let effects read current state without becoming reactive deps
  const edgesRef = useRef(edges);
  const nodesRef = useRef(nodes);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    const initNodes =
      serverNodes.length > 0
        ? (serverNodes as OrgFlowNode[])
        : (DUMMY_NODES as OrgFlowNode[]);
    const initEdges =
      serverEdges.length > 0
        ? (serverEdges as OrgFlowEdge[])
        : (DUMMY_EDGES as OrgFlowEdge[]);
    setNodes(initNodes);
    setEdges(initEdges);
    syncEdgeCache(initEdges);
    pushHistory(initNodes, initEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverNodes, serverEdges]);

  useEffect(() => {
    if (edges.length > 0) syncEdgeCache(edges);
  }, [edges, syncEdgeCache]);

  // ── Derived graph state ───────────────────────────────────────────────────
  const {
    graphMaps,
    filteredVisibleIds,
    enrichedVisibleNodes,
    enrichedVisibleEdges,
    analyticsStats,
    breadcrumbPath,
  } = useEnrichedGraph(nodes, edges);

  // ── Canvas layout ─────────────────────────────────────────────────────────
  useCanvasLayout(filteredVisibleIds, { nodesRef, edgesRef, setNodes, fitView });

  // ── Node CRUD actions ─────────────────────────────────────────────────────
  const {
    handleSubmitOrg,
    handleSubmitDepartment,
    handleSubmitPerson,
    handleSubmitPosition,
    handleSubmitSite,
    handleSubmitDelegation,
    handleRequestDelete,
    handleConfirmDelete,
    handleAutoArrange,
    impactPreview,
    setImpactPreview,
  } = useNodeActions({
    nodes,
    edges,
    setNodes,
    setEdges,
    graphMaps,
    filteredVisibleIds,
    nodeModal,
    addOrgMutation,
    updateOrgMutation,
    addPersonMutation,
    addPositionMutation,
    addSiteMutation,
    addDelegationMutation,
    createUnitMutation,
    pushHistory,
    markDirty,
    storeExpandNode,
    closeDrawer,
    fitView,
  });

  // ── Smart search: auto-expand ancestors + highlight matches ───────────────
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchMatchIds([]);
      return;
    }
    const matchedIds = nodes
      .filter((n) => nodeMatchesSearch(n.type ?? "", n.data, q))
      .map((n) => n.id);
    setSearchMatchIds(matchedIds);
    if (viewMode !== "explorer" || matchedIds.length === 0) return;
    let expanded = [...expandedNodeIds];
    for (const id of matchedIds) expanded = expandAncestors(id, edges, expanded);
    setExpandedNodeIds(expanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ── Derived display values ────────────────────────────────────────────────
  const selectedNode = graphMaps.nodesMap.get(selectedNodeId ?? "") ?? null;
  const activeDepartment = activeDepartmentId
    ? graphMaps.nodesMap.get(activeDepartmentId)
    : null;
  const activeDepartmentName =
    activeDepartment?.data.nodeType === "department"
      ? (activeDepartment.data as DepartmentData).name
      : null;
  const editingNode = nodeModal.editingNodeId
    ? graphMaps.nodesMap.get(nodeModal.editingNodeId)
    : undefined;
  const selectedNodeForDrawer = selectedNode
    ? { type: selectedNode.type, data: selectedNode.data, id: selectedNode.id }
    : null;

  // ── ReactFlow handlers ────────────────────────────────────────────────────
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
    [setEdges, markDirty],
  );

  const onNodeClick: NodeMouseHandler<OrgFlowNode> = useCallback(
    (_event, node) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  const onNodeDoubleClick: NodeMouseHandler<OrgFlowNode> = useCallback(
    (_event, node) => {
      setFocusedBranch(node.id);
    },
    [setFocusedBranch],
  );

  const onNodeContextMenu: NodeMouseHandler<OrgFlowNode> = useCallback(
    (event, node) => {
      event.preventDefault();
      openContextMenu(event.clientX, event.clientY, node.id);
    },
    [openContextMenu],
  );

  const onPaneClick = useCallback(() => {
    closeContextMenu();
    setActiveDepartment(null);
  }, [closeContextMenu, setActiveDepartment]);

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      if (changes.some((c) => c.type === "position" && c.dragging === false))
        markDirty();
    },
    [onNodesChange, markDirty],
  );

  // ── Feature handlers ──────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    notifications.show({
      title: "Saved",
      message: "Organization structure saved successfully.",
      color: "teal",
    });
    markSaved();
  }, [markSaved]);

  const handleToggleViewMode = useCallback(() => {
    if (viewMode === "explorer" && nodes.length > 50) {
      notifications.show({
        title: "Large structure",
        message: `Full map contains ${nodes.length} nodes. Use filters for better readability.`,
        color: "orange",
        autoClose: 5000,
      });
    }
    setViewMode(viewMode === "explorer" ? "fullmap" : "explorer");
  }, [viewMode, nodes.length, setViewMode]);

  const handleBackToParent = useCallback(() => {
    if (!focusedBranchId) return;
    const parent = graphMaps.parentMap[focusedBranchId];
    setFocusedBranch(parent ?? null);
  }, [focusedBranchId, graphMaps, setFocusedBranch]);

  const handleFocusNode = useCallback(
    (id: string) => {
      const newExpandedIds = expandAncestors(id, edges, expandedNodeIds);
      const needsExpand = newExpandedIds.length !== expandedNodeIds.length;
      if (needsExpand) setExpandedNodeIds(newExpandedIds);
      const pan = () => {
        const n = getNode(id);
        if (!n) return;
        const x = n.position.x + (n.measured?.width ?? 200) / 2;
        const y = n.position.y + (n.measured?.height ?? 80) / 2;
        setCenter(x, y, { zoom: 1, duration: 600 });
      };
      if (needsExpand) setTimeout(pan, 80);
      else pan();
    },
    [edges, expandedNodeIds, setExpandedNodeIds, getNode, setCenter],
  );

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback(
    (val: string) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => setSearchQuery(val), 150);
    },
    [setSearchQuery],
  );

  const getContextMenuActions = useCallback(
    (nodeId: string) => {
      const node = graphMaps.nodesMap.get(nodeId);
      const isOrg = node?.type === "org";
      const isDept = node?.type === "department" || node?.type === "group";
      const isPerson = node?.type === "person";
      return [
        { label: "Open details", action: () => selectNode(nodeId) },
        { label: "Focus here", action: () => setFocusedBranch(nodeId) },
        !isPerson
          ? { label: "Expand one level", action: () => storeExpandNode(nodeId) }
          : null,
        !isPerson
          ? { label: "Collapse branch", action: () => collapseNode(nodeId) }
          : null,
        { label: "Edit", action: () => openEditModal(nodeId) },
        isOrg || isDept
          ? {
              label: "Add department",
              action: () =>
                openAddModal(
                  "department",
                  nodeId,
                  (node?.data as OrgOfficeData | DepartmentData).name,
                ),
            }
          : null,
        isOrg || isDept
          ? {
              label: "Add person",
              action: () =>
                openAddModal(
                  "person",
                  nodeId,
                  (node?.data as OrgOfficeData | DepartmentData).name,
                ),
            }
          : null,
        isDept
          ? {
              label: "Add position",
              action: () =>
                openAddModal(
                  "position",
                  undefined,
                  (node?.data as DepartmentData).name,
                  nodeId,
                ),
            }
          : null,
        isOrg
          ? {
              label: "Add site",
              action: () =>
                openAddModal(
                  "site",
                  undefined,
                  (node?.data as OrgOfficeData).name,
                  nodeId,
                ),
            }
          : null,
        isOrg
          ? {
              label: "Add delegation",
              action: () =>
                openAddModal(
                  "delegation",
                  undefined,
                  (node?.data as OrgOfficeData).name,
                  nodeId,
                ),
            }
          : null,
        {
          label: "Delete",
          action: () => handleRequestDelete(nodeId),
          danger: true,
        },
      ].filter(Boolean) as Array<{
        label: string;
        action: () => void;
        danger?: boolean;
      }>;
    },
    [
      graphMaps,
      selectNode,
      setFocusedBranch,
      storeExpandNode,
      collapseNode,
      openEditModal,
      openAddModal,
      handleRequestDelete,
    ],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Paper
      p={0}
      withBorder
      radius="md"
      style={{
        height: "calc(100vh - 16px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ModuleHeader
        breadcrumbItems={[
          { label: "Organization", href: "/admin/organization" },
          { label: "Structure Builder", href: "#" },
        ]}
        right={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingRight: 12,
            }}
          >
            <TextInput
              size="xs"
              placeholder="Search nodes…"
              leftSection={
                <MagnifyingGlassIcon size={13} aria-label="Search" />
              }
              defaultValue={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{ width: 200 }}
            />
            {activeFilters.length > 0 && (
              <Badge size="sm" color="indigo" variant="light">
                {activeFilters.length} filter
                {activeFilters.length > 1 ? "s" : ""}
              </Badge>
            )}
            {enrichedVisibleNodes.length > 0 && (
              <Badge size="sm" color="gray" variant="light">
                {enrichedVisibleNodes.length} visible
              </Badge>
            )}
            <Button
              size="xs"
              variant={saved ? "subtle" : "filled"}
              color="blue"
              leftSection={<FloppyDiskIcon size={13} aria-label="Save" />}
              onClick={handleSave}
            >
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
        }
      />

      <div
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "row" }}
      >
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          {/* Breadcrumb nav (shown in focus mode) */}
          {focusedBranchId && (
            <BreadcrumbNav
              path={breadcrumbPath}
              onNavigate={(nodeId) => setFocusedBranch(nodeId)}
              onExitFocus={() => setFocusedBranch(null)}
            />
          )}

          {/* Filters panel */}
          <FiltersPanel />

          {/* Analytics panel */}
          <AnalyticsPanel {...analyticsStats} />

          <ReactFlow
            nodes={enrichedVisibleNodes}
            edges={enrichedVisibleEdges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            minZoom={0.1}
            maxZoom={3}
            proOptions={{ hideAttribution: true }}
            style={{
              background: "var(--mantine-color-gray-0, #f8fafc)",
              width: "100%",
              height: "100%",
            }}
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
              position="bottom-right"
              style={{
                bottom: 8,
                right: 8,
                border: "1px solid var(--mantine-color-default-border)",
                borderRadius: 8,
              }}
              nodeColor={(n) =>
                n.type === "org"
                  ? "#2563eb"
                  : n.type === "department"
                    ? "#7c3aed"
                    : n.type === "group"
                      ? "#6b21a8"
                      : "#059669"
              }
              maskColor="rgba(0,0,0,0.04)"
            />
          </ReactFlow>

          {nodes.length === 0 && <EmptyState />}

          {/* Filter empty state overlay */}
          {nodes.length > 0 &&
            enrichedVisibleNodes.length === 0 &&
            activeFilters.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--mantine-color-dimmed)",
                    marginBottom: 8,
                  }}
                >
                  No nodes match the current filters.
                </div>
                <Button
                  size="xs"
                  variant="light"
                  color="indigo"
                  style={{ pointerEvents: "all" }}
                  onClick={() => useOrgTreeStore.getState().clearFilters()}
                >
                  Clear filters
                </Button>
              </div>
            )}

          <Toolbar
            onZoomIn={() => zoomIn({ duration: 200 })}
            onZoomOut={() => zoomOut({ duration: 200 })}
            onFitView={() => fitView({ duration: 400, padding: 0.1 })}
            onUndo={() =>
              undo(
                (ns) => setNodes(ns),
                (es) => setEdges(es),
              )
            }
            onRedo={() =>
              redo(
                (ns) => setNodes(ns),
                (es) => setEdges(es),
              )
            }
            onAutoArrange={handleAutoArrange}
            canUndo={canUndo()}
            canRedo={canRedo()}
            activeDepartmentId={activeDepartmentId}
            activeDepartmentName={activeDepartmentName}
            onClearActiveDepartment={() => setActiveDepartment(null)}
            viewMode={viewMode}
            onToggleViewMode={handleToggleViewMode}
            onCollapseAll={collapseAll}
            onExpandAll={expandAll}
            isFullyCollapsed={expandedNodeIds.length === 0}
            focusedBranchId={focusedBranchId}
            onClearFocusBranch={() => setFocusedBranch(null)}
            onBackToParent={handleBackToParent}
            onFitVisible={() => fitView({ duration: 400, padding: 0.15 })}
          />

          {/* Context menu */}
          {contextMenu && (
            <div
              className={styles.contextMenu}
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onMouseLeave={closeContextMenu}
            >
              {getContextMenuActions(contextMenu.nodeId).map(
                ({ label, action, danger }) => (
                  <div
                    key={label}
                    className={`${styles.contextMenuItem} ${danger ? styles.contextMenuDanger : ""}`}
                    onClick={() => {
                      action();
                      closeContextMenu();
                    }}
                  >
                    {label}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
        {/* end canvas div */}

        {/* Inspector panel — sits in flex row next to canvas */}
        <InspectorPanel
          opened={drawerOpen}
          onClose={closeDrawer}
          selectedNode={selectedNodeForDrawer}
          onEdit={openEditModal}
          onDelete={handleRequestDelete}
          nodes={nodes}
          edges={edges}
          onAddChild={(type, parentId, parentName, contextNodeId) =>
            openAddModal(type, parentId, parentName, contextNodeId)
          }
          onSelectNode={(id) => selectNode(id)}
          onFocusNode={handleFocusNode}
        />
      </div>
      {/* end flex row */}

      {/* Add / Edit modal */}
      <NodeFormModal
        opened={nodeModal.open}
        onClose={closeModal}
        mode={nodeModal.mode}
        nodeType={
          nodeModal.mode === "add" ? nodeModal.nodeType : editingNode?.type
        }
        initialData={editingNode?.data}
        onSubmitOrg={handleSubmitOrg}
        onSubmitDepartment={handleSubmitDepartment}
        onSubmitPerson={handleSubmitPerson}
        onSubmitPosition={handleSubmitPosition}
        onSubmitSite={handleSubmitSite}
        onSubmitDelegation={handleSubmitDelegation}
        pendingParentName={nodeModal.pendingParentName}
        pendingContextNodeId={nodeModal.contextNodeId}
        isLoading={
          addOrgMutation.isPending ||
          updateOrgMutation.isPending ||
          addPersonMutation.isPending ||
          addPositionMutation.isPending ||
          addSiteMutation.isPending ||
          addDelegationMutation.isPending ||
          createUnitMutation.isPending
        }
      />

      {/* Impact preview / delete confirmation */}
      {impactPreview && (
        <ImpactPreviewModal
          opened={impactPreview !== null}
          onClose={() => setImpactPreview(null)}
          onConfirm={handleConfirmDelete}
          nodeName={impactPreview.nodeName}
          nodeType={impactPreview.nodeType}
          affectedPeople={impactPreview.affectedPeople}
          affectedDepts={impactPreview.affectedDepts}
        />
      )}
    </Paper>
  );
}

export function OrganizationTree() {
  return (
    <ReactFlowProvider>
      <OrganizationTreeInner />
    </ReactFlowProvider>
  );
}

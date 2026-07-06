"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Center,
  Loader,
  ModuleHeader,
  Paper,
  useQueryClient,
} from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";

import { organizationQueryKeys } from "../_shared/organization.queryKeys";
import { BreadcrumbNav } from "./components/BreadcrumbNav";
import { DeactivateUnitModal } from "./components/DeactivateUnitModal";
import { EmptyState } from "./components/EmptyState";
import { InspectorPanel } from "./components/InspectorPanel";
import { MoveUnitModal } from "./components/MoveUnitModal";
import { OrgRootNode } from "./components/nodes/OrgRootNode";
import { UnitNode } from "./components/nodes/UnitNode";
import { Toolbar } from "./components/Toolbar";
import { UnitFormModal } from "./components/UnitFormModal";
import { useOrganizationRoot, useUnitTree } from "./Structure.hooks";
import { useStructureStore } from "./Structure.store";
import type { StructureFlowEdge, StructureFlowNode } from "./Structure.types";
import {
  autoArrangeNodes,
  buildGraphFromTree,
  computeDimmedNodeIds,
  computePathFromRoot,
  computeVisibleNodeIds,
  expandAncestors,
  getNodeSearchOptionLabel,
} from "./Structure.utils";

const nodeTypes = { org: OrgRootNode, unit: UnitNode } as const;

function StructureInner() {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const { data: organization, isLoading: orgLoading } =
    useOrganizationRoot(orgId);
  const { data: tree, isLoading: treeLoading } = useUnitTree(orgId);

  const {
    selectUnit,
    expandedUnitIds,
    expandUnit,
    setExpandedUnitIds,
    expandAll,
    collapseAll,
    focusedBranchId,
    setFocusedBranch,
    searchUnitId,
    setSearchUnitId,
    openAddUnitModal,
    syncEdgeCache,
  } = useStructureStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<StructureFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<StructureFlowEdge>([]);
  const { fitView, zoomIn, zoomOut, setCenter, getNode } = useReactFlow();
  const queryClient = useQueryClient();

  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Rebuild the full graph whenever the org/tree data changes, preserving
  // any positions already computed for a node that survives the refetch.
  useEffect(() => {
    if (orgLoading || treeLoading || !organization) return;
    const { nodes: freshNodes, edges: freshEdges } = buildGraphFromTree(
      organization,
      tree ?? [],
    );
    const existingPositions = new Map(
      nodesRef.current.map((n) => [n.id, n.position]),
    );
    const nextNodes = freshNodes.map((n) => {
      const existing = existingPositions.get(n.id);
      return existing ? { ...n, position: existing } : n;
    });
    setNodes(nextNodes);
    setEdges(freshEdges);
    syncEdgeCache(freshEdges);
    // Auto-expand the root so a freshly created structure is visible immediately.
    if (organization && expandedUnitIds.length === 0) {
      expandUnit(organization.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, tree, orgLoading, treeLoading]);

  const visibleNodeIds = useMemo(() => {
    if (!organization) return [];
    return computeVisibleNodeIds(organization.id, edges, expandedUnitIds);
  }, [organization, edges, expandedUnitIds]);

  const dimmedNodeIds = useMemo(
    () => new Set(computeDimmedNodeIds(focusedBranchId, visibleNodeIds, edges)),
    [focusedBranchId, visibleNodeIds, edges],
  );

  const pathHighlightIds = useMemo(() => {
    if (!focusedBranchId) return new Set<string>();
    return new Set(computePathFromRoot(focusedBranchId, edges));
  }, [focusedBranchId, edges]);

  const visibleNodeIdSet = useMemo(
    () => new Set(visibleNodeIds),
    [visibleNodeIds],
  );

  const enrichedVisibleNodes = useMemo(
    () =>
      nodes
        .filter((n) => visibleNodeIdSet.has(n.id))
        .map((n) => ({
          ...n,
          data: {
            ...n.data,
            _dimmed: dimmedNodeIds.has(n.id),
            _pathHighlighted:
              pathHighlightIds.has(n.id) && n.id !== focusedBranchId,
            _searchMatch: n.id === searchUnitId,
          },
        })),
    [
      nodes,
      visibleNodeIdSet,
      dimmedNodeIds,
      pathHighlightIds,
      focusedBranchId,
      searchUnitId,
    ],
  );

  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleNodeIdSet.has(e.source) && visibleNodeIdSet.has(e.target),
      ),
    [edges, visibleNodeIdSet],
  );

  // Re-layout whenever the visible set changes so newly expanded/collapsed
  // branches don't overlap. Positions are always derived, never persisted.
  const prevVisibleKey = useRef<string>("");
  useEffect(() => {
    const key = [...visibleNodeIdSet].sort().join(",");
    if (key === prevVisibleKey.current) return;
    prevVisibleKey.current = key;
    setNodes((current) => {
      const visible = current.filter((n) => visibleNodeIdSet.has(n.id));
      const laidOut = autoArrangeNodes(visible, visibleEdges);
      const laidOutMap = new Map(laidOut.map((n) => [n.id, n.position]));
      return current.map((n) =>
        laidOutMap.has(n.id) ? { ...n, position: laidOutMap.get(n.id)! } : n,
      );
    });
    const timeout = setTimeout(
      () => fitView({ duration: 300, padding: 0.2 }),
      50,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleNodeIdSet]);

  const breadcrumbPath = useMemo(() => {
    if (!focusedBranchId) return [];
    return computePathFromRoot(focusedBranchId, edges).map((id) => {
      const node = nodes.find((n) => n.id === id);
      const label =
        node?.data.nodeType === "org"
          ? node.data.name_np
          : (node?.data.name_np ?? id);
      return { id, label };
    });
  }, [focusedBranchId, edges, nodes]);

  const searchOptions = useMemo(
    () =>
      nodes.map((n) => ({ value: n.id, label: getNodeSearchOptionLabel(n) })),
    [nodes],
  );

  const onNodeClick: NodeMouseHandler<StructureFlowNode> = useCallback(
    (_event, node) => {
      if (node.type === "unit") selectUnit(node.id);
    },
    [selectUnit],
  );

  const onNodeDoubleClick: NodeMouseHandler<StructureFlowNode> = useCallback(
    (_event, node) => setFocusedBranch(node.id),
    [setFocusedBranch],
  );

  function handleSearchChange(nodeId: string | null) {
    setSearchUnitId(nodeId);
    if (!nodeId) return;
    const newExpanded = expandAncestors(nodeId, edges, expandedUnitIds);
    if (newExpanded.length !== expandedUnitIds.length) {
      setExpandedUnitIds(newExpanded);
    }
    setTimeout(() => {
      const rfNode = getNode(nodeId);
      if (!rfNode) return;
      const x = rfNode.position.x + (rfNode.measured?.width ?? 220) / 2;
      const y = rfNode.position.y + (rfNode.measured?.height ?? 100) / 2;
      setCenter(x, y, { zoom: 1, duration: 400 });
    }, 120);
  }

  const isLoading = orgLoading || treeLoading;
  const isEmpty = !isLoading && (tree ?? []).length === 0;

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Organization", href: "/admin/organization" },
          {
            label: organization?.name_np ?? "Structure",
            href: `/admin/organization/${orgId}`,
          },
          { label: "Structure Builder", href: "#" },
        ]}
      />
      <Paper
        p={0}
        withBorder
        radius="md"
        style={{
          height: "calc(100vh - 70px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          {isLoading ? (
            <Center h="100%">
              <Loader size="sm" />
            </Center>
          ) : (
            <>
              {focusedBranchId && (
                <BreadcrumbNav
                  path={breadcrumbPath}
                  onNavigate={(id) => setFocusedBranch(id)}
                  onExitFocus={() => setFocusedBranch(null)}
                />
              )}
              <ReactFlow
                nodes={enrichedVisibleNodes}
                edges={visibleEdges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                nodesConnectable={false}
                minZoom={0.1}
                maxZoom={3}
                proOptions={{ hideAttribution: true }}
                style={{
                  background: "var(--mantine-color-body)",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={24}
                  size={1.5}
                />
                <Controls
                  position="bottom-right"
                  showZoom={false}
                  showFitView={false}
                />
              </ReactFlow>

              {isEmpty && (
                <EmptyState
                  onCreateRoot={() => openAddUnitModal(undefined, undefined)}
                />
              )}

              <Toolbar
                onZoomIn={() => zoomIn({ duration: 200 })}
                onZoomOut={() => zoomOut({ duration: 200 })}
                onFitView={() => fitView({ duration: 400, padding: 0.15 })}
                onRefresh={() =>
                  void queryClient.invalidateQueries({
                    queryKey: organizationQueryKeys.unitTree(orgId),
                  })
                }
                onExpandAll={expandAll}
                onCollapseAll={collapseAll}
                isFullyCollapsed={expandedUnitIds.length === 0}
                searchOptions={searchOptions}
                searchValue={searchUnitId}
                onSearchChange={handleSearchChange}
              />
            </>
          )}
        </div>

        <InspectorPanel />
      </Paper>

      {organization && (
        <>
          <UnitFormModal organizationId={organization.id} />
          <MoveUnitModal organizationId={organization.id} />
          <DeactivateUnitModal organizationId={organization.id} />
        </>
      )}
    </>
  );
}

function StructureContent() {
  return (
    <ReactFlowProvider>
      <StructureInner />
    </ReactFlowProvider>
  );
}

export function Structure() {
  return (
    <RequireStaff>
      <StructureContent />
    </RequireStaff>
  );
}

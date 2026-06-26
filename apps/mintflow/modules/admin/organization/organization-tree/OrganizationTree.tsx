"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  MarkerType,
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
  OrgNodeData,
  DepartmentData,
  PersonData,
  OrgOfficeData,
  GroupData,
  NodeHealthIssue,
  DescendantStats,
  FilterKey,
} from "./OrganizationTree.types";
import { DUMMY_NODES, DUMMY_EDGES } from "./OrganizationTree.demoData";
import { useOrganizationGraph } from "./OrganizationTree.hooks";
import {
  computeChildrenMap,
  computeParentMap,
  computeVisibleNodeIds,
  computeDirectChildCounts,
  computePathFromRoot,
  computeDimmedNodeIds,
  expandAncestors,
  computeDescendantStats,
  computeNodeHealth,
  collectAncestors,
} from "./OrganizationTree.utils";
import styles from "./OrganizationTree.module.css";

const nodeTypes = {
  org: OrgNode,
  department: DepartmentNode,
  person: PersonNode,
  group: GroupNode,
} as const;

const DEFAULT_EDGE_OPTIONS = {
  type: "smoothstep",
  style: { strokeWidth: 2, stroke: "#94a3b8" },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
  animated: false,
};

function getEdgeStyleForRelationship(
  relType: string | undefined,
  isPath: boolean,
  isDim: boolean,
) {
  if (isPath) {
    return {
      style: {
        strokeWidth: 3,
        stroke: "var(--mantine-color-orange-5, #f97316)",
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "var(--mantine-color-orange-5, #f97316)",
      },
    };
  }
  if (isDim) {
    return {
      style: { strokeWidth: 1.5, stroke: "#94a3b8", opacity: 0.2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
    };
  }
  switch (relType) {
    case "reports_to":
      return {
        style: { strokeWidth: 1.5, stroke: "#94a3b8", strokeDasharray: "5,3" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
      };
    case "heads":
      return {
        style: { strokeWidth: 2, stroke: "#7c3aed" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#7c3aed" },
      };
    case "supervises":
      return {
        style: { strokeWidth: 2, stroke: "#0891b2" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#0891b2" },
      };
    default:
      return {
        style: DEFAULT_EDGE_OPTIONS.style,
        markerEnd: DEFAULT_EDGE_OPTIONS.markerEnd,
      };
  }
}

function autoArrangeNodes(
  nodes: OrgFlowNode[],
  edges: OrgFlowEdge[],
  layoutMode: "compact" | "expanded" = "expanded",
): OrgFlowNode[] {
  if (nodes.length === 0) return nodes;

  const NODE_W = 300;
  const NODE_H = 160;
  const BASE_H_GAP = layoutMode === "compact" ? 40 : 80;
  const BASE_V_GAP = layoutMode === "compact" ? 100 : 160;

  // Gap scales up with the number of siblings so large rows breathe
  function hGapForCount(count: number): number {
    if (count <= 2) return BASE_H_GAP;
    if (count <= 4) return BASE_H_GAP * 1.25;
    if (count <= 8) return BASE_H_GAP * 1.6;
    return BASE_H_GAP * 2;
  }

  // Vertical gap grows slightly when a parent has many children
  function vGapForCount(count: number): number {
    if (count <= 3) return BASE_V_GAP;
    if (count <= 6) return BASE_V_GAP * 1.2;
    return BASE_V_GAP * 1.4;
  }

  const children: Record<string, string[]> = {};
  const hasParent = new Set<string>();

  for (const edge of edges) {
    if (!children[edge.source]) children[edge.source] = [];
    children[edge.source].push(edge.target);
    hasParent.add(edge.target);
  }

  const roots = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id);

  if (roots.length === 0) {
    return nodes.map((n, i) => ({
      ...n,
      position: {
        x: (i % 4) * (NODE_W + BASE_H_GAP),
        y: Math.floor(i / 4) * (NODE_H + BASE_V_GAP),
      },
    }));
  }

  const positions: Record<string, { x: number; y: number }> = {};
  const visited = new Set<string>();

  function subtreeWidth(id: string, parentChildCount = 1): number {
    const kids = children[id] ?? [];
    if (kids.length === 0) return NODE_W;
    const hGap = hGapForCount(parentChildCount);
    const childWidths = kids.map((k) => subtreeWidth(k, kids.length));
    return Math.max(
      NODE_W,
      childWidths.reduce((acc, w) => acc + w + hGap, -hGap),
    );
  }

  function layout(id: string, x: number, y: number, parentChildCount = 1) {
    if (visited.has(id)) return;
    visited.add(id);
    positions[id] = { x, y };
    const kids = children[id] ?? [];
    if (kids.length === 0) return;
    const hGap = hGapForCount(kids.length);
    const vGap = vGapForCount(kids.length);
    const totalWidth = kids
      .map((k) => subtreeWidth(k, kids.length))
      .reduce((a, w) => a + w + hGap, -hGap);
    let cx = x - totalWidth / 2;
    for (const kid of kids) {
      const kw = subtreeWidth(kid, kids.length);
      layout(kid, cx + kw / 2, y + NODE_H + vGap, kids.length);
      cx += kw + hGap;
    }
  }

  let rootX = 0;
  for (const root of roots) {
    const rw = subtreeWidth(root, roots.length);
    layout(root, rootX + rw / 2, 0, roots.length);
    rootX += rw + BASE_H_GAP * 2;
  }

  let fallbackX = rootX + BASE_H_GAP;
  for (const n of nodes) {
    if (!positions[n.id]) {
      positions[n.id] = { x: fallbackX, y: 0 };
      fallbackX += NODE_W + BASE_H_GAP;
    }
  }

  return nodes.map((n) => ({ ...n, position: positions[n.id] ?? n.position }));
}

// Returns true if a node's searchable fields contain the query string.
// Returns false for group nodes (they are not text-searchable).
function nodeMatchesSearch(
  type: string,
  data: OrgNodeData,
  q: string,
): boolean {
  switch (type) {
    case "person":
      return (
        (data as PersonData).fullName.toLowerCase().includes(q) ||
        (data as PersonData).designation.toLowerCase().includes(q)
      );
    case "department":
      return (data as DepartmentData).name.toLowerCase().includes(q);
    case "org":
      return (data as OrgOfficeData).name.toLowerCase().includes(q);
    default:
      return false;
  }
}

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
    setHighlightedNodeId,
    expandedNodeIds,
    expandedGroupIds,
    focusedBranchId,
    viewMode,
    expandNode: storeExpandNode,
    collapseNode,
    collapseAll,
    setFocusedBranch,
    setViewMode,
    setExpandedNodeIds,
    syncEdgeCache,
    activeFilters,
    searchMatchIds,
    setSearchMatchIds,
    selectNode,
  } = useOrgTreeStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<OrgFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<OrgFlowEdge>([]);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Impact preview state
  const [impactPreview, setImpactPreview] = useState<{
    nodeId: string;
    nodeName: string;
    nodeType: string;
    affectedPeople: number;
    affectedDepts: number;
  } | null>(null);

  // edgesRef lets the layout effect read current edges without making them a reactive dep
  // (the effect intentionally only triggers on visibleLayoutKey, not every edge change)
  const edgesRef = useRef(edges);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    // Use server data when available; fall back to demo data during local development
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

  // ── Shared graph maps — built once per nodes/edges change ─────────────────
  const graphMaps = useMemo(
    () => ({
      childrenOf: computeChildrenMap(edges),
      parentMap: computeParentMap(edges),
      nodeTypeMap: new Map<string, string | undefined>(
        nodes.map((n) => [n.id, n.type]),
      ),
      nodeDataMap: new Map<string, Record<string, unknown>>(
        nodes.map((n) => [n.id, n.data as Record<string, unknown>]),
      ),
      nodesMap: new Map<string, OrgFlowNode>(nodes.map((n) => [n.id, n])),
    }),
    [nodes, edges],
  );

  // ── Visibility: all nodes in BFS (person included in chain) ──────────────
  const visibleIds = useMemo(
    () =>
      new Set(computeVisibleNodeIds(nodes, edges, expandedNodeIds, viewMode)),
    [nodes, edges, expandedNodeIds, viewMode],
  );

  // When group is expanded, also show its members
  const visibleIdsWithGroups = useMemo(() => {
    if (expandedGroupIds.length === 0) return visibleIds;
    const augmented = new Set(visibleIds);
    for (const groupId of expandedGroupIds) {
      const groupNode = graphMaps.nodesMap.get(groupId);
      if (groupNode?.data.nodeType === "group") {
        const gData = groupNode.data as GroupData;
        for (const mid of gData.memberIds) augmented.add(mid);
      }
    }
    return augmented;
  }, [visibleIds, expandedGroupIds, graphMaps]);

  // ── Path highlight ────────────────────────────────────────────────────────
  const pathNodeIds = useMemo(
    () =>
      selectedNodeId
        ? new Set(
            computePathFromRoot(selectedNodeId, edges, graphMaps.parentMap),
          )
        : new Set<string>(),
    [selectedNodeId, edges, graphMaps],
  );

  // ── Dimmed nodes ──────────────────────────────────────────────────────────
  const dimmedNodeIds = useMemo(
    () =>
      new Set(
        computeDimmedNodeIds(
          focusedBranchId,
          [...visibleIdsWithGroups],
          edges,
          graphMaps.childrenOf,
          graphMaps.parentMap,
        ),
      ),
    [focusedBranchId, visibleIdsWithGroups, edges, graphMaps],
  );

  // ── Descendant stats map — maps built once, passed to each call ───────────
  const descendantStatsMap = useMemo(() => {
    const map = new Map<string, DescendantStats>();
    const { childrenOf, nodeTypeMap } = graphMaps;
    for (const id of visibleIdsWithGroups) {
      map.set(
        id,
        computeDescendantStats(id, nodes, edges, childrenOf, nodeTypeMap),
      );
    }
    return map;
  }, [nodes, edges, visibleIdsWithGroups, graphMaps]);

  // ── Health issues map — reuses pre-built maps and pre-computed stats ───────
  const healthIssuesMap = useMemo(() => {
    const map = new Map<string, NodeHealthIssue[]>();
    const { childrenOf, nodeTypeMap, nodeDataMap } = graphMaps;
    for (const id of visibleIdsWithGroups) {
      const issues = computeNodeHealth(
        id,
        nodes,
        edges,
        childrenOf,
        nodeTypeMap,
        nodeDataMap,
        descendantStatsMap.get(id),
      );
      if (issues.length > 0) map.set(id, issues);
    }
    return map;
  }, [nodes, edges, visibleIdsWithGroups, graphMaps, descendantStatsMap]);

  // ── Search match IDs ──────────────────────────────────────────────────────
  const activeSearchMatchIds = useMemo(
    () => new Set(searchMatchIds),
    [searchMatchIds],
  );

  // ── Apply active filters to visible set ──────────────────────────────────
  const filteredVisibleIds = useMemo(() => {
    if (activeFilters.length === 0) return visibleIdsWithGroups;
    const result = new Set<string>();
    const matchedIds: string[] = [];
    const { nodesMap, parentMap } = graphMaps;

    for (const id of visibleIdsWithGroups) {
      const node = nodesMap.get(id);
      if (!node) continue;
      const type = node.type;
      const data = node.data;

      let passes = true;

      for (const filter of activeFilters as FilterKey[]) {
        switch (filter) {
          case "depts_only":
            if (type !== "department" && type !== "group") passes = false;
            break;
          case "people_only":
            if (type !== "person") passes = false;
            break;
          case "leadership_only":
            if (type !== "person") {
              passes = false;
              break;
            }
            // eslint-disable-next-line no-case-declarations
            const pRole = (data as PersonData).role;
            if (
              ![
                "head",
                "manager",
                "minister",
                "secretary",
                "joint_secretary",
              ].includes(pRole ?? "")
            )
              passes = false;
            break;
          case "health_issues_only":
            if (!healthIssuesMap.has(id)) passes = false;
            break;
          case "empty_depts_only":
            if (!healthIssuesMap.get(id)?.includes("empty_dept"))
              passes = false;
            break;
          case "no_head_only":
            if (!healthIssuesMap.get(id)?.includes("missing_head"))
              passes = false;
            break;
          case "active_only":
            if ((data as { status?: string }).status !== "active")
              passes = false;
            break;
          case "inactive_only":
            if ((data as { status?: string }).status !== "inactive")
              passes = false;
            break;
        }
        if (!passes) break;
      }

      if (passes) {
        result.add(id);
        matchedIds.push(id);
      }
    }

    // Include ancestors for context — single parentMap lookup per ancestor, not per matched node
    for (const aid of collectAncestors(matchedIds, parentMap)) result.add(aid);

    return result;
  }, [visibleIdsWithGroups, activeFilters, graphMaps, healthIssuesMap]);

  // ── Enrich visible nodes ──────────────────────────────────────────────────
  const enrichedVisibleNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const { childrenOf, nodeTypeMap } = graphMaps;
    return nodes
      .filter((n) => filteredVisibleIds.has(n.id))
      .filter(
        (n) =>
          !q ||
          nodeMatchesSearch(n.type ?? "", n.data, q) ||
          n.type === "group",
      )
      .map((n) => ({
        ...n,
        data: {
          ...n.data,
          _expanded: expandedNodeIds.includes(n.id),
          _pathHighlighted: pathNodeIds.has(n.id),
          _dimmed: dimmedNodeIds.has(n.id),
          _searchMatch: activeSearchMatchIds.has(n.id),
          _directChildCounts: computeDirectChildCounts(
            n.id,
            nodes,
            edges,
            childrenOf,
            nodeTypeMap,
          ),
          _descendantStats: descendantStatsMap.get(n.id),
          _healthIssues: healthIssuesMap.get(n.id) ?? [],
        },
      }));
  }, [
    nodes,
    edges,
    filteredVisibleIds,
    expandedNodeIds,
    pathNodeIds,
    dimmedNodeIds,
    activeSearchMatchIds,
    descendantStatsMap,
    healthIssuesMap,
    searchQuery,
    graphMaps,
  ]);

  // ── Enrich visible edges ──────────────────────────────────────────────────
  const enrichedVisibleEdges = useMemo(() => {
    return edges
      .filter(
        (e) =>
          filteredVisibleIds.has(e.source) && filteredVisibleIds.has(e.target),
      )
      .map((e) => {
        const isPath = pathNodeIds.has(e.source) && pathNodeIds.has(e.target);
        const isDim =
          dimmedNodeIds.has(e.source) || dimmedNodeIds.has(e.target);
        const relType = (e.data as { relationshipType?: string } | undefined)
          ?.relationshipType;
        const { style, markerEnd } = getEdgeStyleForRelationship(
          relType,
          isPath,
          isDim,
        );
        return { ...e, type: "smoothstep", style, markerEnd };
      });
  }, [edges, filteredVisibleIds, pathNodeIds, dimmedNodeIds]);

  // ── Layout effect ─────────────────────────────────────────────────────────
  const visibleLayoutKey = useMemo(
    () => [...filteredVisibleIds].sort().join(","),
    [filteredVisibleIds],
  );

  useEffect(() => {
    if (nodes.length === 0) return;
    const currentEdges = edgesRef.current;
    const visibleNodeList = nodes.filter((n) => filteredVisibleIds.has(n.id));
    if (visibleNodeList.length === 0) return;

    const visEdges = currentEdges.filter(
      (e) =>
        filteredVisibleIds.has(e.source) && filteredVisibleIds.has(e.target),
    );
    const arranged = autoArrangeNodes(visibleNodeList, visEdges, "expanded");
    const posMap: Record<string, { x: number; y: number }> = {};
    for (const n of arranged) posMap[n.id] = n.position;

    setNodes((ns) =>
      ns.map((n) => (posMap[n.id] ? { ...n, position: posMap[n.id] } : n)),
    );
    setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleLayoutKey]);

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
    for (const id of matchedIds)
      expanded = expandAncestors(id, edges, expanded);
    setExpandedNodeIds(expanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ── Breadcrumb path ───────────────────────────────────────────────────────
  const breadcrumbPath = useMemo(() => {
    if (!focusedBranchId) return [];
    const pathIds = computePathFromRoot(
      focusedBranchId,
      edges,
      graphMaps.parentMap,
    );
    return pathIds.map((id) => {
      const node = graphMaps.nodesMap.get(id);
      const label =
        node?.data.nodeType === "person"
          ? (node.data as PersonData).fullName
          : node?.data.nodeType === "group"
            ? (node.data as GroupData).name
            : ((node?.data as OrgOfficeData | DepartmentData | undefined)
                ?.name ?? id);
      return { id, label };
    });
  }, [focusedBranchId, edges, graphMaps]);

  // ── Analytics ─────────────────────────────────────────────────────────────
  const analyticsStats = useMemo(() => {
    let totalOrgs = 0,
      totalDepts = 0,
      totalPeople = 0,
      missingHeads = 0,
      emptyDepts = 0,
      inactivePeople = 0;
    for (const n of nodes) {
      if (n.type === "org") totalOrgs++;
      else if (n.type === "department") totalDepts++;
      else if (n.type === "person") {
        totalPeople++;
        if ((n.data as PersonData).status === "inactive") inactivePeople++;
      }
    }
    for (const [, issues] of healthIssuesMap) {
      if (issues.includes("missing_head")) missingHeads++;
      if (issues.includes("empty_dept")) emptyDepts++;
    }
    return {
      totalOrgs,
      totalDepts,
      totalPeople,
      missingHeads,
      emptyDepts,
      inactivePeople,
    };
  }, [nodes, healthIssuesMap]);

  const selectedNode = graphMaps.nodesMap.get(selectedNodeId ?? "") ?? null;
  const activeDepartment = activeDepartmentId
    ? graphMaps.nodesMap.get(activeDepartmentId)
    : null;
  const activeDepartmentName =
    activeDepartment?.data.nodeType === "department"
      ? (activeDepartment.data as DepartmentData).name
      : null;

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

  // Click = select only (not expand)
  const onNodeClick: NodeMouseHandler<OrgFlowNode> = useCallback(
    (_event, node) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  // Double-click = enter focus mode
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
    closeDrawer();
    closeContextMenu();
    setActiveDepartment(null);
    setHighlightedNodeId(null);
  }, [
    closeDrawer,
    closeContextMenu,
    setActiveDepartment,
    setHighlightedNodeId,
  ]);

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      if (changes.some((c) => c.type === "position" && c.dragging === false))
        markDirty();
    },
    [onNodesChange, markDirty],
  );

  const handleAddNode = useCallback(
    (data: OrgNodeData) => {
      const id = `node-${Date.now()}`;
      const newNode: OrgFlowNode = {
        id,
        type: data.nodeType as OrgFlowNode["type"],
        position: {
          x: 200 + Math.random() * 300,
          y: 200 + Math.random() * 200,
        },
        data,
      };
      const parentId = nodeModal.pendingParentId;
      setNodes((ns) => {
        const updated = [...ns, newNode];
        pushHistory(updated, edges);
        return updated;
      });
      // Auto-connect to parent if provided
      if (parentId) {
        const newEdge: OrgFlowEdge = {
          id: `e-${parentId}-${id}-${Date.now()}`,
          source: parentId,
          target: id,
          ...DEFAULT_EDGE_OPTIONS,
          data: { relationshipType: "contains" },
        };
        setEdges((es) => [...es, newEdge]);
        storeExpandNode(parentId);
      }
      markDirty();
    },
    [
      setNodes,
      setEdges,
      edges,
      pushHistory,
      markDirty,
      nodeModal.pendingParentId,
      storeExpandNode,
    ],
  );

  const handleEditNode = useCallback(
    (data: OrgNodeData) => {
      if (!nodeModal.editingNodeId) return;
      setNodes((ns) => {
        const updated = ns.map((n) =>
          n.id === nodeModal.editingNodeId ? { ...n, data } : n,
        );
        pushHistory(updated, edges);
        return updated;
      });
      markDirty();
    },
    [nodeModal.editingNodeId, setNodes, edges, pushHistory, markDirty],
  );

  // Delete with impact preview
  const handleRequestDelete = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const { childrenOf, nodeTypeMap } = graphMaps;
      const stats = computeDescendantStats(
        nodeId,
        nodes,
        edges,
        childrenOf,
        nodeTypeMap,
      );
      const nodeName =
        node.data.nodeType === "person"
          ? (node.data as PersonData).fullName
          : node.data.nodeType === "group"
            ? (node.data as GroupData).name
            : (node.data as OrgOfficeData | DepartmentData).name;
      setImpactPreview({
        nodeId,
        nodeName,
        nodeType: node.type ?? "node",
        affectedPeople: stats.totalPeople,
        affectedDepts: stats.totalDepts,
      });
    },
    [nodes, edges, graphMaps],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!impactPreview) return;
    const { nodeId } = impactPreview;
    setNodes((ns) => {
      const updated = ns.filter((n) => n.id !== nodeId);
      pushHistory(updated, edges);
      return updated;
    });
    setEdges((es) =>
      es.filter((e) => e.source !== nodeId && e.target !== nodeId),
    );
    closeDrawer();
    markDirty();
    setImpactPreview(null);
  }, [
    impactPreview,
    setNodes,
    setEdges,
    edges,
    pushHistory,
    closeDrawer,
    markDirty,
  ]);

  const handleAutoArrange = useCallback(
    (layoutMode: "compact" | "expanded" = "expanded") => {
      const visibleNodeList = nodes.filter((n) => filteredVisibleIds.has(n.id));
      const visEdges = edges.filter(
        (e) =>
          filteredVisibleIds.has(e.source) && filteredVisibleIds.has(e.target),
      );
      const arranged = autoArrangeNodes(visibleNodeList, visEdges, layoutMode);
      const posMap: Record<string, { x: number; y: number }> = {};
      for (const n of arranged) posMap[n.id] = n.position;

      setNodes((ns) => {
        const updated = ns.map((n) =>
          posMap[n.id] ? { ...n, position: posMap[n.id] } : n,
        );
        pushHistory(updated, edges);
        return updated;
      });
      setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 50);
      markDirty();
    },
    [
      nodes,
      edges,
      filteredVisibleIds,
      setNodes,
      pushHistory,
      fitView,
      markDirty,
    ],
  );

  const handleBackToParent = useCallback(() => {
    if (!focusedBranchId) return;
    const parent = graphMaps.parentMap[focusedBranchId];
    setFocusedBranch(parent ?? null);
  }, [focusedBranchId, graphMaps, setFocusedBranch]);

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

  const editingNode = nodeModal.editingNodeId
    ? graphMaps.nodesMap.get(nodeModal.editingNodeId)
    : undefined;

  // Context menu — type-aware actions
  const getContextMenuActions = useCallback(
    (nodeId: string) => {
      const node = graphMaps.nodesMap.get(nodeId);
      const isOrg = node?.type === "org";
      const isDept = node?.type === "department" || node?.type === "group";
      const isPerson = node?.type === "person";
      const actions = [
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
      return actions;
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

  // Determine which drawer to show
  const selectedNodeForDrawer = selectedNode
    ? {
        type: selectedNode.type,
        data: selectedNode.data,
        id: selectedNode.id,
      }
    : null;

  // Group drawer (when group node selected)
  const isGroupDrawer = selectedNodeForDrawer?.type === "group";
  const groupMemberNodes = useMemo(() => {
    if (!selectedNode || selectedNode.data.nodeType !== "group") return [];
    const gData = selectedNode.data as GroupData;
    return nodes.filter((n) => gData.memberIds.includes(n.id));
  }, [selectedNode, nodes]);

  // Head person for org drawer
  const headPersonForOrg = useMemo(() => {
    if (!selectedNode || selectedNode.data.nodeType !== "org") return undefined;
    const childIds = graphMaps.childrenOf[selectedNode.id] ?? [];
    for (const childId of childIds) {
      const child = graphMaps.nodesMap.get(childId);
      if (child?.type === "person") {
        const pData = child.data as PersonData;
        if (
          ["head", "manager", "minister", "secretary"].includes(
            pData.role ?? "",
          )
        ) {
          return pData.fullName;
        }
      }
    }
    return undefined;
  }, [selectedNode, graphMaps]);

  const selectedDescendantStats = selectedNodeId
    ? descendantStatsMap.get(selectedNodeId)
    : undefined;
  const selectedHealthIssues = selectedNodeId
    ? (healthIssuesMap.get(selectedNodeId) ?? [])
    : [];

  // Person drawer stats
  const personDirectReports =
    selectedNode?.type === "person"
      ? computeDirectChildCounts(
          selectedNode.id,
          nodes,
          edges,
          graphMaps.childrenOf,
          graphMaps.nodeTypeMap,
        ).personCount
      : 0;
  const personTotalBelow = selectedDescendantStats?.totalPeople ?? 0;

  // Search debounce
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback(
    (val: string) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => setSearchQuery(val), 150);
    },
    [setSearchQuery],
  );

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
            fitView
            fitViewOptions={{ padding: 0.2 }}
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
          onAddDivision={() =>
            selectedNodeForDrawer &&
            openAddModal(
              "department",
              selectedNodeForDrawer.id,
              (selectedNodeForDrawer.data as OrgOfficeData).name,
            )
          }
          onAddPerson={() =>
            selectedNodeForDrawer &&
            openAddModal(
              "person",
              selectedNodeForDrawer.id,
              (selectedNodeForDrawer.data as DepartmentData).name,
            )
          }
          onAddChild={() =>
            selectedNodeForDrawer &&
            openAddModal(
              "department",
              selectedNodeForDrawer.id,
              (selectedNodeForDrawer.data as DepartmentData).name,
            )
          }
          totalPeople={selectedDescendantStats?.totalPeople}
          totalDepts={selectedDescendantStats?.totalDepts}
          hiddenLevels={selectedDescendantStats?.hiddenLevels}
          headPersonName={headPersonForOrg}
          healthIssues={selectedHealthIssues}
          directReports={personDirectReports}
          totalBelow={personTotalBelow}
          memberNodes={groupMemberNodes}
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
        onSubmit={nodeModal.mode === "add" ? handleAddNode : handleEditNode}
        pendingParentName={nodeModal.pendingParentName}
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

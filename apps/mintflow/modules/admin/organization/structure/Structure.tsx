"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Button,
  Center,
  Loader,
  ModuleHeader,
  Paper,
  Stack,
  Text,
  notifications,
  useDebouncedValue,
  useQueries,
  useQueryClient,
} from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";

import { fetchUnitChildren } from "../_shared/organization.api";
import { organizationQueryKeys } from "../_shared/organization.queryKeys";
import type { UnitTreeNodeFlat } from "../_shared/organization.types";
import { BreadcrumbNav } from "./components/BreadcrumbNav";
import { DeactivateUnitModal } from "./components/DeactivateUnitModal";
import { EmptyState } from "./components/EmptyState";
import { InspectorPanel } from "./components/InspectorPanel";
import { MoveUnitModal } from "./components/MoveUnitModal";
import { OrgRootNode } from "./components/nodes/OrgRootNode";
import { UnitNode } from "./components/nodes/UnitNode";
import { Toolbar } from "./components/Toolbar";
import { UnitFormModal } from "./components/UnitFormModal";
import {
  useOrganizationRoot,
  useUnitRoots,
  useUnitSearch,
} from "./Structure.hooks";
import { useStructureStore } from "./Structure.store";
import type { StructureFlowEdge, StructureFlowNode } from "./Structure.types";
import {
  autoArrangeNodes,
  buildGraphFromFlatNodes,
  computeDimmedNodeIds,
  computePathFromRoot,
  computeVisibleNodeIds,
} from "./Structure.utils";

const nodeTypes = { org: OrgRootNode, unit: UnitNode } as const;

/** Stable empty reference so transitional renders don't thrash downstream memos. */
const EMPTY_IDS: string[] = [];

function StructureInner() {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const {
    data: organization,
    isLoading: orgLoading,
    isError: orgError,
    refetch: refetchOrg,
  } = useOrganizationRoot(orgId);
  const {
    data: roots,
    isLoading: rootsLoading,
    isError: rootsError,
    refetch: refetchRoots,
  } = useUnitRoots(orgId);

  const {
    selectUnit,
    expandedUnitIds,
    expandedOrgId,
    setExpandedUnitIds,
    claimOrg,
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

  // Guards the async "jump to search hit" poll: the token invalidates an in-flight
  // poll when a newer selection or org switch happens; the ref lets us cancel the
  // pending timeout on unmount so it can't center a stale/other canvas.
  const searchTokenRef = useRef(0);
  const centerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (centerTimeoutRef.current) clearTimeout(centerTimeoutRef.current);
    },
    [],
  );

  // The store is shared across orgs, so a previous org's open branches can still
  // sit in `expandedUnitIds` during the render that switches `orgId`. Ignore them
  // until the reset effect below has claimed the current org — otherwise we'd fire
  // fetchUnitChildren(newOrg, oldOrgUnitId) and 404. `expandedOrgId` starts null,
  // so this also guards the very first mount against stale persisted expansion.
  const effectiveExpandedIds =
    expandedOrgId === orgId ? expandedUnitIds : EMPTY_IDS;

  // The org node stands in for the tree root; its "children" are the root units
  // (fetched by useUnitRoots). Every OTHER expanded unit lazily loads its direct
  // children + members on demand — one query per expanded branch, RQ-cached so
  // collapsing then re-expanding is instant.
  const expandedChildUnitIds = useMemo(
    () => effectiveExpandedIds.filter((id) => id && id !== organization?.id),
    [effectiveExpandedIds, organization?.id],
  );

  const childQueries = useQueries({
    queries: expandedChildUnitIds.map((unitId) => ({
      queryKey: organizationQueryKeys.unitChildren(orgId, unitId),
      queryFn: () => fetchUnitChildren(orgId, unitId),
      enabled: Boolean(orgId),
    })),
  });

  // Merge the root list with every loaded branch into one flat node set. A unit
  // can appear in more than one response (its parent's expand + its own); keep
  // the member-enriched copy.
  const flatNodes = useMemo(() => {
    const map = new Map<string, UnitTreeNodeFlat>();
    for (const root of roots ?? []) map.set(root.id, root);
    for (const query of childQueries) {
      for (const node of query.data ?? []) {
        const existing = map.get(node.id);
        // Take the incoming node's scalar fields (fresh counts/status), but never
        // drop an already-loaded dimension: keep positions / direct members from
        // whichever copy carried them, so an asymmetric payload (e.g. one fetch
        // with positions but no unit_members) can't blank the members list.
        map.set(node.id, {
          ...node,
          positions: node.positions ?? existing?.positions,
          unit_members: node.unit_members ?? existing?.unit_members,
        });
      }
    }
    return [...map.values()];
  }, [roots, childQueries]);

  // Units whose lazy child fetch is still in flight — drives the node spinner.
  const loadingSignature = expandedChildUnitIds
    .map((id, i) => (childQueries[i]?.isLoading ? id : ""))
    .join(",");
  const loadingUnitIds = useMemo(() => {
    const set = new Set<string>();
    expandedChildUnitIds.forEach((id, i) => {
      if (childQueries[i]?.isLoading) set.add(id);
    });
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingSignature]);

  // Units whose lazy child fetch failed — surfaced on the node so the expand
  // doesn't silently render an empty branch. Collapsing + re-expanding retries.
  const errorSignature = expandedChildUnitIds
    .map((id, i) => (childQueries[i]?.isError ? id : ""))
    .join(",");
  const errorUnitIds = useMemo(() => {
    const set = new Set<string>();
    expandedChildUnitIds.forEach((id, i) => {
      if (childQueries[i]?.isError) set.add(id);
    });
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorSignature]);

  // A stable digest of everything the canvas renders — the graph is only rebuilt
  // when this changes, so per-render churn from useQueries doesn't reshuffle the
  // canvas. It must capture every displayed field (names, code, status, and each
  // position's holders) so a mutation that changes a field without changing tree
  // shape still refreshes the node.
  const graphSignature = useMemo(() => {
    const part = flatNodes
      .map((n) => {
        const members = n.positions
          ? n.positions
              .map(
                (p) =>
                  `${p.id}#${p.status}#${p.title_np}#${p.title_en}#` +
                  p.holders
                    .map(
                      (h) =>
                        `${h.assignment_id}~${h.display_name}~${
                          h.is_primary ? 1 : 0
                        }`,
                    )
                    .join("+"),
              )
              .join(";")
          : "-";
        const directMembers = n.unit_members
          ? n.unit_members
              .map(
                (m) =>
                  `${m.membership_id}~${m.display_name}~${m.is_primary ? 1 : 0}`,
              )
              .join("+")
          : "-";
        const counts = `${n.child_count}/${n.member_count}/${n.position_count}/${
          n.descendant_count ?? ""
        }`;
        return `${n.id}:${n.parent_id ?? ""}:${n.has_children ? 1 : 0}:${
          n.name_np
        }:${n.name_en}:${n.code}:${n.unit_type}:${n.status}:${counts}:[${members}]:{${directMembers}}`;
      })
      .join(",");
    return `${organization?.id ?? ""}:${organization?.name_np ?? ""}:${
      organization?.name_en ?? ""
    }:${organization?.status ?? ""}|${part}`;
  }, [
    organization?.id,
    organization?.name_np,
    organization?.name_en,
    organization?.status,
    flatNodes,
  ]);

  // Deterministic node heights (from member counts) so the layout can space nodes
  // without waiting for ReactFlow to measure the taller, member-expanded cards.
  const nodeHeights = useMemo(() => {
    const heights: Record<string, number> = {};
    for (const node of flatNodes) {
      let height = 120;
      if (node.positions && node.positions.length > 0) {
        height += 26;
        for (const position of node.positions) {
          height += 22 + position.holders.length * 18;
        }
      } else if (node.positions) {
        height += 26;
      }
      if (node.unit_members && node.unit_members.length > 0) {
        height += 26 + node.unit_members.length * 18;
      }
      heights[node.id] = height;
    }
    return heights;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphSignature]);

  // Rebuild the graph only when the aggregated node set changes, preserving
  // positions already computed for surviving nodes.
  const prevGraphSignature = useRef("");
  useEffect(() => {
    if (rootsLoading || orgLoading || !organization) return;
    if (graphSignature === prevGraphSignature.current) return;
    prevGraphSignature.current = graphSignature;
    const { nodes: freshNodes, edges: freshEdges } = buildGraphFromFlatNodes(
      organization,
      flatNodes,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphSignature, rootsLoading, orgLoading]);

  // Reset expansion when switching organizations so one org's open branches
  // don't leak into another (the store is shared across orgs). Claiming the org
  // (which also stamps `expandedOrgId`) is what lets `effectiveExpandedIds` start
  // trusting `expandedUnitIds` again.
  const didInitExpand = useRef(false);
  useEffect(() => {
    didInitExpand.current = false;
    // Invalidate any in-flight jump-to-node poll from the previous org.
    searchTokenRef.current += 1;
    if (centerTimeoutRef.current) clearTimeout(centerTimeoutRef.current);
    claimOrg(orgId);
  }, [orgId, claimOrg]);

  // Auto-expand the org node once per org so its root units are visible.
  useEffect(() => {
    if (organization && !didInitExpand.current) {
      didInitExpand.current = true;
      setExpandedUnitIds([organization.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization]);

  const visibleNodeIds = useMemo(() => {
    if (!organization) return [];
    return computeVisibleNodeIds(organization.id, edges, effectiveExpandedIds);
  }, [organization, edges, effectiveExpandedIds]);

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
            _childrenLoading: loadingUnitIds.has(n.id),
            _childrenError: errorUnitIds.has(n.id),
          },
        })),
    [
      nodes,
      visibleNodeIdSet,
      dimmedNodeIds,
      pathHighlightIds,
      focusedBranchId,
      searchUnitId,
      loadingUnitIds,
      errorUnitIds,
    ],
  );

  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleNodeIdSet.has(e.source) && visibleNodeIdSet.has(e.target),
      ),
    [edges, visibleNodeIdSet],
  );

  // Re-layout whenever the visible set OR member sizing changes so newly
  // expanded/collapsed branches (and taller member-expanded cards) don't
  // overlap. Positions are always derived, never persisted.
  const layoutKey = useMemo(
    () => `${[...visibleNodeIdSet].sort().join(",")}|${graphSignature}`,
    [visibleNodeIdSet, graphSignature],
  );
  const prevLayoutKey = useRef<string>("");
  useEffect(() => {
    if (layoutKey === prevLayoutKey.current) return;
    prevLayoutKey.current = layoutKey;
    setNodes((current) => {
      const visible = current.filter((n) => visibleNodeIdSet.has(n.id));
      const laidOut = autoArrangeNodes(visible, visibleEdges, nodeHeights);
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
  }, [layoutKey]);

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

  // Server-side unit search — finds deep, collapsed units the client hasn't
  // loaded. Debounced so typing doesn't fire a request per keystroke.
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(searchQuery, 250);
  const { data: searchResults = [], isFetching: searchLoading } = useUnitSearch(
    orgId,
    debouncedQuery,
  );
  const searchResultsById = useMemo(
    () => new Map(searchResults.map((r) => [r.id, r])),
    [searchResults],
  );
  const searchOptions = useMemo(
    () =>
      searchResults.map((r) => ({
        value: r.id,
        label: `${r.name_np} · ${r.code}`,
      })),
    [searchResults],
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

  // Poll for the node to appear (its ancestor branches lazy-load after expand),
  // then center on it. `token` cancels the chain when a newer selection or org
  // switch happens; on give-up we tell the user instead of failing silently.
  function centerOnNode(nodeId: string, attempt: number, token: number) {
    if (token !== searchTokenRef.current) return;
    const rfNode = getNode(nodeId);
    if (rfNode?.measured?.width) {
      const x = rfNode.position.x + rfNode.measured.width / 2;
      const y = rfNode.position.y + (rfNode.measured.height ?? 100) / 2;
      setCenter(x, y, { zoom: 1, duration: 400 });
      return;
    }
    if (attempt < 12) {
      centerTimeoutRef.current = setTimeout(
        () => centerOnNode(nodeId, attempt + 1, token),
        200,
      );
    } else {
      notifications.show({
        color: "yellow",
        title: "Couldn't reveal that unit",
        message: "Expand its branch manually, then try again.",
      });
    }
  }

  function handleSelectSearchResult(nodeId: string | null) {
    setSearchUnitId(nodeId);
    if (!nodeId) return;
    // Reveal a deep hit by expanding its full ancestor path (root→node), lazily
    // loading each branch via the existing per-branch fetch, then center on it.
    const token = (searchTokenRef.current += 1);
    if (centerTimeoutRef.current) clearTimeout(centerTimeoutRef.current);
    const result = searchResultsById.get(nodeId);
    const nextExpanded = new Set(expandedUnitIds);
    if (organization) nextExpanded.add(organization.id);
    for (const ancestor of result?.path ?? []) nextExpanded.add(ancestor.id);
    if (nextExpanded.size !== expandedUnitIds.length) {
      setExpandedUnitIds([...nextExpanded]);
    }
    centerOnNode(nodeId, 0, token);
  }

  const isLoading = orgLoading || rootsLoading;
  const hasError = orgError || rootsError;
  const isEmpty = !isLoading && !hasError && (roots ?? []).length === 0;

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
          ) : hasError ? (
            <Center h="100%">
              <Stack align="center" gap="xs" maw={360} px="md">
                <Text fw={600}>Couldn&apos;t load the structure</Text>
                <Text size="sm" c="dimmed" ta="center">
                  The unit tree failed to load. Check your connection and try
                  again.
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => {
                    void refetchOrg();
                    void refetchRoots();
                  }}
                >
                  Retry
                </Button>
              </Stack>
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
                    predicate: (query) => {
                      const key = query.queryKey;
                      return (
                        Array.isArray(key) &&
                        key[0] === "organizations" &&
                        key[1] === orgId &&
                        (key[2] === "unit-roots" || key[2] === "unit-children")
                      );
                    },
                  })
                }
                onCollapseAll={collapseAll}
                searchResults={searchOptions}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSelectUnit={handleSelectSearchResult}
                searchLoading={searchLoading}
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

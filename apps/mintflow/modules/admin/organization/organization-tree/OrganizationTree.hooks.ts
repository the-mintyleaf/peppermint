import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MarkerType } from "@xyflow/react";
import { notifications } from "@peppermint/ui";
import {
  createUnit,
  fetchUnitTree,
  type CreateUnitInput,
} from "./OrganizationTree.api";
import { orgTreeQueryKeys } from "./OrganizationTree.queryKeys";
import type {
  DepartmentData,
  DescendantStats,
  FilterKey,
  GroupData,
  NodeHealthIssue,
  NodeModalConfig,
  OrgOfficeData,
  PersonData,
} from "./OrganizationTree.types";
import {
  useOrgTreeStore,
  type OrgFlowNode,
  type OrgFlowEdge,
} from "./OrganizationTree.store";
import {
  autoArrangeNodes,
  collectAncestors,
  computeChildrenMap,
  computeDescendantStats,
  computeDimmedNodeIds,
  computeDirectChildCounts,
  computeNodeHealth,
  computeParentMap,
  computePathFromRoot,
  computeVisibleNodeIds,
  getEdgeStyleForRelationship,
  nodeMatchesSearch,
  orgToFlowNode,
  personToFlowNode,
} from "./OrganizationTree.utils";
import {
  createOrganization,
  updateOrganization,
} from "../organizations/organizations.api";
import type { Organization } from "../organizations/organizations.types";
import { createPerson } from "../people/people.api";
import type { CreatePersonPayload } from "../people/people.types";
import type { PeopleFormValues } from "../people/form/peopleForm.types";
import type { UnitsFormValues } from "./components/NodeFormModal/forms/UnitsForm/UnitsForm.types";
import { createPosition as createPositionApi } from "../positions/positions.api";
import type { Position } from "../positions/positions.types";
import type { PositionsFormValues } from "../positions/form/PositionsForm/PositionsForm.types";
import { createSite } from "../sites/sites.api";
import type { CreateSitePayload, Site } from "../sites/sites.types";
import { createDelegation } from "../delegations/delegations.api";
import type {
  Delegation,
  DelegationCreatePayload,
} from "../delegations/delegations.types";

interface UnitTreeItem {
  id: string;
  parent_id: string | null;
  name: string;
  code: string;
  unit_type: string;
  status: string;
  sort_order: number;
  children?: UnitTreeItem[];
}

function unitToFlowNode(unit: UnitTreeItem): OrgFlowNode {
  const data: DepartmentData = {
    nodeType: "department",
    name: unit.name,
    deptType: (unit.unit_type as DepartmentData["deptType"]) ?? "department",
    status: unit.status === "active" ? "active" : "inactive",
    peopleCount: 0,
    createdAt: undefined,
  };
  return {
    id: unit.id,
    type: "department",
    data,
    position: { x: 0, y: 0 },
  };
}

function unitToEdge(unit: UnitTreeItem): OrgFlowEdge | null {
  if (!unit.parent_id) return null;
  return {
    id: `e-${unit.parent_id}-${unit.id}`,
    source: unit.parent_id,
    target: unit.id,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
    style: { strokeWidth: 2, stroke: "#94a3b8" },
    data: { relationshipType: "contains" },
  };
}

function flattenTree(
  items: UnitTreeItem[],
  parentId: string | null = null,
): UnitTreeItem[] {
  return items.flatMap((item) => {
    const flat: UnitTreeItem = { ...item, parent_id: parentId };
    return [flat, ...flattenTree(item.children ?? [], item.id)];
  });
}

function buildFlowGraph(raw: { units: unknown[]; positions: unknown[] }): {
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
} {
  const units = flattenTree(raw.units as UnitTreeItem[]);
  const nodes = units.map(unitToFlowNode);
  const edges = units.map(unitToEdge).filter(Boolean) as OrgFlowEdge[];
  return { nodes, edges };
}

export function useOrganizationGraph(orgId: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: orgTreeQueryKeys.graph(orgId),
    queryFn: () => fetchUnitTree(orgId),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });

  const { nodes, edges } = useMemo(
    () => (data ? buildFlowGraph(data) : { nodes: [], edges: [] }),
    [data],
  );

  return { nodes, edges, isLoading, isError };
}

export function useCreateUnit(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateUnitInput, "organization">) =>
      createUnit({ ...input, organization: orgId }),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: orgTreeQueryKeys.graph(orgId),
      });
    },
  });
}

export function useAddOrganizationNode(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<Organization>) => createOrganization(values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useUpdateOrganizationNode(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<Organization>;
    }) => updateOrganization(id, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useAddPersonNode(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CreatePersonPayload) => createPerson(orgId, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useAddPosition(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      unitId,
      values,
    }: {
      unitId: string;
      values: Partial<Position>;
    }) => createPositionApi(unitId, { ...values, organization: orgId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useAddSite(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CreateSitePayload) => createSite(orgId, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

export function useAddDelegation(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: DelegationCreatePayload) =>
      createDelegation(orgId, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgTreeQueryKeys.graph(orgId) });
    },
  });
}

// ─── Derived-state hook ───────────────────────────────────────────────────────

export function useEnrichedGraph(nodes: OrgFlowNode[], edges: OrgFlowEdge[]) {
  const {
    expandedNodeIds,
    expandedGroupIds,
    focusedBranchId,
    viewMode,
    selectedNodeId,
    activeFilters,
    searchQuery,
    searchMatchIds,
  } = useOrgTreeStore();

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

  const visibleIds = useMemo(
    () =>
      new Set(computeVisibleNodeIds(nodes, edges, expandedNodeIds, viewMode)),
    [nodes, edges, expandedNodeIds, viewMode],
  );

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

  const pathNodeIds = useMemo(
    () =>
      selectedNodeId
        ? new Set(
            computePathFromRoot(selectedNodeId, edges, graphMaps.parentMap),
          )
        : new Set<string>(),
    [selectedNodeId, edges, graphMaps],
  );

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

  const activeSearchMatchIds = useMemo(
    () => new Set(searchMatchIds),
    [searchMatchIds],
  );

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

    for (const aid of collectAncestors(matchedIds, parentMap)) result.add(aid);
    return result;
  }, [visibleIdsWithGroups, activeFilters, graphMaps, healthIssuesMap]);

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

  const enrichedVisibleEdges = useMemo(
    () =>
      edges
        .filter(
          (e) =>
            filteredVisibleIds.has(e.source) &&
            filteredVisibleIds.has(e.target),
        )
        .map((e) => {
          const isPath =
            pathNodeIds.has(e.source) && pathNodeIds.has(e.target);
          const isDim =
            dimmedNodeIds.has(e.source) || dimmedNodeIds.has(e.target);
          const relType = (
            e.data as { relationshipType?: string } | undefined
          )?.relationshipType;
          const { style, markerEnd } = getEdgeStyleForRelationship(
            relType,
            isPath,
            isDim,
          );
          return { ...e, type: "smoothstep", style, markerEnd };
        }),
    [edges, filteredVisibleIds, pathNodeIds, dimmedNodeIds],
  );

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

  return {
    graphMaps,
    filteredVisibleIds,
    enrichedVisibleNodes,
    enrichedVisibleEdges,
    descendantStatsMap,
    healthIssuesMap,
    pathNodeIds,
    dimmedNodeIds,
    analyticsStats,
    breadcrumbPath,
    activeSearchMatchIds,
  };
}

// ─── Canvas layout hook ───────────────────────────────────────────────────────

export function useCanvasLayout(
  filteredVisibleIds: Set<string>,
  {
    nodesRef,
    edgesRef,
    setNodes,
    fitView,
  }: {
    nodesRef: MutableRefObject<OrgFlowNode[]>;
    edgesRef: MutableRefObject<OrgFlowEdge[]>;
    setNodes: (fn: (ns: OrgFlowNode[]) => OrgFlowNode[]) => void;
    fitView: (opts?: {
      duration?: number;
      padding?: number;
      maxZoom?: number;
    }) => void;
  },
) {
  const isFirstLayoutRef = useRef(true);
  const layoutPositionedRef = useRef<Set<string>>(new Set());

  const visibleLayoutKey = useMemo(
    () => [...filteredVisibleIds].sort().join(","),
    [filteredVisibleIds],
  );

  useEffect(() => {
    const currentNodes = nodesRef.current;
    if (currentNodes.length === 0) return;
    const currentEdges = edgesRef.current;
    const visibleNodeList = currentNodes.filter((n) =>
      filteredVisibleIds.has(n.id),
    );
    if (visibleNodeList.length === 0) return;

    const posMap: Record<string, { x: number; y: number }> = {};

    if (isFirstLayoutRef.current) {
      const visEdges = currentEdges.filter(
        (e) =>
          filteredVisibleIds.has(e.source) && filteredVisibleIds.has(e.target),
      );
      const arranged = autoArrangeNodes(visibleNodeList, visEdges, "expanded");
      for (const n of arranged) posMap[n.id] = n.position;
      isFirstLayoutRef.current = false;
      for (const id of Object.keys(posMap)) layoutPositionedRef.current.add(id);
      setNodes((ns) =>
        ns.map((n) => (posMap[n.id] ? { ...n, position: posMap[n.id] } : n)),
      );
      setTimeout(
        () => fitView({ duration: 400, padding: 0.15, maxZoom: 0.75 }),
        50,
      );
      return;
    }

    const alreadyPositioned = layoutPositionedRef.current;
    const existingPositions: Record<string, { x: number; y: number }> = {};
    const unpositioned: OrgFlowNode[] = [];

    for (const n of visibleNodeList) {
      if (alreadyPositioned.has(n.id)) {
        existingPositions[n.id] = n.position;
      } else {
        unpositioned.push(n);
      }
    }

    Object.assign(posMap, existingPositions);

    if (unpositioned.length > 0) {
      const NODE_W = 300;
      const H_GAP = 80;
      const NODE_H = 160;
      const V_GAP = 160;

      const byParent = new Map<string, OrgFlowNode[]>();
      for (const n of unpositioned) {
        const parentEdge = currentEdges.find((e) => e.target === n.id);
        const parentId = parentEdge?.source ?? "__root__";
        if (!byParent.has(parentId)) byParent.set(parentId, []);
        byParent.get(parentId)!.push(n);
      }

      for (const [parentId, nodeChildren] of byParent) {
        const parentPos = posMap[parentId];
        if (!parentPos) continue;
        const totalWidth =
          nodeChildren.length * NODE_W + (nodeChildren.length - 1) * H_GAP;
        let startX = parentPos.x - totalWidth / 2 + NODE_W / 2;
        for (const child of nodeChildren) {
          posMap[child.id] = {
            x: startX,
            y: parentPos.y + NODE_H + V_GAP,
          };
          startX += NODE_W + H_GAP;
        }
      }
    }

    if (Object.keys(posMap).length > 0) {
      for (const id of Object.keys(posMap)) layoutPositionedRef.current.add(id);
      setNodes((ns) =>
        ns.map((n) => (posMap[n.id] ? { ...n, position: posMap[n.id] } : n)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleLayoutKey]);
}

// ─── Node actions hook ────────────────────────────────────────────────────────

interface NodeActionsParams {
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
  setNodes: Dispatch<SetStateAction<OrgFlowNode[]>>;
  setEdges: Dispatch<SetStateAction<OrgFlowEdge[]>>;
  graphMaps: {
    childrenOf: Record<string, string[]>;
    nodeTypeMap: Map<string, string | undefined>;
    nodesMap: Map<string, OrgFlowNode>;
  };
  filteredVisibleIds: Set<string>;
  nodeModal: NodeModalConfig;
  addOrgMutation: ReturnType<typeof useAddOrganizationNode>;
  updateOrgMutation: ReturnType<typeof useUpdateOrganizationNode>;
  addPersonMutation: ReturnType<typeof useAddPersonNode>;
  addPositionMutation: ReturnType<typeof useAddPosition>;
  addSiteMutation: ReturnType<typeof useAddSite>;
  addDelegationMutation: ReturnType<typeof useAddDelegation>;
  createUnitMutation: ReturnType<typeof useCreateUnit>;
  pushHistory: (nodes: OrgFlowNode[], edges: OrgFlowEdge[]) => void;
  markDirty: () => void;
  storeExpandNode: (id: string) => void;
  closeDrawer: () => void;
  fitView: (opts?: { duration?: number; padding?: number }) => void;
}

export function useNodeActions({
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
}: NodeActionsParams) {
  const [impactPreview, setImpactPreview] = useState<{
    nodeId: string;
    nodeName: string;
    nodeType: string;
    affectedPeople: number;
    affectedDepts: number;
  } | null>(null);

  const DEFAULT_EDGE_OPTIONS = {
    type: "smoothstep",
    style: { strokeWidth: 2, stroke: "#94a3b8" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
    animated: false,
  };

  const addCanvasNode = useCallback(
    (newNode: OrgFlowNode, parentId?: string, relType = "contains") => {
      setNodes((ns) => {
        const updated = [...ns, newNode];
        pushHistory(updated, edges);
        return updated;
      });
      if (parentId) {
        const newEdge: OrgFlowEdge = {
          id: `e-${parentId}-${newNode.id}-${Date.now()}`,
          source: parentId,
          target: newNode.id,
          ...DEFAULT_EDGE_OPTIONS,
          data: { relationshipType: relType },
        };
        setEdges((es) => [...es, newEdge]);
        storeExpandNode(parentId);
      }
      markDirty();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setNodes, setEdges, edges, pushHistory, markDirty, storeExpandNode],
  );

  const handleSubmitOrg = useCallback(
    (values: Organization) => {
      const parentId = nodeModal.pendingParentId;
      if (nodeModal.mode === "add") {
        addOrgMutation.mutate(values, {
          onSuccess: (org) => {
            const { node } = orgToFlowNode(org, parentId);
            addCanvasNode(node as unknown as OrgFlowNode, parentId);
          },
        });
      } else if (nodeModal.editingNodeId) {
        updateOrgMutation.mutate(
          { id: nodeModal.editingNodeId, values },
          {
            onSuccess: (org) => {
              const data = orgToFlowNode(org).node.data;
              setNodes((ns) =>
                ns.map((n) =>
                  n.id === nodeModal.editingNodeId ? { ...n, data } : n,
                ),
              );
              markDirty();
            },
          },
        );
      }
    },
    [
      nodeModal,
      addOrgMutation,
      updateOrgMutation,
      addCanvasNode,
      setNodes,
      markDirty,
    ],
  );

  const handleSubmitDepartment = useCallback(
    (values: UnitsFormValues) => {
      const parentId = nodeModal.pendingParentId;
      createUnitMutation.mutate(
        {
          name: values.name,
          code: values.code,
          unitType: values.unit_type,
          parentUnit: parentId,
        },
        {
          onSuccess: (result) => {
            const data: DepartmentData = {
              nodeType: "department",
              name: values.name,
              deptType:
                (values.unit_type as DepartmentData["deptType"]) ??
                "department",
              description: values.description,
              status: values.status === "active" ? "active" : "inactive",
            };
            const newNode: OrgFlowNode = {
              id: result.id,
              type: "department",
              position: { x: 0, y: 0 },
              data,
            };
            addCanvasNode(newNode, parentId);
          },
        },
      );
    },
    [nodeModal.pendingParentId, createUnitMutation, addCanvasNode],
  );

  const handleSubmitPerson = useCallback(
    (values: PeopleFormValues) => {
      const parentId = nodeModal.pendingParentId;
      addPersonMutation.mutate(values, {
        onSuccess: (person) => {
          const { node } = personToFlowNode(person, parentId);
          addCanvasNode(node as unknown as OrgFlowNode, parentId, "member_of");
        },
      });
    },
    [nodeModal.pendingParentId, addPersonMutation, addCanvasNode],
  );

  const handleSubmitPosition = useCallback(
    (values: PositionsFormValues) => {
      const unitId = nodeModal.contextNodeId ?? "";
      addPositionMutation.mutate(
        { unitId, values: values as Partial<Position> },
        {
          onSuccess: () => {
            notifications.show({
              title: "Position created",
              message: `"${values.title}" has been added.`,
              color: "teal",
            });
          },
        },
      );
    },
    [nodeModal.contextNodeId, addPositionMutation],
  );

  const handleSubmitSite = useCallback(
    (values: Partial<Site>) => {
      addSiteMutation.mutate(values as CreateSitePayload, {
        onSuccess: (site) => {
          notifications.show({
            title: "Site added",
            message: `"${site.name}" has been created.`,
            color: "teal",
          });
        },
      });
    },
    [addSiteMutation],
  );

  const handleSubmitDelegation = useCallback(
    (values: Delegation) => {
      addDelegationMutation.mutate(
        {
          from_assignment_id: values.from_assignment,
          to_assignment_id: values.to_assignment,
          delegation_type: values.delegation_type,
          starts_at: values.starts_at,
          ends_at: values.ends_at ?? null,
          reason: values.reason,
          scope_unit: values.scope_unit ?? null,
        },
        {
          onSuccess: () => {
            notifications.show({
              title: "Delegation created",
              message: "Delegation has been recorded.",
              color: "teal",
            });
          },
        },
      );
    },
    [addDelegationMutation],
  );

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
  }, [impactPreview, setNodes, setEdges, edges, pushHistory, closeDrawer, markDirty]);

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
    [nodes, edges, filteredVisibleIds, setNodes, pushHistory, fitView, markDirty],
  );

  return {
    addCanvasNode,
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
  };
}

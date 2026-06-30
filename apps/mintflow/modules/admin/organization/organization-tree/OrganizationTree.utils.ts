import { MarkerType } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import type {
  NodeHealthIssue,
  DescendantStats,
  PersonRole,
  OrgOfficeData,
  DepartmentData,
  PersonData,
  OrgNodeData,
} from "./OrganizationTree.types";
import type { Organization } from "../organizations/organizations.types";
import type { Person } from "../people/people.types";

type OrgFlowNode = Node<OrgNodeData, string>;
type OrgFlowEdge = Edge & { data?: { relationshipType?: string } };

type MinNode = { id: string; type?: string; data?: Record<string, unknown> };
type MinEdge = { source: string; target: string };

export const STATUS_COLORS: Record<string, string> = {
  active: "teal",
  inactive: "gray",
  archived: "red",
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Given a set of matched IDs, collect all ancestors from a pre-built parent map.
export function collectAncestors(
  matchedIds: Iterable<string>,
  parentMap: Record<string, string>,
): Set<string> {
  const ancestors = new Set<string>();
  const visited = new Set<string>();
  for (const id of matchedIds) {
    let current = parentMap[id];
    while (current && !visited.has(current)) {
      visited.add(current);
      ancestors.add(current);
      current = parentMap[current];
    }
  }
  return ancestors;
}

export function computeChildrenMap(edges: MinEdge[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const edge of edges) {
    if (!map[edge.source]) map[edge.source] = [];
    map[edge.source].push(edge.target);
  }
  return map;
}

export function computeParentMap(edges: MinEdge[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const edge of edges) {
    map[edge.target] = edge.source;
  }
  return map;
}

export function computeRootIds(nodes: MinNode[], edges: MinEdge[]): string[] {
  const hasParent = new Set(edges.map((e) => e.target));
  return nodes
    .filter((n) => n.type !== "person" && !hasParent.has(n.id))
    .map((n) => n.id);
}

// Updated: person nodes are now part of the BFS traversal when their parent is expanded.
// This enables person chains (Secretary → Joint Secretary → Under Secretary → ...).
export function computeVisibleNodeIds(
  nodes: MinNode[],
  edges: MinEdge[],
  expandedIds: string[],
  viewMode: "explorer" | "fullmap",
): string[] {
  const allIds = new Set(nodes.map((n) => n.id));

  if (viewMode === "fullmap") return [...allIds];

  // Build children map across ALL node types (including persons)
  const childrenOf: Record<string, string[]> = {};
  const hasParent = new Set<string>();
  for (const edge of edges) {
    if (!allIds.has(edge.target)) continue;
    if (!childrenOf[edge.source]) childrenOf[edge.source] = [];
    childrenOf[edge.source].push(edge.target);
    hasParent.add(edge.target);
  }

  // Roots = anything with no parent edge (non-person and non-group, unless orphaned)
  const nodeTypeMap = new Map(nodes.map((n) => [n.id, n.type]));
  const roots = [...allIds].filter((id) => {
    const type = nodeTypeMap.get(id);
    return !hasParent.has(id) && type !== "person";
  });

  const expandedSet = new Set(expandedIds);
  const visible = new Set<string>(roots);
  const queue = roots.filter((id) => expandedSet.has(id));
  const visited = new Set<string>(roots);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const child of childrenOf[current] ?? []) {
      if (!visited.has(child)) {
        visited.add(child);
        visible.add(child);
        if (expandedSet.has(child)) queue.push(child);
      }
    }
  }

  return [...visible];
}

export function computeDirectChildCounts(
  nodeId: string,
  nodes: MinNode[],
  edges: MinEdge[],
  childrenOf?: Record<string, string[]>,
  nodeTypeMap?: Map<string, string | undefined>,
): { deptCount: number; personCount: number } {
  const typeMap = nodeTypeMap ?? new Map(nodes.map((n) => [n.id, n.type]));
  const kids = childrenOf
    ? (childrenOf[nodeId] ?? [])
    : edges.filter((e) => e.source === nodeId).map((e) => e.target);
  let deptCount = 0;
  let personCount = 0;
  for (const childId of kids) {
    const type = typeMap.get(childId);
    if (type === "person") personCount++;
    else if (type) deptCount++;
  }
  return { deptCount, personCount };
}

export function computePathFromRoot(
  nodeId: string,
  edges: MinEdge[],
  parentMap?: Record<string, string>,
): string[] {
  const pMap = parentMap ?? computeParentMap(edges);
  const path: string[] = [];
  let current: string | undefined = nodeId;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    path.unshift(current);
    current = pMap[current];
  }
  return path;
}

export function computeSubtreeIds(
  nodeId: string,
  edges: MinEdge[],
  childrenOf?: Record<string, string[]>,
): string[] {
  const kids = childrenOf ?? computeChildrenMap(edges);
  const result = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (result.has(current)) continue;
    result.add(current);
    for (const child of kids[current] ?? []) queue.push(child);
  }
  return [...result];
}

export function computeDimmedNodeIds(
  focusedBranchId: string | null,
  visibleNodeIds: string[],
  edges: MinEdge[],
  childrenOf?: Record<string, string[]>,
  parentMap?: Record<string, string>,
): string[] {
  if (!focusedBranchId) return [];
  const pathIds = new Set(
    computePathFromRoot(focusedBranchId, edges, parentMap),
  );
  const subtreeIds = new Set(
    computeSubtreeIds(focusedBranchId, edges, childrenOf),
  );
  const keepIds = new Set([...pathIds, ...subtreeIds]);
  return visibleNodeIds.filter((id) => !keepIds.has(id));
}

export function expandAncestors(
  nodeId: string,
  edges: MinEdge[],
  currentExpandedIds: string[],
): string[] {
  const parentMap = computeParentMap(edges);
  const result = new Set(currentExpandedIds);
  let current: string | undefined = parentMap[nodeId];
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    result.add(current);
    current = parentMap[current];
  }
  return [...result];
}

// Traverse all descendants (all edge types), computing total counts and max depth.
// Pass pre-built maps to avoid redundant construction when called in a loop.
export function computeDescendantStats(
  nodeId: string,
  nodes: MinNode[],
  edges: MinEdge[],
  childrenOf?: Record<string, string[]>,
  nodeTypeMap?: Map<string, string | undefined>,
): DescendantStats {
  const typeMap = nodeTypeMap ?? new Map(nodes.map((n) => [n.id, n.type]));
  const kids = childrenOf ?? computeChildrenMap(edges);

  let totalPeople = 0;
  let totalDepts = 0;
  let maxDepth = 0;

  const queue: Array<{ id: string; depth: number }> = [
    { id: nodeId, depth: 0 },
  ];
  const visited = new Set<string>([nodeId]);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (depth > maxDepth) maxDepth = depth;

    for (const child of kids[id] ?? []) {
      if (visited.has(child)) continue;
      visited.add(child);
      const type = typeMap.get(child);
      if (type === "person") totalPeople++;
      else if (type === "department" || type === "org" || type === "group")
        totalDepts++;
      queue.push({ id: child, depth: depth + 1 });
    }
  }

  return {
    totalPeople,
    totalDepts,
    hiddenLevels: Math.max(0, maxDepth - 1),
  };
}

// Computes structure health issues for a given node.
// Pass pre-built maps and pre-computed stats to avoid redundant construction when called in a loop.
export function computeNodeHealth(
  nodeId: string,
  nodes: MinNode[],
  edges: MinEdge[],
  childrenOf?: Record<string, string[]>,
  nodeTypeMap?: Map<string, string | undefined>,
  nodeDataMap?: Map<string, Record<string, unknown>>,
  descendantStats?: DescendantStats,
): NodeHealthIssue[] {
  const typeMap = nodeTypeMap ?? new Map(nodes.map((n) => [n.id, n.type]));
  const dataMap =
    nodeDataMap ?? new Map(nodes.map((n) => [n.id, n.data ?? {}]));
  const issues: NodeHealthIssue[] = [];
  const type = typeMap.get(nodeId);

  const kids = childrenOf ?? computeChildrenMap(edges);
  const hasParentEdge = edges.some((e) => e.target === nodeId);
  const children = kids[nodeId] ?? [];

  if (type === "department" || type === "org") {
    const personChildren = children.filter(
      (cid) => typeMap.get(cid) === "person",
    );
    const hasHead = personChildren.some((pid) => {
      const pData = dataMap.get(pid) ?? {};
      const role = pData.role as PersonRole | undefined;
      return (
        role === "head" ||
        role === "manager" ||
        role === "minister" ||
        role === "secretary"
      );
    });
    if (!hasHead) issues.push("missing_head");

    const stats =
      descendantStats ??
      computeDescendantStats(nodeId, nodes, edges, kids, typeMap);
    if (stats.totalPeople === 0) issues.push("empty_dept");

    if (!hasParentEdge && type === "department") issues.push("no_parent");

    for (const pid of personChildren) {
      const pData = dataMap.get(pid) ?? {};
      const role = pData.role as PersonRole | undefined;
      if (
        (role === "head" ||
          role === "manager" ||
          role === "minister" ||
          role === "secretary") &&
        pData.status === "inactive"
      ) {
        issues.push("inactive_head");
        break;
      }
    }
  }

  if (type === "person") {
    const directPersonReports = children.filter(
      (cid) => typeMap.get(cid) === "person",
    );
    if (directPersonReports.length > 10) issues.push("too_many_reports");
  }

  // Deduplicate
  return [...new Set(issues)];
}

export function orgToFlowNode(
  org: Organization,
  parentId?: string,
): { node: OrgFlowNode; edge: OrgFlowEdge | null } {
  const data: OrgOfficeData = {
    nodeType: "org",
    name: org.name,
    orgType:
      (org.organization_type as OrgOfficeData["orgType"]) ?? "organization",
    description: org.description,
    status: org.status === "active" ? "active" : "inactive",
  };
  const node: OrgFlowNode = {
    id: org.id,
    type: "org",
    position: { x: 0, y: 0 },
    data,
  };
  const edge: OrgFlowEdge | null = parentId
    ? {
        id: `e-${parentId}-${org.id}`,
        source: parentId,
        target: org.id,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
        style: { strokeWidth: 2, stroke: "#94a3b8" },
        data: { relationshipType: "contains" },
      }
    : null;
  return { node, edge };
}

export function personToFlowNode(
  person: Person,
  parentId?: string,
): { node: OrgFlowNode; edge: OrgFlowEdge | null } {
  const data: PersonData = {
    nodeType: "person",
    fullName: person.user_display_name,
    designation: person.employee_code || "Member",
    email: person.user_email,
    status: person.membership_status === "active" ? "active" : "inactive",
  };
  const node: OrgFlowNode = {
    id: person.id,
    type: "person",
    position: { x: 0, y: 0 },
    data,
  };
  const edge: OrgFlowEdge | null = parentId
    ? {
        id: `e-${parentId}-${person.id}`,
        source: parentId,
        target: person.id,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
        style: { strokeWidth: 2, stroke: "#94a3b8" },
        data: { relationshipType: "member_of" },
      }
    : null;
  return { node, edge };
}

// ─── Pure helpers used by the main component and hooks ───────────────────────

export const DEFAULT_EDGE_OPTIONS = {
  type: "smoothstep",
  style: { strokeWidth: 2, stroke: "#94a3b8" },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
  animated: false,
} as const;

export function getEdgeStyleForRelationship(
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

const NODE_TYPE_LABELS: Record<string, string> = {
  org: "Organization",
  department: "Department",
  person: "Person",
};

export function getNodeDisplayLabel(type: string, data: OrgNodeData): string {
  switch (type) {
    case "person": {
      const person = data as PersonData;
      const designation = person.designation?.trim();
      return designation
        ? `${person.fullName} (${designation})`
        : person.fullName;
    }
    case "department":
      return (data as DepartmentData).name;
    case "org":
      return (data as OrgOfficeData).name;
    default:
      return "Unknown node";
  }
}

export function getNodeSearchOptionLabel(
  type: string,
  data: OrgNodeData,
): string {
  const typeLabel = NODE_TYPE_LABELS[type] ?? type;
  return `${typeLabel} · ${getNodeDisplayLabel(type, data)}`;
}

export function nodeMatchesSearch(
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

export function autoArrangeNodes(
  nodes: OrgFlowNode[],
  edges: OrgFlowEdge[],
  layoutMode: "compact" | "expanded" = "expanded",
): OrgFlowNode[] {
  if (nodes.length === 0) return nodes;

  const NODE_W = 300;
  const NODE_H = 160;
  const BASE_H_GAP = layoutMode === "compact" ? 40 : 80;
  const BASE_V_GAP = layoutMode === "compact" ? 100 : 160;

  function hGapForCount(count: number): number {
    if (count <= 2) return BASE_H_GAP;
    if (count <= 4) return BASE_H_GAP * 1.25;
    if (count <= 8) return BASE_H_GAP * 1.6;
    return BASE_H_GAP * 2;
  }

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

  function layout(id: string, x: number, y: number) {
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
      layout(kid, cx + kw / 2, y + NODE_H + vGap);
      cx += kw + hGap;
    }
  }

  let rootX = 0;
  for (const root of roots) {
    const rw = subtreeWidth(root, roots.length);
    layout(root, rootX + rw / 2, 0);
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

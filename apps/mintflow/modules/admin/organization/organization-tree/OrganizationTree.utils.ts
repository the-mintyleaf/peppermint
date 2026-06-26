import type {
  NodeHealthIssue,
  DescendantStats,
  PersonRole,
} from "./OrganizationTree.types";

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

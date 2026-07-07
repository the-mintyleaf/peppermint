import { MarkerType } from "@xyflow/react";

import type {
  Organization,
  UnitParentPatch,
  UnitTreeNodeFlat,
} from "../_shared/organization.types";
import type {
  OrgRootNodeData,
  StructureFlowEdge,
  StructureFlowNode,
  UnitNodeData,
} from "./Structure.types";

type MinEdge = { source: string; target: string };

export const DEFAULT_EDGE_OPTIONS = {
  type: "smoothstep",
  style: { strokeWidth: 2, stroke: "#94a3b8" },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
  animated: false,
} as const;

/**
 * Builds ReactFlow nodes/edges from the org root + a flat list of loaded units
 * (positions unset). Each unit edges up to `parent_id ?? organization.id`, so
 * top-level units hang off the org node. Only units already in `flatNodes` are
 * emitted — the list grows as branches are lazily expanded.
 */
export function buildGraphFromFlatNodes(
  organization: Organization,
  flatNodes: UnitTreeNodeFlat[],
): { nodes: StructureFlowNode[]; edges: StructureFlowEdge[] } {
  // Org-wide total: each top-level unit (parent_id === null) contributes itself
  // plus its subtree. `descendant_count` is the number of descendants (excludes
  // self), so `1 + descendant_count` is the whole top-level subtree. Only shown
  // when EVERY root supplies it — a partial set would render a misleading
  // undercount, so we hide the summary until the backend provides it on all roots.
  const rootNodes = flatNodes.filter((unit) => unit.parent_id === null);
  const descendantCount =
    rootNodes.length > 0 &&
    rootNodes.every((unit) => unit.descendant_count !== undefined)
      ? rootNodes.reduce(
          (sum, unit) => sum + 1 + (unit.descendant_count ?? 0),
          0,
        )
      : undefined;

  const nodes: StructureFlowNode[] = [
    {
      id: organization.id,
      type: "org",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "org",
        name_np: organization.name_np,
        name_en: organization.name_en,
        code: organization.code,
        organizationType: organization.organization_type,
        status: organization.status,
        descendantCount,
      } satisfies OrgRootNodeData,
    },
  ];
  const edges: StructureFlowEdge[] = [];

  for (const unit of flatNodes) {
    const parentId = unit.parent_id ?? organization.id;
    nodes.push({
      id: unit.id,
      type: "unit",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "unit",
        name_np: unit.name_np,
        name_en: unit.name_en,
        code: unit.code,
        unitType: unit.unit_type,
        status: unit.status,
        hasChildren: unit.has_children,
        childCount: unit.child_count ?? 0,
        memberCount: unit.member_count ?? 0,
        positionCount: unit.position_count ?? 0,
        positions: unit.positions,
        unitMembers: unit.unit_members,
      } satisfies UnitNodeData,
    });
    edges.push({
      id: `e-${parentId}-${unit.id}`,
      source: parentId,
      target: unit.id,
      ...DEFAULT_EDGE_OPTIONS,
    });
  }

  return { nodes, edges };
}

/**
 * Patch a single node's scalar fields in a cached `unit-tree-nodes` list, in place,
 * only if it is already present (never adds — placement of a new/moved node is left
 * to a scoped refetch). Preserves the already-loaded `positions` / `unit_members`
 * dimensions, which the bare mutation node doesn't carry.
 */
export function patchNodeFieldsInList(
  list: UnitTreeNodeFlat[] | undefined,
  node: UnitTreeNodeFlat,
): UnitTreeNodeFlat[] | undefined {
  if (!list) return list;
  const idx = list.findIndex((n) => n.id === node.id);
  if (idx === -1) return list;
  const next = [...list];
  next[idx] = {
    ...node,
    positions: node.positions ?? list[idx].positions,
    unit_members: node.unit_members ?? list[idx].unit_members,
    // Optional aggregate the bare mutation node may omit — keep the loaded value
    // so a rename doesn't drop the org-wide total (which needs it on every root).
    descendant_count: node.descendant_count ?? list[idx].descendant_count,
  };
  return next;
}

/** Patch `has_children`/`child_count` for any parent present in a cached list. */
export function patchParentsInList(
  list: UnitTreeNodeFlat[] | undefined,
  parents: UnitParentPatch[],
): UnitTreeNodeFlat[] | undefined {
  if (!list || parents.length === 0) return list;
  let changed = false;
  const next = list.map((n) => {
    const patch = parents.find((p) => p.id === n.id);
    if (!patch) return n;
    changed = true;
    return {
      ...n,
      has_children: patch.has_children,
      child_count: patch.child_count,
    };
  });
  return changed ? next : list;
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
  for (const edge of edges) map[edge.target] = edge.source;
  return map;
}

/** Root of the tree is always the single organization node — never has a parent edge. */
export function computeVisibleNodeIds(
  rootId: string,
  edges: MinEdge[],
  expandedIds: string[],
): string[] {
  const childrenOf = computeChildrenMap(edges);
  const expandedSet = new Set(expandedIds);
  const visible = new Set<string>([rootId]);
  const queue = expandedSet.has(rootId) ? [rootId] : [];
  const visited = new Set<string>([rootId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const child of childrenOf[current] ?? []) {
      if (visited.has(child)) continue;
      visited.add(child);
      visible.add(child);
      if (expandedSet.has(child)) queue.push(child);
    }
  }

  return [...visible];
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

export function computeDimmedNodeIds(
  focusedBranchId: string | null,
  visibleNodeIds: string[],
  edges: MinEdge[],
): string[] {
  if (!focusedBranchId) return [];
  const pathIds = new Set(computePathFromRoot(focusedBranchId, edges));
  const subtreeIds = new Set(computeSubtreeIds(focusedBranchId, edges));
  const keepIds = new Set([...pathIds, ...subtreeIds]);
  return visibleNodeIds.filter((id) => !keepIds.has(id));
}

/**
 * Simple top-down tree layout — mirrors the structure builder reference's layout algorithm.
 * `heights` supplies each node's measured height (from ReactFlow) so nodes made taller by
 * an inline member list push their children down without overlapping. Falls back to a
 * default height for nodes not yet measured.
 */
export function autoArrangeNodes(
  nodes: StructureFlowNode[],
  edges: StructureFlowEdge[],
  heights: Record<string, number> = {},
): StructureFlowNode[] {
  if (nodes.length === 0) return nodes;

  const NODE_W = 260;
  const NODE_H = 120;
  const H_GAP = 60;
  const V_GAP = 80;

  const heightOf = (id: string) => heights[id] ?? NODE_H;

  const children = computeChildrenMap(edges);
  const hasParent = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id);

  const positions: Record<string, { x: number; y: number }> = {};
  const visited = new Set<string>();

  function subtreeWidth(id: string): number {
    const kids = children[id] ?? [];
    if (kids.length === 0) return NODE_W;
    const childWidths = kids.map(subtreeWidth);
    return Math.max(
      NODE_W,
      childWidths.reduce((acc, w) => acc + w + H_GAP, -H_GAP),
    );
  }

  function layout(id: string, x: number, y: number) {
    if (visited.has(id)) return;
    visited.add(id);
    positions[id] = { x, y };
    const kids = children[id] ?? [];
    if (kids.length === 0) return;
    const totalWidth = kids
      .map(subtreeWidth)
      .reduce((acc, w) => acc + w + H_GAP, -H_GAP);
    let cx = x - totalWidth / 2;
    const childY = y + heightOf(id) + V_GAP;
    for (const kid of kids) {
      const kw = subtreeWidth(kid);
      layout(kid, cx + kw / 2, childY);
      cx += kw + H_GAP;
    }
  }

  let rootX = 0;
  for (const root of roots) {
    const rw = subtreeWidth(root);
    layout(root, rootX + rw / 2, 0);
    rootX += rw + H_GAP * 2;
  }

  return nodes.map((n) => ({ ...n, position: positions[n.id] ?? n.position }));
}

import { MarkerType } from "@xyflow/react";

import type { Organization, UnitTreeNode } from "../_shared/organization.types";
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

/** Flattens the org root + nested unit tree into ReactFlow nodes/edges, positions unset. */
export function buildGraphFromTree(
  organization: Organization,
  tree: UnitTreeNode[],
): { nodes: StructureFlowNode[]; edges: StructureFlowEdge[] } {
  const nodes: StructureFlowNode[] = [
    {
      id: organization.id,
      type: "org",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "org",
        name: organization.name,
        code: organization.code,
        organizationType: organization.organization_type,
        status: organization.status,
      } satisfies OrgRootNodeData,
    },
  ];
  const edges: StructureFlowEdge[] = [];

  function walk(unit: UnitTreeNode, parentId: string) {
    nodes.push({
      id: unit.id,
      type: "unit",
      position: { x: 0, y: 0 },
      data: {
        nodeType: "unit",
        name: unit.name,
        code: unit.code,
        unitType: unit.unit_type,
        status: unit.status,
        hasChildren: unit.children.length > 0,
      } satisfies UnitNodeData,
    });
    edges.push({
      id: `e-${parentId}-${unit.id}`,
      source: parentId,
      target: unit.id,
      ...DEFAULT_EDGE_OPTIONS,
    });
    for (const child of unit.children) walk(child, unit.id);
  }

  for (const root of tree) walk(root, organization.id);

  return { nodes, edges };
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

export function getNodeSearchOptionLabel(node: StructureFlowNode): string {
  if (node.data.nodeType === "org") {
    return `Organization · ${node.data.name}`;
  }
  return `Unit · ${node.data.name} (${node.data.code})`;
}

export function nodeMatchesSearch(
  node: StructureFlowNode,
  query: string,
): string | null {
  const q = query.toLowerCase();
  const label =
    node.data.nodeType === "org"
      ? node.data.name
      : `${node.data.name} ${node.data.code}`;
  return label.toLowerCase().includes(q) ? node.id : null;
}

/** Simple top-down tree layout — mirrors the structure builder reference's layout algorithm. */
export function autoArrangeNodes(
  nodes: StructureFlowNode[],
  edges: StructureFlowEdge[],
): StructureFlowNode[] {
  if (nodes.length === 0) return nodes;

  const NODE_W = 260;
  const NODE_H = 120;
  const H_GAP = 60;
  const V_GAP = 120;

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
    for (const kid of kids) {
      const kw = subtreeWidth(kid);
      layout(kid, cx + kw / 2, y + NODE_H + V_GAP);
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

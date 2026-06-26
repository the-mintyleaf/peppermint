import type { OrgFlowNode, OrgFlowEdge } from "../../OrganizationTree.store";

export function computeDirectChildren(
  nodeId: string,
  nodes: OrgFlowNode[],
  edges: OrgFlowEdge[],
): OrgFlowNode[] {
  const childIds = new Set(
    edges.filter((e) => e.source === nodeId).map((e) => e.target),
  );
  return nodes.filter((n) => childIds.has(n.id));
}

export function computeAllDescendants(
  nodeId: string,
  nodes: OrgFlowNode[],
  edges: OrgFlowEdge[],
): OrgFlowNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const childrenMap = new Map<string, string[]>();
  for (const e of edges) {
    if (!childrenMap.has(e.source)) childrenMap.set(e.source, []);
    childrenMap.get(e.source)!.push(e.target);
  }

  const result: OrgFlowNode[] = [];
  const visited = new Set<string>();

  function collect(id: string) {
    const children = childrenMap.get(id) ?? [];
    for (const childId of children) {
      if (visited.has(childId)) continue;
      visited.add(childId);
      const node = nodeMap.get(childId);
      if (node) {
        result.push(node);
        collect(childId);
      }
    }
  }

  collect(nodeId);
  return result;
}

export function groupChildrenByType(
  children: OrgFlowNode[],
): Record<string, OrgFlowNode[]> {
  const groups: Record<string, OrgFlowNode[]> = {};
  for (const node of children) {
    const type = node.type ?? "unknown";
    if (!groups[type]) groups[type] = [];
    groups[type].push(node);
  }
  return groups;
}

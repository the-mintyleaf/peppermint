export const orgTreeQueryKeys = {
  graph: (orgId: string) =>
    ["org-structure", "builder", "graph", orgId] as const,
};

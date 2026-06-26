export const positionsQueryKeys = {
  list: (orgId: string) => ["org-structure", "positions", orgId] as const,
};

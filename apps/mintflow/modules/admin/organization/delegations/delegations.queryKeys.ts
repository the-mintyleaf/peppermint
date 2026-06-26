export const delegationsQueryKeys = {
  list: (orgId: string) => ["org-structure", "delegations", orgId] as const,
};

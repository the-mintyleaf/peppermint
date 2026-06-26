export const sitesQueryKeys = {
  list: (orgId: string) => ["org-structure", "sites", orgId] as const,
};

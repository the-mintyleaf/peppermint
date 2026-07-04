export const delegationsQueryKeys = {
  list: (organizationId: string) => `delegations.list.${organizationId}`,
  listKey: (organizationId: string) =>
    ["delegations", "list", organizationId] as const,
};

export const membersQueryKeys = {
  list: (organizationId: string) => `memberships.list.${organizationId}`,
  listKey: (organizationId: string) =>
    ["memberships", "list", organizationId] as const,
  detail: (membershipId: string) => ["memberships", membershipId] as const,
  userSummary: (userId: string) => ["users", userId, "summary"] as const,
  unitMemberships: (membershipId: string) =>
    ["memberships", membershipId, "unit-memberships"] as const,
  positionAssignments: (membershipId: string) =>
    ["memberships", membershipId, "position-assignments"] as const,
};

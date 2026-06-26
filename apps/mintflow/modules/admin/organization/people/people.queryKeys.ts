export const peopleQueryKeys = {
  list: (orgId: string) => ["org-structure", "people", orgId, "list"] as const,
  detail: (membershipId: string) =>
    ["org-structure", "people", "detail", membershipId] as const,
  unitMemberships: (membershipId: string) =>
    ["org-structure", "people", membershipId, "unit-memberships"] as const,
  positionAssignments: (membershipId: string) =>
    ["org-structure", "people", membershipId, "position-assignments"] as const,
};

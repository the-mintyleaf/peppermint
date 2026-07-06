export const organizationQueryKeys = {
  list: () => "organizations.list",
  listKey: () => ["organizations", "list"] as const,
  detail: (orgId: string) => ["organizations", orgId] as const,
  unitRoots: (orgId: string) => ["organizations", orgId, "unit-roots"] as const,
  unitChildren: (orgId: string, unitId: string) =>
    ["organizations", orgId, "unit-children", unitId] as const,
  unitsFlat: (orgId: string) => ["organizations", orgId, "units-flat"] as const,
  unitDetail: (unitId: string) => ["units", unitId] as const,
  unitAncestors: (unitId: string) => ["units", unitId, "ancestors"] as const,
  unitDescendants: (unitId: string) =>
    ["units", unitId, "descendants"] as const,

  positionsList: (unitId: string) => ["units", unitId, "positions"] as const,
  positionDetail: (positionId: string) => ["positions", positionId] as const,
  positionHolders: (positionId: string) =>
    ["positions", positionId, "holders"] as const,
  chainOfCommand: (positionId: string, reportingLineType: string) =>
    ["positions", positionId, "chain-of-command", reportingLineType] as const,
  subordinates: (positionId: string) =>
    ["positions", positionId, "subordinates"] as const,

  membershipsList: (orgId: string) =>
    ["organizations", orgId, "memberships"] as const,
  membershipDetail: (membershipId: string) =>
    ["memberships", membershipId] as const,
  unitMembershipsList: (membershipId: string) =>
    ["memberships", membershipId, "unit-memberships"] as const,
  positionAssignmentsList: (membershipId: string) =>
    ["memberships", membershipId, "position-assignments"] as const,

  reportingLinesList: (orgId: string) =>
    ["organizations", orgId, "reporting-lines"] as const,
  delegationsList: (orgId: string) =>
    ["organizations", orgId, "delegations"] as const,
  eventLogList: (orgId: string) => ["organizations", orgId, "events"] as const,

  actorContext: (userId: string, orgId?: string, atTime?: string) =>
    ["actor-context", userId, orgId ?? "any", atTime ?? "now"] as const,
};

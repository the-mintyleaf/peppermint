export const reportingLinesQueryKeys = {
  list: (organizationId: string) => `reporting-lines.list.${organizationId}`,
  listKey: (organizationId: string) =>
    ["reporting-lines", "list", organizationId] as const,
  chainOfCommand: (positionId: string, type: string) =>
    ["positions", positionId, "chain-of-command", type] as const,
  subordinates: (positionId: string) =>
    ["positions", positionId, "subordinates"] as const,
};

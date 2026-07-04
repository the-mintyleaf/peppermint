export const positionsQueryKeys = {
  list: (unitId: string) => `positions.list.${unitId}`,
  listKey: (unitId: string) => ["positions", "list", unitId] as const,
  detail: (positionId: string) => ["positions", positionId] as const,
  holders: (positionId: string) =>
    ["positions", positionId, "holders"] as const,
};

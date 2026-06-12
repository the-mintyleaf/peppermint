export const runsKeys = {
  all: ["automation-runs"] as const,
  lists: () => [...runsKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...runsKeys.lists(), { filters }] as const,
  details: () => [...runsKeys.all, "detail"] as const,
  detail: (id: string) => [...runsKeys.details(), id] as const,
} as const;

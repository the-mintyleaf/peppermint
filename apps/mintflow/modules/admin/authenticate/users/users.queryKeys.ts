export const usersQueryKeys = {
  list: () => "users.list",
  /** Array form of `list()`, for invalidation calls (React Query prefix matching). */
  listKey: () => ["users", "list"] as const,
  sessions: (userId: string, page: number) =>
    ["users", userId, "sessions", page] as const,
  sessionsKey: (userId: string) => ["users", userId, "sessions"] as const,
  authEvents: (userId: string, page: number, eventType?: string) =>
    ["users", userId, "auth-events", page, eventType ?? "all"] as const,
  authEventsKey: (userId: string) => ["users", userId, "auth-events"] as const,
  serviceAccountCredentials: (userId: string, page: number) =>
    ["users", userId, "service-account-credentials", page] as const,
  serviceAccountCredentialsKey: (userId: string) =>
    ["users", userId, "service-account-credentials"] as const,
};

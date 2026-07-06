export const roleBindingQueryKeys = {
  list: () => "permissions.role-bindings.list",
  /** Array form of `list()`, for invalidation calls (React Query prefix matching). */
  listKey: () => ["permissions", "role-bindings", "list"] as const,
  bySubject: (subjectUserId: string) =>
    ["permissions", "role-bindings", "subject", subjectUserId] as const,
};

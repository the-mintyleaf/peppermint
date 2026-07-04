export const roleQueryKeys = {
  list: () => "permissions.roles.list",
  /** Array form of `list()`, for invalidation calls (React Query prefix matching). */
  listKey: () => ["permissions", "roles", "list"] as const,
  assignable: () => ["permissions", "roles", "assignable"] as const,
  permissions: (roleId: string) =>
    ["permissions", "roles", roleId, "permissions"] as const,
};

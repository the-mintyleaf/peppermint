export const policyTreeQueryKeys = {
  apps: () => ["policy", "apps"] as const,
  tree: (app?: string) =>
    ["policy", "permissions", "tree", app ?? "all"] as const,
};

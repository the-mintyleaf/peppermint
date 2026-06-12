export const settingsKeys = {
  all: ["settings"] as const,
  profile: () => [...settingsKeys.all, "profile"] as const,
  workspace: () => [...settingsKeys.all, "workspace"] as const,
  team: () => [...settingsKeys.all, "team"] as const,
  notifPrefs: () => [...settingsKeys.all, "notifPrefs"] as const,
  integrations: () => [...settingsKeys.all, "integrations"] as const,
  billing: () => [...settingsKeys.all, "billing"] as const,
};

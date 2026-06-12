import type { MediaFilters } from "./media.api";

export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (filters: MediaFilters) => [...mediaKeys.lists(), filters] as const,
  folders: () => [...mediaKeys.all, "folders"] as const,
};

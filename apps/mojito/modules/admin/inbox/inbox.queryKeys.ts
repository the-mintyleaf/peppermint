import type { InboxFilters } from "./inbox.api";

export const inboxKeys = {
  all: ["inbox"] as const,
  lists: () => [...inboxKeys.all, "list"] as const,
  list: (filters: InboxFilters) => [...inboxKeys.lists(), filters] as const,
  details: () => [...inboxKeys.all, "detail"] as const,
  detail: (id: string) => [...inboxKeys.details(), id] as const,
};

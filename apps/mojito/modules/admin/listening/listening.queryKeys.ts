import type { MentionFilters } from "./listening.api";

export const listeningKeys = {
  all: ["listening"] as const,
  mentions: (filters: MentionFilters = {}) =>
    [...listeningKeys.all, "mentions", filters] as const,
  keywords: () => [...listeningKeys.all, "keywords"] as const,
  competitors: () => [...listeningKeys.all, "competitors"] as const,
  sentiment: () => [...listeningKeys.all, "sentiment"] as const,
  alerts: () => [...listeningKeys.all, "alerts"] as const,
};

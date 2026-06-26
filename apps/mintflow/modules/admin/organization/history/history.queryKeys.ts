import type { HistoryFetchParams } from "./history.types";

export const historyQueryKeys = {
  list: (orgId: string, params: HistoryFetchParams) =>
    ["org-structure", "history", orgId, params] as const,
};

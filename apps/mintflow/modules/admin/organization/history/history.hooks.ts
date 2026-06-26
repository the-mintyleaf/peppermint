import { useQuery } from "@peppermint/ui";
import { fetchEvents } from "./history.api";
import { historyQueryKeys } from "./history.queryKeys";
import type { HistoryFetchParams } from "./history.types";

export function useHistory(orgId: string, params: HistoryFetchParams) {
  return useQuery({
    queryKey: historyQueryKeys.list(orgId, params),
    queryFn: () => fetchEvents(orgId, params),
    placeholderData: (prev) => prev,
  });
}

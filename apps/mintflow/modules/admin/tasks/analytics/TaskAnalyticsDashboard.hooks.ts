import { useQuery } from "@peppermint/ui";
import { fetchTaskAnalyticsDashboard } from "./taskAnalytics.api";
import { taskAnalyticsQueryKeys } from "./taskAnalytics.queryKeys";

export function useTaskAnalyticsDashboard(selectedMonth: string) {
  return useQuery({
    queryKey: taskAnalyticsQueryKeys.dashboard(selectedMonth),
    queryFn: () => fetchTaskAnalyticsDashboard(selectedMonth),
  });
}

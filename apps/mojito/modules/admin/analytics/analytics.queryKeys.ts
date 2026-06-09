import type { AnalyticsPeriod } from "./Analytics.types";

export const analyticsQueryKeys = {
  summary: (period: AnalyticsPeriod) => ["analytics", "summary", period] as const,
  automations: (period: AnalyticsPeriod) => ["analytics", "automations", period] as const,
  content: (period: AnalyticsPeriod) => ["analytics", "content", period] as const,
};

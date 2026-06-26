import type { AnalyticsPeriod } from "./Analytics.types";

export const analyticsQueryKeys = {
  summary: (period: AnalyticsPeriod) =>
    ["analytics", "summary", period] as const,
  automations: (period: AnalyticsPeriod) =>
    ["analytics", "automations", period] as const,
  content: (period: AnalyticsPeriod) =>
    ["analytics", "content", period] as const,
  overview: (period: string) => ["analytics", "overview", period] as const,
  channelPerformance: (period: string) =>
    ["analytics", "channel-performance", period] as const,
  audience: (period: string) => ["analytics", "audience", period] as const,
  sentimentAnalytics: (period: string) =>
    ["analytics", "sentiment-analytics", period] as const,
  benchmark: (period: string) => ["analytics", "benchmark", period] as const,
  roi: (period: string) => ["analytics", "roi", period] as const,
  reports: () => ["analytics", "reports"] as const,
};

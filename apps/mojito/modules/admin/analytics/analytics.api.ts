import type {
  AnalyticsPeriod,
  AnalyticsSummaryResponse,
  AnalyticsAutomationsResponse,
  AnalyticsContentResponse,
} from "./Analytics.types";

export async function fetchSummary(period: AnalyticsPeriod): Promise<AnalyticsSummaryResponse> {
  await new Promise((r) => setTimeout(r, 300));
  const multiplier = period === "7d" ? 1 : period === "30d" ? 4 : 12;
  return {
    summary: {
      contentGenerated: 48 * multiplier,
      contentGeneratedDelta: 12,
      activeAutomations: 6,
      totalRuns: 84 * multiplier,
      successRate: 91.2,
    },
  };
}

export async function fetchAutomationStats(
  period: AnalyticsPeriod
): Promise<AnalyticsAutomationsResponse> {
  await new Promise((r) => setTimeout(r, 300));
  const multiplier = period === "7d" ? 1 : period === "30d" ? 4 : 12;
  return {
    automations: [
      { id: "auto_1", name: "Weekly Instagram Post", runs: 4 * multiplier, successRate: 100, contentVolume: 16 * multiplier, avgDuration: 12 },
      { id: "auto_2", name: "LinkedIn Article", runs: 4 * multiplier, successRate: 75, contentVolume: 12 * multiplier, avgDuration: 28 },
      { id: "auto_3", name: "Twitter Daily", runs: 7 * multiplier, successRate: 85, contentVolume: 18 * multiplier, avgDuration: 8 },
      { id: "auto_4", name: "TikTok Weekly", runs: 2 * multiplier, successRate: 50, contentVolume: 4 * multiplier, avgDuration: 45 },
      { id: "auto_5", name: "Story Highlights", runs: 3 * multiplier, successRate: 100, contentVolume: 9 * multiplier, avgDuration: 15 },
    ],
  };
}

export async function fetchContentVolume(
  period: AnalyticsPeriod
): Promise<AnalyticsContentResponse> {
  await new Promise((r) => setTimeout(r, 300));
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const platforms = ["instagram", "linkedin", "twitter", "tiktok"];
  const now = Date.now();
  const series = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 86_400_000).toISOString().split("T")[0];
    for (const platform of platforms) {
      series.push({ date, platform, count: Math.floor(Math.random() * 5) });
    }
  }

  return {
    series,
    byPlatform: [
      { platform: "instagram", count: 42 },
      { platform: "twitter", count: 28 },
      { platform: "linkedin", count: 18 },
      { platform: "tiktok", count: 12 },
    ],
  };
}

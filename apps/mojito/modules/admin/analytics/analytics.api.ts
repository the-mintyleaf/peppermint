import type {
  AnalyticsPeriod,
  AnalyticsSummaryResponse,
  AnalyticsAutomationsResponse,
  AnalyticsContentResponse,
} from "./Analytics.types";

export async function fetchSummary(
  period: AnalyticsPeriod,
): Promise<AnalyticsSummaryResponse> {
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
  period: AnalyticsPeriod,
): Promise<AnalyticsAutomationsResponse> {
  await new Promise((r) => setTimeout(r, 300));
  const multiplier = period === "7d" ? 1 : period === "30d" ? 4 : 12;
  return {
    automations: [
      {
        id: "auto_1",
        name: "Weekly Instagram Post",
        runs: 4 * multiplier,
        successRate: 100,
        contentVolume: 16 * multiplier,
        avgDuration: 12,
      },
      {
        id: "auto_2",
        name: "LinkedIn Article",
        runs: 4 * multiplier,
        successRate: 75,
        contentVolume: 12 * multiplier,
        avgDuration: 28,
      },
      {
        id: "auto_3",
        name: "Twitter Daily",
        runs: 7 * multiplier,
        successRate: 85,
        contentVolume: 18 * multiplier,
        avgDuration: 8,
      },
      {
        id: "auto_4",
        name: "TikTok Weekly",
        runs: 2 * multiplier,
        successRate: 50,
        contentVolume: 4 * multiplier,
        avgDuration: 45,
      },
      {
        id: "auto_5",
        name: "Story Highlights",
        runs: 3 * multiplier,
        successRate: 100,
        contentVolume: 9 * multiplier,
        avgDuration: 15,
      },
    ],
  };
}

export async function fetchContentVolume(
  period: AnalyticsPeriod,
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

export type AnalyticsPeriodDays = 7 | 30 | 90;

function periodToDays(period: string): number {
  if (period === "7d") return 7;
  if (period === "30d") return 30;
  return 90;
}

function generateTimeSeries(days: number, base = 1000, variance = 0.3) {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000)
      .toISOString()
      .split("T")[0],
    value: Math.round(base * (1 + (Math.random() - 0.5) * variance)),
  }));
}

export interface OverviewKPI {
  impressions: number;
  reach: number;
  engagementRate: number;
  followerGrowth: number;
  impressionsDelta: number;
  reachDelta: number;
}

export async function fetchOverview(period: string): Promise<{
  kpis: OverviewKPI;
  trendSeries: Array<{ date: string; value: number }>;
  platformBreakdown: Array<{ platform: string; pct: number }>;
  topPosts: Array<{
    id: string;
    title: string;
    impressions: number;
    engagement: number;
  }>;
}> {
  await new Promise((r) => setTimeout(r, 300));
  const days = periodToDays(period);
  return {
    kpis: {
      impressions: 142000,
      reach: 89000,
      engagementRate: 4.2,
      followerGrowth: 3.1,
      impressionsDelta: 12,
      reachDelta: 8,
    },
    trendSeries: generateTimeSeries(days, 4700),
    platformBreakdown: [
      { platform: "instagram", pct: 38 },
      { platform: "tiktok", pct: 28 },
      { platform: "linkedin", pct: 18 },
      { platform: "x", pct: 10 },
      { platform: "facebook", pct: 6 },
    ],
    topPosts: Array.from({ length: 5 }, (_, i) => ({
      id: `content_mock_${i}`,
      title: `Top post ${i + 1}`,
      impressions: Math.round(8000 - i * 1200),
      engagement: Math.round(350 - i * 50),
    })),
  };
}

export async function fetchChannelPerformance(period: string): Promise<{
  platforms: string[];
  followerGrowth: Record<string, Array<{ date: string; value: number }>>;
  engagementRate: Record<string, Array<{ date: string; value: number }>>;
}> {
  await new Promise((r) => setTimeout(r, 300));
  const days = periodToDays(period);
  const platforms = ["instagram", "tiktok", "linkedin", "x"];
  return {
    platforms,
    followerGrowth: Object.fromEntries(
      platforms.map((p) => [p, generateTimeSeries(days, 100, 0.5)]),
    ),
    engagementRate: Object.fromEntries(
      platforms.map((p) => [p, generateTimeSeries(days, 4, 0.4)]),
    ),
  };
}

export async function fetchAudience(period: string): Promise<{
  ageGender: Array<{ group: string; pct: number }>;
  geo: Array<{ country: string; pct: number }>;
  activeHours: Array<{ hour: number; value: number }>;
}> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    ageGender: [
      { group: "18-24 F", pct: 22 },
      { group: "18-24 M", pct: 18 },
      { group: "25-34 F", pct: 20 },
      { group: "25-34 M", pct: 17 },
      { group: "35-44 F", pct: 12 },
      { group: "35-44 M", pct: 11 },
    ],
    geo: [
      { country: "US", pct: 42 },
      { country: "UK", pct: 18 },
      { country: "CA", pct: 12 },
      { country: "AU", pct: 8 },
      { country: "Other", pct: 20 },
    ],
    activeHours: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      value:
        h >= 8 && h <= 22
          ? Math.round(50 + Math.random() * 100)
          : Math.round(Math.random() * 20),
    })),
  };
}

export async function fetchSentimentAnalytics(period: string): Promise<{
  series: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  topics: Array<{ topic: string; positive: number; negative: number }>;
  overallScore: number;
}> {
  await new Promise((r) => setTimeout(r, 300));
  const days = periodToDays(period);
  return {
    series: Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 86400000)
        .toISOString()
        .split("T")[0],
      positive: Math.round(60 + Math.random() * 20),
      neutral: Math.round(25 + Math.random() * 10),
      negative: Math.round(5 + Math.random() * 10),
    })),
    topics: ["Product", "Service", "Brand", "Pricing", "Support"].map((t) => ({
      topic: t,
      positive: Math.round(50 + Math.random() * 40),
      negative: Math.round(5 + Math.random() * 20),
    })),
    overallScore: 72,
  };
}

export async function fetchBenchmark(period: string): Promise<{
  competitors: Array<{
    handle: string;
    platform: string;
    avgEngagement: number;
    followerGrowth: number;
  }>;
  volumeSeries: Array<{ date: string; own: number; competitor: number }>;
}> {
  await new Promise((r) => setTimeout(r, 300));
  const days = periodToDays(period);
  return {
    competitors: [
      {
        handle: "@rival_brand",
        platform: "instagram",
        avgEngagement: 3.8,
        followerGrowth: 2.1,
      },
      {
        handle: "@competitor_co",
        platform: "tiktok",
        avgEngagement: 5.2,
        followerGrowth: 8.4,
      },
    ],
    volumeSeries: Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 86400000)
        .toISOString()
        .split("T")[0],
      own: Math.round(3000 + Math.random() * 2000),
      competitor: Math.round(2500 + Math.random() * 2500),
    })),
  };
}

export async function fetchROI(period: string): Promise<{
  funnel: Array<{ stage: string; value: number }>;
  campaigns: Array<{
    name: string;
    spend: number;
    revenue: number;
    roi: number;
  }>;
}> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    funnel: [
      { stage: "Impressions", value: 142000 },
      { stage: "Reach", value: 89000 },
      { stage: "Clicks", value: 12000 },
      { stage: "Leads", value: 1400 },
      { stage: "Revenue", value: 280 },
    ],
    campaigns: [
      { name: "Summer Campaign", spend: 5000, revenue: 18000, roi: 260 },
      { name: "Product Launch", spend: 8000, revenue: 24000, roi: 200 },
      { name: "Brand Awareness", spend: 3000, revenue: 6000, roi: 100 },
    ],
  };
}

export interface Report {
  id: string;
  name: string;
  range: { from: string; to: string };
  sections: Array<{ id: string; name: string; enabled: boolean }>;
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    recipients: string[];
  };
  createdAt: string;
}

let reportsStore: Report[] = [
  {
    id: "report_1",
    name: "Monthly Social Summary",
    range: { from: "2026-05-01", to: "2026-05-31" },
    sections: [
      { id: "overview", name: "Overview", enabled: true },
      { id: "channels", name: "Channel Performance", enabled: true },
      { id: "audience", name: "Audience", enabled: false },
    ],
    schedule: { frequency: "monthly", recipients: ["team@example.com"] },
    createdAt: "2026-06-01",
  },
  {
    id: "report_2",
    name: "Weekly Engagement",
    range: { from: "2026-06-01", to: "2026-06-07" },
    sections: [{ id: "overview", name: "Overview", enabled: true }],
    createdAt: "2026-06-07",
  },
];

export async function fetchReports(): Promise<Report[]> {
  await new Promise((r) => setTimeout(r, 200));
  return reportsStore;
}

export async function createReport(
  data: Omit<Report, "id" | "createdAt">,
): Promise<Report> {
  await new Promise((r) => setTimeout(r, 400));
  const { v4: uuidv4 } = await import("uuid");
  const report: Report = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString().split("T")[0],
  };
  reportsStore = [report, ...reportsStore];
  return report;
}

export async function deleteReport(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  reportsStore = reportsStore.filter((r) => r.id !== id);
}

export async function exportReport(
  id: string,
  format: "pdf" | "csv",
): Promise<void> {
  await new Promise((r) => setTimeout(r, 800));
  // Simulate download by creating a mock blob
  const content =
    format === "csv"
      ? "date,impressions,reach\n2026-06-01,4500,2800\n"
      : `%PDF mock report ${id}`;
  const blob = new Blob([content], {
    type: format === "csv" ? "text/csv" : "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${id}.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

// TODO(backend): replace with real analytics data pipeline

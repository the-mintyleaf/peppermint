export type AnalyticsPeriod = "7d" | "30d" | "90d";

export interface AnalyticsSummary {
  contentGenerated: number;
  contentGeneratedDelta: number;
  activeAutomations: number;
  totalRuns: number;
  successRate: number;
}

export interface AutomationStatRow {
  id: string;
  name: string;
  runs: number;
  successRate: number;
  contentVolume: number;
  avgDuration: number;
}

export interface PlatformShare {
  platform: string;
  count: number;
}

export interface ContentVolumeSeries {
  date: string;
  platform: string;
  count: number;
}

export interface AnalyticsSummaryResponse {
  summary: AnalyticsSummary;
}

export interface AnalyticsAutomationsResponse {
  automations: AutomationStatRow[];
}

export interface AnalyticsContentResponse {
  series: ContentVolumeSeries[];
  byPlatform: PlatformShare[];
}

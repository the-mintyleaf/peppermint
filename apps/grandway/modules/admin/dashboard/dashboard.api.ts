import api from "@/lib/api";
import type {
  DashboardActivityResponse,
  DashboardBlockers,
  DashboardConversion,
  DashboardOutcomes,
  DashboardPipeline,
  DashboardSummary,
  DashboardToday,
  DashboardWorkload,
} from "./dashboard.types";

const DASHBOARD = "/api/v1/dashboard";

/**
 * `fiscal_year`/`country` are one shared, optional filter set accepted by
 * ALL EIGHT endpoints (INTEGRATION.md §3 "Filter params — one set, all eight
 * endpoints, all optional" / §7's per-section table) — earlier drafts of
 * this module sent them only to conversion/outcomes, which left
 * summary/today/pipeline/blockers/workload unfiltered no matter what the
 * filter bar was set to. Not every section *honours* every filter (e.g.
 * `today.documents_in_progress` ignores `country`; `activity` honours only
 * `fiscal_year` — see `fetchActivity`), but every section still *accepts*
 * both, so both are always sent.
 */
export interface DashboardFilterParams {
  fiscal_year?: string;
  country?: string;
}

export async function fetchSummary(
  params: DashboardFilterParams,
): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>(`${DASHBOARD}/summary/`, {
    params,
  });
  return data;
}

export async function fetchToday(
  params: DashboardFilterParams,
): Promise<DashboardToday> {
  const { data } = await api.get<DashboardToday>(`${DASHBOARD}/today/`, {
    params,
  });
  return data;
}

export async function fetchPipeline(
  params: DashboardFilterParams,
): Promise<DashboardPipeline> {
  const { data } = await api.get<DashboardPipeline>(`${DASHBOARD}/pipeline/`, {
    params,
  });
  return data;
}

export async function fetchBlockers(
  params: DashboardFilterParams,
): Promise<DashboardBlockers> {
  const { data } = await api.get<DashboardBlockers>(`${DASHBOARD}/blockers/`, {
    params,
  });
  return data;
}

export async function fetchWorkload(
  params: DashboardFilterParams,
): Promise<DashboardWorkload> {
  const { data } = await api.get<DashboardWorkload>(`${DASHBOARD}/workload/`, {
    params,
  });
  return data;
}

export async function fetchConversion(
  params: DashboardFilterParams,
): Promise<DashboardConversion> {
  const { data } = await api.get<DashboardConversion>(
    `${DASHBOARD}/conversion/`,
    { params },
  );
  return data;
}

export async function fetchOutcomes(
  params: DashboardFilterParams,
): Promise<DashboardOutcomes> {
  const { data } = await api.get<DashboardOutcomes>(`${DASHBOARD}/outcomes/`, {
    params,
  });
  return data;
}

export interface ActivityParams {
  fiscal_year?: string;
  page: number;
  page_size: number;
}

/**
 * `activity` honours ONLY `fiscal_year` (INTEGRATION.md §7) — `country` is
 * deliberately never in this param shape. Sending it would be misleading:
 * the backend validates it as a known filter key but silently ignores it here,
 * so a caller who included it would believe the feed was narrowed when it
 * was not.
 */
export async function fetchActivity(
  params: ActivityParams,
): Promise<DashboardActivityResponse> {
  const { data } = await api.get<DashboardActivityResponse>(
    `${DASHBOARD}/activity/`,
    { params },
  );
  return data;
}

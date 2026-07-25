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

// Five of the eight sections never receive a query param from this app: the
// contract's per-section "honoured filters" list (INTEGRATION.md §7) does not
// name `fiscal_year`/`country` for summary/today/pipeline/blockers/workload, and
// the UI must not send a filter a section silently ignores (§3 "must not
// present an ignored control as active"). Only conversion/outcomes read
// `{fiscal_year, country}`, and activity reads only `fiscal_year` (+ paging).

export async function fetchSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>(`${DASHBOARD}/summary/`);
  return data;
}

export async function fetchToday(): Promise<DashboardToday> {
  const { data } = await api.get<DashboardToday>(`${DASHBOARD}/today/`);
  return data;
}

export async function fetchPipeline(): Promise<DashboardPipeline> {
  const { data } = await api.get<DashboardPipeline>(`${DASHBOARD}/pipeline/`);
  return data;
}

export async function fetchBlockers(): Promise<DashboardBlockers> {
  const { data } = await api.get<DashboardBlockers>(`${DASHBOARD}/blockers/`);
  return data;
}

export async function fetchWorkload(): Promise<DashboardWorkload> {
  const { data } = await api.get<DashboardWorkload>(`${DASHBOARD}/workload/`);
  return data;
}

export interface ConversionOutcomesParams {
  fiscal_year?: string;
  country?: string;
}

export async function fetchConversion(
  params: ConversionOutcomesParams,
): Promise<DashboardConversion> {
  const { data } = await api.get<DashboardConversion>(
    `${DASHBOARD}/conversion/`,
    { params },
  );
  return data;
}

export async function fetchOutcomes(
  params: ConversionOutcomesParams,
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

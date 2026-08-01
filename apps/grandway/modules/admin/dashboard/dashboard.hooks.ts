"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@peppermint/ui";
import {
  fetchActivity,
  fetchBlockers,
  fetchConversion,
  fetchOutcomes,
  fetchPipeline,
  fetchSummary,
  fetchToday,
  fetchWorkload,
} from "./dashboard.api";
import { dashboardQueryKeys } from "./dashboard.queryKeys";
import {
  DEFAULT_DASHBOARD_TAB,
  isDashboardTab,
  type DashboardTab,
} from "./dashboard.tabs";
import type { DashboardFilters } from "./dashboard.types";

// Eight INDEPENDENT hooks — never combined into one parent query. Each has its
// own loading/error state so a slow section never blocks a fast one from
// painting (FLOWS.md "Morning triage" step 2: "a client that awaits all eight
// before painting discards the only reason they were split"). All eight take
// the same `{fiscalYear, country}` filter pair (INTEGRATION.md §3 — one
// shared, optional filter set across all eight endpoints); not every section
// *honours* both (per-section notes in §7), but every section *accepts* them.

type DashboardFilterInput = { fiscalYear: string; country: string };

function toApiParams({ fiscalYear, country }: DashboardFilterInput) {
  return {
    fiscal_year: fiscalYear || undefined,
    country: country || undefined,
  };
}

export function useDashboardSummary(filters: DashboardFilterInput) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.summary(apiParams),
    queryFn: () => fetchSummary(apiParams),
  });
}

export function useDashboardToday(filters: DashboardFilterInput) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.today(apiParams),
    queryFn: () => fetchToday(apiParams),
  });
}

export function useDashboardPipeline(filters: DashboardFilterInput) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.pipeline(apiParams),
    queryFn: () => fetchPipeline(apiParams),
  });
}

export function useDashboardBlockers(filters: DashboardFilterInput) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.blockers(apiParams),
    queryFn: () => fetchBlockers(apiParams),
  });
}

export function useDashboardWorkload(filters: DashboardFilterInput) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.workload(apiParams),
    queryFn: () => fetchWorkload(apiParams),
  });
}

export function useDashboardConversion(filters: DashboardFilterInput) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.conversion(apiParams),
    queryFn: () => fetchConversion(apiParams),
  });
}

export function useDashboardOutcomes(filters: DashboardFilterInput) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.outcomes(apiParams),
    queryFn: () => fetchOutcomes(apiParams),
  });
}

export function useDashboardActivity(params: {
  fiscalYear: string;
  page: number;
  pageSize: number;
}) {
  const apiParams = {
    fiscal_year: params.fiscalYear || undefined,
    page: params.page,
    page_size: params.pageSize,
  };
  return useQuery({
    queryKey: dashboardQueryKeys.activity(apiParams),
    queryFn: () => fetchActivity(apiParams),
  });
}

/**
 * One writer for every URL-held dashboard control (`fiscal_year`, `country`,
 * `tab`) — a single `router.replace` that patches one key and preserves the
 * rest, so switching tabs never drops the filters and vice versa. `replace`
 * (not `push`) keeps a keystroke or a tab click out of the history stack.
 */
function useSearchParamPatch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };
}

/**
 * `fiscal_year`/`country` live in the URL — shareable/bookmarkable per
 * `.claude/rules.md` state-ownership rule ("filters ... -> URL search
 * params").
 */
export function useDashboardFilters(): DashboardFilters & {
  setFiscalYear: (value: string) => void;
  setCountry: (value: string) => void;
} {
  const searchParams = useSearchParams();
  const patch = useSearchParamPatch();

  return {
    fiscalYear: searchParams.get("fiscal_year") ?? "",
    country: searchParams.get("country") ?? "",
    setFiscalYear: (value: string) => patch("fiscal_year", value),
    setCountry: (value: string) => patch("country", value),
  };
}

/**
 * The active tab is URL state for the same reason the filters are — "open the
 * dashboard on Blockers for FY82/83" has to be one shareable link, and the
 * alert rows on Overview navigate by switching it. An unknown or absent `tab`
 * falls back to `overview` rather than rendering nothing.
 */
export function useDashboardTab(): {
  tab: DashboardTab;
  setTab: (value: DashboardTab) => void;
} {
  const searchParams = useSearchParams();
  const patch = useSearchParamPatch();

  const raw = searchParams.get("tab");

  return {
    tab: isDashboardTab(raw) ? raw : DEFAULT_DASHBOARD_TAB,
    setTab: (value: DashboardTab) =>
      patch("tab", value === DEFAULT_DASHBOARD_TAB ? "" : value),
  };
}

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
 * `fiscal_year`/`country` live in the URL — shareable/bookmarkable per
 * `.claude/rules.md` state-ownership rule ("filters ... -> URL search
 * params"). Read via `useSearchParams`, written via `router.replace` (no
 * history entry per keystroke).
 */
export function useDashboardFilters(): DashboardFilters & {
  setFiscalYear: (value: string) => void;
  setCountry: (value: string) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fiscalYear = searchParams.get("fiscal_year") ?? "";
  const country = searchParams.get("country") ?? "";

  const patch = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return {
    fiscalYear,
    country,
    setFiscalYear: (value: string) => patch("fiscal_year", value),
    setCountry: (value: string) => patch("country", value),
  };
}

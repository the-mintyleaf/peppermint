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
// before painting discards the only reason they were split").

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardQueryKeys.summary(),
    queryFn: fetchSummary,
  });
}

export function useDashboardToday() {
  return useQuery({
    queryKey: dashboardQueryKeys.today(),
    queryFn: fetchToday,
  });
}

export function useDashboardPipeline() {
  return useQuery({
    queryKey: dashboardQueryKeys.pipeline(),
    queryFn: fetchPipeline,
  });
}

export function useDashboardBlockers() {
  return useQuery({
    queryKey: dashboardQueryKeys.blockers(),
    queryFn: fetchBlockers,
  });
}

export function useDashboardWorkload() {
  return useQuery({
    queryKey: dashboardQueryKeys.workload(),
    queryFn: fetchWorkload,
  });
}

export function useDashboardConversion(params: {
  fiscalYear: string;
  country: string;
}) {
  const apiParams = {
    fiscal_year: params.fiscalYear || undefined,
    country: params.country || undefined,
  };
  return useQuery({
    queryKey: dashboardQueryKeys.conversion(apiParams),
    queryFn: () => fetchConversion(apiParams),
  });
}

export function useDashboardOutcomes(params: {
  fiscalYear: string;
  country: string;
}) {
  const apiParams = {
    fiscal_year: params.fiscalYear || undefined,
    country: params.country || undefined,
  };
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

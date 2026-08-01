"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueries, useQuery } from "@peppermint/ui";
import type { QueryParams } from "@peppermint/admin";
import { listApplicants } from "@/modules/admin/applicants/applicants.api";
import { applicantsQueryKeys } from "@/modules/admin/applicants/applicants.queryKeys";
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

/**
 * One `summary` per destination country, fanned out with `useQueries`.
 *
 * There is NO per-country aggregation endpoint — `country` is a filter, not a
 * group-by (INTEGRATION.md §3; the id is an `institutions.Country` resolved
 * through `applicant_journeys`). A per-country comparison therefore has to be
 * built by asking the same question once per country, which is honest but costs
 * one request each: the caller decides how many countries to pass, and must NOT
 * pass the whole catalogue unbounded.
 *
 * The key shape is identical to `useDashboardSummary`, so when the header's
 * country filter is set to one of these, both share a single cached request.
 * Each entry keeps its own loading/error state — one country failing must not
 * blank the strip.
 */
export function useCountrySummaries(countryIds: string[], fiscalYear: string) {
  return useQueries({
    queries: countryIds.map((countryId) => {
      const apiParams = toApiParams({ fiscalYear, country: countryId });
      return {
        queryKey: dashboardQueryKeys.summary(apiParams),
        queryFn: () => fetchSummary(apiParams),
      };
    }),
  });
}

/**
 * Applicant headcount per destination country, fanned out with `useQueries`.
 *
 * `/applicants/` accepts `country` as a **filter** and returns the matching
 * total in `meta.count`, so a per-country applicant count is one page-size-1
 * request each — the whole row is thrown away and only the count is read. That
 * is far cheaper than a full dashboard `summary` per country and, unlike one,
 * it counts APPLICANTS rather than a mixed volume set.
 *
 * There is still no group-by endpoint, so this is N independent questions: each
 * lands on its own clock and the set is only as complete as the countries that
 * actually resolved. The CALLER must bound the list.
 */
export function useApplicantsByCountry(
  countries: { id: string; name: string }[],
  fiscalYear: string,
) {
  return useQueries({
    queries: countries.map((country) => {
      const params: QueryParams = {
        page: 1,
        pageSize: 1,
        search: "",
        sort: [],
        filters: {
          country: country.id,
          ...(fiscalYear ? { fiscal_year: fiscalYear } : {}),
        },
      };
      return {
        queryKey: applicantsQueryKeys.list(params),
        queryFn: () => listApplicants(params),
        select: (response: { meta: { total: number } }) => response.meta.total,
      };
    }),
  });
}

/**
 * The newest applicants, optionally narrowed to how they were created.
 * `/applicants/` is newest-first with **no client-controlled ordering**
 * (INTEGRATION.md §"Filter/search params"), so "recently added" is simply the
 * first page — there is no `ordering` param to send, and sending one would look
 * deliberate while doing nothing.
 */
export function useRecentApplicants(
  filters: DashboardFilterInput,
  creationSource: string | null,
  limit: number,
) {
  const params: QueryParams = {
    page: 1,
    pageSize: limit,
    search: "",
    sort: [],
    filters: {
      ...(filters.country ? { country: filters.country } : {}),
      ...(filters.fiscalYear ? { fiscal_year: filters.fiscalYear } : {}),
      ...(creationSource ? { creation_source: creationSource } : {}),
    },
  };
  return useQuery({
    queryKey: applicantsQueryKeys.list(params),
    queryFn: () => listApplicants(params),
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

export function useDashboardBlockers(
  filters: DashboardFilterInput,
  enabled = true,
) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.blockers(apiParams),
    queryFn: () => fetchBlockers(apiParams),
    enabled,
  });
}

// `enabled` exists because a multi-view card must not pay for the views nobody
// is looking at: the panel gates its sections on the open view, and React Query
// keeps whatever has already landed, so switching back is instant rather than a
// second request.

export function useDashboardWorkload(
  filters: DashboardFilterInput,
  enabled = true,
) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.workload(apiParams),
    queryFn: () => fetchWorkload(apiParams),
    enabled,
  });
}

export function useDashboardConversion(
  filters: DashboardFilterInput,
  enabled = true,
) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.conversion(apiParams),
    queryFn: () => fetchConversion(apiParams),
    enabled,
  });
}

export function useDashboardOutcomes(
  filters: DashboardFilterInput,
  enabled = true,
) {
  const apiParams = toApiParams(filters);
  return useQuery({
    queryKey: dashboardQueryKeys.outcomes(apiParams),
    queryFn: () => fetchOutcomes(apiParams),
    enabled,
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

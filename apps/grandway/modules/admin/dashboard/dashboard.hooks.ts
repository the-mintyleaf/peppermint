"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueries, useQuery } from "@peppermint/ui";
import type { QueryParams } from "@peppermint/admin";
import { listApplicants } from "@/modules/admin/applicants/applicants.api";
import { applicantsQueryKeys } from "@/modules/admin/applicants/applicants.queryKeys";
import { listReminders } from "@/modules/admin/reminders/reminders.api";
import { dueRemindersKey } from "@/modules/admin/reminders/reminders.queryKeys";
import { nepalToday } from "@/modules/admin/reminders/reminders.utils";
import type { Reminder } from "@/modules/admin/reminders/reminders.types";
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

/** One due window: the rows to preview, and the true size of the window. */
export interface DueRemindersBucket {
  rows: Reminder[];
  /** `meta.count` for that window — the real total, never `rows.length`. */
  total: number;
}

/** The three buckets the Follow-ups card reads. */
export interface DueRemindersResult {
  overdue: DueRemindersBucket;
  today: DueRemindersBucket;
  upcoming: DueRemindersBucket;
  /** Nepal's today, so the card's rows read against the same clock the hook used. */
  todayDate: string;
}

/**
 * Staff-set follow-ups that are due, as three bucketed worklists.
 *
 * The dashboard's only **cross-module** data source that is not part of the
 * `/api/v1/dashboard/` contract — that contract has no reminder section at all
 * (its §2 does not list `reminders`, and none of its eight endpoints touches
 * one). Documented precedent for reading another module's endpoint from here:
 * `useApplicantsByCountry` and `useRecentApplicants` above.
 *
 * **Three window-filtered requests, one clock.** The boundary dates are
 * computed **once** on the client from `nepalToday()` and sent explicitly as
 * `due_before`/`due_after`, so the three windows provably partition the space —
 * this is not the "three requests, three clocks" trap, which is what happens
 * when each request lets the *server* decide its own boundary.
 *
 * It is three requests rather than one because a single `?status=active` page
 * caps at 100 rows in **newest-created** order (this API has no due-date
 * ordering). An office with more than 100 open follow-ups would silently drop
 * older ones — including overdue ones — and every count on the card would be a
 * quiet under-report. Each window here returns its own `meta.count`, which is
 * the **true** total for that bucket at any volume, and the ten rows it shows
 * are the ten that belong to it.
 *
 * **Not filtered by `fiscal_year`/`country`.** Reminders carry neither concept —
 * `fiscal_year` on this API is a Bikram Sambat label over `due_date`, a
 * different question from the dashboard's filter, and there is no country at
 * all. The card says so in its caption rather than letting the controls
 * silently do nothing.
 */
export function useDueReminders() {
  // ONE clock. Every window below is derived from this single value, so the
  // three requests describe one consistent partition of the calendar.
  const todayDate = nepalToday();
  const yesterday = shiftDate(todayDate, -1);
  const tomorrow = shiftDate(todayDate, 1);

  const windows: { key: string; filters: Record<string, string> }[] = [
    // `due_before` is INCLUSIVE, so "overdue" ends the day before today.
    { key: "overdue", filters: { due_before: yesterday } },
    // Both bounds inclusive on the same day → exactly today.
    { key: "today", filters: { due_after: todayDate, due_before: todayDate } },
    // `due_after` is INCLUSIVE, so "upcoming" starts tomorrow.
    { key: "upcoming", filters: { due_after: tomorrow } },
  ];

  const results = useQueries({
    queries: windows.map(({ key, filters }) => ({
      queryKey: [...dueRemindersKey(), key, filters],
      queryFn: () => listReminders(toReminderQueryParams(filters)),
    })),
  });

  const [overdue, today, upcoming] = results;
  const bucket = (index: number): DueRemindersBucket => ({
    rows: results[index].data?.data ?? [],
    // The honest count for the whole window, not the length of the page.
    total: results[index].data?.meta.total ?? 0,
  });

  const buckets: DueRemindersResult = {
    overdue: bucket(0),
    today: bucket(1),
    upcoming: bucket(2),
    todayDate,
  };

  return {
    buckets,
    isPending: results.some((r) => r.isPending),
    isError: results.some((r) => r.isError),
    isRefetching: results.some((r) => r.isRefetching),
    refetch: () => {
      void overdue.refetch();
      void today.refetch();
      void upcoming.refetch();
    },
  };
}

/**
 * `status=active` narrows to open follow-ups — the card answers "what still
 * needs chasing", and closed rows belong to a record's own panel.
 *
 * `pageSize` is the card's preview depth, not a cap on the answer: `meta.count`
 * still reports the true size of the window, so a bucket of 300 says 300 and
 * shows ten.
 */
function toReminderQueryParams(filters: Record<string, string>): QueryParams {
  return {
    page: 1,
    pageSize: REMINDER_PREVIEW_ROWS,
    search: "",
    sort: [],
    filters: { status: "active", ...filters },
  };
}

/** Rows previewed per bucket. The count beside each view is the real total. */
export const REMINDER_PREVIEW_ROWS = 10;

/**
 * `YYYY-MM-DD` shifted by whole days.
 *
 * Both sides are anchored at UTC midnight — the same fixed offset each — so the
 * arithmetic measures calendar days and never picks up a local-offset shift.
 * The values are Nepal calendar dates; UTC is only the arithmetic frame.
 */
function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
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

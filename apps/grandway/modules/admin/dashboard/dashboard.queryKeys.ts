import { createQueryKeys } from "@peppermint/admin";

/**
 * One resource root, but each section gets its OWN key builder rather than
 * sharing `.list()`/`.detail()` — the eight endpoints are independent live
 * requests with independent cache lifetimes (INTEGRATION.md §3 "No
 * cross-section consistency guarantee"), so invalidating one must never touch
 * another's cache entry.
 */
const dashboardBase = createQueryKeys("dashboard");

/** All eight sections share the `{fiscal_year, country}` filter set — every key is parameterized by it so a filter change is a cache miss, not stale data. */
type FilterParams = { fiscal_year?: string; country?: string };

export const dashboardQueryKeys = {
  summary: (params: FilterParams) =>
    [...dashboardBase.detail("summary"), params] as const,
  today: (params: FilterParams) =>
    [...dashboardBase.detail("today"), params] as const,
  pipeline: (params: FilterParams) =>
    [...dashboardBase.detail("pipeline"), params] as const,
  blockers: (params: FilterParams) =>
    [...dashboardBase.detail("blockers"), params] as const,
  workload: (params: FilterParams) =>
    [...dashboardBase.detail("workload"), params] as const,
  conversion: (params: FilterParams) =>
    [...dashboardBase.detail("conversion"), params] as const,
  outcomes: (params: FilterParams) =>
    [...dashboardBase.detail("outcomes"), params] as const,
  activity: (params: {
    fiscal_year?: string;
    page: number;
    page_size: number;
  }) => [...dashboardBase.detail("activity"), params] as const,
};

import { createQueryKeys } from "@peppermint/admin";

/**
 * One resource root, but each section gets its OWN key builder rather than
 * sharing `.list()`/`.detail()` — the eight endpoints are independent live
 * requests with independent cache lifetimes (INTEGRATION.md §3 "No
 * cross-section consistency guarantee"), so invalidating one must never touch
 * another's cache entry.
 */
const dashboardBase = createQueryKeys("dashboard");

export const dashboardQueryKeys = {
  /** Unfiltered sections — no params ever sent (see `dashboard.api.ts`). */
  summary: () => dashboardBase.detail("summary"),
  today: () => dashboardBase.detail("today"),
  pipeline: () => dashboardBase.detail("pipeline"),
  blockers: () => dashboardBase.detail("blockers"),
  workload: () => dashboardBase.detail("workload"),
  /** Filtered sections — parameterized so a filter change is a cache miss, not stale data. */
  conversion: (params: { fiscal_year?: string; country?: string }) =>
    [...dashboardBase.detail("conversion"), params] as const,
  outcomes: (params: { fiscal_year?: string; country?: string }) =>
    [...dashboardBase.detail("outcomes"), params] as const,
  activity: (params: {
    fiscal_year?: string;
    page: number;
    page_size: number;
  }) => [...dashboardBase.detail("activity"), params] as const,
};

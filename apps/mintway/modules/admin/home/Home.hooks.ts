import { useQuery } from "@peppermint/ui";
import type { QueryParams } from "@peppermint/admin";

import { documentsApi } from "@/modules/documents";
import { fetchApplicants } from "@/modules/admin/applicant/_shared/applicant.api";
import type { ApplicantListRow } from "@/modules/admin/applicant/_shared/applicant.types";
import { fetchUsers } from "@/modules/admin/authenticate/users/users.api";

/** Counts and short lists are re-read on a light interval; keep them briefly fresh. */
const STALE = 60_000;

/**
 * Build a full `QueryParams` for a count/list read. All numbers on the dashboard come
 * from list endpoints (there is no aggregate API), so a count is a `pageSize: 1` read of
 * `meta.total` and a "recent" list is a small sorted page.
 */
function listParams(
  filters: Record<string, unknown> = {},
  opts?: { pageSize?: number; sort?: QueryParams["sort"] },
): QueryParams {
  return {
    page: 1,
    pageSize: opts?.pageSize ?? 1,
    search: "",
    sort: opts?.sort ?? [],
    filters,
  };
}

/**
 * Applicant count for one filter bucket (a lifecycle stage or engagement status).
 * `bucketKey` namespaces the cache entry so sibling buckets don't collide.
 */
export function useApplicantCount(
  bucketKey: string,
  filters: Record<string, unknown>,
) {
  return useQuery({
    queryKey: ["home", "applicant-count", bucketKey],
    queryFn: async () => {
      const res = await fetchApplicants(listParams(filters));
      return res.meta.total;
    },
    staleTime: STALE,
  });
}

/** The most recently updated applicants — the "what changed" activity feed. */
export function useRecentApplicants(limit = 5) {
  return useQuery({
    queryKey: ["home", "recent-applicants", limit],
    queryFn: async () => {
      const res = await fetchApplicants(
        listParams(
          {},
          {
            pageSize: limit,
            sort: [{ field: "updated_at", direction: "desc" }],
          },
        ),
      );
      return res.data;
    },
    staleTime: STALE,
  });
}

/**
 * Applicants with a follow-up date, soonest first. Admin-only: `next_follow_up_at` is an
 * admin field projection, so this is gated by `enabled`. Ordering is best-effort — if the
 * backend rejects the param we still receive a page and filter/sort client-side, so the
 * card degrades to "no follow-ups due" rather than throwing. The consumer keeps only the
 * overdue / due-today rows.
 */
export function useFollowUpsDue(enabled: boolean, fetchSize = 20) {
  return useQuery({
    queryKey: ["home", "followups-due", fetchSize],
    queryFn: async () => {
      const res = await fetchApplicants(
        listParams(
          {},
          {
            pageSize: fetchSize,
            sort: [{ field: "next_follow_up_at", direction: "asc" }],
          },
        ),
      );
      return res.data;
    },
    enabled,
    staleTime: STALE,
  });
}

/** Active document workspaces (non-paginated summary array) + total open drafts. */
export function useDocumentWorkspaces(enabled: boolean) {
  return useQuery({
    queryKey: ["home", "doc-workspaces"],
    queryFn: async () => {
      const workspaces = await documentsApi.listWorkspaces();
      const drafts = workspaces.reduce(
        (sum, w) => sum + (w.draftCount ?? 0),
        0,
      );
      return { count: workspaces.length, drafts };
    },
    enabled,
    staleTime: STALE,
  });
}

/** Active signatory count (non-paginated array). */
export function useActiveSignaturesCount(enabled: boolean) {
  return useQuery({
    queryKey: ["home", "active-signatures"],
    queryFn: async () => (await documentsApi.listSignatures(true)).length,
    enabled,
    staleTime: STALE,
  });
}

/** Total user accounts via the paginated admin list `meta.total`. */
export function useUserCount(enabled: boolean) {
  return useQuery({
    queryKey: ["home", "user-count"],
    queryFn: async () => {
      const res = await fetchUsers(listParams());
      return res.meta.total;
    },
    enabled,
    staleTime: STALE,
  });
}

/** Rows the operator should act on: a follow-up that is overdue or due today. */
export function selectDueFollowUps(
  rows: ApplicantListRow[] | undefined,
  now: number,
): ApplicantListRow[] {
  if (!rows) return [];
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return rows
    .filter((r) => {
      if (!r.next_follow_up_at) return false;
      return new Date(r.next_follow_up_at).getTime() <= endOfToday.getTime();
    })
    .sort(
      (a, b) =>
        new Date(a.next_follow_up_at ?? 0).getTime() -
        new Date(b.next_follow_up_at ?? 0).getTime(),
    );
}

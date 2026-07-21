/**
 * Real dashboard reads — the three self-scoped `/my/*` work endpoints. These are
 * the only dashboard data with a clean backend; the rest of the dashboard
 * (focus/flow/metrics/files) has no work-API source and stays on mock. Types come
 * from the frozen `@/lib/work` contract.
 */

import api from "@/lib/api";
import type { WorkAssignment, WorkItem, WorkReviewRound } from "@/lib/work";

/**
 * The `/my/*` endpoints return a bare list or a paginated `{ data, meta }`
 * (the api-client unwraps the envelope either way). Normalize to an array.
 */
function unwrapList<T>(raw: T[] | { data: T[] }): T[] {
  return Array.isArray(raw) ? raw : (raw?.data ?? []);
}

export async function listMyActiveWork(): Promise<WorkItem[]> {
  const { data } = await api.get<WorkItem[] | { data: WorkItem[] }>(
    "/api/v1/work/my/active/",
  );
  return unwrapList(data);
}

export async function listMyPendingAssignments(): Promise<WorkAssignment[]> {
  const { data } = await api.get<WorkAssignment[] | { data: WorkAssignment[] }>(
    "/api/v1/work/my/pending-assignments/",
  );
  return unwrapList(data);
}

export async function listMyPendingReviews(): Promise<WorkReviewRound[]> {
  const { data } = await api.get<
    WorkReviewRound[] | { data: WorkReviewRound[] }
  >("/api/v1/work/my/pending-reviews/");
  return unwrapList(data);
}

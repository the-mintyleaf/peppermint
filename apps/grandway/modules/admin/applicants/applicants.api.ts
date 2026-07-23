import { createResourceApi } from "@peppermint/admin";
import type { ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  ApplicantCreatePayload,
  ApplicantDetail,
  ApplicantUpdatePayload,
  HistoryEntry,
  StatusChangePayload,
} from "./applicants.types";

const applicantResource = createResourceApi<
  ApplicantDetail,
  ApplicantCreatePayload,
  ApplicantUpdatePayload
>({
  client: api,
  basePath: "/api/v1/applicants",
});

/** `GET /api/v1/applicants/` — list-shape rows; server-side `status`/`search`/etc. filters. */
export const listApplicants = applicantResource.list;

/** `GET /api/v1/applicants/<id>/` — always genuine 404, no ownership to hide. */
export const getApplicant = applicantResource.get;

/** `POST /api/v1/applicants/` — Admin only; `status` isn't part of the payload type. */
export const createApplicant = applicantResource.create;

/** `PATCH /api/v1/applicants/<id>/` — nested collections replace wholesale. */
export const updateApplicant = applicantResource.update;

/** `POST /api/v1/applicants/<id>/status/` — manual only, never a lifecycle side effect. */
export function changeApplicantStatus(id: string, body: StatusChangePayload) {
  return applicantResource.action<ApplicantDetail>(id, "status", body);
}

// ── History ──────────────────────────────────────────────────────────────────
//
// Nested under an applicant id rather than its own base path, so it doesn't fit
// `createResourceApi`'s single-basePath shape — hand-rolled, reusing the
// primitive's `ResourceListResponse` for the `meta.count → total` remap
// (same pattern as `leadManagement.api.ts`'s `fetchLeadHistory`).

/**
 * `GET /api/v1/applicants/<id>/history/` — paginated, newest-first, backed by
 * the central audit log. Requests a generous single page rather than the
 * backend's own default of 20 — a file with more history than that is an
 * edge case this view doesn't yet handle, not a silent one (the panel shows a
 * "showing the N most recent" disclosure when `meta.total` exceeds it).
 */
export async function fetchApplicantHistory(
  id: string,
  pageSize = 100,
): Promise<ResourceListResponse<HistoryEntry>> {
  const { data } = await api.get<{
    data: HistoryEntry[];
    meta: { count: number } & Record<string, unknown>;
  }>(`/api/v1/applicants/${id}/history/`, {
    params: { page: 1, page_size: pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

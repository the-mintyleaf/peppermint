import { createResourceApi } from "@peppermint/admin";
import type { ResourceListResponse } from "@peppermint/admin";
import { toNotesListResult } from "@/components/notes-panel";
import type {
  NoteCreatePayload,
  NotesListParams,
  NotesListResult,
  NoteUpdatePayload,
} from "@/components/notes-panel";
import api from "@/lib/api";
import type { User } from "@/modules/admin/authenticate/_shared/authenticate.types";
import type {
  ApplicantCreatePayload,
  ApplicantDetail,
  ApplicantNote,
  ApplicantUpdatePayload,
  AssignPayload,
  HistoryEntry,
  RestorePayload,
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

/**
 * `POST /api/v1/applicants/<id>/status/` — manual only, never a lifecycle side
 * effect. Can archive ("delete"), but can no longer move out of `archived`
 * (409 `APPLICANTS_APPLICANT_ARCHIVED`) — that is `restoreApplicant`.
 */
export function changeApplicantStatus(id: string, body: StatusChangePayload) {
  return applicantResource.action<ApplicantDetail>(id, "status", body);
}

/**
 * `POST /api/v1/applicants/<id>/restore/` — Admin only. Returns the applicant
 * at the status it held before archiving (`active` or `dormant`).
 */
export function restoreApplicant(id: string, body: RestorePayload) {
  return applicantResource.action<ApplicantDetail>(id, "restore", body);
}

/**
 * `POST /api/v1/applicants/<id>/assign/` — Admin assigns/reassigns/clears; a
 * Lead Manager may only take an unassigned file (own id) or release their own
 * (`null`). Refused on an archived applicant.
 */
export function assignApplicant(id: string, body: AssignPayload) {
  return applicantResource.action<ApplicantDetail>(id, "assign", body);
}

// ── Notes ────────────────────────────────────────────────────────────────────
//
// Nested under the applicant id, so hand-rolled like history. These four back
// the shared `NotesPanel` adapter (`useApplicantNotesAdapter`).

const notesPath = (applicantId: string) =>
  `/api/v1/applicants/${applicantId}/notes/`;

/** `GET /notes/` — paginated; `meta.counts` carries the per-category totals. */
export async function listApplicantNotes(
  applicantId: string,
  params: NotesListParams,
): Promise<NotesListResult<ApplicantNote>> {
  const { data } = await api.get<{
    data: ApplicantNote[];
    meta: { count?: number; counts?: Partial<Record<string, number>> };
  }>(notesPath(applicantId), {
    params: {
      category: params.category,
      ordering: params.ordering,
      page: params.page,
      page_size: params.pageSize,
    },
  });
  return toNotesListResult(data);
}

export async function createApplicantNote(
  applicantId: string,
  body: NoteCreatePayload,
): Promise<ApplicantNote> {
  const { data } = await api.post<ApplicantNote>(notesPath(applicantId), body);
  return data;
}

export async function updateApplicantNote(
  applicantId: string,
  noteId: string,
  body: NoteUpdatePayload,
): Promise<ApplicantNote> {
  const { data } = await api.patch<ApplicantNote>(
    `${notesPath(applicantId)}${noteId}/`,
    body,
  );
  return data;
}

/** Soft delete on the server — the note leaves the list, its history stays. */
export async function deleteApplicantNote(
  applicantId: string,
  noteId: string,
): Promise<void> {
  await api.delete(`${notesPath(applicantId)}${noteId}/`);
}

// ── Assignee picker ──────────────────────────────────────────────────────────

/**
 * The people an Admin can pick as assignee. **There is no picker endpoint in
 * this module** (INTEGRATION.md §9): the nearest list is `GET /auth/users/`,
 * which shows an Admin the tier they manage — Lead Managers — and never fellow
 * Admins. The endpoint takes no filters (authenticate INTEGRATION.md §3), so
 * every page is read at the backend max of 100 until `meta.next` is `null`;
 * deactivated accounts are dropped afterwards because `POST /assign/` refuses
 * them (`APPLICANTS_ASSIGNEE_INVALID`). `MAX_STAFF_PAGES` is only a runaway
 * guard (5,000 accounts) against a `next` that never ends.
 */
const STAFF_PAGE_SIZE = 100;
const MAX_STAFF_PAGES = 50;

export async function fetchAssignableStaff(): Promise<User[]> {
  const users: User[] = [];
  for (let page = 1; page <= MAX_STAFF_PAGES; page += 1) {
    const { data } = await api.get<{
      data: User[];
      meta?: { next?: string | null };
    }>("/api/v1/auth/users/", {
      params: { page, page_size: STAFF_PAGE_SIZE },
    });
    const rows = Array.isArray(data.data) ? data.data : [];
    users.push(...rows);
    if (!data.meta?.next || rows.length === 0) break;
  }
  return users.filter((user) => user.is_active);
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

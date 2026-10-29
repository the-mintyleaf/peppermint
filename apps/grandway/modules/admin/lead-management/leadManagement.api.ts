import { createResourceApi } from "@peppermint/admin";
import type { ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import { toNotesListResult } from "@/components/notes-panel";
import type {
  NoteCreatePayload,
  NotesListParams,
  NotesListResult,
  NoteUpdatePayload,
} from "@/components/notes-panel";
import type {
  ConvertLeadResponse,
  DeleteLeadPayload,
  FollowUpPayload,
  Lead,
  LeadCreatePayload,
  LeadDetail,
  LeadListFilters,
  LeadNote,
  LeadSource,
  LeadUpdatePayload,
  LossReason,
  MarkLostPayload,
  ReferenceEntry,
  ReferenceEntryCreatePayload,
  ReferenceEntryUpdatePayload,
  ReopenPayload,
  RestoreLeadPayload,
  StageChangePayload,
  HistoryEntry,
} from "./leadManagement.types";

const leadResource = createResourceApi<
  LeadDetail,
  LeadCreatePayload,
  LeadUpdatePayload
>({
  client: api,
  basePath: "/api/v1/leads",
});

/** `GET /api/v1/leads/<id>/`. */
export const getLead = leadResource.get;

/** `POST /api/v1/leads/` — `stage` isn't part of the payload type, so it can never be sent. */
export const createLead = leadResource.create;

/** `PATCH /api/v1/leads/<id>/` — `stage` is silently ignored by the backend if sent. */
export const updateLead = leadResource.update;

/** `POST /api/v1/leads/<id>/stage/`. */
export function changeLeadStage(id: string, body: StageChangePayload) {
  return leadResource.action<LeadDetail>(id, "stage", body);
}

/** `POST /api/v1/leads/<id>/follow-up/`. */
export function recordLeadFollowUp(id: string, body: FollowUpPayload) {
  return leadResource.action<LeadDetail>(id, "follow-up", body);
}

/** `POST /api/v1/leads/<id>/lost/`. */
export function markLeadLost(id: string, body: MarkLostPayload) {
  return leadResource.action<LeadDetail>(id, "lost", body);
}

/** `POST /api/v1/leads/<id>/reopen/`. */
export function reopenLead(id: string, body: ReopenPayload = {}) {
  return leadResource.action<LeadDetail>(id, "reopen", body);
}

/**
 * `DELETE /api/v1/leads/<id>/` — Admin-only SOFT delete, the reason sent as
 * the JSON body (hence not `leadResource.remove`, which sends none). Returns
 * the lead with `deleted_*` set. 409 `LEADS_LEAD_ALREADY_CONVERTED` for a lead
 * that was ever converted; 409 `LEADS_LEAD_DELETED` when already deleted.
 */
export async function deleteLead(
  id: string,
  body: DeleteLeadPayload,
): Promise<LeadDetail> {
  const { data } = await api.delete<LeadDetail>(`/api/v1/leads/${id}/`, {
    data: body,
  });
  return data;
}

/** `POST /api/v1/leads/<id>/restore/` — Admin only; 409 `LEADS_LEAD_NOT_DELETED` on a live lead. */
export function restoreLead(id: string, body: RestoreLeadPayload = {}) {
  return leadResource.action<LeadDetail>(id, "restore", body);
}

/**
 * List-shape row of `?deleted=true`. The contract's list shape carries no
 * `deleted_*` fields, so they are optional here — rendered when the server
 * includes them, otherwise the drawer's detail fetch is where they show.
 */
export type DeletedLeadRow = Lead &
  Partial<Pick<LeadDetail, "deleted_at" | "deleted_by" | "delete_reason">>;

export interface DeletedLeadsPage {
  data: DeletedLeadRow[];
  total: number;
}

/**
 * `GET /api/v1/leads/?deleted=true` — Admin only (a Lead Manager gets 403
 * `LEADS_ACTOR_FORBIDDEN`). Lists deleted leads, and only them.
 */
export async function fetchDeletedLeads(
  page: number,
  pageSize: number,
): Promise<DeletedLeadsPage> {
  const { data } = await api.get<{
    data: DeletedLeadRow[];
    meta: { count: number };
  }>("/api/v1/leads/", {
    params: { deleted: true, page, page_size: pageSize },
  });
  return { data: data.data, total: data.meta.count };
}

/**
 * `POST /api/v1/leads/<id>/convert/` — Admin only, empty body. Response shape
 * differs from the other lifecycle actions (`{ lead, applicant_id,
 * journey_id }`, not a bare `LeadDetail`) so it can't reuse the `<LeadDetail>`
 * generic the others do.
 */
export function convertLead(id: string) {
  return leadResource.action<ConvertLeadResponse>(id, "convert", {});
}

// ── Aggregated fetch for the categorized board ──────────────────────────────
//
// `GET /leads/` only supports single-value filters — there's no server-side
// "stage in [...]" or "needs attention" concept, so accurate, mutually-exclusive
// category tabs require the caller's whole in-scope set in memory. Capped so a
// caller with an unexpectedly large lead volume gets a disclosure banner
// (`meta.capped`) instead of a silent partial view.

const AGGREGATE_PAGE_SIZE = 100;
const AGGREGATE_PAGE_CAP = 10;

export interface FetchAllLeadsParams extends LeadListFilters {
  fiscalYear?: string;
}

export interface FetchAllLeadsResult {
  data: Lead[];
  meta: { total: number; capped: boolean };
}

interface LeadListPage {
  data: Lead[];
  meta: { count: number; next: string | null };
}

/** Camel-cased params → the backend's snake_case query, blank values dropped. */
function toLeadListQuery(params: FetchAllLeadsParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.fiscalYear) query.fiscal_year = params.fiscalYear;
  if (params.highestQualificationLevel) {
    query.highest_qualification_level = params.highestQualificationLevel;
  }
  if (params.languageTestStatus) {
    query.language_test_status = params.languageTestStatus;
  }
  if (params.languageTestType) {
    query.language_test_type = params.languageTestType;
  }
  return query;
}

/**
 * Loops `GET /api/v1/leads/` at `page_size=100` until exhausted or capped at
 * 1000 leads. Deleted leads are excluded server-side for everyone — they only
 * come back through `fetchDeletedLeads`.
 */
export async function fetchAllLeads(
  params: FetchAllLeadsParams = {},
): Promise<FetchAllLeadsResult> {
  const collected: Lead[] = [];
  let page = 1;
  let total = 0;
  let capped = false;
  const query = toLeadListQuery(params);

  while (page <= AGGREGATE_PAGE_CAP) {
    const { data } = await api.get<LeadListPage>("/api/v1/leads/", {
      params: { page, page_size: AGGREGATE_PAGE_SIZE, ...query },
    });
    collected.push(...data.data);
    total = data.meta.count;
    if (!data.meta.next) break;
    if (page === AGGREGATE_PAGE_CAP) {
      capped = true;
      break;
    }
    page += 1;
  }

  return { data: collected, meta: { total, capped } };
}

// ── Reference data — read (picker-facing, active only) ──────────────────────

/** `GET /api/v1/leads/sources/` — unpaginated; omit `include_inactive` so retired entries stay hidden. */
export async function fetchLeadSources(): Promise<LeadSource[]> {
  const { data } = await api.get<LeadSource[]>("/api/v1/leads/sources/");
  return data;
}

/** `GET /api/v1/leads/loss-reasons/` — unpaginated. */
export async function fetchLossReasons(): Promise<LossReason[]> {
  const { data } = await api.get<LossReason[]>("/api/v1/leads/loss-reasons/");
  return data;
}

// ── Reference data admin — Admin only (FLOWS.md "Configure the pickers") ────
//
// `.list()`/`.remove()` from `createResourceApi` deliberately unused: the list
// response here is a bare array, not the shell's `{data, meta}` envelope
// (`toListResponse` doesn't apply), and there's no delete — only `.create`/
// `.update` map onto this endpoint's real shape.

function createReferenceEntryAdminApi(basePath: string) {
  const resource = createResourceApi<
    ReferenceEntry,
    ReferenceEntryCreatePayload,
    ReferenceEntryUpdatePayload
  >({ client: api, basePath });

  return {
    /** `?include_inactive=true` — only this admin view ever passes it. */
    fetchAll: async (): Promise<ReferenceEntry[]> => {
      const { data } = await api.get<ReferenceEntry[]>(`${basePath}/`, {
        params: { include_inactive: true },
      });
      return data;
    },
    create: resource.create,
    update: resource.update,
  };
}

const leadSourceAdminApi = createReferenceEntryAdminApi(
  "/api/v1/leads/sources",
);
const lossReasonAdminApi = createReferenceEntryAdminApi(
  "/api/v1/leads/loss-reasons",
);

export const fetchAllLeadSources = leadSourceAdminApi.fetchAll;
export const createLeadSource = leadSourceAdminApi.create;
export const updateLeadSource = leadSourceAdminApi.update;

export const fetchAllLossReasons = lossReasonAdminApi.fetchAll;
export const createLossReason = lossReasonAdminApi.create;
export const updateLossReason = lossReasonAdminApi.update;

// ── Notes and history ────────────────────────────────────────────────────────
//
// Nested under a lead id rather than their own base path, so these don't fit
// `createResourceApi`'s single-basePath shape — hand-rolled, but reusing the
// primitive's `ResourceListResponse` for the `meta.count → total` remap instead
// of re-declaring an identical local type.

/**
 * `GET /api/v1/leads/<id>/notes/` — one page of one category (`general` |
 * `visit`), in the requested `ordering`. `meta.counts` carries BOTH tabs'
 * live-note counts on every response, so one request feeds both badges.
 * Readable on any lead in scope, converted included.
 */
export async function fetchLeadNotes(
  id: string,
  { category, ordering, page, pageSize }: NotesListParams,
): Promise<NotesListResult<LeadNote>> {
  const { data } = await api.get<{
    data: LeadNote[];
    meta: { count?: number; counts?: Partial<Record<string, number>> };
  }>(`/api/v1/leads/${id}/notes/`, {
    params: { category, ordering, page, page_size: pageSize },
  });
  return toNotesListResult(data);
}

/**
 * `POST /api/v1/leads/<id>/notes/` — `noted_at` omitted = now. 409
 * `LEADS_LEAD_ALREADY_CONVERTED` / `LEADS_LEAD_DELETED` once the lead is
 * converted or deleted (notes are read-only then).
 */
export async function createLeadNote(
  id: string,
  body: NoteCreatePayload,
): Promise<LeadNote> {
  const { data } = await api.post<LeadNote>(`/api/v1/leads/${id}/notes/`, body);
  return data;
}

/** `PATCH /api/v1/leads/<id>/notes/<note_id>/` — the note's author or an Admin. */
export async function updateLeadNote(
  id: string,
  noteId: string,
  body: NoteUpdatePayload,
): Promise<LeadNote> {
  const { data } = await api.patch<LeadNote>(
    `/api/v1/leads/${id}/notes/${noteId}/`,
    body,
  );
  return data;
}

/** `DELETE /api/v1/leads/<id>/notes/<note_id>/` — soft; `lead_note_deleted` stays in history. */
export async function deleteLeadNote(
  id: string,
  noteId: string,
): Promise<void> {
  await api.delete(`/api/v1/leads/${id}/notes/${noteId}/`);
}

/**
 * `GET /api/v1/leads/<id>/history/` — paginated, newest-first, backed by the
 * central audit log. The drawer requests a generous single page (`pageSize`,
 * default 100) and discloses truncation when `meta.total` exceeds it.
 */
export async function fetchLeadHistory(
  id: string,
  pageSize = 100,
): Promise<ResourceListResponse<HistoryEntry>> {
  const { data } = await api.get<{
    data: HistoryEntry[];
    meta: { count: number } & Record<string, unknown>;
  }>(`/api/v1/leads/${id}/history/`, {
    params: { page: 1, page_size: pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

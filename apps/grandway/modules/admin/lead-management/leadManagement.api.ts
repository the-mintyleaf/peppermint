import { createResourceApi } from "@peppermint/admin";
import type { ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  FollowUpPayload,
  Lead,
  LeadCreatePayload,
  LeadDetail,
  LeadNote,
  LeadNoteCreatePayload,
  LeadSource,
  LeadUpdatePayload,
  LossReason,
  MarkLostPayload,
  ReopenPayload,
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

// ── Aggregated fetch for the categorized board ──────────────────────────────
//
// `GET /leads/` only supports single-value filters — there's no server-side
// "stage in [...]" or "needs attention" concept, so accurate, mutually-exclusive
// category tabs require the caller's whole in-scope set in memory. Capped so a
// caller with an unexpectedly large lead volume gets a disclosure banner
// (`meta.capped`) instead of a silent partial view.

const AGGREGATE_PAGE_SIZE = 100;
const AGGREGATE_PAGE_CAP = 10;

export interface FetchAllLeadsParams {
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

/** Loops `GET /api/v1/leads/` at `page_size=100` until exhausted or capped at 1000 leads. */
export async function fetchAllLeads(
  params: FetchAllLeadsParams = {},
): Promise<FetchAllLeadsResult> {
  const collected: Lead[] = [];
  let page = 1;
  let total = 0;
  let capped = false;

  while (page <= AGGREGATE_PAGE_CAP) {
    const { data } = await api.get<LeadListPage>("/api/v1/leads/", {
      params: {
        page,
        page_size: AGGREGATE_PAGE_SIZE,
        ...(params.fiscalYear ? { fiscal_year: params.fiscalYear } : {}),
      },
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

// ── Reference data (read-only in this module — no admin source/reason management UI) ──

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

// ── Notes and history ────────────────────────────────────────────────────────
//
// Nested under a lead id rather than their own base path, so these don't fit
// `createResourceApi`'s single-basePath shape — hand-rolled, but reusing the
// primitive's `ResourceListResponse` for the `meta.count → total` remap instead
// of re-declaring an identical local type.

/**
 * `GET /api/v1/leads/<id>/notes/` — paginated, newest-first. The detail
 * drawer shows recent activity, not a full paginated history browser, so
 * this requests a generous single page (`pageSize`, default 100) rather than
 * the backend's own default of 20 — a lead with more notes than that is an
 * edge case this view doesn't yet handle, not a silent one (the panel shows
 * a "showing the N most recent" disclosure when `meta.total` exceeds it).
 */
export async function fetchLeadNotes(
  id: string,
  pageSize = 100,
): Promise<ResourceListResponse<LeadNote>> {
  const { data } = await api.get<{
    data: LeadNote[];
    meta: { count: number } & Record<string, unknown>;
  }>(`/api/v1/leads/${id}/notes/`, {
    params: { page: 1, page_size: pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

/** `POST /api/v1/leads/<id>/notes/` — append-only, no edit/delete. */
export async function createLeadNote(
  id: string,
  body: LeadNoteCreatePayload,
): Promise<LeadNote> {
  const { data } = await api.post<LeadNote>(`/api/v1/leads/${id}/notes/`, body);
  return data;
}

/**
 * `GET /api/v1/leads/<id>/history/` — paginated, newest-first, backed by the
 * central audit log. Same generous-single-page approach as `fetchLeadNotes`.
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

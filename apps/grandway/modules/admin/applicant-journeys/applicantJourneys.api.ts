import { createResourceApi } from "@peppermint/admin";
import type { QueryParams, ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  ApplicantJourneyDetail,
  HistoryEntry,
  JourneyClosePayload,
  JourneyCreatePayload,
  JourneyDeferPayload,
  JourneyReopenPayload,
  JourneyStageChangePayload,
  JourneyUpdatePayload,
} from "./applicantJourneys.types";

/**
 * `GET /journeys/` supports exactly `applicant`/`stage`/`target_country`/
 * `fiscal_year` plus pagination (INTEGRATION.md §3) — no free-text search, no
 * client-choosable ordering ("Newest first always"). `toServerParams`
 * therefore never forwards `search`/`sort`, same convention as
 * `audit/_shared/audit.api.ts`'s `fetchAuditEvents` — so a user typing in the
 * shell's search box has no effect rather than silently mis-filtering or
 * risking an unexpected 400 from an unrecognised query param.
 */
function toJourneyServerParams(params: QueryParams): Record<string, unknown> {
  return { ...params.filters, page: params.page, page_size: params.pageSize };
}

const journeyResource = createResourceApi<
  ApplicantJourneyDetail,
  JourneyCreatePayload,
  JourneyUpdatePayload
>({
  client: api,
  basePath: "/api/v1/journeys",
  toServerParams: toJourneyServerParams,
});

/**
 * `GET /api/v1/journeys/` — server-side pagination/filters. Rows are really
 * the trimmed list shape (INTEGRATION.md §4), but `journeyResource` is typed
 * against the richer detail shape (needed for `get`/`create`/`update`/
 * `action`, all of which return it) — `ApplicantJourneyDetail extends
 * ApplicantJourney`, so this is still a safe fit for any consumer that only
 * reads list-shape fields, same accepted looseness `applicants.api.ts`'s
 * `listApplicants` uses.
 */
export const listJourneys = journeyResource.list;

/** `GET /api/v1/journeys/<id>/` — always a genuine 404, journeys are shared like applicants. */
export const getJourney = journeyResource.get;

/** `POST /api/v1/journeys/` — `stage` isn't part of the payload type, so it can never be sent; always starts `planning`. */
export const createJourney = journeyResource.create;

/** `PATCH /api/v1/journeys/<id>/` — `applicant` immutable, dropped from the payload type entirely. */
export const updateJourney = journeyResource.update;

/** `POST /api/v1/journeys/<id>/stage/` — 6 selectable stages only. */
export function changeJourneyStage(
  id: string,
  body: JourneyStageChangePayload,
) {
  return journeyResource.action<ApplicantJourneyDetail>(id, "stage", body);
}

/** `POST /api/v1/journeys/<id>/defer/` — not an outcome; `stage` becomes `deferred`, `outcome` stays empty. */
export function deferJourney(id: string, body: JourneyDeferPayload) {
  return journeyResource.action<ApplicantJourneyDetail>(id, "defer", body);
}

/** `POST /api/v1/journeys/<id>/close/` — `outcome` required; `successful` → `completed`, anything else → `closed`. */
export function closeJourney(id: string, body: JourneyClosePayload) {
  return journeyResource.action<ApplicantJourneyDetail>(id, "close", body);
}

/** `POST /api/v1/journeys/<id>/reopen/` — the only way back from any terminal/deferred state. */
export function reopenJourney(id: string, body: JourneyReopenPayload = {}) {
  return journeyResource.action<ApplicantJourneyDetail>(id, "reopen", body);
}

// ── History (backed by the central audit log) ───────────────────────────────
//
// Nested under a journey id rather than its own base path, so it doesn't fit
// `createResourceApi`'s single-basePath shape — hand-rolled, reusing the
// primitive's `ResourceListResponse` for the `meta.count → total` remap, same
// pattern as `leadManagement.api.ts`'s `fetchLeadHistory`.

/**
 * `GET /api/v1/journeys/<id>/history/` — paginated, newest-first. Requests a
 * generous single page rather than the backend's own default of 20 — a
 * journey with more history than that is an edge case this view doesn't yet
 * handle, not a silent one (the History panel shows a "showing the N most
 * recent" disclosure when `meta.total` exceeds it).
 */
export async function fetchJourneyHistory(
  id: string,
  pageSize = 100,
): Promise<ResourceListResponse<HistoryEntry>> {
  const { data } = await api.get<{
    data: HistoryEntry[];
    meta: { count: number } & Record<string, unknown>;
  }>(`/api/v1/journeys/${id}/history/`, {
    params: { page: 1, page_size: pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

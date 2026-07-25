import { createResourceApi } from "@peppermint/admin";
import type { QueryParams, ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  Condition,
  ConditionCreatePayload,
  ConditionStatusPayload,
  ConditionUpdatePayload,
  HistoryEntry,
  OfferCreatePayload,
  OfferDecisionPayload,
  OfferDetail,
  OfferUpdatePayload,
} from "./offers.types";

const OFFERS = "/api/v1/offers";

/**
 * `GET /offers/` supports `journey`/`applicant`/`institution`/`program`/
 * `status`/`offer_type`/`intake`/`deadline_before`/`fiscal_year` plus
 * pagination — NO text search and NO client-choosable ordering (server-fixed,
 * newest first, §3). So `search`/`sort` are never forwarded. Two column-filter
 * accessors are remapped to their server param names: the Intake column's
 * `intake_label` → `intake` (substring), and the Response deadline column's
 * `response_deadline` → `deadline_before`. Everything else passes straight
 * through (accessors already match the server params).
 */
function toOfferServerParams(params: QueryParams): Record<string, unknown> {
  const { intake_label, response_deadline, ...rest } = params.filters ?? {};
  return {
    ...rest,
    ...(intake_label ? { intake: intake_label } : {}),
    ...(response_deadline ? { deadline_before: response_deadline } : {}),
    page: params.page,
    page_size: params.pageSize,
  };
}

const offerResource = createResourceApi<
  OfferDetail,
  OfferCreatePayload,
  OfferUpdatePayload
>({
  client: api,
  basePath: OFFERS,
  toServerParams: toOfferServerParams,
});

/**
 * `GET /api/v1/offers/` — rows are really the trimmed list shape, but the
 * resource is typed against the richer `OfferDetail` (needed by
 * `get`/`create`/`update`/`action`); `OfferDetail extends Offer`, so any
 * list-shape consumer is still a safe fit (same accepted looseness as
 * `applicantJourneys.api.ts`'s `listJourneys`).
 */
export const listOffers = offerResource.list;

/** `GET /api/v1/offers/<id>/` — detail shape with `conditions` nested. 404 is always genuine. */
export const getOffer = offerResource.get;

/** `POST /api/v1/offers/` — 201. `reference_source` is derived, never in the payload type. */
export const createOffer = offerResource.create;

/** `PATCH /api/v1/offers/<id>/` — mutable subset only; immutable fields are absent from the payload type. */
export const updateOffer = offerResource.update;

/** `POST /api/v1/offers/<id>/issue/` — empty body; requires status `draft`. Returns the detail shape. */
export function issueOffer(id: string) {
  return offerResource.action<OfferDetail>(id, "issue", {});
}

/** `POST /api/v1/offers/<id>/decision/` — final, no reopen; requires `draft`/`issued`. Returns the detail shape. */
export function recordOfferDecision(id: string, body: OfferDecisionPayload) {
  return offerResource.action<OfferDetail>(id, "decision", body);
}

// ── History (backed by the central audit log) ───────────────────────────────
//
// Nested under an offer id, so it doesn't fit `createResourceApi`'s single
// base path — hand-rolled, reusing `ResourceListResponse` for the
// `meta.count → total` remap (same pattern as `applicantJourneys.api.ts`).

/**
 * `GET /api/v1/offers/<id>/history/` — paginated, newest-first, includes
 * condition events (`metadata.condition_id`). Never empty for an existing
 * offer. Requests a generous single page; the panel discloses when there are
 * more than fit.
 */
export async function fetchOfferHistory(
  id: string,
  pageSize = 100,
): Promise<ResourceListResponse<HistoryEntry>> {
  const { data } = await api.get<{
    data: HistoryEntry[];
    meta: { count: number } & Record<string, unknown>;
  }>(`${OFFERS}/${id}/history/`, {
    params: { page: 1, page_size: pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

// ── Conditions ───────────────────────────────────────────────────────────────
//
// Create is NESTED under an offer id; update/status are UN-NESTED by condition
// id (`/offers/conditions/<id>/`). Conditions are already nested in the offer
// detail, so the list endpoint isn't needed to render Offer Detail.

/** `POST /api/v1/offers/<offer_id>/conditions/` — 201. Allowed even on a decided offer. */
export async function createCondition(
  offerId: string,
  body: ConditionCreatePayload,
): Promise<Condition> {
  const { data } = await api.post<Condition>(
    `${OFFERS}/${offerId}/conditions/`,
    body,
  );
  return data;
}

/** `PATCH /api/v1/offers/conditions/<condition_id>/` — un-nested; wording only, NOT status. */
export async function updateCondition(
  conditionId: string,
  body: ConditionUpdatePayload,
): Promise<Condition> {
  const { data } = await api.patch<Condition>(
    `${OFFERS}/conditions/${conditionId}/`,
    body,
  );
  return data;
}

/**
 * `POST /api/v1/offers/conditions/<condition_id>/status/` — the tick/waive
 * control. The response is the condition alone; it flips the offer's
 * `has_open_conditions` but does NOT return it, so callers must refetch the
 * offer detail after this (see `offers.hooks.ts`).
 */
export async function changeConditionStatus(
  conditionId: string,
  body: ConditionStatusPayload,
): Promise<Condition> {
  const { data } = await api.post<Condition>(
    `${OFFERS}/conditions/${conditionId}/status/`,
    body,
  );
  return data;
}

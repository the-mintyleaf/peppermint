"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import {
  changeConditionStatus,
  createCondition,
  fetchOfferHistory,
  getOffer,
  issueOffer,
  recordOfferDecision,
  updateCondition,
} from "./offers.api";
import {
  offerConditionsKey,
  offerHistoryKey,
  offerQueryKeys,
} from "./offers.queryKeys";
import type {
  Condition,
  ConditionCreatePayload,
  ConditionStatusPayload,
  ConditionUpdatePayload,
  OfferDecisionPayload,
  OfferDetail,
} from "./offers.types";

/** Full detail for the detail page — always the real fetch, never the trimmed list row. */
export function useOfferDetail(offerId: string | null) {
  return useQuery({
    queryKey: offerId
      ? offerQueryKeys.detail(offerId)
      : ["offers.offers", "detail", "none"],
    queryFn: () => getOffer(offerId as string),
    enabled: offerId !== null,
  });
}

export function useOfferHistory(offerId: string | null) {
  return useQuery({
    queryKey: offerId
      ? offerHistoryKey(offerId)
      : ["offers.offers", "detail", "none", "history"],
    queryFn: () => fetchOfferHistory(offerId as string),
    enabled: offerId !== null,
  });
}

/**
 * Every mutation invalidates the worklist list (so `status`/overdue/open-
 * conditions flags refresh) and this offer's own detail. `offerHistoryKey(id)`
 * and `offerConditionsKey(id)` are both `[...detail(id), …]`, so `detail(id)`
 * is a strict prefix — invalidating it alone refreshes an open History or
 * Conditions view too (same reasoning as `applicantJourneys.hooks.ts`).
 */
function invalidateKeysFor(offerId: string) {
  return [offerQueryKeys.lists(), offerQueryKeys.detail(offerId)];
}

/** `POST /issue/` — draft → issued. Returns the fresh detail shape. */
export function useIssueOffer(offerId: string) {
  return useAppMutation<OfferDetail, void>({
    mutationFn: () => issueOffer(offerId),
    successMessage: "Offer issued.",
    errorTitle: "Couldn't issue offer",
    invalidateKeys: invalidateKeysFor(offerId),
  });
}

/** `POST /decision/` — final, no reopen. 409 `OFFERS_ACCEPTED_OFFER_EXISTS` surfaces via the notification. */
export function useRecordOfferDecision(offerId: string) {
  return useAppMutation<OfferDetail, OfferDecisionPayload>({
    mutationFn: (body) => recordOfferDecision(offerId, body),
    successMessage: "Decision recorded.",
    errorTitle: "Couldn't record decision",
    invalidateKeys: invalidateKeysFor(offerId),
  });
}

/** `POST /<offer_id>/conditions/` — nested create. Allowed even on a decided offer. */
export function useCreateCondition(offerId: string) {
  return useAppMutation<Condition, ConditionCreatePayload>({
    mutationFn: (body) => createCondition(offerId, body),
    successMessage: "Condition added.",
    errorTitle: "Couldn't add condition",
    invalidateKeys: invalidateKeysFor(offerId),
  });
}

/** `PATCH /conditions/<id>/` — wording only. `id` travels with the mutate call (a list of conditions renders these). */
export function useUpdateCondition(offerId: string) {
  return useAppMutation<
    Condition,
    { conditionId: string; body: ConditionUpdatePayload }
  >({
    mutationFn: ({ conditionId, body }) => updateCondition(conditionId, body),
    successMessage: "Condition updated.",
    errorTitle: "Couldn't update condition",
    invalidateKeys: invalidateKeysFor(offerId),
  });
}

/**
 * `POST /conditions/<id>/status/` — the tick/waive control. The endpoint does
 * NOT return the offer's `has_open_conditions`, so the offer detail MUST be
 * refetched afterwards; `invalidateKeysFor` invalidates `detail(offerId)` (and
 * `lists()`), which does exactly that.
 */
export function useChangeConditionStatus(offerId: string) {
  return useAppMutation<
    Condition,
    { conditionId: string; body: ConditionStatusPayload }
  >({
    mutationFn: ({ conditionId, body }) =>
      changeConditionStatus(conditionId, body),
    successMessage: "Condition status updated.",
    errorTitle: "Couldn't update condition status",
    invalidateKeys: [
      offerQueryKeys.lists(),
      offerQueryKeys.detail(offerId),
      offerConditionsKey(offerId),
    ],
  });
}

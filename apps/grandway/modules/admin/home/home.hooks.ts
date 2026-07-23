"use client";

import { useApplicantList } from "@/modules/admin/applicants";
import { useJourneyList } from "@/modules/admin/applicant-journeys";
import type { ApplicantStatus } from "@/modules/admin/applicants/applicants.types";

/**
 * No backend aggregate/count endpoint exists for either domain (same gap as
 * `leads` — see `docs/backend/{applicants,applicant-journeys}/INTEGRATION.md`
 * "Gaps"), so each count is its own `pageSize: 1` request reading `meta.total`
 * rather than a real page of rows — cheap, and avoids pulling full applicant/
 * journey lists into memory just to count them client-side.
 */
function useCountByApplicantStatus(status: ApplicantStatus) {
  const { data, isLoading, isError } = useApplicantList({
    page: 1,
    pageSize: 1,
    search: "",
    sort: [],
    filters: { status },
  });
  return { count: data?.meta.total ?? 0, isLoading, isError };
}

/**
 * Offer Stage and Visa Stage only — not a full 9-stage breakdown. These two
 * are the time-sensitive "needs attention" stages (`docs/backend/
 * applicant-journeys/CONCEPT.md`'s "operational worklist" framing); a tile
 * per stage would be a wall of tiles, not a signal board (`DESIGN.md` Part
 * 5C).
 */
function useCountByJourneyStage(stage: "offer_stage" | "visa_stage") {
  const { data, isLoading, isError } = useJourneyList({
    page: 1,
    pageSize: 1,
    search: "",
    sort: [],
    filters: { stage },
  });
  return { count: data?.meta.total ?? 0, isLoading, isError };
}

/**
 * Each returned value carries its own `isLoading`/`isError` — callers
 * (`StatTile` per tile) must not collapse these into one combined flag, or
 * one query's still-loading state masks a sibling's already-resolved error.
 */
export function useApplicantStatusCounts() {
  return {
    active: useCountByApplicantStatus("active"),
    dormant: useCountByApplicantStatus("dormant"),
    archived: useCountByApplicantStatus("archived"),
  };
}

export function useJourneyAttentionCounts() {
  return {
    offerStage: useCountByJourneyStage("offer_stage"),
    visaStage: useCountByJourneyStage("visa_stage"),
  };
}

/** Last 5 created applicants — the list endpoint is already newest-first. */
export function useRecentApplicants() {
  const { data, isLoading, isError, isRefetching, refetch } = useApplicantList({
    page: 1,
    pageSize: 5,
    search: "",
    sort: [],
    filters: {},
  });
  return {
    applicants: data?.data ?? [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  };
}

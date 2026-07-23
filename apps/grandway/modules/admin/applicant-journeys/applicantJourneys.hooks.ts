"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import {
  changeJourneyStage,
  closeJourney,
  createJourney,
  deferJourney,
  fetchJourneyHistory,
  getJourney,
  listJourneys,
  reopenJourney,
  updateJourney,
} from "./applicantJourneys.api";
import {
  journeyHistoryKey,
  journeyQueryKeys,
} from "./applicantJourneys.queryKeys";
import type {
  ApplicantJourneyDetail,
  JourneyClosePayload,
  JourneyCreatePayload,
  JourneyDeferPayload,
  JourneyReopenPayload,
  JourneyStageChangePayload,
  JourneyUpdatePayload,
} from "./applicantJourneys.types";

/**
 * Standalone paginated fetch over `GET /journeys/` — independent of the
 * worklist's own `ModalTableShell` wiring, so any other consumer can just
 * ask for a filtered page of journeys. Exported from the module barrel for
 * exactly that reason: `ApplicantJourneysPanel` (in the `applicants` module's
 * detail page) calls this with `{ filters: { applicant: id } }` rather than
 * re-deriving the fetch (`docs/backend/applicant-journeys/FLOWS.md` "Record a
 * new study objective" — the per-person view is the primary entry point).
 */
export function useJourneyList(params?: QueryParams) {
  return useQuery({
    queryKey: journeyQueryKeys.list(params),
    queryFn: () => listJourneys(params),
  });
}

/** Full detail for the detail page and the edit form's prefill — always the real fetch. */
export function useJourneyDetail(journeyId: string | null) {
  return useQuery({
    queryKey: journeyId
      ? journeyQueryKeys.detail(journeyId)
      : ["applicant-journeys.journeys", "detail", "none"],
    queryFn: () => getJourney(journeyId as string),
    enabled: journeyId !== null,
  });
}

export function useJourneyHistory(journeyId: string | null) {
  return useQuery({
    queryKey: journeyId
      ? journeyHistoryKey(journeyId)
      : ["applicant-journeys.journeys", "detail", "none", "history"],
    queryFn: () => fetchJourneyHistory(journeyId as string),
    enabled: journeyId !== null,
  });
}

/**
 * Every lifecycle mutation invalidates the worklist's list (so filtered
 * views/pagination refresh) and this journey's own detail query.
 * `journeyHistoryKey(id)` is `[...detail(id), "history"]`, so `detail(id)` is
 * a strict prefix — invalidating it alone already refreshes an open History
 * panel too (same reasoning as `leadManagement.hooks.ts`).
 */
function invalidateKeysFor(journeyId: string) {
  return [journeyQueryKeys.lists(), journeyQueryKeys.detail(journeyId)];
}

export function useChangeJourneyStage(journeyId: string) {
  return useAppMutation<unknown, JourneyStageChangePayload>({
    mutationFn: (body) => changeJourneyStage(journeyId, body),
    successMessage: "Stage updated.",
    errorTitle: "Couldn't update stage",
    invalidateKeys: invalidateKeysFor(journeyId),
  });
}

export function useDeferJourney(journeyId: string) {
  return useAppMutation<unknown, JourneyDeferPayload>({
    mutationFn: (body) => deferJourney(journeyId, body),
    successMessage: "Journey deferred.",
    errorTitle: "Couldn't defer journey",
    invalidateKeys: invalidateKeysFor(journeyId),
  });
}

export function useCloseJourney(journeyId: string) {
  return useAppMutation<unknown, JourneyClosePayload>({
    mutationFn: (body) => closeJourney(journeyId, body),
    successMessage: "Journey closed.",
    errorTitle: "Couldn't close journey",
    invalidateKeys: invalidateKeysFor(journeyId),
  });
}

export function useReopenJourney(journeyId: string) {
  return useAppMutation<unknown, JourneyReopenPayload>({
    mutationFn: (body) => reopenJourney(journeyId, body),
    successMessage: "Journey reopened.",
    errorTitle: "Couldn't reopen journey",
    invalidateKeys: invalidateKeysFor(journeyId),
  });
}

/**
 * Not used by this module's own `JourneyWorklist` — its `ModalTableShell`
 * calls `createJourney`/`updateJourney` directly (the shell owns its own
 * create/edit mutation + notification, same pattern `LeadManagementBoard`
 * uses). Used by `ApplicantJourneysPanel`'s own "New journey" affordance,
 * which opens a plain `Modal` outside any table shell.
 */
export function useCreateJourney() {
  return useAppMutation<ApplicantJourneyDetail, JourneyCreatePayload>({
    mutationFn: (body) => createJourney(body),
    successMessage: "Journey created.",
    errorTitle: "Couldn't create journey",
    invalidateKeys: [journeyQueryKeys.lists()],
  });
}

export function useUpdateJourney(journeyId: string) {
  return useAppMutation<ApplicantJourneyDetail, JourneyUpdatePayload>({
    mutationFn: (body) => updateJourney(journeyId, body),
    successMessage: "Journey updated.",
    errorTitle: "Couldn't update journey",
    invalidateKeys: invalidateKeysFor(journeyId),
  });
}

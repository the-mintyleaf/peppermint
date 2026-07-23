"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import {
  changeApplicantStatus,
  createApplicant,
  fetchApplicantHistory,
  getApplicant,
  listApplicants,
  updateApplicant,
} from "./applicants.api";
import {
  applicantHistoryKey,
  applicantsQueryKeys,
} from "./applicants.queryKeys";
import type {
  ApplicantCreatePayload,
  ApplicantDetail,
  ApplicantUpdatePayload,
  StatusChangePayload,
} from "./applicants.types";

/**
 * Backs the list page's `DataTableShell` (server-side pagination/filter/
 * search) and any other consumer needing a plain applicant list/search —
 * `enabled` lets a picker skip firing on an empty/too-short search term.
 */
export function useApplicantList(params?: QueryParams, enabled = true) {
  return useQuery({
    queryKey: applicantsQueryKeys.list(params),
    queryFn: () => listApplicants(params),
    enabled,
  });
}

/** Full detail for the detail page and the edit form's prefill — always the real fetch. */
export function useApplicantDetail(applicantId: string | null) {
  return useQuery({
    queryKey: applicantId
      ? applicantsQueryKeys.detail(applicantId)
      : ["applicants", "detail", "none"],
    queryFn: () => getApplicant(applicantId as string),
    enabled: applicantId !== null,
  });
}

export function useApplicantHistory(applicantId: string | null) {
  return useQuery({
    queryKey: applicantId
      ? applicantHistoryKey(applicantId)
      : ["applicants", "detail", "none", "history"],
    queryFn: () => fetchApplicantHistory(applicantId as string),
    enabled: applicantId !== null,
  });
}

/**
 * Every mutation invalidates the list (so the table refreshes) and this
 * applicant's own detail query. `applicantHistoryKey(id)` is `[...detail(id),
 * "history"]`, so `detail(id)` is a strict prefix — invalidating it alone
 * already refreshes an open History tab too.
 */
function invalidateKeysFor(applicantId: string) {
  return [applicantsQueryKeys.lists(), applicantsQueryKeys.detail(applicantId)];
}

export function useCreateApplicant() {
  return useAppMutation<ApplicantDetail, ApplicantCreatePayload>({
    mutationFn: (body) => createApplicant(body),
    successMessage: "Applicant created.",
    errorTitle: "Couldn't create applicant",
    invalidateKeys: [applicantsQueryKeys.lists()],
  });
}

export function useUpdateApplicant(applicantId: string) {
  return useAppMutation<ApplicantDetail, ApplicantUpdatePayload>({
    mutationFn: (body) => updateApplicant(applicantId, body),
    successMessage: "Applicant updated.",
    errorTitle: "Couldn't update applicant",
    invalidateKeys: invalidateKeysFor(applicantId),
  });
}

export function useChangeApplicantStatus(applicantId: string) {
  return useAppMutation<ApplicantDetail, StatusChangePayload>({
    mutationFn: (body) => changeApplicantStatus(applicantId, body),
    successMessage: "Status updated.",
    errorTitle: "Couldn't update status",
    invalidateKeys: invalidateKeysFor(applicantId),
  });
}

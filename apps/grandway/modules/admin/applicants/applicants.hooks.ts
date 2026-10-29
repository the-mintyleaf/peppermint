"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import type { NotesAdapter } from "@/components/notes-panel";
import { getApiError } from "@/lib/authErrorMessages";
import {
  assignApplicant,
  changeApplicantStatus,
  createApplicant,
  createApplicantNote,
  deleteApplicantNote,
  fetchApplicantHistory,
  fetchAssignableStaff,
  getApplicant,
  listApplicantNotes,
  listApplicants,
  restoreApplicant,
  updateApplicant,
  updateApplicantNote,
} from "./applicants.api";
import {
  applicantHistoryKey,
  applicantNotesKey,
  applicantsQueryKeys,
  assignableStaffKey,
} from "./applicants.queryKeys";
import type {
  ApplicantCreatePayload,
  ApplicantDetail,
  ApplicantNote,
  ApplicantUpdatePayload,
  AssignPayload,
  RestorePayload,
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
 * applicant's own detail query. `applicantHistoryKey(id)` and
 * `applicantNotesKey(id)` are both `[...detail(id), …]`, so `detail(id)` is a
 * strict prefix — invalidating it alone already refreshes an open History or
 * Notes tab too.
 */
function invalidateKeysFor(applicantId: string) {
  return [applicantsQueryKeys.lists(), applicantsQueryKeys.detail(applicantId)];
}

/**
 * A 409 on an action means the record moved under us (archived or restored in
 * another tab). Refetch so the controls follow the real state — the error
 * toast has already said what happened.
 */
function useRefetchOnConflict(applicantId: string) {
  const queryClient = useQueryClient();
  return (error: unknown) => {
    const { code } = getApiError(error);
    if (
      code === "APPLICANTS_APPLICANT_ARCHIVED" ||
      code === "APPLICANTS_APPLICANT_NOT_ARCHIVED" ||
      code === "APPLICANTS_ASSIGNMENT_FORBIDDEN"
    ) {
      invalidateKeysFor(applicantId).forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    }
  };
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
  const onError = useRefetchOnConflict(applicantId);
  return useAppMutation<ApplicantDetail, StatusChangePayload>({
    mutationFn: (body) => changeApplicantStatus(applicantId, body),
    successMessage: (data) =>
      data.status === "archived" ? "Applicant archived." : "Status updated.",
    errorTitle: "Couldn't update status",
    invalidateKeys: invalidateKeysFor(applicantId),
    onError,
  });
}

/** Admin only — the UI hides the lever for everyone else (403 otherwise). */
export function useRestoreApplicant(applicantId: string) {
  const onError = useRefetchOnConflict(applicantId);
  return useAppMutation<ApplicantDetail, RestorePayload>({
    mutationFn: (body) => restoreApplicant(applicantId, body),
    successMessage: (data) =>
      `Applicant restored — back to ${data.status === "dormant" ? "Dormant" : "Active"}.`,
    errorTitle: "Couldn't restore applicant",
    invalidateKeys: invalidateKeysFor(applicantId),
    onError,
  });
}

export function useAssignApplicant(applicantId: string) {
  const onError = useRefetchOnConflict(applicantId);
  return useAppMutation<ApplicantDetail, AssignPayload>({
    mutationFn: (body) => assignApplicant(applicantId, body),
    successMessage: (data) =>
      data.assigned_to
        ? `Assigned to ${data.assigned_to.display_name || data.assigned_to.username}.`
        : "Assignment cleared.",
    errorTitle: "Couldn't change the assignment",
    invalidateKeys: invalidateKeysFor(applicantId),
    onError,
  });
}

/**
 * The Admin's assignee picker list (active accounts from `GET /auth/users/` —
 * Lead Managers only; see `fetchAssignableStaff`). `enabled` keeps a Lead
 * Manager, who cannot list accounts, from ever firing it.
 */
export function useAssignableStaff(enabled: boolean) {
  return useQuery({
    queryKey: assignableStaffKey,
    queryFn: fetchAssignableStaff,
    enabled,
    staleTime: 5 * 60_000,
  });
}

/**
 * The `NotesPanel` adapter for one applicant — every call already bound to
 * the id. Memoised on the id so the panel's query/mutation hooks see a stable
 * object. A note write also invalidates History (it appends an event there).
 */
export function useApplicantNotesAdapter(
  applicantId: string,
): NotesAdapter<ApplicantNote> {
  return useMemo(
    () => ({
      queryKey: applicantNotesKey(applicantId),
      list: (params) => listApplicantNotes(applicantId, params),
      create: (payload) => createApplicantNote(applicantId, payload),
      update: (noteId, payload) =>
        updateApplicantNote(applicantId, noteId, payload),
      remove: (noteId) => deleteApplicantNote(applicantId, noteId),
      invalidateKeys: [applicantHistoryKey(applicantId)],
    }),
    [applicantId],
  );
}

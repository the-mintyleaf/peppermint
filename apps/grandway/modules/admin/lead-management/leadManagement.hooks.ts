"use client";

import { useMemo } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import {
  changeLeadStage,
  convertLead,
  createLeadNote,
  createLeadSource,
  createLossReason,
  fetchAllLeads,
  fetchAllLeadSources,
  fetchAllLossReasons,
  fetchLeadHistory,
  fetchLeadNotes,
  fetchLeadSources,
  fetchLossReasons,
  getLead,
  markLeadLost,
  recordLeadFollowUp,
  reopenLead,
  updateLeadSource,
  updateLossReason,
} from "./leadManagement.api";
import { emptyCategoryCounts, toLeadBoardRow } from "./leadCategory.utils";
import {
  leadHistoryKey,
  leadManagementQueryKeys,
  leadNotesKey,
  leadSourceQueryKeys,
  lossReasonQueryKeys,
} from "./leadManagement.queryKeys";
import type {
  ConvertLeadResponse,
  FollowUpPayload,
  LeadBoardRow,
  LeadCategory,
  LeadNoteCreatePayload,
  MarkLostPayload,
  ReferenceEntry,
  ReferenceEntryCreatePayload,
  ReferenceEntryUpdatePayload,
  ReopenPayload,
  StageChangePayload,
} from "./leadManagement.types";

export interface LeadBoardQueryResult {
  data: LeadBoardRow[];
  meta: { total: number; capped: boolean };
}

export interface UseLeadBoardDataResult {
  rows: LeadBoardRow[];
  counts: Record<LeadCategory, number>;
  total: number;
  capped: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * One query function shared between this hook's own `useQuery` (for tab
 * counts / the capped banner) and the `ModalTableShell`'s internal one, both
 * registered under the identical `boardQueryKey` returned below — React
 * Query dedupes same-key queries, but only safely when every observer
 * supplies the *same* queryFn, so the board passes this exact reference
 * straight through as `queryGetFn` rather than re-deriving its own.
 */
function makeLeadBoardQueryFn(
  fiscalYear: string | null,
): () => Promise<LeadBoardQueryResult> {
  return async () => {
    const { data, meta } = await fetchAllLeads({
      fiscalYear: fiscalYear ?? undefined,
    });
    const rows: LeadBoardRow[] = data.map((lead) => toLeadBoardRow(lead));
    return { data: rows, meta };
  };
}

/**
 * The single fetch behind the whole board — categorizes the caller's full
 * in-scope lead set once per fiscal-year scope. The board hands `queryFn`
 * straight to `ModalTableShell` as its `queryGetFn`, and the 4 category tabs
 * use the shell's own `tabs[].filter` mechanism — the same pattern already
 * used by Users/SecurityEvents lists elsewhere in the repo.
 */
export function useLeadBoardData(fiscalYear: string | null) {
  // No-fiscal-year is encoded by array *length*, not a sentinel string value
  // — a user typing "all" into the fiscal-year field must not collide with
  // the unscoped key and silently serve the wrong cached scope.
  const boardQueryKey = useMemo(
    () =>
      fiscalYear
        ? ([...leadManagementQueryKeys.lists(), fiscalYear] as const)
        : leadManagementQueryKeys.lists(),
    [fiscalYear],
  );
  const queryFn = useMemo(() => makeLeadBoardQueryFn(fiscalYear), [fiscalYear]);

  const query = useQuery({
    queryKey: boardQueryKey,
    queryFn,
    // Keep the previous fiscal year's rows/counts on screen while the next
    // scope loads, instead of counts flashing to zero and the capped banner
    // disappearing mid-fetch.
    placeholderData: keepPreviousData,
  });

  const counts = useMemo(() => {
    const acc = emptyCategoryCounts();
    for (const row of query.data?.data ?? []) {
      acc[row.category] += 1;
    }
    return acc;
  }, [query.data]);

  const result: UseLeadBoardDataResult = {
    rows: query.data?.data ?? [],
    counts,
    total: query.data?.meta.total ?? 0,
    capped: query.data?.meta.capped ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };

  return { ...result, boardQueryKey, queryFn };
}

/** Sources for the create/edit form picker and the in-shell source filter. Unpaginated, so no `list` params. */
export function useLeadSources() {
  return useQuery({
    queryKey: leadSourceQueryKeys.lists(),
    queryFn: fetchLeadSources,
  });
}

/** Loss reasons for the mark-lost dialog's picker. Unpaginated. */
export function useLossReasons() {
  return useQuery({
    queryKey: lossReasonQueryKeys.lists(),
    queryFn: fetchLossReasons,
  });
}

// ── Reference data admin (Admin only — the "Reference data" modal) ─────────
//
// A distinct cache entry from the picker query above (`.list({...})` vs
// `.lists()`) since this one includes retired entries — but `.lists()` is a
// prefix of `.list({...})`'s key, so every mutation below invalidating
// `.lists()` still refreshes both this view and the picker.

/** Admin management view — includes retired entries, unlike `useLeadSources`. */
export function useLeadSourcesAdmin() {
  return useQuery({
    queryKey: leadSourceQueryKeys.list({ includeInactive: true }),
    queryFn: fetchAllLeadSources,
  });
}

/** Admin management view — includes retired entries, unlike `useLossReasons`. */
export function useLossReasonsAdmin() {
  return useQuery({
    queryKey: lossReasonQueryKeys.list({ includeInactive: true }),
    queryFn: fetchAllLossReasons,
  });
}

export function useCreateLeadSource() {
  return useAppMutation<ReferenceEntry, ReferenceEntryCreatePayload>({
    mutationFn: createLeadSource,
    successMessage: "Lead source added.",
    errorTitle: "Couldn't add lead source",
    invalidateKeys: [leadSourceQueryKeys.lists()],
  });
}

/**
 * Unlike `useChangeLeadStage`/`useMarkLeadLost` (bound to one lead id at hook
 * call time — they mount inside a single-lead modal), this panel renders a
 * *list* of entries, so the id travels with the mutate call instead of being
 * bound at the hook call site.
 */
export function useUpdateLeadSource() {
  return useAppMutation<
    ReferenceEntry,
    { id: string; body: ReferenceEntryUpdatePayload }
  >({
    mutationFn: ({ id, body }) => updateLeadSource(id, body),
    successMessage: "Lead source updated.",
    errorTitle: "Couldn't update lead source",
    invalidateKeys: [leadSourceQueryKeys.lists()],
  });
}

/** Row-level retire/reactivate — separate from `useUpdateLeadSource` so the toast names the actual consequence. */
export function useSetLeadSourceActive() {
  return useAppMutation<ReferenceEntry, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) =>
      updateLeadSource(id, { is_active: isActive }),
    successMessage: (_data, { isActive }) =>
      isActive ? "Lead source reactivated." : "Lead source retired.",
    errorTitle: "Couldn't update lead source",
    invalidateKeys: [leadSourceQueryKeys.lists()],
  });
}

export function useCreateLossReason() {
  return useAppMutation<ReferenceEntry, ReferenceEntryCreatePayload>({
    mutationFn: createLossReason,
    successMessage: "Loss reason added.",
    errorTitle: "Couldn't add loss reason",
    invalidateKeys: [lossReasonQueryKeys.lists()],
  });
}

/** See `useUpdateLeadSource` — id travels with the mutate call, not bound at hook call time. */
export function useUpdateLossReason() {
  return useAppMutation<
    ReferenceEntry,
    { id: string; body: ReferenceEntryUpdatePayload }
  >({
    mutationFn: ({ id, body }) => updateLossReason(id, body),
    successMessage: "Loss reason updated.",
    errorTitle: "Couldn't update loss reason",
    invalidateKeys: [lossReasonQueryKeys.lists()],
  });
}

/** Row-level retire/reactivate — separate from `useUpdateLossReason` so the toast names the actual consequence. */
export function useSetLossReasonActive() {
  return useAppMutation<ReferenceEntry, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) =>
      updateLossReason(id, { is_active: isActive }),
    successMessage: (_data, { isActive }) =>
      isActive ? "Loss reason reactivated." : "Loss reason retired.",
    errorTitle: "Couldn't update loss reason",
    invalidateKeys: [lossReasonQueryKeys.lists()],
  });
}

/** Full detail for the detail drawer's Overview tab — always the real fetch, never the board's trimmed row. */
export function useLeadDetail(leadId: string | null) {
  return useQuery({
    queryKey: leadId
      ? leadManagementQueryKeys.detail(leadId)
      : ["lead-management.leads", "detail", "none"],
    queryFn: () => getLead(leadId as string),
    enabled: leadId !== null,
  });
}

export function useLeadNotes(leadId: string | null) {
  return useQuery({
    queryKey: leadId
      ? leadNotesKey(leadId)
      : ["lead-management.leads", "notes", "none"],
    queryFn: () => fetchLeadNotes(leadId as string),
    enabled: leadId !== null,
  });
}

export function useLeadHistory(leadId: string | null) {
  return useQuery({
    queryKey: leadId
      ? leadHistoryKey(leadId)
      : ["lead-management.leads", "history", "none"],
    queryFn: () => fetchLeadHistory(leadId as string),
    enabled: leadId !== null,
  });
}

/**
 * Every stage-affecting mutation invalidates the board's aggregate list (so
 * category tabs/counts refresh) and this lead's own detail query. `useQuery`
 * invalidation is prefix-based, and `leadNotesKey`/`leadHistoryKey` are both
 * `[...detail(id), "notes"|"history"]`, so `detail(id)` is a strict prefix of
 * both — invalidating `detail(id)` alone already refreshes an open
 * Notes/History tab too; listing those keys separately would be redundant.
 */
function invalidateKeysFor(leadId: string) {
  return [
    leadManagementQueryKeys.lists(),
    leadManagementQueryKeys.detail(leadId),
  ];
}

export function useChangeLeadStage(leadId: string) {
  return useAppMutation<unknown, StageChangePayload>({
    mutationFn: (body) => changeLeadStage(leadId, body),
    successMessage: "Stage updated.",
    errorTitle: "Couldn't update stage",
    invalidateKeys: invalidateKeysFor(leadId),
  });
}

export function useRecordLeadFollowUp(leadId: string) {
  return useAppMutation<unknown, FollowUpPayload>({
    mutationFn: (body) => recordLeadFollowUp(leadId, body),
    successMessage: "Follow-up recorded.",
    errorTitle: "Couldn't record follow-up",
    invalidateKeys: invalidateKeysFor(leadId),
  });
}

export function useMarkLeadLost(leadId: string) {
  return useAppMutation<unknown, MarkLostPayload>({
    mutationFn: (body) => markLeadLost(leadId, body),
    successMessage: "Lead marked as lost.",
    errorTitle: "Couldn't mark lead as lost",
    invalidateKeys: invalidateKeysFor(leadId),
  });
}

export function useReopenLead(leadId: string) {
  return useAppMutation<unknown, ReopenPayload>({
    mutationFn: (body) => reopenLead(leadId, body),
    successMessage: "Lead reopened.",
    errorTitle: "Couldn't reopen lead",
    invalidateKeys: invalidateKeysFor(leadId),
  });
}

/**
 * Admin only (`LEADS_ACTOR_FORBIDDEN` for anyone else). Deliberately a plain
 * `useMutation`, not `useAppMutation` — `LEADS_LEAD_ALREADY_CONVERTED` is a
 * "someone else already did this" race, not a real failure, and the caller
 * (`ConvertLeadModal`) navigates to the applicant that already exists rather
 * than showing an error. `useAppMutation`'s notification is unconditional on
 * every error, which would show a red "Couldn't convert lead" toast on top
 * of that graceful redirect — this hook leaves all notification/redirect
 * decisions to the caller instead.
 */
export function useConvertLead(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation<ConvertLeadResponse, unknown, void>({
    mutationFn: () => convertLead(leadId),
    onSuccess: () => {
      invalidateKeysFor(leadId).forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}

export function useCreateLeadNote(leadId: string) {
  return useAppMutation<unknown, LeadNoteCreatePayload>({
    mutationFn: (body) => createLeadNote(leadId, body),
    successMessage: "Note added.",
    errorTitle: "Couldn't add note",
    // Deliberately narrower than `invalidateKeysFor` — a note changes no
    // board-visible field (category, counts, `last_followed_up_at`), so
    // invalidating `lists()` here would trigger the board's full
    // up-to-10-page aggregate refetch for data that didn't change.
    // `detail(leadId)` alone still refreshes the open Notes tab (prefix
    // match, see `invalidateKeysFor`'s comment).
    invalidateKeys: [leadManagementQueryKeys.detail(leadId)],
  });
}

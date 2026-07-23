"use client";

import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import {
  changeLeadStage,
  createLeadNote,
  fetchAllLeads,
  fetchLeadHistory,
  fetchLeadNotes,
  fetchLeadSources,
  fetchLossReasons,
  getLead,
  markLeadLost,
  recordLeadFollowUp,
  reopenLead,
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
  FollowUpPayload,
  LeadBoardRow,
  LeadCategory,
  LeadNoteCreatePayload,
  MarkLostPayload,
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

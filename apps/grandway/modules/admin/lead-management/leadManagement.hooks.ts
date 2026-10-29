"use client";

import { useCallback, useMemo } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import type { NotesAdapter } from "@/components/notes-panel";
import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";
import {
  changeLeadStage,
  convertLead,
  createLeadNote,
  createLeadSource,
  createLossReason,
  deleteLead,
  deleteLeadNote,
  fetchAllLeads,
  fetchAllLeadSources,
  fetchAllLossReasons,
  fetchDeletedLeads,
  fetchLeadHistory,
  fetchLeadNotes,
  fetchLeadSources,
  fetchLossReasons,
  getLead,
  markLeadLost,
  recordLeadFollowUp,
  reopenLead,
  restoreLead,
  updateLeadNote,
  updateLeadSource,
  updateLossReason,
} from "./leadManagement.api";
import { emptyCategoryCounts, toLeadBoardRow } from "./leadCategory.utils";
import { getLeadNoteErrorMessage, isStaleLeadError } from "./leadErrors.utils";
import {
  deletedLeadsKey,
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
  LeadDetail,
  LeadListFilters,
  LeadNote,
  MarkLostPayload,
  ReferenceEntry,
  ReferenceEntryCreatePayload,
  ReferenceEntryUpdatePayload,
  ReopenPayload,
  StageChangePayload,
  VisitNotePayload,
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
  filters: LeadListFilters,
): () => Promise<LeadBoardQueryResult> {
  return async () => {
    const { data, meta } = await fetchAllLeads({
      ...filters,
      fiscalYear: fiscalYear ?? undefined,
    });
    const rows: LeadBoardRow[] = data.map((lead) => toLeadBoardRow(lead));
    return { data: rows, meta };
  };
}

const NO_FILTERS: LeadListFilters = {};

/**
 * The single fetch behind the whole board — categorizes the caller's full
 * in-scope lead set once per (fiscal year + server filter) scope. The board
 * hands `queryFn` straight to `ModalTableShell` as its `queryGetFn`, and the 4
 * category tabs use the shell's own `tabs[].filter` mechanism — the same
 * pattern already used by Users/SecurityEvents lists elsewhere in the repo.
 *
 * `filters` (qualification level, test status, test type) are SERVER filters:
 * the list shape carries neither the study interest nor the certificates, so
 * the shell's in-memory filtering could never apply them.
 */
export function useLeadBoardData(
  fiscalYear: string | null,
  filters: LeadListFilters = NO_FILTERS,
) {
  const { highestQualificationLevel, languageTestStatus, languageTestType } =
    filters;
  // The unscoped board is exactly `lists()`; any scope adds ONE serialized
  // segment (the shell's `queryKey` is `readonly string[]`, so no objects).
  // Serializing as JSON keeps a user typing "all" into the fiscal-year field
  // from colliding with the unscoped key and serving the wrong cached scope.
  const boardQueryKey = useMemo(() => {
    const scope = {
      fiscalYear: fiscalYear ?? undefined,
      highestQualificationLevel,
      languageTestStatus,
      languageTestType,
    };
    const scoped = Object.values(scope).some(Boolean);
    return scoped
      ? ([...leadManagementQueryKeys.lists(), JSON.stringify(scope)] as const)
      : leadManagementQueryKeys.lists();
  }, [
    fiscalYear,
    highestQualificationLevel,
    languageTestStatus,
    languageTestType,
  ]);
  const queryFn = useMemo(
    () =>
      makeLeadBoardQueryFn(fiscalYear, {
        highestQualificationLevel,
        languageTestStatus,
        languageTestType,
      }),
    [
      fiscalYear,
      highestQualificationLevel,
      languageTestStatus,
      languageTestType,
    ],
  );

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

/**
 * Refetch one lead and the board (`lists()` — every scope, the dashboard's
 * and the Deleted-leads view included). Used after delete/restore, after a
 * lead create/edit, and whenever a write is refused as stale.
 */
export function useRefreshLead() {
  const queryClient = useQueryClient();
  return useCallback(
    (leadId: string) => {
      invalidateKeysFor(leadId).forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
    [queryClient],
  );
}

/**
 * `onError` for every lead write: on a stale-lead 409 (`isStaleLeadError` —
 * deleted / not deleted / already converted) refetch the lead and the board,
 * since `useAppMutation` only invalidates on success.
 */
export function useRefreshOnStaleLead() {
  const refreshLead = useRefreshLead();
  return useCallback(
    (error: unknown, leadId: string) => {
      if (isStaleLeadError(error)) refreshLead(leadId);
    },
    [refreshLead],
  );
}

export function useChangeLeadStage(leadId: string) {
  const refreshOnStale = useRefreshOnStaleLead();
  return useAppMutation<unknown, StageChangePayload>({
    mutationFn: (body) => changeLeadStage(leadId, body),
    successMessage: "Stage updated.",
    errorTitle: "Couldn't update stage",
    invalidateKeys: invalidateKeysFor(leadId),
    onError: (error) => refreshOnStale(error, leadId),
  });
}

export function useRecordLeadFollowUp(leadId: string) {
  const refreshOnStale = useRefreshOnStaleLead();
  return useAppMutation<unknown, FollowUpPayload>({
    mutationFn: (body) => recordLeadFollowUp(leadId, body),
    successMessage: "Follow-up recorded.",
    errorTitle: "Couldn't record follow-up",
    invalidateKeys: invalidateKeysFor(leadId),
    onError: (error) => refreshOnStale(error, leadId),
  });
}

export function useMarkLeadLost(leadId: string) {
  const refreshOnStale = useRefreshOnStaleLead();
  return useAppMutation<unknown, MarkLostPayload>({
    mutationFn: (body) => markLeadLost(leadId, body),
    successMessage: "Lead marked as lost.",
    errorTitle: "Couldn't mark lead as lost",
    invalidateKeys: invalidateKeysFor(leadId),
    onError: (error) => refreshOnStale(error, leadId),
  });
}

export function useReopenLead(leadId: string) {
  const refreshOnStale = useRefreshOnStaleLead();
  return useAppMutation<unknown, ReopenPayload>({
    mutationFn: (body) => reopenLead(leadId, body),
    successMessage: "Lead reopened.",
    errorTitle: "Couldn't reopen lead",
    invalidateKeys: invalidateKeysFor(leadId),
    onError: (error) => refreshOnStale(error, leadId),
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
  const refreshLead = useRefreshLead();
  const refreshOnStale = useRefreshOnStaleLead();
  return useMutation<ConvertLeadResponse, unknown, void>({
    mutationFn: () => convertLead(leadId),
    onSuccess: () => refreshLead(leadId),
    // Hook-level, so it runs alongside the caller's own `onError` (the
    // already-converted redirect) — the board/dashboard catch up either way.
    onError: (error) => refreshOnStale(error, leadId),
  });
}

/**
 * Admin-only soft delete. The id travels with the mutate call (not bound at
 * hook time) because the same hook serves the board's row menu and the
 * drawer. Invalidates `lists()` — the board AND the Deleted-leads view — and
 * the lead's detail, so an open drawer flips to its deleted state.
 */
export function useDeleteLead() {
  const refreshLead = useRefreshLead();
  const refreshOnStale = useRefreshOnStaleLead();
  return useAppMutation<LeadDetail, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => deleteLead(id, { reason }),
    successTitle: "Lead deleted",
    successMessage: "An Admin can restore it from Deleted leads.",
    errorTitle: "Couldn't delete lead",
    // The shared copy for these codes is written for other actions; on a
    // delete they mean "someone got there first" / "this is an applicant's
    // origin record" (also covers converted-then-reopened leads, which look
    // active in the board's list shape).
    getErrorMessage: (error) => {
      const { code } = getApiError(error);
      if (code === "LEADS_LEAD_DELETED") {
        return "Someone already deleted this lead — the board has been refreshed.";
      }
      if (code === "LEADS_LEAD_ALREADY_CONVERTED") {
        return "A lead that was converted can't be deleted — it is the applicant's origin record.";
      }
      return getApiErrorMessage(error);
    },
    // `invalidateKeys` is static; these keys depend on the variables' id.
    onSuccess: (_data, { id }) => refreshLead(id),
    onError: (error, { id }) => refreshOnStale(error, id),
  });
}

/** Admin-only restore — see `useDeleteLead` for why the id rides the variables. */
export function useRestoreLead() {
  const refreshLead = useRefreshLead();
  const refreshOnStale = useRefreshOnStaleLead();
  return useAppMutation<LeadDetail, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => restoreLead(id, reason ? { reason } : {}),
    successTitle: "Lead restored",
    successMessage: "It is back on the board, exactly as it was.",
    errorTitle: "Couldn't restore lead",
    getErrorMessage: (error) =>
      getApiError(error).code === "LEADS_LEAD_NOT_DELETED"
        ? "This lead was already restored — the board has been refreshed."
        : getApiErrorMessage(error),
    onSuccess: (_data, { id }) => refreshLead(id),
    onError: (error, { id }) => refreshOnStale(error, id),
  });
}

/**
 * Admin "Deleted leads" view — `?deleted=true`, paginated server-side.
 * `enabled` is the caller's Admin gate: a Lead Manager gets 403 here, so the
 * query must never fire for one.
 */
export function useDeletedLeads(
  page: number,
  pageSize: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: deletedLeadsKey(page, pageSize),
    queryFn: () => fetchDeletedLeads(page, pageSize),
    enabled,
    placeholderData: keepPreviousData,
  });
}

/**
 * The `NotesPanel` adapter for one lead. Memoized on the id so the panel's
 * query key and callbacks stay referentially stable across renders.
 *
 * Note writes invalidate the notes base (the panel does that) plus the
 * History tab — every write appends `lead_note_*` there. Deliberately NOT
 * `lists()`: a note changes no board-visible field, and invalidating it would
 * trigger the board's up-to-10-page aggregate refetch for nothing.
 */
export function useLeadNotesAdapter(leadId: string): NotesAdapter<LeadNote> {
  return useMemo<NotesAdapter<LeadNote>>(
    () => ({
      queryKey: leadNotesKey(leadId),
      list: (params) => fetchLeadNotes(leadId, params),
      create: (payload) => createLeadNote(leadId, payload),
      update: (noteId, payload) => updateLeadNote(leadId, noteId, payload),
      remove: (noteId) => deleteLeadNote(leadId, noteId),
      invalidateKeys: [leadHistoryKey(leadId)],
    }),
    [leadId],
  );
}

/**
 * The board's quick "Add visit note" (row icon + row menu) — writes a `visit`
 * note without opening the drawer. Invalidates the same keys a write from the
 * drawer's `NotesPanel` does: the notes base (every tab/page, and the
 * `meta.counts` tab badges ride on those responses) and the History tab.
 * Not `lists()`: a note changes no field the board shows (`last_followed_up_at`
 * is set only by a follow-up), and it would refetch the whole aggregate.
 *
 * On a stale-lead 409 (converted since — even if reopened — or deleted) the
 * lead + board refetch (`detail(id)` prefixes the notes key, so the notes
 * refresh too); `LEADS_LEAD_NOT_FOUND` means the lead left the caller's
 * scope, so the board refetches as well.
 */
export function useAddLeadVisitNote(leadId: string, leadName: string) {
  const refreshLead = useRefreshLead();
  return useAppMutation<LeadNote, VisitNotePayload>({
    mutationFn: ({ body, noted_at }) =>
      createLeadNote(leadId, {
        category: "visit",
        body,
        // Omitted = "now", stamped by the server at save time.
        ...(noted_at ? { noted_at } : {}),
      }),
    successTitle: "Visit note added",
    successMessage: `Saved to ${leadName}'s visit notes.`,
    errorTitle: "Couldn't add visit note",
    getErrorMessage: getLeadNoteErrorMessage,
    invalidateKeys: [leadNotesKey(leadId), leadHistoryKey(leadId)],
    onError: (error) => {
      const notFound = getApiError(error).code === "LEADS_LEAD_NOT_FOUND";
      if (isStaleLeadError(error) || notFound) refreshLead(leadId);
    },
  });
}

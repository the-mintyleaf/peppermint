"use client";

import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@peppermint/ui";
import { fetchAllLeads, fetchLeadSources } from "./leadManagement.api";
import { categorizeLead, emptyCategoryCounts } from "./leadCategory.utils";
import {
  leadManagementQueryKeys,
  leadSourceQueryKeys,
} from "./leadManagement.queryKeys";
import type { LeadBoardRow, LeadCategory } from "./leadManagement.types";

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
    const rows: LeadBoardRow[] = data.map((lead) => ({
      ...lead,
      category: categorizeLead(lead),
    }));
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

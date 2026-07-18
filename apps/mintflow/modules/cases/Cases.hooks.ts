"use client";

import { useMemo } from "react";
import { notifications, useQuery } from "@peppermint/ui";

import {
  resolveTitle,
  WORK_STATUS_LABEL,
  workKeys,
  type WorkItem,
  type WorkListParams,
  type WorkStatus,
} from "@/lib/work";
import { listWorkItems } from "./cases.api";
import { PRIORITY_RANK } from "./cases.styles";

export type StatusFilter = "all" | WorkStatus;
export type SortKey = "recent" | "priority" | "due" | "title";

/**
 * Curated status tabs. `all` is unfiltered; the rest map to a real `WorkStatus`
 * and drive the server-side `?status` filter (the remaining statuses stay
 * reachable through search / the "all" tab).
 */
export const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_progress", label: WORK_STATUS_LABEL.in_progress },
  { value: "review_pending", label: WORK_STATUS_LABEL.review_pending },
  { value: "blocked", label: WORK_STATUS_LABEL.blocked },
  { value: "closure_pending", label: WORK_STATUS_LABEL.closure_pending },
  { value: "closed", label: WORK_STATUS_LABEL.closed },
];

const SORT_LABELS: Record<SortKey, string> = {
  recent: "Recent",
  priority: "Priority",
  due: "Due date",
  title: "Title",
};

export const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[];

export function sortLabel(key: SortKey): string {
  return SORT_LABELS[key];
}

/** Shared "no backend yet" feedback for inert actions (mutations land in P3). */
export function notConnected(): void {
  notifications.show({ message: "Not connected yet", color: "gray" });
}

const PAGE_SIZE = 100;

/**
 * Visible work items for the selected status tab. `?status` is applied
 * server-side; search + sort run client-side over the loaded page (P1 keeps the
 * mock's single-page interaction model — full cursor pagination is a later pass).
 */
export function useWorkItems(status: StatusFilter) {
  const params: WorkListParams = { page_size: PAGE_SIZE };
  if (status !== "all") params.status = status;
  return useQuery({
    queryKey: workKeys.itemList(params),
    queryFn: () => listWorkItems(params),
  });
}

function matchesItem(item: WorkItem, query: string): boolean {
  if (!query) return true;
  return (
    resolveTitle(item).toLowerCase().includes(query) ||
    item.title_np.toLowerCase().includes(query) ||
    item.reference_number.toLowerCase().includes(query) ||
    item.objective.toLowerCase().includes(query)
  );
}

/** Missing deadlines sort last regardless of direction. */
function byDue(a: WorkItem, b: WorkItem): number {
  if (!a.due_at && !b.due_at) return 0;
  if (!a.due_at) return 1;
  if (!b.due_at) return -1;
  return a.due_at.localeCompare(b.due_at);
}

export function useFilteredCases(
  items: WorkItem[] | undefined,
  search: string,
  sort: SortKey,
): WorkItem[] {
  return useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = (items ?? []).filter((w) => matchesItem(w, q));

    const sorted = [...rows];
    if (sort === "priority")
      sorted.sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      );
    else if (sort === "due") sorted.sort(byDue);
    else if (sort === "title")
      sorted.sort((a, b) => resolveTitle(a).localeCompare(resolveTitle(b)));
    // `recent` keeps the server order (-updated_at).
    return sorted;
  }, [items, search, sort]);
}

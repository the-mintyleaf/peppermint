"use client";

import { useMemo } from "react";
import { useQuery } from "@peppermint/ui";

import { fetchCases, fetchFiles } from "./module.api";
import type {
  CaseFile,
  CasePriority,
  CaseStatus,
  WorkCase,
} from "./module.api";

export type StatusFilter = "all" | CaseStatus;
export type SortKey = "recent" | "priority" | "due" | "title";

export const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "under_review", label: "Under Review" },
  { value: "on_hold", label: "On Hold" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
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

const PRIORITY_RANK: Record<CasePriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

export function useCases() {
  return useQuery({ queryKey: ["cases"], queryFn: fetchCases });
}

export function useFiles() {
  return useQuery({ queryKey: ["cases", "files"], queryFn: fetchFiles });
}

function matchesCase(workCase: WorkCase, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    workCase.title.toLowerCase().includes(q) ||
    workCase.caseNumber.toLowerCase().includes(q) ||
    workCase.summary.toLowerCase().includes(q)
  );
}

export function useFilteredCases(
  cases: WorkCase[] | undefined,
  status: StatusFilter,
  search: string,
  sort: SortKey,
): WorkCase[] {
  return useMemo(() => {
    const rows = (cases ?? []).filter(
      (c) =>
        (status === "all" || c.status === status) && matchesCase(c, search),
    );

    const sorted = [...rows];
    if (sort === "priority")
      sorted.sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      );
    else if (sort === "due")
      sorted.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    else if (sort === "title")
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [cases, status, search, sort]);
}

export function useFilteredFiles(
  files: CaseFile[] | undefined,
  search: string,
): CaseFile[] {
  return useMemo(() => {
    if (!search) return files ?? [];
    const q = search.toLowerCase();
    return (files ?? []).filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.caseNumber.toLowerCase().includes(q),
    );
  }, [files, search]);
}

/** "2026-08-15" → "15 Aug 2026". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

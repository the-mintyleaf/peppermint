import type { QueryParams } from "@peppermint/admin";
import type { Checklist, ChecklistStatus } from "../../checklists.types";

/**
 * Every worklist this applicant has, across journeys — the list endpoint's
 * `applicant` filter matches *through the journey*
 * (`docs/backend/checklists/INTEGRATION.md` §3), so the drawer never has to
 * read journeys first.
 *
 * No `status` filter: the journey panel's params pin `active` because an
 * archived worklist has to count as "none" there, but this drawer is the
 * applicant's whole requirement picture — a completed worklist is a real
 * answer to "what is on file", not noise. Archived ones are dropped in
 * `visibleWorklists` instead: they are out of active work by definition, and
 * `status` takes one value, so "everything except archived" can't be a filter.
 */
export function applicantWorklistListParams(applicantId: string): QueryParams {
  return {
    page: 1,
    pageSize: 50,
    search: "",
    sort: [],
    filters: { applicant: applicantId },
  };
}

export type WorklistSortKey = "active" | "recent" | "progress" | "title";

export const WORKLIST_SORT_OPTIONS: {
  value: WorklistSortKey;
  label: string;
}[] = [
  { value: "active", label: "Active first" },
  { value: "recent", label: "Newest" },
  { value: "progress", label: "Least done" },
  { value: "title", label: "Title A–Z" },
];

/** Work before settled — the default order, and the tie-break inside every other one. */
const STATUS_ORDER: ChecklistStatus[] = [
  "active",
  "draft",
  "completed",
  "archived",
];

/** Share of the list resolved, 0–1. An empty worklist counts as untouched, not done. */
function doneRatio(worklist: Checklist): number {
  const { total, resolved } = worklist.progress;
  return total > 0 ? resolved / total : 0;
}

/** Archived is out of active work by definition — the full worklist page is where it stays visible. */
export function visibleWorklists(rows: Checklist[]): Checklist[] {
  return rows.filter((row) => row.status !== "archived");
}

/** Title and destination — the two things a row actually shows. */
export function searchWorklists(rows: Checklist[], query: string): Checklist[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    [row.title, row.country?.name ?? ""].some((field) =>
      field.toLowerCase().includes(q),
    ),
  );
}

export function sortWorklists(
  rows: Checklist[],
  key: WorklistSortKey,
): Checklist[] {
  const byStatus = (a: Checklist, b: Checklist) =>
    STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  const byNewest = (a: Checklist, b: Checklist) =>
    b.created_at.localeCompare(a.created_at);

  const comparators: Record<
    WorklistSortKey,
    (a: Checklist, b: Checklist) => number
  > = {
    active: (a, b) => byStatus(a, b) || byNewest(a, b),
    recent: (a, b) => byNewest(a, b),
    progress: (a, b) => doneRatio(a) - doneRatio(b) || byStatus(a, b),
    title: (a, b) => a.title.localeCompare(b.title),
  };

  return [...rows].sort(comparators[key]);
}

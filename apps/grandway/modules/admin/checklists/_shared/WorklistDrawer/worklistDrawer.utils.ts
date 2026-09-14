import type { QueryParams } from "@peppermint/admin";
import type { ChecklistStatus } from "../../checklists.types";

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
 * `sortWorklists` instead: they are out of active work by definition, and
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

/** Work first, then the settled ones. */
const STATUS_ORDER: ChecklistStatus[] = [
  "active",
  "draft",
  "completed",
  "archived",
];

interface SortableWorklist {
  status: ChecklistStatus;
  created_at: string;
}

/** Drops archived rows, then orders by status band and newest-first inside it. */
export function sortWorklists<T extends SortableWorklist>(rows: T[]): T[] {
  return rows
    .filter((row) => row.status !== "archived")
    .sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
        b.created_at.localeCompare(a.created_at),
    );
}

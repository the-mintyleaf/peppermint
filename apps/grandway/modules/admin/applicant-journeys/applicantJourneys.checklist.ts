import type { QueryParams } from "@peppermint/admin";

/**
 * Shared `QueryParams` for reading a single journey's checklist(s). Used by both
 * the stage-transition "ensure a checklist exists" side effect
 * (`useChangeJourneyStage`) and the journey detail Checklist tab
 * (`JourneyChecklistPanel`), so they hit the same `checklistQueryKeys.list` cache
 * entry — creating one refreshes the other. A journey has at most one *active*
 * checklist (one per applicant, `docs/backend/checklists/CONCEPT.md`).
 *
 * `status: "active"` is required: the list endpoint includes archived rows by
 * default (`docs/backend/checklists/INTEGRATION.md`), and an archived checklist
 * must count as "none" — the panel would otherwise render it as live (409 on any
 * action) and the ensure step would skip creating a fresh one.
 */
export function journeyChecklistListParams(journeyId: string): QueryParams {
  return {
    page: 1,
    pageSize: 20,
    search: "",
    sort: [],
    filters: { journey: journeyId, status: "active" },
  };
}

import { createQueryKeys } from "@peppermint/admin";

/** Two independent resources under one basePath prefix — same precedent as `offers.queryKeys.ts`. */
export const templateQueryKeys = createQueryKeys("checklists.templates");
export const checklistQueryKeys = createQueryKeys("checklists.checklists");

/**
 * Own cache slot for the safety-net view — deliberately NOT nested under either
 * resource's keys, since `GET /?journey_missing_checklist=true` returns a
 * distinct resource (`JourneyAwaitingChecklist`, journeys — not checklists).
 * Fixed shape (no params), matching `createQueryKeys(...).lists()`'s sibling
 * convention — `DataTableShell` composes the actual page/filter params
 * internally, so the base key itself never needs to encode them.
 */
export function awaitingChecklistKey() {
  return ["checklists.awaiting-setup", "list"] as const;
}

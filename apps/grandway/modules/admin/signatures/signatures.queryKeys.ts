import { createQueryKeys } from "@peppermint/admin";
import type { SignatoryListFilters } from "./signatures.types";

export const signatoryQueryKeys = createQueryKeys("signatures.signatories");

/**
 * The management screen's list key. Filters are part of the key, so the
 * unfiltered library view and a status-filtered one are different queries
 * rather than the same one re-filtered client-side — omitting `status`
 * returns draft and retired rows too (§7), which is what a management screen
 * wants and a picker does not.
 */
export function signatoriesListKey(filters: SignatoryListFilters = {}) {
  return signatoryQueryKeys.list(filters);
}

/**
 * The picker feed — `?status=active` only. Deliberately its own key rather
 * than a filtered read of the management list: the two have very different
 * staleness needs (a picker is read on every editor mount, the library only
 * while it is open), and every certificate in the editor shares this one entry.
 */
export function activeSignatoriesKey() {
  return signatoryQueryKeys.list({ status: "active" });
}

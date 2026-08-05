import type { AdminShellSearchResult } from "@peppermint/admin";
import { GLOBAL_SEARCH_SOURCES } from "./globalSearch.sources";
import type { GlobalSearchOptions } from "./globalSearch.types";

const DEFAULT_PER_DOMAIN_LIMIT = 5;

/**
 * The AdminShell spotlight's search provider: one query fanned out across every
 * backend the current role may read, flattened into the shell's result shape.
 *
 * **Partial failure is not total failure.** Eight endpoints answer one query;
 * one of them 500ing must not blank out the other seven, so sources are settled
 * independently and a failed one contributes nothing. It is logged rather than
 * notified — a toast per keystroke would be worse than the missing rows, and
 * the user can see which groups are present. Only an all-sources failure
 * rejects, which is what puts the spotlight into its retryable error state.
 *
 * Aborts are re-thrown untouched: a superseded keystroke is not an error, and
 * React Query must see the abort rather than an empty result set.
 */
export async function searchEverything(
  query: string,
  { access, signal, perDomainLimit }: GlobalSearchOptions,
): Promise<AdminShellSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const sources = GLOBAL_SEARCH_SOURCES.filter((source) =>
    source.enabled(access),
  );
  if (sources.length === 0) return [];

  const limit = perDomainLimit ?? DEFAULT_PER_DOMAIN_LIMIT;
  const settled = await Promise.allSettled(
    sources.map((source) => source.run(trimmed, limit, signal, access)),
  );

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const results: AdminShellSearchResult[] = [];
  let failed = 0;

  settled.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") {
      results.push(...outcome.value);
      return;
    }

    failed += 1;
    console.error(
      `[global-search] "${sources[index].group}" failed`,
      outcome.reason,
    );
  });

  if (failed === sources.length) {
    throw new Error("Global search failed for every domain");
  }

  return results;
}

import type { AdminShellSearchResult } from "@peppermint/admin";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { TEMPLATE_STATUS_LABELS } from "../checklists/checklists.labels";
import { runGlobalSearch, searchChecklistTemplates } from "./globalSearch.api";
import {
  bucketHref,
  entityRoute,
  hitHref,
  permittedTypes,
} from "./globalSearch.routes";
import type {
  GlobalSearchOptions,
  SearchBucket,
  SearchResult,
} from "./globalSearch.types";

const DEFAULT_PER_TYPE_LIMIT = 5;

/**
 * The last successful result, kept only to survive a 429.
 *
 * The contract is explicit: on `RATE_LIMIT_EXCEEDED` a client should "back off
 * for `Retry-After` and **show the previous results rather than an error**".
 * The shell owns the query lifecycle and would render its retryable error state
 * for a thrown rejection, so the graceful degradation has to happen here.
 *
 * One entry, not a cache — this exists to hold a keystroke steady while the
 * limiter cools, never to serve a stale answer to a *different* question.
 */
let lastResults: { query: string; results: AdminShellSearchResult[] } | null =
  null;

function isRateLimited(error: unknown): boolean {
  return (
    (error as { response?: { status?: number } })?.response?.status === 429
  );
}

/** `matched_on` → the right-aligned hint, so a phone-number match doesn't read as a mystery. */
function matchHint(matchedOn: string[]): string | undefined {
  if (matchedOn.length === 0) return undefined;
  const FIELD_LABELS: Record<string, string> = {
    full_name: "name",
    email: "email",
    contact_number: "phone",
    passport_number: "passport",
    name: "name",
    spokesperson_name: "spokesperson",
    common_name: "also known as",
    label: "label",
    key: "key",
    title: "title",
    original_filename: "filename",
  };
  const labels = matchedOn.map((field) => FIELD_LABELS[field] ?? field);
  return `matched ${labels.join(", ")}`;
}

/**
 * One server bucket → the shell's flat result rows, plus a trailing "see all"
 * row when the bucket has more than it returned.
 *
 * The bucket's own `label` is the group heading, so a new searchable type names
 * itself without a frontend release.
 */
function toShellResults(
  bucket: SearchBucket,
  query: string,
): AdminShellSearchResult[] {
  const entry = entityRoute(bucket.entity_type);
  // A type this build has no route for — the backend's catalogue is allowed to
  // grow without a frontend release. Skip the bucket rather than throw: a
  // `TypeError` here would reject the whole search and blank out the eight
  // buckets that DO render.
  if (!entry) {
    console.warn(
      `[global-search] no route for entity type "${bucket.entity_type}" — bucket skipped`,
    );
    return [];
  }
  const { icon } = entry;
  const rows = bucket.hits.map<AdminShellSearchResult>((hit) => ({
    // Namespaced by type: two modules can legitimately hold the same UUID, and
    // the shell requires ids unique within one result set.
    id: `${hit.entity_type}:${hit.id}`,
    group: bucket.label,
    label: hit.title || "Untitled",
    // Opaque display text, rendered as-is and never parsed.
    description: hit.subtitle || undefined,
    hint: matchHint(hit.matched_on),
    icon,
    href: hitHref(hit.entity_type, hit.id, hit.title),
  }));

  const seeAllHref = bucketHref(bucket.entity_type, query);
  if (!bucket.has_more || !seeAllHref) return rows;

  return [
    ...rows,
    {
      id: `${bucket.entity_type}:see-all`,
      group: bucket.label,
      label: `See all ${bucket.total} in ${bucket.label.toLowerCase()}`,
      hint: "all results",
      icon,
      // The FRONTEND list, not the bucket's `list_url` (an API URL).
      href: seeAllHref,
    },
  ];
}

/**
 * Checklist templates, the one client-side source left standing.
 *
 * **They are not a backend searchable type** and are not planned to become one
 * (`docs/backend/search/INTEGRATION.md` §9: "Journeys, offers, and checklists
 * are not searchable"). They *were* searchable in this app before the
 * migration, so dropping them silently would remove a working capability from
 * Admins. One extra request, only for a role that can reach the templates
 * screen — against the eight this module used to fire on every keystroke.
 */
async function checklistTemplateResults(
  query: string,
  limit: number,
  signal?: AbortSignal,
): Promise<AdminShellSearchResult[]> {
  const rows = await searchChecklistTemplates(query, limit, signal);
  return rows.map<AdminShellSearchResult>((row) => ({
    id: `checklist_template:${row.id}`,
    group: "Checklist templates",
    label: row.label,
    description: row.country ? row.country.name : "Global template",
    hint: TEMPLATE_STATUS_LABELS[row.status],
    icon: ListChecksIcon,
    href: `/admin/checklists/templates?template=${row.id}`,
  }));
}

/**
 * The AdminShell spotlight's search provider.
 *
 * **One server request answers eight of the nine buckets** — this replaced a
 * client-side fan-out that fired one request per domain on every keystroke.
 * Scoping, relevance ranking within the people buckets, and the cost of the
 * query all moved back to the backend with it.
 *
 * Three rules the contract insists on and this function keeps:
 *
 * - **Server bucket order is preserved.** `results` is rendered in the order it
 *   arrives (people → work → reference); re-sorting would diverge from every
 *   other client.
 * - **Empty buckets are dropped.** The server returns every requested type,
 *   including ones with `total: 0`; rendering those would be nine empty
 *   sections instead of one honest "nothing found".
 * - **`types` is a capability allowlist sent on the request**, so a bucket this
 *   role could not open is never fetched — which is also the only control a
 *   client has over the cost of a search.
 */
export async function searchEverything(
  query: string,
  { access, signal, perTypeLimit }: GlobalSearchOptions,
): Promise<AdminShellSearchResult[]> {
  const trimmed = query.trim();
  // The contract's floor. The shell already enforces `minQueryLength`, but a
  // sub-2-character query is a 400, so this never relies on that alone.
  if (trimmed.length < 2) return [];

  const types = permittedTypes(access);
  const limit = perTypeLimit ?? DEFAULT_PER_TYPE_LIMIT;

  const serverSearch: Promise<SearchResult | null> =
    types.length > 0
      ? runGlobalSearch({ q: trimmed, types, limit_per_type: limit, signal })
      : Promise.resolve(null);

  const supplement: Promise<AdminShellSearchResult[]> = access.checklists
    ? checklistTemplateResults(trimmed, limit, signal)
    : Promise.resolve([]);

  // Settled independently: the checklist supplement failing must not blank out
  // the server's eight buckets, and vice versa.
  const [searchOutcome, supplementOutcome] = await Promise.allSettled([
    serverSearch,
    supplement,
  ]);

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  if (
    searchOutcome.status === "rejected" &&
    isRateLimited(searchOutcome.reason)
  ) {
    // Typing outran the 60/minute limiter. Holding the previous answer on
    // screen is the contract's prescribed behaviour and is far better than
    // flashing an error at someone mid-keystroke — but ONLY for the same
    // question. Serving "acme" rows under a "zephyr" query would be worse than
    // showing nothing, so a different query falls through to empty.
    return lastResults?.query === trimmed ? lastResults.results : [];
  }

  if (searchOutcome.status === "rejected") {
    // A genuine failure of the only substantive endpoint. Always rethrow, so
    // the shell shows its retryable error state.
    //
    // Deliberately NOT softened when the checklist supplement happens to have
    // matched: returning one checklist row while eight buckets failed would
    // read as "nothing else matched" and hide a backend outage behind a
    // plausible-looking result. A wrong answer is worse than an error.
    throw searchOutcome.reason;
  }

  const results: AdminShellSearchResult[] = [];

  if (searchOutcome.value) {
    for (const bucket of searchOutcome.value.results) {
      // `total`, not `hits.length` — a bucket the caller may not see returns
      // zero of both, and either way there is nothing to render.
      if (bucket.total === 0) continue;
      results.push(...toShellResults(bucket, trimmed));
    }
  }

  if (supplementOutcome.status === "fulfilled") {
    results.push(...supplementOutcome.value);
  } else {
    console.error(
      "[global-search] checklist templates failed",
      supplementOutcome.reason,
    );
  }

  lastResults = { query: trimmed, results };
  return results;
}

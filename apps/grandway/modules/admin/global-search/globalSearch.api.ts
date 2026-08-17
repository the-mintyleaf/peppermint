import api from "@/lib/api";
import type { TemplateStatus } from "../checklists/checklists.types";
import type { GlobalSearchParams, SearchResult } from "./globalSearch.types";

const SEARCH = "/api/v1/search";

/**
 * `GET /api/v1/search/` — **one** request answering across every permitted type.
 *
 * This replaced a client-side fan-out over eight list endpoints. Three things
 * moved back to the server with it: the scoping rules (a Lead Manager's leads
 * and files are narrowed by the owning modules, not by the frontend), relevance
 * ranking within the applicant and lead buckets, and the request cost.
 *
 * `signal` comes from the shell's React Query instance — a superseded keystroke
 * aborts the in-flight request rather than letting a stale answer land.
 *
 * Rate limited to **60/minute on its own throttle scope**, separate from the
 * project budget, which is what makes the shell's debounce non-optional.
 */
export async function runGlobalSearch({
  q,
  types,
  limit_per_type,
  signal,
}: GlobalSearchParams): Promise<SearchResult> {
  const { data } = await api.get<SearchResult>(`${SEARCH}/`, {
    params: {
      q,
      // Sent as the comma-separated string the contract specifies. Omitted
      // entirely when undefined — an empty `types=` is not "all nine".
      ...(types && types.length > 0 ? { types: types.join(",") } : {}),
      ...(limit_per_type ? { limit_per_type } : {}),
    },
    signal,
  });
  return data;
}

// `GET /api/v1/search/types/` is deliberately NOT consumed.
//
// The contract says to build **type filter chips** from that endpoint rather
// than hardcoding the nine keys — and it is right, but this app has no chip UI
// to build. `AdminShell` owns the spotlight's input and renders one flat,
// grouped result list; there is nowhere to put a chip without changing the
// package. The group headings that DO render come from each bucket's own
// server `label`, so a renamed type already reaches the UI without a release.
//
// What a new *type* needs is a route, an icon and a capability — all decisions
// only this app can make (`globalSearch.routes.ts`). `toShellResults` skips a
// bucket whose type it has no route for rather than throwing, so a tenth type
// degrades to "not shown yet" instead of breaking the other nine.
//
// If a chip row is ever added, fetch `/types/` once per session and build it
// from the response. Do not hardcode the keys.

// ── The one surviving client-side source ────────────────────────────────────
//
// **Checklist templates are not a backend searchable type and are not planned
// to become one** (`docs/backend/search/INTEGRATION.md` §9: "Journeys, offers,
// and checklists are not searchable"). They *were* searchable in this app
// before the migration, so dropping them silently would take a working
// capability away from Admins.
//
// One extra request, only for a role that can reach the templates screen —
// against the eight this module used to fire, that is still a 4× reduction.
// If the backend ever adds a `checklist_template` type, delete this and the
// `checklists` flag on `GlobalSearchAccess` with it.

export interface ChecklistTemplateSearchRow {
  id: string;
  key: string;
  label: string;
  country: { id: string; name: string } | null;
  status: TemplateStatus;
}

interface ListEnvelope<T> {
  data: T[];
  meta: { count: number } & Record<string, unknown>;
}

/** `GET /api/v1/checklists/templates/?search=` — matches `label` or `key`. */
export async function searchChecklistTemplates(
  query: string,
  limit: number,
  signal?: AbortSignal,
): Promise<ChecklistTemplateSearchRow[]> {
  const { data } = await api.get<ListEnvelope<ChecklistTemplateSearchRow>>(
    "/api/v1/checklists/templates/",
    { params: { page: 1, page_size: limit, search: query }, signal },
  );
  return data.data;
}

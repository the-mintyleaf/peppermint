// DTOs mirror `docs/backend/search/INTEGRATION.md` §4 (models) and §5 (enums),
// field-for-field.
//
// Two contract facts govern everything here:
//
// 1. **`detail_path` and `list_url` are API paths, not frontend routes.** The
//    client maps `entity_type` + `id` through its own router
//    (`globalSearch.routes.ts`). Nothing in this module ever navigates to a
//    value the server sent.
// 2. **Bucket order is fixed server-side** (people → work → reference) and the
//    order of keys in `types` is ignored. A client that re-sorts diverges from
//    every other client, so the provider preserves `results` order as given.

/** The nine searchable record types (§5). */
export type SearchEntityType =
  | "applicant"
  | "lead"
  | "client"
  | "document"
  | "uploaded_file"
  | "institution"
  | "program"
  | "document_template"
  | "signatory";

/** The three bucket groups, which fix the render order (§5). */
export type SearchGroup = "people" | "work" | "reference";

/** One found record, reduced to what a result row needs and nothing more (§4). */
export interface SearchHit {
  /** What a client routes on. */
  entity_type: SearchEntityType;
  id: string;
  /** May be `""`. */
  title: string;
  /**
   * May be `""`. **Opaque display text — never parse it.** Assembled from
   * different fields per `entity_type` and joined with a space-padded `·`;
   * the composition is explicitly not pinned by the contract (§9).
   */
  subtitle: string;
  /**
   * Which fields matched. **May be empty** — a `program` matched through its
   * institution's name has no matching field of its own (§9).
   */
  matched_on: string[];
  /** An **API** path, `{id}` already filled in. Never navigate to this. */
  detail_path: string;
  detail_permission_key: string;
}

/** One type's slice of the answer (§4). Empty buckets ARE returned. */
export interface SearchBucket {
  entity_type: SearchEntityType;
  label: string;
  group: SearchGroup;
  /** The **true** match count for the type, not `hits.length`. */
  total: number;
  /** `total > hits.length` — this, not a length check, is what gates "see all". */
  has_more: boolean;
  hits: SearchHit[];
  /** The owning app's **API** list URL. Mapped to a frontend route by this module. */
  list_url: string;
  list_permission_key: string;
}

/** The top-level `data` of `GET /api/v1/search/` (§4). */
export interface SearchResult {
  /**
   * The **normalised, trimmed** query actually run — may differ byte-wise from
   * what was sent. Echoed so a client can discard a stale keystroke's response.
   */
  query: string;
  /** Type keys actually searched, in catalogue order. */
  types: SearchEntityType[];
  /** Sum of every bucket's `total`. */
  total_hits: number;
  results: SearchBucket[];
}

/**
 * One row of `GET /api/v1/search/types/` (§4). Static per deployment.
 *
 * Note `detail_path` here is a **template** containing a literal `{id}`, unlike
 * the filled-in value on a `SearchHit`.
 */
export interface SearchableType {
  key: SearchEntityType;
  label: string;
  group: SearchGroup;
  app_label: string;
  matched_fields: string[];
  detail_path: string;
  detail_permission_key: string;
  list_path: string;
  /** `institution` and `program` use `q`; the other seven use `search`. */
  list_search_param: "search" | "q";
  list_permission_key: string;
}

/** Query parameters for `GET /api/v1/search/` (§7). */
export interface GlobalSearchParams {
  /** ≥2 characters after trimming, ≤150. */
  q: string;
  /** Omit for all nine. An unknown key is a 400, not an ignored value. */
  types?: SearchEntityType[];
  /** 1–20. **21 is a 400, not a clamp.** */
  limit_per_type?: number;
  signal?: AbortSignal;
}

/**
 * Which buckets this role may be shown.
 *
 * **The backend does not narrow every bucket per authority**, and says so: its
 * §9 records "whether a Lead Manager should see all applicants, documents, and
 * catalogue records" as unresolved project-wide, and today those modules do not
 * narrow their own lists. Grandway cannot wait on that — `caps.documents` is
 * `false` for a Lead Manager, so an unfiltered render would hand that tier
 * document hits that dead-end in a panel they are refused.
 *
 * So the client sends a capability-derived `types=` allowlist. Filtering at the
 * **request** rather than the response is deliberate twice over: the forbidden
 * bucket is never fetched, and `types` is the only control a caller has over the
 * cost of a search (a full nine-type query is 20 database queries).
 */
export interface GlobalSearchAccess {
  /** `applicants` — admin/lead_manager, never superadmin. */
  applicants: boolean;
  /** `leads` — admin/lead_manager, never superadmin. */
  leads: boolean;
  /** `clients` — Admin only. */
  clients: boolean;
  /** `catalogue` (institutions + programs) — Admin only. */
  catalogue: boolean;
  /** `documents` — the right to read a generated document at all. */
  documents: boolean;
  /**
   * `fileReview` — uploaded files. The backend already applies that module's
   * own per-record visibility rule, so this gates the *screen*, not the rows.
   */
  files: boolean;
  /**
   * Document templates and their signatories. Rides on `documentWorkspaces`:
   * both land on `/admin/documents`, the Admin-only roll-up, so a reader who
   * cannot reach that screen would only get results that dead-end.
   */
  documentLibrary: boolean;
  /**
   * `checklists` templates. **Not a backend searchable type** — see the
   * supplement in `globalSearch.provider.ts`.
   */
  checklists: boolean;
}

export interface GlobalSearchOptions {
  access: GlobalSearchAccess;
  signal?: AbortSignal;
  /** Hits requested per bucket. 1–20. @default 5 */
  perTypeLimit?: number;
}

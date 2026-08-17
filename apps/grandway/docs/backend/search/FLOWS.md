# FLOWS — Search

**Owner app:** `search`
**Synced:** 2026-08-02, adapted from `.backend/concepts/search_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **Almost every step after the first is `(cross-app:)`, and that is the shape of the app
> rather than an accident: global search exists to _hand off_.** Its own two endpoints answer
> "which record did you mean"; everything after belongs to the module that owns the record.
> A flow here that never left this app would be a flow that never got the user anywhere.
>
> **The one thing the frontend must own is routing.** A hit's `detail_path` is an **API**
> path, not a frontend route, and four of the nine types (`lead`, `client`,
> `document_template`, `signatory`) have **no frontend detail route in Grandway at all** —
> they deep-link the owning list instead. Map `entity_type` + `id` through the app's own
> router; never navigate to `detail_path`.

---

## Flow: Find a person at the counter and open their record

**Actor:** Admin or Lead Manager · **Entry point:** the global search bar in the app shell

1. **App shell startup** — prepare the filter chips →
   `GET /api/v1/search/types/` (`search.type.list`).
   - **Cache it for the session.** It is static per deployment and does not change between
     calls. Build chips from this response rather than hardcoding the nine keys, so a new
     searchable type reaches the client without a release.
   - The response is **not** narrowed by authority: every caller sees all nine types. A type
     whose records the caller cannot see still appears and simply returns an empty bucket.
     Narrowing it would leak, by omission, which record classes an authority is denied.
   - `SEARCH_ACTOR_FORBIDDEN` → the caller is a Superadmin. **Hide the search bar entirely.**
     A box that always 403s is worse than no box.

2. **Global search bar** — the user types at least two characters (debounced) →
   `GET /api/v1/search/?q=<text>` (`search.query.read`).
   - **Requires state:** nothing beyond the session. An empty system returns nine empty
     buckets and `total_hits: 0`, not an error.
   - **Side effects:** none. Nothing is written and **no audit event is recorded**.
   - `VALIDATION_ERROR` → **do not send a query under two characters at all.** Enforce the
     minimum client-side (after trimming) and leave the panel in its idle state.
   - `RATE_LIMIT_EXCEEDED` (429) → the box is not debounced enough. Back off for
     `Retry-After` and **show the previous results rather than an error**. The limit is
     60/minute on this endpoint's **own** throttle scope, separate from the project budget.

3. **Results panel** — render one section per bucket with `total > 0`, **in the order
   returned**, showing `title`, `subtitle`, and a badge derived from `matched_on`.
   - **Order is fixed server-side** (people → work → reference) and the order of keys in
     `types=` is ignored. A client that re-sorts is diverging from every other client.
   - **Discard a response whose `data.query` no longer matches the box.** A slower earlier
     keystroke can land after a later one; `query` is echoed back normalised for exactly this.
   - `total_hits === 0` → **one** "nothing found" message for the whole panel, never nine
     empty sections.
   - `subtitle` may be `""`, `title` may be `""`, and `matched_on` may be **empty** — a
     `program` matched through its institution's name has no matching field of its own.
     **Never parse `subtitle`**; it is opaque display text joined with a space-padded `·` separator.

4. **Results panel** — the user clicks an applicant hit → route on `entity_type` + `id` →
   the applicant detail screen, which loads
   `GET /api/v1/applicants/<id>/` **(cross-app: `applicants`)**.
   - `APPLICANTS_APPLICANT_NOT_FOUND` → the record was deleted between the search and the
     click. Refresh the search rather than showing a dead detail screen.

5. **Results panel** — or the user clicks "see all 43" on a bucket → the owning module's own
   list, already filtered by the same query **(cross-app: the owning module)**.
   - The bucket's `list_url` is the **API** URL. Grandway maps the bucket to its own list
     route and re-attaches the query as that screen's search parameter — the same job
     `lib/useDeepLinkSearch.ts` already does for records without a detail route.
   - Show it only when `has_more` is true. `total` is the **true** match count for the type,
     not the number of rows returned.

## Flow: Find a file whose owner nobody remembers

**Actor:** Admin or Lead Manager · **Entry point:** the search bar, then the type chips

1. Restrict to files → `GET /api/v1/search/?q=<filename>&types=uploaded_file`.
   - `VALIDATION_ERROR` naming `types` → the client sent a key not in the catalogue. Rebuild
     the chips from `/types/` instead of hardcoding them.
2. Open the file hit → `GET /api/v1/files/<id>/` **(cross-app: `uploaded_files`)**.
   - **An empty bucket for a Lead Manager where an Admin sees a result is not a failure.**
     The file belongs to a document or a print snapshot and is outside that tier's
     visibility. Show the ordinary empty state — do not retry, and **do not surface an
     "access denied" message for a record the user was never told exists.**

## Flow: Look up an institution while advising, then shortlist

**Actor:** Admin or Lead Manager · **Entry point:** the global search bar

1. `GET /api/v1/search/?q=<name>&types=institution,program`.
2. Read `availability_status` from each hit's `subtitle`.
   - **Not a failure:** paused and withdrawn records **are** returned here, unlike the
     catalogue's own lists, which default to usable records only. Render the status visibly —
     someone searching a paused institution is usually checking exactly that.
3. Follow the program bucket's "see all" into real shortlisting →
   `GET /api/v1/catalogue/programs/?q=<name>` **(cross-app: `institutions`)**.
   - Note the parameter: `institution` and `program` are the two types whose list search
     parameter is **`q`**, not `search`. Read it from `list_search_param`; do not assume.
   - The catalogue list owns the shortlisting filters (country, level, field, tuition,
     scholarship); search deliberately does not duplicate them.

## Flow: Narrow a noisy search

**Actor:** Admin or Lead Manager · **Entry point:** the results panel type chips

1. The user selects chips; the client re-issues the same query →
   `GET /api/v1/search/?q=<text>&types=applicant&limit_per_type=20`.
   - The request is proportionally cheaper server-side. **`types` is the only control a
     client has over the cost of a search** — a full nine-type query is exactly 20 database
     queries.
   - `VALIDATION_ERROR` naming `limit_per_type` → the cap is **20, and 21 is a 400, not a
     clamp**. Page through the bucket's list instead of raising the limit.

---

## Endpoint coverage

| `permission_key`    | `METHOD /path`              | Used by flow(s)                       | Notes                                                                           |
| ------------------- | --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| `search.query.read` | `GET /api/v1/search/`       | All four flows                        | The app's only substantive endpoint. Throttled 60/min separately                |
| `search.type.list`  | `GET /api/v1/search/types/` | Find a person at the counter (step 1) | Fetched once at shell startup and cached; every other flow relies on that cache |

## Cross-app dependencies

- **Outbound:** the read and list endpoints of `applicants`, `leads`, `clients`, `documents`,
  `uploaded_files`, `institutions` (institution + program) and `document_templates` (template
  - signatory). Every one is a hand-off target reached from a hit or a bucket.
- **Inbound:** none. No other app's flow calls a `search.*` endpoint — this module is a leaf.

## Grandway-specific note

The client sends a **capability-derived `types=` allowlist** rather than requesting all nine.
The backend does not narrow the `applicant`, `document`, or catalogue buckets for a Lead
Manager (its own §9 records this as unresolved), but Grandway's `documents` capability is
`false` for that tier — so an unfiltered render would return document hits that dead-end in a
forbidden panel. Filtering at the request also keeps the query cost proportional to what the
role can actually open.

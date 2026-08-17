# Integration — Search

**Owner app:** `search`
**Version:** 1.0.0
**Status:** Active
**Synced:** 2026-08-02 (from `.backend/backend/search/docs/{INTEGRATION,API,DATA_CONTRACT}.md`)

> Re-sync with `/sync-api grandway search` when the backend's
> Change History moves past version 1.0.0.
>
> Global conventions (envelopes, pagination, IDs, times, money, rate limits) live
> in `../CORE_INTEGRATION.md` — this file records only what `search` adds or
> deviates from.

---

## Change History

| Version | Date       | Summary                                                                         |
| ------- | ---------- | ------------------------------------------------------------------------------- |
| 1.0.0   | 2026-08-02 | Initial integration contract — 2 read-only endpoints, 9 searchable record types |

---

## 1. Module

- **Name:** Search — the one global search box. A single query answered across every
  searchable record type, grouped by type, with each group linking to the owning
  module's own list for the full set. **It owns no data and writes nothing.**
- **Base path:** `/api/v1/search/`
- **Auth:** Bearer access JWT. `admin` and `lead_manager` may use it; a `superadmin`
  token is refused **403 everywhere** — so the search box must be **hidden entirely**
  for that authority, not rendered and allowed to fail.
- **Status:** active

## 2. Requires

`authenticate` (issues the JWT and supplies `authority_type`), plus a service call into
each owning module for its bucket: `applicants`, `leads`, `clients`, `documents`,
`uploaded_files`, `institutions` (institution + program), `document_templates`
(template + signatory). A module that is unavailable yields an **empty bucket**, never
an error.

**This module has no inbound dependencies.** Nothing reads it and nothing points at it —
it is a leaf.

## 3. Conventions — what this module adds or deviates from `../CORE_INTEGRATION.md`

- **`meta` is always `{}`.** Neither endpoint paginates.
- **Not paginated, deliberately.** The query returns a fixed set of buckets, each capped
  at `limit_per_type`. Depth is reached by following a bucket into the owning module's
  list endpoint, which _is_ paginated.
- **No timestamps** are returned by either endpoint.
- **Rate limited to 60 requests per minute per user, on its own throttle scope**,
  separate from the project-wide budget. A search-as-you-type box **must** debounce.
  On 429, honour `Retry-After` and keep the previous results on screen.
- **`detail_path` is an API path, not a frontend route.** The client maps `entity_type`
  to its own routing. Same for a bucket's `list_url`.
- **Results are grouped, never interleaved.** There is no cross-type relevance ranking;
  scores from different modules are not comparable.
- **Bucket order is fixed by the server** — `people` (applicant, lead, client), then
  `work` (document, uploaded_file), then `reference` (institution, program,
  document_template, signatory). The order of keys in `types` is **ignored**, and a
  client that re-sorts diverges from every other client.
- **Every requested bucket is returned, including empty ones** (`total: 0`, `hits: []`).
  The **client** is responsible for not rendering them, and for showing a single
  "nothing found" message when `total_hits` is `0` rather than nine empty sections.
- **Results are narrowed by each owning module's own rules, so two authorities
  legitimately see different totals for the same query.** A `lead_manager` sees only
  leads they own, and no file belonging to a `document` or a print snapshot. **This is
  the scoping working — do not report differing counts as a defect.** Both `total` and
  `hits` are narrowed; a count is a disclosure and is scoped exactly as the rows are.
- **`/types/` is _not_ narrowed by authority.** Every caller sees all nine. Narrowing it
  would leak, by omission, which record classes an authority is denied.
- **Availability is not filtered** on the `institution` and `program` buckets — a paused
  or withdrawn record is findable, and its `subtitle` carries its `availability_status`.
  This **differs** from the catalogue's own list endpoints, which default to usable
  records only.
- **Document `content`, file bytes, and operator free-text notes are never searched.**
- **`q` is unicode-normalised server-side**, and `data.query` echoes back what was
  actually run — compare it against the input to discard a stale keystroke's response.

## 4. Models

**SearchResult** (the top-level `data`) — `{ query, types, total_hits, results }`

| Field        | Type             | Notes                                                                                    |
| ------------ | ---------------- | ---------------------------------------------------------------------------------------- |
| `query`      | `string`         | The **normalised, trimmed** query actually run — may differ byte-wise from what was sent |
| `types`      | `string[]`       | Type keys actually searched, **in catalogue order**                                      |
| `total_hits` | `number`         | Sum of every bucket's `total`                                                            |
| `results`    | `SearchBucket[]` | One per searched type, fixed order, **empty buckets included**                           |

**SearchBucket**

| Field                 | Type                          | Notes                                                                                              |
| --------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `entity_type`         | enum (9)                      |                                                                                                    |
| `label`               | `string`                      | Section heading                                                                                    |
| `group`               | `people \| work \| reference` |                                                                                                    |
| `total`               | `number`                      | **True match count for the type**, not `hits.length`                                               |
| `has_more`            | `boolean`                     | `total > hits.length` — this is what gates "see all N"                                             |
| `hits`                | `SearchHit[]`                 | Up to `limit_per_type`; **may be empty**                                                           |
| `list_url`            | `string`                      | The owning app's **API** list URL + the same query, URL-encoded, using that app's own search param |
| `list_permission_key` | `string`                      |                                                                                                    |

**SearchHit**

| Field                   | Type            | Notes                                                                                              |
| ----------------------- | --------------- | -------------------------------------------------------------------------------------------------- |
| `entity_type`           | enum (9)        | **What a client routes on**                                                                        |
| `id`                    | `string` (UUID) |                                                                                                    |
| `title`                 | `string`        | **May be `""`**                                                                                    |
| `subtitle`              | `string`        | **May be `""`. Opaque display text — never parse it.** Joined with a space-padded `·` separator    |
| `matched_on`            | `string[]`      | **May be empty** — a `program` matched via its institution's name has no matching field of its own |
| `detail_path`           | `string`        | **API** path, `{id}` already filled in                                                             |
| `detail_permission_key` | `string`        |                                                                                                    |

**SearchableType** (`GET /types/` returns `SearchableType[]`) —
`{ key, label, group, app_label, matched_fields, detail_path, detail_permission_key,
list_path, list_search_param, list_permission_key }`.

Here `detail_path` is a **template containing a literal `{id}` placeholder**; on a
`SearchHit` it is already filled in.

### The nine searchable types

| key                 | label              | group     | app_label            | matched_fields                                            | list_search_param |
| ------------------- | ------------------ | --------- | -------------------- | --------------------------------------------------------- | ----------------- |
| `applicant`         | Applicants         | people    | `applicants`         | `full_name`, `email`, `contact_number`, `passport_number` | `search`          |
| `lead`              | Leads              | people    | `leads`              | `full_name`, `email`, `contact_number`                    | `search`          |
| `client`            | Clients            | people    | `clients`            | `name`, `spokesperson_name`                               | `search`          |
| `document`          | Documents          | work      | `documents`          | `label`                                                   | `search`          |
| `uploaded_file`     | Files              | work      | `uploaded_files`     | `original_filename`                                       | `search`          |
| `institution`       | Institutions       | reference | `institutions`       | `name`, `common_name`                                     | **`q`**           |
| `program`           | Programs           | reference | `institutions`       | `title`                                                   | **`q`**           |
| `document_template` | Document templates | reference | `document_templates` | `label`, `key`                                            | `search`          |
| `signatory`         | Signatories        | reference | `document_templates` | `name`                                                    | `search`          |

Build this table from the endpoint at runtime — it is reproduced here for orientation,
not as a hardcoding licence. Within the `applicant` and `lead` buckets, hits are
**relevance-ranked** (exact name > prefix > substring); other buckets use their owning
module's default ordering.

## 5. Enums

- `SearchHit.entity_type` / `SearchBucket.entity_type` / `SearchableType.key`:
  `applicant` | `lead` | `client` | `document` | `uploaded_file` | `institution` |
  `program` | `document_template` | `signatory`
- `SearchBucket.group` / `SearchableType.group`: `people` | `work` | `reference`
- `SearchableType.list_search_param`: `search` | `q`
- `SearchHit.matched_on` values, by `entity_type`: as in the table above.

## 6. Dependency order

`search` needs a session from `authenticate` and nothing else. Searching an empty system
returns nine empty buckets and `total_hits: 0`, not an error.

**Start here:** `GET /api/v1/search/types/` once at startup, then `GET /api/v1/search/`.

## 7. Endpoints

### Global search — `GET /api/v1/search/`

Permission `search.query.read`, risk medium. Read-only; **query parameters only**.

| Param            | Type                 | Required | Default | Rules                                                                           |
| ---------------- | -------------------- | -------- | ------- | ------------------------------------------------------------------------------- |
| `q`              | `string`             | **Yes**  | —       | **≥2 characters after trimming**, ≤150. Unicode-normalised server-side          |
| `types`          | comma-separated keys | No       | all 9   | An unknown key is a **400, not ignored**. De-duplicated; caller order discarded |
| `limit_per_type` | `number`             | No       | `5`     | **1–20. 21 is a 400, not a clamp**                                              |

**Returns:** `SearchResult`. **Side effects:** none — nothing is written anywhere, and
**searches are not recorded in the audit log**.

### Searchable types — `GET /api/v1/search/types/`

Permission `search.type.list`, risk low. **Takes no parameters at all.** Returns
`SearchableType[]`. Static per deployment — **fetch once and cache for the session.**

## 8. Error codes

| Code                      | HTTP | Trigger                                                                                                                                                     |
| ------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VALIDATION_ERROR`        | 400  | `q` missing / <2 chars after trimming / >150; `types` naming an unknown key; `limit_per_type` outside 1–20. The offending field is named in `error.details` |
| `SEARCH_ACTOR_FORBIDDEN`  | 403  | A `superadmin` token, on either endpoint                                                                                                                    |
| `AUTHENTICATION_REQUIRED` | 401  | Missing or invalid bearer token                                                                                                                             |
| `RATE_LIMIT_EXCEEDED`     | 429  | More than 60 searches in a minute. **Carries `Retry-After`** — honour it and keep the previous results on screen                                            |

There is exactly **one** app-specific code, by design.

## 9. Gaps

- **`subtitle` composition is not contractually pinned.** It is assembled from different
  fields per `entity_type` and joined with a space-padded `·` separator. Treat it as opaque display text;
  **never parse it.**
- **`matched_on` for `program` can be empty** when the match came through the
  institution's name. There is no way to distinguish "matched via institution" from
  "matched, field unknown".
- **`clients.spokesperson_name` is searched but not trigram-indexed** (the directory is a
  bounded table — a deliberate decision), as are `document_template` label and key
  (~53 rows).
- **Journeys, offers, and checklists are not searchable** and are not planned to be.
  None has a name of its own; all are reached by navigating from the applicant.
- **Searches are not audited.** Whether "who looked up whom" should be recorded is an
  open question and is not currently answered either way.
- **Whether a Lead Manager should see all applicants, documents, and catalogue records is
  unresolved project-wide.** Today they do, because those modules do not narrow their own
  lists. If that answer changes, these buckets narrow with it and totals will drop.
  **Grandway does not wait on it:** the client sends a capability-derived `types=`
  allowlist, because the app's own `documents` capability is `false` for that tier and an
  unfiltered render would produce hits that dead-end in a forbidden panel.

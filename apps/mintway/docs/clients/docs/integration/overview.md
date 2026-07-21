# Overview — Client Directory (`clients`)

**Pack version:** 1.5.0 · **Backend source version:** 1.5.0 · **Synced:** 2026-07-20

> Frontend pins to this version. When the backend Change History below moves past
> it, re-sync and bump.

## Change history

| Version | Date       | Summary                                                                                                                      |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-20 | Client core — CRUD, status transitions, archive/restore, admin lock/unlock, audit.                                           |
| 1.1.0   | 2026-07-20 | Phase 2 directory detail — contacts, addresses, aliases, tags; embedded children + broadened search/filters.                 |
| 1.2.0   | 2026-07-20 | Phase 2 logo — upload/replace/stream/remove + thumbnail; logo_url/logo_thumbnail_url on client list/detail; has_logo filter. |
| 1.3.0   | 2026-07-20 | Phase 3 — ranked search + trigram; duplicate warnings + override_reason; lookup + duplicate-check endpoints.                 |
| 1.4.0   | 2026-07-20 | Phase 4 — document-prefill packet + audit-trail read; domain-event outbox deferred.                                          |
| 1.5.0   | 2026-07-20 | Phase 5 — merge + merge-history (admin+); CSV export (staff+) + import (admin+).                                             |

## Purpose

Owns the authoritative directory of external organizations the company deals with
(companies, educational institutions, banks, cooperatives, government offices,
NGOs/INGOs, embassies, vendors, training providers) — together with their **contact
persons, addresses, aliases, tags, and logo** — plus its immutable audit trail. It is a
**standalone master-data module** — it does **not** own applicants (that is the
`applicant` module), authentication/roles (the `authenticate` module), or
access-control metadata (`core.policy_engine`). It has **no** cross-app model
dependencies and **no** tenant/organization scoping: `client_code` is globally
unique.

## Base paths

| Prefix                                   | Holds                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `/api/v1/clients/`                       | Client list/create/detail + archive/restore/lock/unlock actions                             |
| `/api/v1/clients/{id}/merge/`            | Merge a duplicate into this survivor (admin/superadmin only)                                |
| `/api/v1/clients/{id}/merge-history/`    | Merge records where this client is survivor or duplicate (admin/superadmin only; paginated) |
| `/api/v1/clients/export/`                | Streamed `text/csv` export of the filtered directory (staff+; throttle-flagged)             |
| `/api/v1/clients/import/`                | Bulk CSV import (admin/superadmin only; multipart; ≤1000 rows; throttle-flagged)            |
| `/api/v1/clients/lookup/`                | Reduced ranked lookup for dropdowns / document-prefill (not paginated)                      |
| `/api/v1/clients/duplicate-check/`       | Preflight duplicate analysis (no write; advisory matches only)                              |
| `/api/v1/clients/{id}/document-prefill/` | Read-time document-prefill packet (staff+; consumer snapshots the values)                   |
| `/api/v1/clients/{id}/audit-events/`     | Immutable audit trail read (admin/superadmin only; paginated)                               |
| `/api/v1/clients/{id}/contacts/`         | Contact persons (nested; list/create/detail/deactivate)                                     |
| `/api/v1/clients/{id}/addresses/`        | Addresses (nested; list/create/detail/deactivate)                                           |
| `/api/v1/clients/{id}/aliases/`          | Aliases (nested; list/add/remove)                                                           |
| `/api/v1/clients/{id}/tags/`             | Tag assignments for one client (nested; list/assign/unassign)                               |
| `/api/v1/clients/tags/`                  | Company-wide tag catalog (read-only list for filter dropdowns)                              |
| `/api/v1/clients/{id}/logo/`             | Client logo — upload/replace/stream/remove (nested)                                         |
| `/api/v1/clients/{id}/logo/thumbnail/`   | Client logo thumbnail — authenticated stream (nested)                                       |

## Auth

- Session-bound JWT: `Authorization: Bearer <access>`. Every endpoint requires an
  authenticated staff (or higher) account.
- Unauthenticated → **401**; authenticated non-staff → **403**. On a hard 401 the
  api client should redirect to login.

## Response envelope

Every JSON response is wrapped. **Map the envelope to your UI shape at the API
layer** so components never see the raw wrapper.

```jsonc
// success
{ "success": true, "message": "...", "data": { /* the resource */ }, "meta": {} }
// error
{ "success": false, "error": { "code": "...", "message": "...", "details": {} }, "meta": {} }
```

- `data` is the resource (or `list` payload). Unwrap to `data`.
- `error.code` is the machine-readable key — **switch UI behavior on `code`, not
  on `message`** (message is human copy, may change).
- `error.details` carries per-field serializer errors when present (shape not
  fully enumerated → see `gaps.md`).

## Pagination

Lists are paginated. `meta` carries `{ count, page, page_size, next, previous }`.

- Request: `?page`, `?page_size` (**max 100**).
- **Map `meta.count` → `total`** at the API layer.
- `next` / `previous` are full absolute URLs (or `null` at the ends).

## Ordering, search, filtering

Passed as query params on list endpoints; the exact set is on the entity's
**Endpoints** section. `ordering` is a comma list of field names, prefix `-` for
descending, **whitelisted** to `legal_name`, `display_name`, `client_code`,
`created_at`, `updated_at`, `relationship_started_on`. `search` matches
case-insensitively (`.distinct()`) across name + romanized projections,
`client_code`, normalized email/phone/domain/registration/tax, **and now also the
client's aliases, active contact names, active address localities, and tag names**
(Phase 2). The client list also gains a `tag` filter (by normalized tag name), a
`has_spokesperson` boolean, and a `has_logo` boolean. Privileged actors get extra
date filters and `include_archived` (see `client.md` §3).

**Ranked search (Phase 3).** When `search` is present **and no explicit
`ordering` is given**, the client list comes back **ranked by match priority**
(exact code → exact registration/tax → exact name → exact alias → exact
email/phone/domain → name prefix → contact-name → fuzzy) — so the best matches
lead. Passing an explicit `ordering` overrides the ranking with that sort.
Trigram (`pg_trgm`) GIN indexes accelerate the underlying match on PostgreSQL;
they change no request or response shape (a pure performance concern).

## IDs, dates, money

- **IDs** are string UUIDs everywhere.
- **Timestamps** are ISO 8601 strings.
- **Bikram Sambat siblings:** the **admin** detail projection carries read-only
  `<field>_bs` objects `{ year, month, day, month_name_en, month_name_np,
display_en, display_np }` for `established_date`, `relationship_started_on`, and
  `relationship_ended_on`. Render `display_en` / `display_np`; the plain field
  stays the AD source of truth. Never send `_bs` — it is response-only, and it is
  absent from the staff projection.
- **Money:** None. This module has no money fields in Phase 1.
- **Empty vs null.** A field marked `Nullable=Yes` can come back `null`
  (`established_date`, `relationship_started_on`, `relationship_ended_on`,
  `locked_at`, `archived_at`). An **optional text/enum** field marked
  `Nullable=No` (Django `blank=True`, not DB-null) comes back as an **empty string
  `""`** when unset — never `null`. So the DTO types it `string` (or the enum),
  and a fallback tests `value === ""`, not `value == null`. Only `Nullable=Yes`
  fields are typed `| null`.

## Media (logo)

The client **logo** is stored in **private** on-prem media with **no public URL**.
It is served only through **authenticated** stream endpoints; a client read/list
exposes `logo_url` / `logo_thumbnail_url` that point at those endpoints (or `null`
when there is no logo / no thumbnail). Because the stream is authenticated, a plain
`<img src={logo_url}>` only works if your app forwards the bearer token — otherwise
fetch the bytes with the `Authorization` header and render an object URL. Full
contract in `logo.md`.

## Duplicate warnings (meta)

Duplicate detection is **advisory, never blocking** (Phase 3). A `POST` (create)
or `PATCH` (update) **always succeeds**; if the submitted values collide with an
existing non-archived client, the same success response carries the warning in
`meta`: `{ possible_duplicate: true, duplicate_matches: [ … ] }` (absent when
there is no match). Each match row is **privacy-safe** — the peer's
`legal_name` is **masked** to first-initials (e.g. `T***** E**********`) and only
its public `client_code` plus boolean signal flags are returned. To proceed
deliberately despite a warning, resubmit with a top-level `override_reason`
string (audited). A preflight `POST /api/v1/clients/duplicate-check/` returns the
same match rows under `data.matches` **before** you submit, so the UI can warn
early. Full field shape + the `lookup` projection are in `client.md`.

## Document prefill & audit trail (Phase 4)

Two read-only projections were added in Phase 4 — both live on the `Client`
entity (`client.md` §3), no new entity file.

- **Document prefill** (`GET /api/v1/clients/{id}/document-prefill/`, **staff+**):
  a read-time **snapshot packet** of a client's reusable identity / contact /
  spokesperson / logo fields for seeding a document form. It **excludes**
  `internal_notes` and all lock/version/audit internals, and returns only for a
  **non-archived** client (archived / unknown id → `404 CLIENT_NOT_FOUND`).
  **Historical-safety contract (mandatory):** the packet returns **live** values,
  so the **consumer must copy them into the document at generation time and store
  them** — a rendered/issued document must **never** depend on the live client
  record, so a later client edit can never mutate an already-issued document.
  `clients` owns the contract and serves the live values; there is no document
  module in this standalone app.
- **Audit trail** (`GET /api/v1/clients/{id}/audit-events/`, **admin/superadmin
  only** — staff → `403`): the immutable, append-only event log for one client,
  **paginated** (standard `meta` `{ count, page, page_size, next, previous }`),
  **newest first**. Rows are read-only; `event_type` is the `Audit` enum in
  `enums.md`. `metadata` was sanitized at write time (no credential/identity
  plaintext).

## Merge & bulk CSV (Phase 5)

Three operational surfaces were added in Phase 5 — all live on the `Client` entity
(`client.md` §3), **no new entity file**.

- **Merge** (`POST /api/v1/clients/{id}/merge/`, **admin/superadmin only** — staff
  → `403`): fold a `duplicate_id` into the survivor at `{id}`. Body carries a
  mandatory `reason` and an optional `field_resolutions` map
  (`{field: "duplicate"}`) picking scalar fields to take from the duplicate. The
  duplicate is **retained** (never deleted) and archived pointing at the survivor;
  the survivor's invariants win; children transfer; an immutable
  `ClientMergeRecord` + a `client_merged` audit event are written in one
  transaction. The response `meta` carries `merge_record_id` + `transferred`
  counts. This is a **destructive admin action** — confirm before calling.
- **Merge history** (`GET /api/v1/clients/{id}/merge-history/`, **admin/superadmin
  only** — staff → `403`): **paginated** `MergeRecord[]` for merges where the
  client is survivor or folded duplicate.
- **CSV export** (`GET /api/v1/clients/export/`, **staff+**): a streamed
  `text/csv` download (`Content-Disposition: attachment`) of the filtered
  directory — same query params as the list. Staff exports **omit**
  `internal_notes`; privileged actors get it and may include archived rows.
- **CSV import** (`POST /api/v1/clients/import/`, **admin/superadmin only** — staff
  → `403`): a **multipart** `file` upload; each row is created through the exact
  same validation + audit path as a single create (`source=import`), **max 1000
  rows**. Returns a per-row result `{ created, failed, created_ids, errors }` —
  per-row failures are reported, never fatal.

> **All five concept phases are now complete** (concept §24): Phase 1 client core,
> Phase 2 nested children + logo, Phase 3 ranked search + duplicate integrity,
> Phase 4 document-prefill + audit trail, and Phase 5 merge + bulk CSV.

## Throttling

DRF project defaults apply (no per-view scopes in Phase 1). A throttled request
returns **429**; surface a "slow down / try again shortly" state and back off.
The bulk **export** (`GET /clients/export/`) and **import** (`POST /clients/import/`)
endpoints are expensive/abuse-prone and are **flagged for per-user throttling in
deployment** — treat a `429` on either as expected under load and back off. Import
is additionally hard-bounded to **1000 rows per file** (`CLIENT_IMPORT_TOO_LARGE`).

## Role model

Two access bands, **enforced server-side** — never rely on the frontend to hide
protected data:

| Surface                                                                | staff                       | admin / superadmin                                |
| ---------------------------------------------------------------------- | --------------------------- | ------------------------------------------------- |
| List / read / create / update                                          | ✅ (restricted projection)  | ✅ (full)                                         |
| Archive / restore                                                      | ✅                          | ✅                                                |
| Lock / unlock                                                          | ❌ 403                      | ✅                                                |
| Contacts / addresses / aliases / tags (all)                            | ✅                          | ✅                                                |
| Logo (upload / stream / remove)                                        | ✅                          | ✅                                                |
| Document prefill (`.../document-prefill/`)                             | ✅                          | ✅                                                |
| Audit trail (`.../audit-events/`)                                      | ❌ 403                      | ✅                                                |
| CSV export (`.../export/`)                                             | ✅ (omits `internal_notes`) | ✅ (incl. `internal_notes`, may include archived) |
| Merge (`.../{id}/merge/`)                                              | ❌ 403                      | ✅                                                |
| Merge history (`.../{id}/merge-history/`)                              | ❌ 403                      | ✅                                                |
| CSV import (`.../import/`)                                             | ❌ 403                      | ✅                                                |
| `internal_notes`, lock actor/reason, `*_bs`, `merged_into`/`merged_at` | ❌ (absent from response)   | ✅                                                |
| Contact `notes`                                                        | ❌ (absent; cannot set)     | ✅                                                |

Two consequences the UI must respect:

1. **Role projection:** a staff token and an admin token calling the _same_ GET
   receive **different field sets**. Type the staff and admin projections
   separately (see `client.md` §2). Protected fields (`internal_notes`,
   `legal_name_romanized`, `display_name_romanized`, `locked_at`, `lock_reason`,
   `archived_at`, and the `*_bs` siblings on `Client`; `notes` on a contact) are
   simply **absent** for staff — not `null`.
2. **Non-disclosing 404:** an unknown _or malformed_ client id returns
   `CLIENT_NOT_FOUND` (404), never a distinct "exists but forbidden" signal.

## Optimistic concurrency

`Client` carries `record_version` (starts at 1, increments per write). **Every
`PATCH`, `archive`, and `restore` must echo the last-read `record_version`** in
the body; a mismatch → `409 CLIENT_VERSION_CONFLICT` — reload the resource and
retry with the fresh version. No silent last-write-wins. Lock/unlock do **not**
take a version (they take a `reason` only). Independently, a staff write against
an admin-**locked** record is rejected first with `423 CLIENT_RECORD_LOCKED`
(checked before the version comparison, so the signal is unambiguous).

## Dependency order (start here →)

Build/integrate in this order — later steps need earlier ones to exist:

1. **Authentication** (external `authenticate` module) — a staff token must exist.
2. **Client** — the aggregate root; create it first (`POST /api/v1/clients/`).
3. **Status / lifecycle changes** — via `PATCH` (status transition map) — need a
   client.
4. **Archive / restore** — soft-delete lifecycle — need a client.
5. **Lock / unlock** — admin/superadmin business freeze — need a client.
6. **Contacts / addresses / aliases / tags** — nested children; each needs a
   parent client id and inherits its lock/archive guard (see `contact.md`,
   `address.md`, `alias.md`, `tag.md`). The **tag catalog**
   (`GET /api/v1/clients/tags/`) is independent — load it for filter dropdowns.
7. **Logo** — nested media; needs a parent client id and inherits its lock/archive
   guard. Upload/replace/stream/remove; read via the authenticated `logo_url` /
   `logo_thumbnail_url` on the client (see `logo.md`).

**Independent helpers** (no ordering — wire whenever useful): `GET
/api/v1/clients/lookup/` (reduced ranked rows for dropdowns / document-prefill),
`POST /api/v1/clients/duplicate-check/` (preflight duplicate warning), `GET
/api/v1/clients/{id}/document-prefill/` (staff+ snapshot packet for a document
form — needs a client id), `GET /api/v1/clients/{id}/audit-events/`
(admin/superadmin-only paginated history — needs a client id), `POST
/api/v1/clients/{id}/merge/` and `GET /api/v1/clients/{id}/merge-history/`
(admin/superadmin-only dedup — need two client ids / a client id), and `GET
/api/v1/clients/export/` (staff+ CSV download) / `POST /api/v1/clients/import/`
(admin/superadmin-only CSV upload). All are covered on `client.md` §3 — no
separate entity file.

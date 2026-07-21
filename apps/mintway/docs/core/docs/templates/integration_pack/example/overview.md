# Overview — Applicant CRM & Documents (`applicant`)

**Pack version:** 1.6.0 · **Backend source version:** 1.6.0 · **Synced:** 2026-07-15

> Frontend `/sync-api` pins to this version. When the backend Change History
> below moves past it, re-sync and bump.

## Change history

| Version | Date       | Summary                                                           |
| ------- | ---------- | ----------------------------------------------------------------- |
| 1.0.0   | 2026-07-15 | Applicant core — CRUD, lifecycle, lock, addresses, profile image. |
| 1.1.0   | 2026-07-15 | Profile children, evidence media, identity dedupe.                |
| 1.2.0   | 2026-07-15 | CRM/compliance children, qualification assessments (supersede).   |
| 1.3.0   | 2026-07-15 | Application cases, assignments.                                   |
| 1.4.0   | 2026-07-15 | Documents (53-type registry), prefill, workspaces.                |
| 1.5.0   | 2026-07-15 | Revisions, print events, signatures, document search.             |
| 1.6.0   | 2026-07-15 | Admin duplicate merge + merge history.                            |

## Purpose

Owns the applicant (person) master record and its aggregate: lifecycle /
engagement state and history, business locking, addresses, the full profile
subrecords, private evidence media, application cases, prepared documents (with
immutable revisions + print evidence), signatures, and duplicate merge. Does
**not** own authentication/accounts (that is the `authenticate` module).

## Base paths

| Prefix                       | Holds                                              |
| ---------------------------- | -------------------------------------------------- |
| `/api/v1/applicants/`        | Applicant + all nested children, media, cases      |
| `/api/v1/application-cases/` | Case detail + transition + status history          |
| `/api/v1/documents/`         | Document detail, actions, revisions, print, search |
| `/api/v1/signatures/`        | Global signatories                                 |

## Auth

- JWT bearer / session: `Authorization: Bearer <access>`. Every endpoint requires
  an authenticated consultancy account.
- Unauthenticated → **401**. The frontend's api client already handles the
  single-flight refresh; on a hard 401 redirect to login.

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
- **Map `meta.count` → `total`** at the API layer (the admin `createResourceApi`
  primitive already does this).

## Ordering, search, filtering

Passed as query params on list endpoints; the exact set is per-entity (see each
entity's **Endpoints** section). `ordering` is a comma list of field names,
prefix `-` for descending. Filter/search availability differs by role.

## IDs, dates, money

- **IDs** are string UUIDs everywhere.
- **Timestamps** are ISO 8601 strings.
- **Bikram Sambat siblings:** protected user-facing date fields carry a read-only
  `<field>_bs` object `{ year, month, day, month_name_en, month_name_np,
display_en, display_np }`. Render `display_en` / `display_np`; the plain field
  stays the AD source of truth. Never send `_bs` — it is response-only.
- **Money** fields (`estimated_budget`, `annual_income`, `funding_amount`) are
  **decimal strings**, not numbers — keep them as strings to avoid float drift.
- **Empty vs null.** A field marked `Nullable=Yes` in an entity table can come
  back `null`. An **optional text/enum** field marked `Nullable=No` (Django
  `blank=True`, not DB-null) comes back as an **empty string `""`** when unset —
  never `null`. So the DTO types it `string` (or the enum), and code that wants a
  fallback must test `value === ""`, not `value == null`. Only `Nullable=Yes`
  fields are typed `| null`.

## Throttling

Project defaults apply: `anon` 100/h, `user` 1000/h (no custom scopes). A
throttled request returns **429**; surface a "slow down / try again shortly"
state and back off. Bulk/import UIs that fan out many writes should client-side
rate-limit to stay under 1000/h.

## Role model

Three application roles: `staff`, `admin`, `superadmin`. Access is **role-based
and enforced server-side** — never rely on the frontend to hide protected data.

| Surface                                 | staff                       | admin / superadmin |
| --------------------------------------- | --------------------------- | ------------------ |
| Applicant list / read / create / update | ✅ (restricted projection)  | ✅ (full)          |
| Addresses, profile image                | ✅                          | ✅                 |
| Transition, lock, history, archive      | ❌ 403                      | ✅                 |
| Profile / CRM children, media, cases    | ❌ 403                      | ✅                 |
| Documents, revisions, print, signatures | ❌ **404** (non-disclosing) | ✅                 |

Two consequences the UI must respect:

1. **Role projection:** a staff token and an admin token calling the _same_ GET
   receive **different field sets**. Type the staff and admin projections
   separately (see `applicant.md`). Protected fields (`date_of_birth`,
   `religion`, `counselling_notes`, summaries, follow-up, lock/convert metadata)
   are simply absent for staff — not `null`.
2. **Non-disclosing 404:** document/signature surfaces return **404, not 403**,
   to staff, so they can't infer a document exists. Treat 404 on those surfaces
   as "not available to you," not "deleted."

## Optimistic concurrency

**Some** entities carry `record_version` (starts at 1, increments per write) —
`applicant`, `document`, `application-case`. For those, **every `PATCH` /
`DELETE` / `transition` must echo the last-read `record_version`**; a mismatch →
`409 *_VERSION_CONFLICT`: reload the resource and retry with the fresh version.
No silent last-write-wins. Entities **without** `record_version` (addresses,
profile children, append-only records, signatures) take no version on write — the
per-entity file's UI-notes section states which case applies.

## Dependency order (start here →)

Build/integrate in this order — later resources need earlier ones to exist:

1. **Authentication** (external `authenticate` module) — a token must exist.
2. **Applicant** — the aggregate root; create it first.
3. **Address / profile image** — need an applicant (staff-allowed).
4. **Profile & CRM children, media, qualification assessments** — need an
   applicant + an admin actor.
5. **Application cases** — need an applicant.
6. **Documents** → **document revisions** (auto-appended per edit) and **document
   print events** (recorded on print) — need a document (+ optional case).
7. **Signatures** — global; needed before certificate documents that reference
   them.

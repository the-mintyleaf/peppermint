# Overview — Applicant CRM & Documents (`applicant`)

**Pack version:** 1.0.0 · **Backend source version:** 1.7.0 · **Synced:** 2026-07-19

> The frontend pins to this **pack version**. When the backend source version
> below moves past what this pack was built from, re-sync and bump the pack
> version + add a change-history row.

## Change history

| Version | Date       | Summary                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-19 | Initial folder pack, re-projected from backend source 1.7.0 (applicant core, lifecycle, lock, addresses, media, profile/CRM children, interest profile, qualification assessments, application cases, assignments, documents, revisions, print events, signatures, duplicate merge, and Phase-7 lead intake + `payment_status`). Replaces the legacy single-file `INTEGRATION.md`. |

## Purpose

Owns the applicant (person) master record and its aggregate: lifecycle /
engagement state and history, business locking, addresses, the full profile
subrecords, private evidence media, application cases, prepared documents (with
immutable revisions + print evidence), signatures, duplicate merge, and the
Phase-7 **lead** intake funnel (the enquiry record that precedes an applicant).
Does **not** own authentication/accounts (that is the `authenticate` module).

## Base paths

| Prefix                       | Holds                                                      |
| ---------------------------- | ---------------------------------------------------------- |
| `/api/v1/applicants/`        | Applicant + all nested children, media, cases, assignments |
| `/api/v1/applicants/leads/`  | Lead intake (list/create/detail/convert)                   |
| `/api/v1/application-cases/` | Case detail + transition + status history                  |
| `/api/v1/documents/`         | Document detail, actions, revisions, print events, search  |
| `/api/v1/signatures/`        | Global signatories                                         |

## Auth

- JWT bearer / session: `Authorization: Bearer <access>`. Every endpoint requires
  an authenticated consultancy account.
- Unauthenticated → **401**. The frontend's api client handles the single-flight
  refresh; on a hard 401 redirect to login.

## Response envelope

Every JSON response is wrapped. **Map the envelope to your UI shape at the API
layer** so components never see the raw wrapper.

```jsonc
// success
{ "success": true, "message": "...", "data": { /* the resource */ }, "meta": {} }
// error
{ "success": false, "error": { "code": "...", "message": "...", "details": {} }, "meta": {} }
```

- `data` is the resource (or list payload). Unwrap to `data`.
- `error.code` is the machine-readable key — **switch UI behavior on `code`, not
  on `message`** (message is human copy and may change).
- `error.details` carries per-field serializer errors when present. Its exact
  shape is **not enumerated** in the source → treat it as an opaque object and
  fall back to `error.message` (see `gaps.md`).

## Pagination

Lists are paginated. `meta` carries `{ count, page, page_size, next, previous }`.

- Request: `?page`, `?page_size` (**max 100**).
- `next` / `previous` are full absolute URLs, or `null` at an edge.
- **Map `meta.count` → `total`** at the API layer.

## Ordering, search, filtering

Passed as query params on list endpoints; the exact set is per-entity (see each
entity's **Endpoints** section). `ordering` is a comma list of field names,
prefix `-` for descending. Filter/search availability differs by role.

## IDs, dates, money

- **IDs** are string UUIDs everywhere.
- **Timestamps** are ISO 8601 strings.
- **Bikram Sambat siblings:** user-facing date fields carry a read-only
  `<field>_bs` object `{ year, month, day, month_name_en, month_name_np,
display_en, display_np }`. Render `display_en` / `display_np`; the plain field
  stays the AD source of truth. Never send `_bs` — it is response-only.
- **Money** fields (`estimated_budget`, `annual_income`, `funding_amount`, and
  the decimal language-test scores) are **decimal strings**, not numbers — keep
  them as strings to avoid float drift.
- **Empty vs null.** A field marked `Nullable=Yes` in an entity table can come
  back `null`. An **optional text/enum** field marked `Nullable=No` (Django
  `blank=True`, not DB-null) comes back as an **empty string `""`** when unset —
  never `null`. So the DTO types it `string` (or the enum), and code that wants a
  fallback must test `value === ""`, not `value == null`. Only `Nullable=Yes`
  fields are typed `| null`.

## Throttling

Project defaults apply: `anon` 100/h, `user` 1000/h (no custom scopes). A
throttled request returns **429**; surface a "slow down / try again shortly"
state and back off.

## Role model

Three application roles: `staff`, `admin`, `superadmin`. Access is **role-based
and enforced server-side** — never rely on the frontend to hide protected data.

| Surface                                           | staff                       | admin / superadmin |
| ------------------------------------------------- | --------------------------- | ------------------ |
| Lead intake (list / create / read / update)       | ✅                          | ✅                 |
| Lead → applicant conversion                       | ❌ 403                      | ✅                 |
| Applicant **create**                              | ❌ 403 (Phase 7)            | ✅                 |
| Applicant list / read / update                    | ✅ (restricted projection)  | ✅ (full)          |
| Addresses, profile image                          | ✅                          | ✅                 |
| Transition, lock, history, archive, merge         | ❌ 403                      | ✅                 |
| Profile / CRM children, interest, evidence media  | ❌ 403                      | ✅                 |
| Application cases, assignments, qual. assessments | ❌ 403                      | ✅                 |
| Documents, revisions, print, signatures           | ❌ **404** (non-disclosing) | ✅                 |

Three consequences the UI must respect:

1. **Role projection:** a staff token and an admin token calling the _same_
   applicant GET receive **different field sets**. Type the staff and admin
   projections separately (see `entities/applicant.md`). Protected fields
   (`date_of_birth`, `religion`, `counselling_notes`, summaries, follow-up,
   `payment_status`, lock/convert metadata, `full_name_romanized`) are simply
   **absent** for staff — not `null`.
2. **Non-disclosing 404:** document/signature surfaces return **404, not 403**,
   to staff, so they cannot infer a document exists. Treat 404 on those surfaces
   as "not available to you," not "deleted."
3. **Staff funnel through leads:** staff can no longer create an applicant
   directly (Phase 7 → 403); they capture enquiries as **leads**, which an admin
   converts into applicants.

## Optimistic concurrency

**Some** entities carry `record_version` (starts at 1, increments per write) —
`applicant`, `lead`, `application-case`, `document`. For those:

- `applicant` / `application-case` / `document`: **every `PATCH` / `DELETE` /
  `transition` must echo the last-read `record_version`** (required); a mismatch
  → `409 *_VERSION_CONFLICT`.
- `lead`: `record_version` is **optional** on `PATCH` / `convert` — checked only
  when supplied; if you send a stale one you still get `409
APPLICANT_LEAD_VERSION_CONFLICT`. Send it to be safe.

Reload the resource and retry with the fresh version on any conflict. No silent
last-write-wins. Entities **without** `record_version` (addresses, profile / CRM
children, interest profile, qualification assessments, assignments, revisions,
print events, signatures) take no version on write — each entity's UI-notes
section states which case applies.

## Dependency order (start here →)

Build/integrate in this order — later resources need earlier ones to exist:

1. **Authentication** (external `authenticate` module) — a token must exist.
2. **Lead** (staff) — the enquiry funnel; needs only an authenticated staff+
   account (no applicant). _Or_ **Applicant** directly (admin only).
3. **Applicant** — the aggregate root. Created directly by an admin, or produced
   by **converting a lead** (admin).
4. **Address / profile image** — need an applicant (staff-allowed).
5. **Profile & CRM children, evidence media, interest profile, qualification
   assessments** — need an applicant + an admin actor.
6. **Application cases** → **assignments** — need an applicant.
7. **Documents** → **document revisions** (auto-appended per edit) and **document
   print events** (recorded on print) — need a document (+ optional case).
8. **Signatures** — global; needed before certificate documents that reference
   them.

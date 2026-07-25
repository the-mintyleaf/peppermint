# Integration — Documents

**Owner app:** `documents`
**Version:** 1.1.0
**Status:** Active
**Synced:** 2026-07-25 (from `.backend/backend/documents/docs/{INTEGRATION,SECURITY}.md`)

> Re-sync with `/sync-api grandway documents` when the backend's
> Change History moves past version 1.1.0.
>
> Global conventions (envelopes, pagination, IDs, times, money, rate limits) live
> in `../CORE_INTEGRATION.md` — this file records only what `documents` adds or
> deviates from.

---

## Change History

| Version | Date       | Summary                                                                                                         |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-24 | Initial integration contract — 9 endpoints, one resource                                                        |
| 1.0.1   | 2026-07-24 | No endpoint change. `document_history` documented as a consumer; print/recover gaps closed                      |
| 1.0.2   | 2026-07-24 | No endpoint change. `document_templates` documented as a consumer; slug count corrected to 53                   |
| 1.0.3   | 2026-07-24 | No endpoint change. `uploaded_files` moved to the now-exists list; named the file calls a client makes          |
| 1.1.0   | 2026-07-24 | History entries gained `actor_id` (shape owned by `audit`). Additive. `audit` recorded as a read dependency too |

---

## 1. Module

- **Name:** Documents — the editable document working record: identity,
  ownership, template association, status, and the entered source data staff
  type into the document workspace. **The backend is not the rendering engine** —
  it stores `content` verbatim and the frontend renders it and computes every
  display value. Owns no file storage, no print snapshots, and no template
  catalogue.
- **Base path:** `/api/v1/documents/`
- **Auth — Admin only, reads included.** Bearer access JWT on every endpoint.
  `admin` may do everything; **`lead_manager` and `superadmin` are both refused
  403 on every route, `GET` included.** This is the strictest access model in the
  project and the first where a Lead Manager is denied a _read_. A documents panel
  must be **hidden entirely** for a Lead Manager — never rendered read-only, never
  shown empty. An empty panel asserts "this applicant has no documents", which is
  false, and knowing _which_ applicants have bank statements on file is itself
  disclosure. There is no metadata-only or "exists but not its contents" tier.

## 2. Requires

| Depends on     | Kind                      | Why                                                                                                                                                           | What breaks without it                                                                                          |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `authenticate` | framework/JWT + FK        | Issues the access JWT and supplies `authority_type` (the whole access check). `created_by` (`PROTECT`), `archived_by` (`SET_NULL`) reference users.           | Every endpoint 401s; any non-Admin gets 403 `DOCUMENTS_ACTOR_FORBIDDEN`; attribution unresolvable.              |
| `applicants`   | FK + service call         | An applicant-owned document points at one, resolved through `applicants.selectors.get_applicant_by_id` on create.                                             | Only standalone documents could be created; `POST` returns 400 `DOCUMENTS_APPLICANT_NOT_FOUND` for a bad id.    |
| `audit`        | service call + read shape | Every mutation appends one immutable event; the history endpoint reads audit's selector and renders audit's shared entry shape (read **and** write coupling). | Module does not start. If only the write path failed, saves would leave no trace and `/history/` returns empty. |

**This module writes to nothing outside itself** — creating, editing, or
archiving a document never touches the applicant's status or any other record.

**Three sibling apps this module deliberately does not contain (all now exist):**

- `uploaded_files` (`/api/v1/files/`) — file storage/verification/versioning. **A
  document has no attachment field here.** Attach with `POST /api/v1/files/`
  (`document=<id>`) and list with `GET /api/v1/files/?document=<id>`; this module
  returns no file references. Cross-app; the attachments panel is a second call
  the screen joins itself.
- `document_history` (`/api/v1/document-history/`) — immutable print snapshots.
  It **consumes** this module (holds `PROTECT` FKs to `Document`; recovers a body
  through this module's own update service). Printing, reprinting, and recovering
  a previous body all live there. **No field on `Document` reports whether it has
  ever been printed** — ask `document_history`. A `snapshot.recover` surfaces here
  as an ordinary `document_updated` event; refetch after one rather than trusting
  a cached copy.
- `document_templates` (`/api/v1/document-templates/`) — the signatory library
  and template-slug catalogue. That module imports _this_ one's `family` enum and
  slug rule; this module imports nothing from it and **does not consult it**. Both
  the `template_key` catalogue and the signatory ids are advisory — see §9.

## 3. Conventions

- **Response/Error envelopes:** the standard project envelope (`../CORE_INTEGRATION.md` §3) —
  `{ success, message, data, meta }` / `{ success: false, error: { code, message, details } }`.
  `error.details` is always present (`{}` when no field errors). **Do not assert on `message`** —
  branch on HTTP status and `error.code`.
- **`DOCUMENTS_ACTOR_FORBIDDEN` replaces the global `PERMISSION_DENIED`, it does not coexist with it.**
  You will not see `PERMISSION_DENIED` from `/api/v1/documents/`. It applies identically to all nine
  endpoints and is omitted from the per-endpoint error lists in §7.
- **404 is always genuine** — `DOCUMENTS_DOCUMENT_NOT_FOUND` never means "not yours"; nothing is
  hidden from an Admin, and Admins are the only readers.
- **The backend never touches the body.** `content` is returned exactly as sent. It computes no
  running balances, debit/credit totals, closing balance, interest/tax rows, or amount-in-words —
  and it does **not strip** them if you send them (§9). Never read a derived value back as truth.
- **`content` replaces wholesale on `PATCH` — it is not merged.** A partial `content` silently
  discards every key it omits. Send the complete body on every save. Most likely integration mistake
  in this module.
- **Immutable fields are REJECTED on `PATCH`, not ignored** (unlike `institutions`, which drops them).
  `applicant`/`family`/`template_key` → 400 `DOCUMENTS_OWNERSHIP_IMMUTABLE`; `status`/`archive_reason`/`archived_at`/`archived_by` → 400 `DOCUMENTS_STATUS_IMMUTABLE`. Send only the fields the user changed.
  Do not reuse a read-modify-write-the-whole-object edit form from the catalogue screens.
- **Nothing is ever deleted — there is no `DELETE` on any endpoint.** Withdrawal is archive with a
  mandatory reason; the record is kept forever and stays in unfiltered list results.
- **An archived document is frozen.** `PATCH` and the status action both return 409
  `DOCUMENTS_DOCUMENT_NOT_EDITABLE` until it is restored. `is_editable` is then `false`.
- **A `PATCH` that changes nothing writes no audit event** — still 200 with the unchanged record. A
  UI showing "saved, history updated" after a no-op save is lying.
- **HTTP:** `POST /documents/` → 201; every other success → 200. Domain-rule violations → 400; state
  conflicts (edit/status/archive/restore on the wrong state) → 409; missing URL record → 404;
  authority failure → 403; unrouted method → 405 `METHOD_NOT_ALLOWED`.
- **Pagination:** page-number based, `page`/`page_size` (default 20, max 100; over-max clamped).
  Applied to all three list endpoints (documents, workspaces, history). `data` is the bare array;
  page metadata (`count`, `page`, `page_size`, `next`, `previous`) lives in `meta`.
- **Ordering is fixed and not client-controllable** — no `sort`/`ordering` param. Documents by
  `-updated_at`, workspaces by `-last_updated`, history newest-first.
- **IDs:** UUID strings. `template_key` is a human-readable slug but is **not** an addressable
  identifier. **Times:** ISO 8601 UTC. **Only `archived_at` carries a Bikram Sambat sibling**
  (`archived_at_bs`, `{ year, month, day, month_name, display }` or `null`); `created_at`/`updated_at`
  never do, and dates _inside_ `content` are opaque and never parsed or converted.
- **Empty text fields are `""`, never `null`.** The only nullable fields are `applicant`,
  `applicant_name`, `archived_at`, and `archived_by_username`.
- **Invalid query params are rejected 400, not ignored** — `?family=banks` errors rather than
  returning an unfiltered set. `standalone` is a boolean (`true`/`false`/`1`/`0`); omitting it
  returns both kinds.

## 4. Models

**Document — list shape** (`GET /api/v1/documents/` rows): `{ id, applicant?, applicant_name?, is_standalone, family: enum, template_key, label, status: enum, is_archived, created_at, updated_at }`.

- **`content` is deliberately ABSENT from the list** — a page of twenty bank statements would carry a
  megabyte of transaction rows nothing renders. Fetch the detail for a body.
- `applicant` and `applicant_name` are both `null` on a standalone document.

**Document — detail shape** (retrieve, create, update, status, archive, **and** restore): the list
shape **plus** `{ content: json, standalone_purpose, notes, is_editable, archive_reason, archived_at?, archived_at_bs?: json, archived_by_username?, created_by_username }`.

- **`content` is opaque JSON — whatever you stored.** Its shape depends on `family` + `template_key`;
  the backend neither validates nor interprets it. Must be a JSON **object** (not array/scalar),
  ≤ 256 KiB. The authoritative per-family shapes are the frontend's own contract.
- `archive_reason` is non-empty only when `status` is `archived`; restoring clears it.

**WorkspaceSummary** (`GET /api/v1/documents/workspaces/` rows): `{ applicant_id, applicant_name, document_count, last_updated }`.

- One row per applicant who has **live** documents. **Standalone documents are excluded** (no
  applicant to group under) and **archived documents are excluded from the count** — an applicant
  whose documents are all archived does not appear. Answers "whose files have live work".
  `last_updated` is the max `updated_at` across that applicant's live documents.

**HistoryEvent** (`GET /api/v1/documents/<id>/history/` rows): `{ id, action: enum, actor_type: enum, actor_id: uuid|null, actor_label, summary, reason, changes: json, metadata: json, created_at, created_at_bs: json }`.

- Owned by the `audit` module (its `AuditEventHistoryEntry`); this app renders it, every module's
  `/history/` returns the identical shape. `actor_id` is the acting user's UUID or `null` for
  system/AI actors — prefer it over `actor_label` (a preserved username snapshot) when linking.
- `changes` maps field → `{ from, to }` (both stringified); `{}` on creation events.
- **A body change appears as `changes.content = { from: "<changed>", to: "<changed>" }`** — the
  literal marker, never the body. The body is never written to the audit log. **You cannot recover a
  previous body from the history.**

## 5. Enums

- **`Document.family`** (6): `student` | `woda` | `lor` | `moi` | `bank_statement` | `bank_certificate`.
  - The backend's type vocabulary — **not the 53 slugs.** Bank documents are **two** families, not
    one: a statement and a certificate have different content shapes and different screens.
- **`Document.status`** (3): `draft` | `ready` | `archived`.
  - **No `printed`, and there will not be one** — print snapshots live in `document_history` and
    capturing one deliberately does not touch this field.
  - **No `submitted`** — the (different) frontend's third value maps to `ready`. Nothing in Grandway
    submits a document anywhere.
  - `archived` is **not** reachable through the status action; it requires the archive endpoint and a
    reason.
- **`template_key`** — **not an enum.** A lowercase ASCII slug matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`,
  up to 100 chars, which must agree with `family` by prefix (`student-`, `woda-`, `lor-`, `moi-`,
  `bank-`) and, for the two bank families, by suffix (`-statement`, `-certificate`). A new bank
  partner is a new slug value, not a backend deploy.
- **`HistoryEvent.action`** (5): `document_created` | `document_updated` | `document_status_changed` | `document_archived` | `document_restored`.
- **`HistoryEvent.actor_type`** (5): `superadmin` | `admin` | `lead_manager` | `system` | `ai` — the
  `audit` enum. In practice only `admin` appears here, since only Admins can write.

## 6. Dependency order

1. A `Document` needs an `Applicant` **(external module: `applicants`)** — _unless_ it is standalone,
   in which case it needs a `standalone_purpose` instead. **Exactly one of the two.**
2. For an applicant-owned document, obtain the applicant id from `GET /api/v1/applicants/` (or the
   file already being viewed), then `POST /api/v1/documents/`.
3. A standalone document can be posted immediately with a `standalone_purpose` — no prerequisite
   record at all. Everything else operates on an existing document id.

## 7. Endpoints

All nine are Admin-only; `DOCUMENTS_ACTOR_FORBIDDEN` (403) applies to every one and is omitted below.
**There is no `DELETE`.**

| Endpoint                          | Method | Policy key                           | Auth       | Notes                                                                                                            |
| --------------------------------- | ------ | ------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `/api/v1/documents/`              | GET    | `documents.document.list`            | Admin only | Omits `content`. Filters: `applicant`, `standalone`, `status`, `family`, `template_key`, `search`, `fiscal_year` |
| `/api/v1/documents/`              | POST   | `documents.document.create`          | Admin only | 201. `family` + `template_key` cross-validated; either `applicant` or `standalone_purpose`                       |
| `/api/v1/documents/workspaces/`   | GET    | `documents.document.list_workspaces` | Admin only | One row per applicant with live docs; excludes standalone & archived. Literal segment                            |
| `/api/v1/documents/<id>/`         | GET    | `documents.document.read`            | Admin only | **The only endpoint that returns `content`** (risk: high)                                                        |
| `/api/v1/documents/<id>/`         | PATCH  | `documents.document.update`          | Admin only | `content` replaces wholesale; immutable fields rejected; 409 if archived                                         |
| `/api/v1/documents/<id>/status/`  | POST   | `documents.document.change_status`   | Admin only | `draft`/`ready` only; `archived` refused. 409 if archived                                                        |
| `/api/v1/documents/<id>/archive/` | POST   | `documents.document.archive`         | Admin only | Reason mandatory. **This is what the delete button becomes.** Doc stays in list                                  |
| `/api/v1/documents/<id>/restore/` | POST   | `documents.document.restore`         | Admin only | Always returns to `draft`, never `ready`                                                                         |
| `/api/v1/documents/<id>/history/` | GET    | `documents.document.list_history`    | Admin only | Backed by `audit`; body changes shown as a marker only                                                           |

### Request bodies

- **Create:** `family` (**required**), `template_key` (**required**), `label` (**required**); then
  **either** `applicant` (UUID) **or** `standalone_purpose`; plus optional `content`, `notes`.
  `content` defaults to `{}`. `status` not accepted — always starts `draft`.
- **Update:** any subset of `label`, `content`, `standalone_purpose`, `notes` — **and nothing else.**
  Sending `applicant`/`family`/`template_key` or `status`/archive fields fails the whole request.
  `content` is replaced wholesale; `standalone_purpose` cannot be cleared once set.
- **Change status:** `{ status }` — `draft` or `ready` only. Re-sending the current status is a no-op.
- **Archive:** `{ reason }` — required, non-empty (whitespace-only is rejected).
- **Restore:** no body.

## 8. Error codes

| Code                                   | HTTP | Notes                                                                                         |
| -------------------------------------- | ---- | --------------------------------------------------------------------------------------------- |
| `DOCUMENTS_ACTOR_FORBIDDEN`            | 403  | Any non-Admin on any endpoint (reads included). Replaces `PERMISSION_DENIED`                  |
| `DOCUMENTS_DOCUMENT_NOT_FOUND`         | 404  | Always genuine                                                                                |
| `DOCUMENTS_APPLICANT_NOT_FOUND`        | 400  | Create — no applicant with that id                                                            |
| `DOCUMENTS_OWNER_REQUIRED`             | 400  | Neither `applicant` nor `standalone_purpose` given, or purpose cleared on save                |
| `DOCUMENTS_TEMPLATE_KEY_INVALID`       | 400  | The slug does not agree with `family` (came from different pickers — a UI bug)                |
| `VALIDATION_ERROR` (on `template_key`) | 400  | Slug malformed — uppercase, spaces, or underscores. Slugs are lowercase ASCII, single hyphens |
| `DOCUMENTS_CONTENT_INVALID`            | 400  | `content` is not a JSON object                                                                |
| `DOCUMENTS_CONTENT_TOO_LARGE`          | 400  | `content` exceeds 256 KiB (realistically a very long bank statement)                          |
| `DOCUMENTS_OWNERSHIP_IMMUTABLE`        | 400  | `PATCH` carried `applicant`, `family`, or `template_key`; `details` names each                |
| `DOCUMENTS_STATUS_IMMUTABLE`           | 400  | `PATCH` carried `status`, `archive_reason`, `archived_at`, or `archived_by`                   |
| `VALIDATION_ERROR` (on `status`)       | 400  | Status action sent `archived` (fails serializer — archive needs its own endpoint)             |
| `DOCUMENTS_STATUS_INVALID_TRANSITION`  | 400  | Reserved — a status outside the selectable set that passes serializer validation              |
| `DOCUMENTS_DOCUMENT_NOT_EDITABLE`      | 409  | `PATCH`/status on an archived document. Refetch and switch to read-only                       |
| `DOCUMENTS_ARCHIVE_REASON_REQUIRED`    | 400  | Archive — reason missing or whitespace-only                                                   |
| `DOCUMENTS_DOCUMENT_ALREADY_ARCHIVED`  | 409  | Archive on an already-archived document                                                       |
| `DOCUMENTS_DOCUMENT_NOT_ARCHIVED`      | 409  | Restore on an active document                                                                 |

## 9. Gaps

**Blocking — features the concept describes with no endpoint here**

- **Signature references are unvalidated.** `content.instructorId` / `content.directorId` on
  certificate templates name records in `document_templates`, fetchable from
  `GET /api/v1/document-templates/signatories/?status=active`, but this module stores `content` opaque
  and never looks inside it. A typo, a stale id, or a `draft` signatory's id are all accepted
  silently — **your dropdown is the only guard.**
- **The template catalogue is advisory; `template_key` is not checked against it.** `document_templates`
  holds a registry of slugs; this module does not consult it. A well-formed slug matching its family
  prefix is accepted whether or not it is registered or retired (`bank-vyass-statement` passes). **The
  picker — populated from `GET /api/v1/document-templates/templates/?status=active` — is the only
  guard.**
- **No supporting files on this resource.** A document payload carries no file references at all — no
  count, no ids. Files are reachable only from `uploaded_files` via `GET /api/v1/files/?document=<id>`;
  a screen showing a document and its attachments makes two calls and joins them.

**Behavioural — things that will surprise a client**

- **A client-supplied derived value is stored, not stripped.** Posting `statement_debit_total` gets it
  persisted and returned — the backend cannot strip it without knowing all 53 shapes. Never read a
  derived value back as truth; recompute from the inputs.
- **`content` is replaced wholesale on `PATCH`, not merged** — sending one key on a ten-key body leaves
  one key. Send the complete body.
- **A previous body is recoverable only if somebody printed it.** No field history, no versioning, and
  the audit log redacts the body — `document_history` snapshots are the only record of a previous body.
  Editing a never-printed document loses its previous contents irrecoverably.
- **`content` is not sanitized or escaped** — returned exactly as stored; escaping on render is the
  frontend's responsibility.
- **`?search=` matches `label` only** — not the body, not the applicant's name, not `template_key`.
- **No cascade from applicants.** `applicant` is `PROTECT`; no document is ever removed as a side effect.
- **No bulk operations** — no bulk create, archive, or export.

**Frontend contract reconciliation** — the uploaded `frontend_*` docs describe a **different backend**
(mintway: a different project, auth, and envelope). Every row is a real difference the grandway data
layer must adapt to:

| The frontend docs assume                                  | Grandway actually                                                                                                                                    |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/login/` with `{ email, password }`        | `POST /api/v1/auth/login/` with `{ username, password, device_id }`                                                                                  |
| `{ data, meta: { total, page, pageSize } }`               | `{ success, message, data, meta: { count, page, page_size, next, previous } }`                                                                       |
| `GET /api/auth/users/me/`                                 | `GET /api/v1/auth/me/`                                                                                                                               |
| `studentId` on a document                                 | `applicant` (UUID)                                                                                                                                   |
| `GET /students/:studentId/documents`                      | `GET /api/v1/documents/?applicant=<id>`                                                                                                              |
| `GET /students/:studentId/full`                           | `GET /api/v1/applicants/<id>/` — but **without** `summary`, `skills`, `experience`, IELTS scores, or education (`education`/`test_scores` not built) |
| `DELETE /documents/:id` → 204, cascade-deletes print logs | **No delete.** `POST /api/v1/documents/<id>/archive/` with a reason                                                                                  |
| Deleting a student removes their documents                | **Never.** `applicant` is `PROTECT`                                                                                                                  |
| `type: "bank-vyas-statement"` (one field)                 | `family: "bank_statement"` **and** `template_key: "bank-vyas-statement"` (two fields, cross-validated)                                               |
| `status: draft \| submitted \| archived`                  | `draft \| ready \| archived` — `submitted` becomes `ready`                                                                                           |
| `GET /documents/workspaces`                               | `GET /api/v1/documents/workspaces/` — trailing slash                                                                                                 |
| `DocumentWorkspaceSummary.studentId` / `.studentName`     | `applicant_id` / `applicant_name`                                                                                                                    |
| `GET /documents/:id/print-logs`, `POST` the same          | Different module/path: `GET /api/v1/document-history/documents/<id>/timeline/`, `POST /api/v1/document-history/documents/<id>/snapshots/`            |
| `GET /signatures?active=true`                             | Different module/path: `GET /api/v1/document-templates/signatories/?status=active` (resource `Signatory`, single `name` field)                       |
| Any authenticated user reaches these screens              | **Admin only.** A Lead Manager gets 403 on every route, reads included                                                                               |

**What the frontend gets right and must keep:** `content` carries input fields only; derived values
are computed at render and never persisted — exactly this backend's contract.

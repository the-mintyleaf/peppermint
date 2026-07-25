# Integration — Document History

**Owner app:** `document_history`
**Version:** 1.0.4
**Status:** Active
**Synced:** 2026-07-25 (from `.backend/backend/document_history/docs/INTEGRATION.md`)

> Re-sync with `/sync-api grandway document_history` when the backend's
> Change History moves past version 1.0.4.

---

## Change History

| Version | Date       | Summary                                                                                                                                                                                                                                                             |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-24 | Initial integration contract — 6 endpoints, two resources                                                                                                                                                                                                           |
| 1.0.1   | 2026-07-24 | No endpoint change. Added success status codes, the recovery response shape, the 403 on every `Errors` list, the Bikram Sambat `fiscal_year` warning, corrected the query-parameter rule, recorded three new gaps                                                   |
| 1.0.2   | 2026-07-24 | No endpoint change. Declared the recovery `Document` field set complete, defined `is_editable`, disambiguated the `-id` tiebreaker, documented capture-note propagation, empty-body capture, nullable BS objects, response size, and the unenforced permission keys |
| 1.0.3   | 2026-07-24 | No endpoint change. Recorded that signatory ids frozen into `render_context` now resolve against `document_templates` — while this module still validates nothing inside `render_context` — and that it gained no dependency on that module in either direction     |
| 1.0.4   | 2026-07-24 | No endpoint or schema change. Corrected statements that `uploaded_files` does not exist — it shipped 2026-07-24. Named the calls that store and find a generated PDF, and that nothing here will report it                                                          |

---

## 1. Module

- **Name:** Document History — the immutable print snapshots of a document, and
  the print events that produced them. The `documents` module owns the editable
  working record; this owns the frozen copies of it plus the render-time context
  needed to reproduce what the frontend showed. **Nothing stored here is ever
  edited or deleted** — by any route, by the Django admin, or by any service.
- **Base path:** `/api/v1/document-history/`
- **Auth:** Bearer access JWT on every endpoint. **Admin authority only,
  reads included.** A `lead_manager` and a `superadmin` are both refused with
  403 `DOCUMENT_HISTORY_ACTOR_FORBIDDEN` on **every route including `GET`** —
  identical to the `documents` module. A document-history panel must be
  **hidden** for a Lead Manager, not rendered read-only or shown empty.

## 2. Requires

| Depends on     | Kind           | Why                                                                                                                                                                  | What breaks without it                                                                                                         |
| -------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `authenticate` | framework/JWT  | Issues the access JWT and supplies `authority_type`, which is the whole access check here.                                                                           | Every endpoint 401s; any non-Admin gets 403 `DOCUMENT_HISTORY_ACTOR_FORBIDDEN` everywhere.                                     |
| `authenticate` | FK (`PROTECT`) | `captured_by` and `performed_by` reference user accounts.                                                                                                            | Snapshots could not record who captured or printed them.                                                                       |
| `documents`    | FK (`PROTECT`) | Every snapshot and every print event points at exactly one `Document`. There is no standalone snapshot; every route is document- or snapshot-scoped.                 | The module has nothing to snapshot; no route is reachable without a document that already exists.                              |
| `documents`    | service call   | `selectors.get_document_by_id` resolves the document id in every document-scoped route. `services.update_document` performs the **write** behind `snapshot.recover`. | Without the selector, every route 404s. Without the service, recovery is impossible and the module degrades to read-only.      |
| `audit`        | service call   | Every capture, reprint, and recovery appends one immutable event. This module keeps its own per-document timeline table separately.                                  | Snapshots still save but leave no trace in the central log. The per-document timeline still works — it is this module's table. |
| `applicants`   | none           | **No edge at all.** A snapshot reaches the applicant only through its document.                                                                                      | Nothing.                                                                                                                       |

**This module writes to exactly one thing outside itself, on exactly one
endpoint.** `POST /snapshots/<id>/recover/` writes `label` and `content` into
the working `Document` through `documents.services.update_document` — one of
only two cross-app writes in the whole project (the other is lead conversion in
`leads`). Every other endpoint is inert with respect to the rest of the system.
In particular, **capturing a snapshot does not change the document's `status`
or `updated_at`** — there is no `printed` status in `documents`, deliberately.

**Two apps this module deliberately does not contain, both of which now exist:**

- `uploaded_files` (`/api/v1/files/`) can store a client-generated PDF against a
  snapshot, but **a snapshot payload here has no file field at all** — the link
  is visible only from the file's side. See §9.
- `document_templates` (`/api/v1/document-templates/`) owns the signatory
  library whose ids you freeze into `render_context.signatories`. This module
  holds **no dependency on it in either direction** — no FK, no import, no call.
  It stores whatever `render_context` you send and never looks inside it.

## 3. Conventions

- **Response/Error envelopes:** the standard project envelope — `{ success, message, data, meta }` / `{ success: false, error: { code, message, details }, meta: {} }`. `details` is always present, `{}` when there are no field-level errors. **Do not assert on `message`** — branch on HTTP status and `error.code`.
- **Auth failures:** 401 with the `authenticate` module's codes (not enumerated here — see §9) for a missing/expired/revoked token; 403 `DOCUMENT_HISTORY_ACTOR_FORBIDDEN` for any non-Admin call. That 403 code **replaces** the project-wide `PERMISSION_DENIED` here — a handler keyed only on the global code will never fire. It is repeated at the head of every §7 `Errors` list for that reason.
- **Nothing is ever edited or deleted** — **no `PUT`, `PATCH`, or `DELETE` on any route.** A mistaken snapshot is corrected by capturing a new one. An unrouted method is 405 `METHOD_NOT_ALLOWED` inside the standard envelope.
- **The backend copies the document body; it never accepts one.** A capture request has **no `content` field**. `content`, `family`, `template_key`, and `label` are all read off the committed document row inside the capture transaction. A `content` key in the request body is ignored.
- **Recovery does not rewrite history.** It writes the frozen body _forward_ into the working document and leaves the snapshot untouched; it creates no new snapshot.
- **Pagination:** page-number based, `page`/`page_size` (default 20, max 100 — over-max is **clamped, not rejected**). `data` is the **bare array of rows** (not nested under `results`). `meta` carries `count` (total across all pages), `page`, `page_size`, `next`, `previous` (absolute URLs or `null`). Applied to both list endpoints.
- **Query-parameter encoding:** a **recognised** parameter with an invalid value is **rejected with 400** (`?event_type=printed` → `VALIDATION_ERROR`). An **unrecognised** parameter (e.g. a cache-buster `?_=…`) is **silently ignored**. There is no multi-value syntax — `?event_type=capture,reprint` is one invalid value, not two.
- **Ordering** is fixed and **not client-controllable** — no `sort`/`ordering` param. Snapshots order by `-version_number`; print events by `-created_at` then `-id` (the returned UUID string) as a tiebreaker, because a capture writes snapshot + event in one transaction and two events can share a timestamp.
- **IDs:** UUID strings — a field with no type marker below is a string. `version_number` is a small integer unique **within one document's chain only**; it cannot address a snapshot — use `id`.
- **Times:** `created_at` is ISO 8601 UTC and carries a Bikram Sambat sibling `created_at_bs` — an object `{ year, month, day, month_name, display }`, **never `null`** on either resource. Dates inside `content`/`render_context` are opaque and never parsed or given a BS sibling. **`updated_at` is not exposed on either resource** — a row that can never be updated has nothing to report.
- **Empty text fields are `""`, never `null`.** `capture_note` and `note` are `""` when not supplied. **No field on either resource is nullable.**

## 4. Models

**Snapshot — list shape** (`GET .../snapshots/` rows): `{ id, document, version_number, family: enum-as-string, template_key, label, capture_note, captured_by_username, created_at, created_at_bs: { year, month, day, month_name, display } }`.

- **`content` and `render_context` are deliberately absent from the list** — a chain of twenty bank statements would otherwise carry twenty frozen transaction arrays to render a list of dates. Fetch the detail for a body.
- `family`, `template_key`, and `label` are **frozen copies** taken at capture, not live reads. Renaming the document later does not change them — a snapshot's `label` and its document's current `label` may legitimately differ, and showing the snapshot's own is correct.

**Snapshot — detail shape** (retrieve **and** capture): the list shape **plus** `{ content: json, render_context: json }`.

- **`content` is whatever the document held at capture time, byte-for-byte** — its shape depends on `family`/`template_key`; the backend neither validates nor interprets it (per-family shapes live in `documents`' `DATA_CONTRACT.md` §2).
- **`render_context` is whatever you sent** — stored and returned verbatim, unknown keys preserved, nothing validates its shape.
- **`content` holds input fields; `render_context.computed` holds derived values.** `render_context.computed` is the running balances, totals, closing balance, and amount-in-words the renderer calculated. This split is a **convention, unenforced** — see §9.

**PrintEvent** — `{ id, snapshot, document, version_number, label, event_type: enum, note, performed_by_username, created_at, created_at_bs: { year, month, day, month_name, display } }`.

- `version_number` and `label` are **read through from the referenced snapshot**, so a timeline renders without one extra request per row. They describe the snapshot, not the event.
- A `capture` event and its snapshot are created in one transaction and share `created_at`. **A capture's event copies the snapshot's `capture_note` into its own `note`.** `reprint`/`recovery` events carry the `note` sent on their own request.
- A `reprint` or `recovery` event **has no snapshot of its own** — it points at an existing one. Several events may name the same `snapshot`.

**Document — what a recovery returns** (owned by the `documents` module; reproduced here so this response is typeable without reading the other contract — the **complete twenty-field set**, no others):

```json
{
  "id": "…",
  "applicant": "…",
  "applicant_name": "राम बहादुर",
  "is_standalone": false,
  "standalone_purpose": "",
  "family": "bank_statement",
  "template_key": "bank-vyas-statement",
  "label": "Vyas Statement",
  "content": { "…": "…" },
  "status": "ready",
  "is_archived": false,
  "is_editable": true,
  "notes": "…",
  "archive_reason": "",
  "archived_at": null,
  "archived_at_bs": null,
  "archived_by_username": null,
  "created_by_username": "adminuser",
  "created_at": "2026-07-20T04:11:23Z",
  "updated_at": "2026-07-24T12:03:11Z"
}
```

- **`label` and `content` are the two fields the recovery wrote**, taken from the snapshot. `status` and `notes` are **not touched**.
- Nullable fields (the only nullable fields in either module): `applicant`, `applicant_name` (both `null` on a standalone document), `archived_at`, `archived_at_bs`, `archived_by_username`.
- **`archived_at_bs` is nullable here**, unlike `created_at_bs` on this module's own resources, which never is. A single shared BS decoder must be nullable or it throws the first archived document it meets.
- `status` is `draft` | `ready` | `archived`. A 200 recovery can never return `archived` (recovering into an archived document is 409), so it always has `is_editable: true`. `is_archived == (status == "archived")` and `is_editable` is its exact negation — use `is_editable` to enable/grey the Recover button before calling.
- `updated_at` moves **only if the body actually changed** — a no-op recovery leaves it in place; do not use it to detect success.

## 5. Enums

- **`PrintEvent.event_type`:** `capture` | `reprint` | `recovery`.
  - `capture` — the first and only event created alongside a new snapshot (one per snapshot, always). `reprint` — a past snapshot printed again, no new snapshot. `recovery` — a past snapshot's body restored into the working document, no new snapshot.
  - **Set by which endpoint was called — the client cannot supply it.** There is no field for it in any request body.
- **`Snapshot.family`:** `student` | `woda` | `lor` | `moi` | `bank_statement` | `bank_certificate` — the same vocabulary as `documents.Document.family`, copied at capture. It is a plain `CharField` here (an open string), not a re-declared enum: a value `documents` adds later appears here with no change and no `/api/v2/`. **Do not generate a closed union from this list** — treat it as an open string with a fallback branch (see §9).
- **`Snapshot.template_key`:** **not an enum** — a lowercase ASCII slug copied from the document. `documents` validates its format; this module never re-checks it.

## 6. Dependency order

1. A `Document` must already exist (`documents` app — itself needing an `Applicant` unless standalone). There is no route in this module callable before a document exists.
2. A `Snapshot` needs that `Document`; capture creates it. There is no standalone snapshot and no way to create one directly.
3. A `PrintEvent` needs a `Snapshot` — created automatically by capture, or by calling reprint/recover on one that exists.
4. Nothing in `documents` or `applicants` needs anything from this module.

## 7. Endpoints

| Endpoint                              | Method | Policy key                             | Auth       | Notes                                                                            |
| ------------------------------------- | ------ | -------------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| `/documents/<document_id>/snapshots/` | GET    | `document_history.snapshot.list`       | Admin only | The version chain. List shape — omits `content`/`render_context`. `?fiscal_year` |
| `/documents/<document_id>/snapshots/` | POST   | `document_history.snapshot.capture`    | Admin only | Capture → **201** detail. Send `render_context`, never `content`                 |
| `/snapshots/<snapshot_id>/`           | GET    | `document_history.snapshot.read`       | Admin only | Retrieve one in full — **the only endpoint returning a frozen body**             |
| `/snapshots/<snapshot_id>/recover/`   | POST   | `document_history.snapshot.recover`    | Admin only | → **200** with a **`Document`**, not a snapshot. Writes into `documents`         |
| `/documents/<document_id>/timeline/`  | GET    | `document_history.print_event.list`    | Admin only | The chronological event list. `?event_type`, `?fiscal_year`                      |
| `/snapshots/<snapshot_id>/reprint/`   | POST   | `document_history.print_event.reprint` | Admin only | → **201** PrintEvent. Writes an event, never a snapshot                          |

All paths are prefixed `/api/v1/document-history/`. **There is no `PUT`, `PATCH`, or `DELETE` on any route.**

### Request bodies

- **Capture** (`POST /documents/<id>/snapshots/`): `{ render_context? (object, defaults {}, ≤256 KiB serialized), capture_note? (string, ≤2000) }`. **No `content` field** — content, family, template_key, and label are copied from the committed document row. `version_number` is server-allocated under a row lock (`max(existing)+1`) — never compute it client-side.
- **Recover** (`POST /snapshots/<id>/recover/`): `{ note? (string, ≤2000) }`. Nothing else — no ETag, version, or `updated_at` precondition (see §9, last-write-wins).
- **Reprint** (`POST /snapshots/<id>/reprint/`): `{ note? (string, ≤2000) }`.
- **`event_type` is never client-supplied** on any request — it is set by which endpoint is called.

### Query parameters

- **Snapshot chain** (`.../snapshots/`): `fiscal_year`, `page`, `page_size`.
- **Timeline** (`.../timeline/`): `event_type` (`capture` | `reprint` | `recovery` — one value only, no comma list), `fiscal_year`, `page`, `page_size`. **No filter by snapshot, actor, or date range** — to show "every event affecting version 2" you page the whole timeline and filter client-side.
- **`fiscal_year` is a Bikram Sambat year pair and getting it wrong fails silently.** Send `?fiscal_year=2083/84`, **not** `2026/27`. A Gregorian-looking pair passes the format check, is converted as if BS, lands the range in the 1960s, and returns an **empty list — no error**. Derive it from a `created_at_bs.year` the API already returns. It filters on the **capture** date.
- The 256 KiB `render_context` cap is measured server-side as the UTF-8 byte length of the most compact JSON encoding (separators `,`/`:`, no whitespace, raw UTF-8). Devanagari is where a pretty-printed pre-check most overestimates (3 bytes raw vs 6 escaped per char).

## 8. Error codes

| Code                                        | HTTP | Notes                                                                                              |
| ------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------- |
| `DOCUMENT_HISTORY_ACTOR_FORBIDDEN`          | 403  | Caller is not an Admin. Fires on **every** route, `GET` included. Replaces `PERMISSION_DENIED`     |
| `DOCUMENT_HISTORY_DOCUMENT_NOT_FOUND`       | 404  | No document with the id in the path. Distinct from an empty timeline/chain (which is 200 `[]`)     |
| `DOCUMENT_HISTORY_SNAPSHOT_NOT_FOUND`       | 404  | No snapshot with that id                                                                           |
| `DOCUMENT_HISTORY_RENDER_CONTEXT_INVALID`   | 400  | `render_context` is not a JSON object (an array or scalar was sent) — a client bug                 |
| `DOCUMENT_HISTORY_RENDER_CONTEXT_TOO_LARGE` | 400  | `render_context` over 256 KiB serialized. Trim per-row derived values rather than failing print    |
| `DOCUMENT_HISTORY_DOCUMENT_NOT_EDITABLE`    | 409  | **The document is archived**, not the snapshot. Restore via `POST /documents/<id>/restore/`, retry |
| `DOCUMENT_HISTORY_CONTENT_TOO_LARGE`        | 400  | Frozen body exceeds the working record's cap. **Unreachable today** — handling optional            |
| `VALIDATION_ERROR`                          | 400  | `capture_note`/`note` too long, malformed `fiscal_year`, or an unrecognised `event_type` value     |
| `METHOD_NOT_ALLOWED`                        | 405  | An unrouted method (any `PUT`/`PATCH`/`DELETE`)                                                    |

401 (missing/expired/revoked token) uses the `authenticate` module's codes, not enumerated here — see §9. `DOCUMENT_HISTORY_SNAPSHOT_IMMUTABLE` has a code but **no reachable HTTP path** (there is no update/delete route to raise it) — do not write client handling for it.

## 9. Gaps

- **A "has this been printed?" badge on a documents list costs one extra request per row, and there is no way around it.** No field on `Document` reports snapshot existence or count, and both list endpoints here require a document id — no cross-document query, no `?document_id__in=`, no batch, no aggregate. A 50-row list with a printed indicator is 50 extra calls against a shared 1000/hour budget. Design the screen around this or do not build the badge.
- **The actor is exposed only as a username string.** `captured_by_username`/`performed_by_username` are backed by `PROTECT` FKs but neither id is returned — no deep-link to a user, no avatar without a name lookup. A username is mutable, so renaming a user retroactively changes what every past snapshot appears to say. Consistent with every module, but sharp here given the module's purpose.
- **`Snapshot.family` will grow without a version bump.** §5 lists six values; the field is a plain string copied from `documents`. Do not generate a closed union — treat `family` as an open string with a fallback branch.
- **No generated-file reference on this resource.** A snapshot payload has no file field or PDF URL. `uploaded_files` (`/api/v1/files/`) can store a client-generated PDF against a snapshot (`POST /api/v1/files/` with `snapshot=<id>`, `category=generated_document`, `upload_source=system_generated`; found via `GET /api/v1/files/?snapshot=<id>`), but **nothing in this API reports it** — the link is visible only from the file's side. Store the generated PDF via `uploaded_files`, never expect this module to reference it.
- **No compare endpoint.** The "Compare Snapshots" screen is two `snapshot.read` calls diffed client-side. The backend computes, returns, and stores no diff.
- **No cross-document view.** Both list endpoints require a document id — no "everything printed this month" or "all snapshots of family `bank_statement`". `GET /api/v1/audit/events/?app=document_history` is the nearest substitute and returns audit events, not snapshots.
- **`render_context` is completely unvalidated** beyond "JSON object under 256 KiB." If your client stops sending a computed value, older snapshots keep theirs and newer ones lack it, with no error or migration. Version your own shape — `template_version` is the conventional place, but nothing enforces or reads it.
- **Nothing enforces the `content` / `render_context` split.** `content` is copied wholesale from the document, and `documents` does not strip derived values either. A snapshot whose `content` carries a stale `statement_closing_balance` is possible and the API will not flag it. Treat `content` as inputs and `render_context.computed` as outputs by convention only.
- **Signatory ids inside `render_context` are resolvable but still unvalidated.** They name records in `document_templates` (`GET /api/v1/document-templates/signatories/<id>/` resolves one; a retired signatory stays retrievable). But this module validates nothing inside `render_context` — a snapshot may name a signatory that never existed. **Freeze the signatory's name and role alongside the id**, as the §4 worked example does.
- **Capturing does not mark the document as printed.** `documents.Document.status` has no `printed` value and this module sets none. To show "has been printed" you must call the snapshot list or timeline yourself.
- **No `updated_at` on either resource.** Both models carry one internally; neither is exposed. Use `created_at`. (The `Document` returned by a recovery _does_ carry one — it belongs to `documents`.)
- **401 bodies are not enumerated here.** This contract states _that_ a missing/expired/revoked token returns 401 with `authenticate`'s codes, but not what they are — so distinguishing "refresh silently" from "redirect to login" requires reading `authenticate`'s contract.
- **No throttle beyond the project default** (`UserRateThrottle`, 1000/hour). A capture writes up to 512 KiB per call and is not separately rate-limited.
- **Snapshot retrieve is the heaviest read in the project** — a frozen body (≤256 KiB) plus its render context (≤256 KiB), both returned in full, no field-selection or partial fetch. Compare Snapshots is two of these concurrently. The list endpoints exist precisely so you do not pay this to render a chain.
- **This contract cannot tell you the caller's `authority_type`, which every access rule turns on.** Both this file and the project contract instruct you to _hide_ these screens from a non-Admin rather than let them 403 — but neither states where a client reads the caller's authority from a login response. That is `authenticate`'s contract.
- **The §7 permission keys are not enforced in the request path.** Every endpoint has one registered; no view consults it — access is decided solely by the `admin` authority check. Do not build a client-side permission gate off those keys expecting the server to agree.
- **No route-deprecation signal has been exercised.** The "nothing is ever deleted" guarantee is about **rows**, not routes — it says nothing about the stability of these six paths.

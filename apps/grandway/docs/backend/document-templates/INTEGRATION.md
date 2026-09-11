# Integration — Document Templates

**Owner app:** `document_templates`
**Version:** 1.2.0
**Status:** Active
**Synced:** 2026-09-10 (from `.backend/backend/document_templates/docs/INTEGRATION.md`,
`API.md`, `DATA_CONTRACT.md`, and `SECURITY.md`)

> Re-sync with `/sync-api grandway document_templates` when the backend's
> Change History moves past version 1.2.0.

---

## Change History

| Version | Date       | Summary                                                                                                                                                                                                                                                                                                                                                              |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-24 | Initial integration contract — 10 endpoints, two resources                                                                                                                                                                                                                                                                                                           |
| 1.0.1   | 2026-07-24 | `STATUS_INVALID_TRANSITION` renamed to `STATUS_IMMUTABLE` for the `PATCH` guard (no transition here is ever invalid); documented create-error precedence, the pagination cost of mirroring, four added gaps                                                                                                                                                          |
| 1.0.2   | 2026-07-24 | No endpoint/schema change. Corrected the claims that `uploaded_files` does not exist — it shipped 2026-07-24                                                                                                                                                                                                                                                         |
| 1.1.0   | 2026-07-25 | **Breaking:** English-only names — dropped the `_np`/`_romanized` columns and renamed `_en` fields to bare (Signatory `name`/`title`). Taken in place on `/api/v1/`                                                                                                                                                                                                  |
| 1.2.0   | 2026-09-10 | **Signature images are uploadable.** New endpoint `POST /signatories/<id>/signature/` (§7), two new `Signatory` fields (`signature_file`, `signature_source`), a real `uploaded_files` dependency (§2), and a new `SECURITY.md` (§10). `signature_image_url` retained and still honoured — additive, non-breaking. **Retires the "no signature image storage" gap.** |

---

## 1. Module

- **Name:** Document Templates — the **signatory library** that certificate
  documents name, and the **catalogue of template slugs** the document picker
  offers. This module stores what is _offered_, not what is _rendered_: the
  templates themselves are frontend code, and nothing here describes how any
  document draws itself.
- **Base path:** `/api/v1/document-templates/`
- **Auth:** Bearer access JWT on every endpoint (from `POST /api/v1/auth/login/`).
  **Admin authority only.** A `lead_manager` **and** a `superadmin` are both
  rejected with 403 `DOCUMENT_TEMPLATES_ACTOR_FORBIDDEN` on **every** route,
  reads included — identical to `documents` and `document_history`. Hide these
  screens for a Lead Manager rather than rendering them read-only.
- **This is an advisory catalogue.** `documents` never consults it: a
  template key absent from the catalogue, or present but retired, is still
  accepted when creating a document. It constrains the **picker only** — see §9.

## 2. Requires

| Depends on       | Kind                                  | Why                                                                                                                                                                                | What breaks without it                                                                                                     |
| ---------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `authenticate`   | framework/JWT + FK (`PROTECT`)        | Issues the access JWT and supplies `authority_type` (the whole access check); `created_by` on both models references a user account.                                               | Every endpoint 401s; any non-Admin 403s; attribution unrecordable.                                                         |
| `documents`      | 3 Python imports — **no DB relation** | The `family` enum, the template-key slug validator, and the key/family agreement rule (a service function called at request time). **Signatories have no `documents` dependency.** | Template creation could not validate a key; this module's family vocabulary would drift from the one `documents` enforces. |
| `audit`          | service call                          | Every mutation appends one immutable event; this module stores no history of its own.                                                                                              | Records still save but leave no trace of who changed what.                                                                 |
| `uploaded_files` | service call + FK (`PROTECT`)         | Signature bytes live in the file ledger, not here. `Signatory.signature_file` points into it; the signature endpoint calls that module's `upload_file`/`replace_file`.             | The upload endpoint fails outright; `signature_file` stays `null` and `signature_source` never leaves `"url"`/`"none"`.    |

- **No foreign key to `documents` in either direction.** This module writes to
  nothing outside itself, and nothing outside it writes here.
- **Two modules reference this one without a foreign key, and neither validates
  the reference:** `documents` stores a `Signatory.id` in
  `content.instructorId` / `content.directorId` (opaque, unvalidated JSON);
  `document_history` freezes the same id into `render_context.signatories[].id`
  at print time. Nothing stops either accepting an id that was never in the
  list — see §9.
- **`uploaded_files` is now a real relation, and it runs both ways** — the only
  such pair in the project. A file may be **owned by** a signatory (that module's
  sixth owner type), and a signatory **points at** the file that currently
  renders. The second cannot be derived from the first: archived and superseded
  predecessors stay owned by the same signatory. This is still the module's
  **only** database relation outside itself.
- **Signature files are Admin-only inside the file ledger.** `signatory` is one of
  `uploaded_files`' admin-only owner types, so per-file routes answer **404**
  (not 403) to a Lead Manager, the upload route answers 403, and the list selector
  drops the rows. Without that, the file ledger would be a side door around this
  module's access rule. **Superadmin is refused too.**
- **Signature files are excluded from the file-verification queue** (by owner, not
  by category), so they do not appear in `get_files_awaiting_verification` or the
  dashboard counts built on it. They remain reviewable directly.

## 3. Conventions

- **Response/Error envelopes:** the standard project envelope — `{ success, message, data, meta }` / `{ success: false, error: { code, message, details }, meta: {} }`. `error.details` is always present (`{}` when there are no field-level errors). **Do not assert on `message`** — branch on HTTP status and `error.code`.
- **Auth failures:** 401 (with the `authenticate` module's codes, not enumerated here — see §9) for a missing/expired/revoked token; 403 `DOCUMENT_TEMPLATES_ACTOR_FORBIDDEN` for any non-Admin, `GET` included. This 403 code **replaces** the project-wide `PERMISSION_DENIED` — a handler keyed only on the global code will never fire here.
- **Nothing is ever deleted.** There is **no `DELETE` method on any endpoint**. Retirement is a status change; a retired record stays retrievable by id forever, so old documents and snapshots keep resolving.
- **A signature can arrive two ways, and `signature_source` says which one won.** Either upload bytes with `POST /signatories/<id>/signature/` (§7), or set `signature_image_url` — a plain external link the API stores verbatim, never fetches, and never validates beyond well-formedness. **An uploaded file always wins when both are present.** **Do not re-derive that rule from `signature_file` being non-null** — an archived or superseded file stops counting and is indistinguishable from "never uploaded" in the payload. Read `signature_source` (`"uploaded"` / `"url"` / `"none"`) and render exactly one branch.
- **`signature_file.download_path` is a `fetch` target, not an `<img src>`.** It is a relative path to an authenticated route answering `Content-Disposition: attachment`; point an `<img>` at it and you get a 401 and a broken image. Fetch it with the bearer token, then `URL.createObjectURL` the blob. **Fetch each signature once per session and hold the object URL** — the route forbids caching (`Cache-Control: no-store`) and writes an audit event on **every** call, the project's only audited read.
- **Removing a signature is archiving its file** — `POST /api/v1/files/<file_id>/archive/` on the file module. There is no removal endpoint and no delete service here; do not invent one. After archiving, `signature_file` returns to `null` and `signature_source` falls back to `"url"` or `"none"`.
- **Pagination:** page-number based, `page`/`page_size` (**default 20, max 100**). `data` is the bare array of rows — **not** nested under `results`. `meta` carries `count` (total across all pages), `page`, `page_size`, `next`, `previous`. The **~53-row catalogue is three requests at the default size** — pass `?page_size=100` to mirror it in one call, and re-check that when the catalogue passes 100 rows (the max clamps silently).
- **Query parameters:** a recognised param with an invalid value is **rejected with 400** (`?status=enabled` → `VALIDATION_ERROR`); an unrecognised param (incl. a cache-buster `?_=…`) is silently ignored. `page_size` over 100 is **clamped, not rejected**. No multi-value syntax: `?status=draft,active` is one invalid value → 400.
- **IDs:** UUID strings. Every endpoint takes the UUID `id` in its path. A template's `key` is a unique slug but **is not an address** — there is **no lookup-by-key endpoint** (see §9).
- **Ordering** is fixed and **not client-controllable** (no `sort`/`ordering` param). Signatories: by `name` (alphabetical). Templates: by `family`, then `display_order`, then `label`.
- **Times.** `created_at`/`updated_at` are ISO 8601 UTC. **No Bikram Sambat sibling anywhere in this module** (unlike `documents`/`document_history`), and **no `?fiscal_year=` filter** — both timestamps are system bookkeeping on a reference library, not user-facing business dates.
- **Empty text fields are `""`, never `null`.** **Exactly one field in this module is nullable: `Signatory.signature_file`**, an object, `null` when no uploaded signature is in force. `signature_source` is never null — it reports `"none"` instead. Nothing else on either resource can be `null`.
- **Request encoding:** `application/json`, **except `POST /signatories/<id>/signature/`, which is `multipart/form-data`. Sending JSON to it returns 415** with no error code in the body — the parser rejects it before any handler runs.
- **HTTP status codes.** Three `POST`s return **201**: both collection creates and **the signature upload** (it creates a file record, though the body it returns is the signatory). Every other success (all four `GET`s, both `PATCH`es, both `POST .../status/`) returns **200**. Domain-rule violations are **400** — **this module has no 409 anywhere**, because no operation can conflict with another's state. 404 for a missing path record, 403 for authority, 405 (`METHOD_NOT_ALLOWED`) for an unrouted method.

## 4. Models

**Signatory** — one shape for **both list and detail** (there is no large column to withhold): `{ id, name, title, role, signature_image_url, signature_file: object|null, signature_source: enum, status: enum, is_active, status_note, created_by_username, created_at, updated_at }`. The list carries `signature_file` too, at no extra query cost.

**SignatureFile** (the nested `signature_file` object) — `{ id, download_path, original_filename, content_type, size_bytes, version_number, uploaded_at }`.

- **`is_active` is `status == "active"`.** A `draft` signatory is _not_ active. This is the boolean to gate a picker on.
- **`role` is free text, not an enum** (see §5). It describes who the person is, not which slot they may fill.
- **`signature_image_url` is a plain external link** and may be `""` — a signatory can exist without one, and a `draft` usually does. It is the **fallback**; an uploaded file outranks it.
- **`signature_file` is `null` in three different situations** — never uploaded, uploaded then archived, uploaded then superseded through the file module directly — and **you cannot tell them apart from this field.** You do not need to: render from `signature_source`.
- **`version_number` counts replacements from 1**, so a signatory whose signature has been replaced twice shows `3`. `size_bytes` is the stored byte count.
- **There is no field for the bytes themselves.** `download_path` is the only way to them, and it is authenticated.

**DocumentTemplate** — `{ id, key, family: enum, label, description, display_order, status: enum, is_active, status_note, created_by_username, created_at, updated_at }`.

- **`key` is the string `documents` stores** — the only field here that connects to anything outside this module. It is **unique and immutable**.
- **`label` is what you render; `key` is a machine slug** — never show the key.
- **`display_order` is per-family, not global.** Sort by `family`, then `display_order`, to reproduce the intended picker grouping; two templates in different families routinely share a `display_order`.

## 5. Enums

- **`Signatory.status` / `DocumentTemplate.status`** (both): `draft` | `active` | `inactive`.
  - **`draft`** — created but not offered. Every record starts here; there is **no way to create one `active`**.
  - **`active`** — offered for new work. `is_active` is `true` only in this state.
  - **`inactive`** — retired. Still readable by id forever; simply not offered.
  - **Any transition to any state is allowed, in any order**, including `inactive` → `active`.
- **`Signatory.signature_source`** (3): `uploaded` | `url` | `none`. **Server-computed, read-only, never null.** `uploaded` = an uploaded file is in force (neither archived nor superseded); `url` = no such file, but `signature_image_url` is non-empty; `none` = nothing to render. **This is the only field to branch rendering on.**
- **`DocumentTemplate.family`** (6): `student` | `woda` | `lor` | `moi` | `bank_statement` | `bank_certificate`.
  - The same vocabulary as `documents.Document.family`, **imported** from that module, so the two can never disagree. A seventh family can appear here with **no version bump** — treat `family` as an **open string** with a fallback branch; do **not** generate a closed union.
  - Bank documents are **two** families, splitting on the `-statement` / `-certificate` suffix.
- **`Signatory.role`** — **not an enum.** Free text, max 100. Observed values `director` and `instructor`, but nothing constrains it. Do not build a closed dropdown; do not filter the picker by `role`.
- **`DocumentTemplate.key`** — **not an enum.** A lowercase ASCII slug matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 100, which must agree with `family` by prefix (`student-`, `woda-`, `lor-`, `moi-`, `bank-`) and, for the two bank families, by suffix.

## 6. Dependency order

1. A `Signatory` needs **nothing** — the only resource in the document stack you can create against an empty database.
2. A `DocumentTemplate` needs **nothing** either, though its `family` must be one of the six values `documents` defines.
3. A `Document` **(external module: `documents`)** needs neither — it accepts any well-formed `template_key` and any string in `content.instructorId`, registered here or not.

**Start here:** `POST /signatories/`, then activate it — the signatory picker is the one screen in the document stack that is empty without this module.

## 7. Endpoints

| Endpoint                                                 | Method | Policy key                                      | Auth  | Notes                                                                    |
| -------------------------------------------------------- | ------ | ----------------------------------------------- | ----- | ------------------------------------------------------------------------ |
| `/api/v1/document-templates/signatories/`                | GET    | `document_templates.signatory.list`             | Admin | Picker feed (`?status=active`); management screens omit `status`         |
| `/api/v1/document-templates/signatories/`                | POST   | `document_templates.signatory.create`           | Admin | Always creates as `draft`                                                |
| `/api/v1/document-templates/signatories/<id>/`           | GET    | `document_templates.signatory.read`             | Admin | Resolves a single id (e.g. a retired signer)                             |
| `/api/v1/document-templates/signatories/<id>/`           | PATCH  | `document_templates.signatory.update`           | Admin | `status`/`status_note` **and `signature_file`** rejected                 |
| `/api/v1/document-templates/signatories/<id>/signature/` | POST   | `document_templates.signatory.upload_signature` | Admin | **`multipart/form-data`**, **201**, returns the `Signatory`. Risk `high` |
| `/api/v1/document-templates/signatories/<id>/status/`    | POST   | `document_templates.signatory.change_status`    | Admin | **The activate / retire button.** Any transition, any order              |
| `/api/v1/document-templates/templates/`                  | GET    | `document_templates.template.list`              | Admin | `?family=`, `?status=`, `?search=`                                       |
| `/api/v1/document-templates/templates/`                  | POST   | `document_templates.template.create`            | Admin | `key` + `family` cross-validated                                         |
| `/api/v1/document-templates/templates/<id>/`             | GET    | `document_templates.template.read`              | Admin | Single-row inspection                                                    |
| `/api/v1/document-templates/templates/<id>/`             | PATCH  | `document_templates.template.update`            | Admin | `key` **immutable, rejected not dropped**                                |
| `/api/v1/document-templates/templates/<id>/status/`      | POST   | `document_templates.template.change_status`     | Admin | **The publish / retire button.** No 409 possible                         |

**No `DELETE` on any route. No 409 anywhere. No lookup-by-key endpoint.**

### Request bodies

- **Create signatory:** `{ name (required, max 255), title? (max 255), role? (max 100), signature_image_url? (URL, max 500) }`. `status` is **not** a create field — the record is always `draft`. **The authoritative field set is the §4 model shape** — see the §9 data-artifact note; the raw source's "Send (create)" block is corrupted by the v1.1.0 rename and repeats `name`/`title`.
- **Update signatory:** any subset of the same fields. `status`/`status_note` are **rejected** (400 `DOCUMENT_TEMPLATES_STATUS_IMMUTABLE`), not ignored — change status via the dedicated action only.
- **Upload a signature:** **`multipart/form-data`**, one `file` part plus an optional `notes` text field. **Nothing else is accepted** — no `category`, no `upload_source`, no owner; the service fixes all three, because accepting any of them would let a caller store something other than a signature under a signer's name. `png`/`jpg`/`jpeg`/`webp` only (**a strict subset of the file ledger's seven types — do not copy that accept list**), max **10 MB**. Validated twice: the extension first, then the leading bytes, so a PDF renamed `signature.png` is refused on the second. **Send exactly one file part** — a second raises during multipart parsing and surfaces as a **500**, not a 400.
  - **Uploading again replaces**: a signature currently in force is versioned (predecessor superseded); no signature, or one already archived/superseded, starts a fresh chain at version 1.
  - **Any status may receive a signature** — `draft`, `active`, and `inactive` alike, so a retired signer's certificates stay reprintable.
  - The stored file is always `category=signature_image`, `upload_source=staff_upload`, `verification_status=pending`.
- **Change signatory status:** `{ status (required, one of draft|active|inactive), note? (max 2000) }`. The note is optional on every transition. Setting the status it already has, with no note, is a no-op and writes no event.
- **Create template:** `{ key (required, max 100, slug agreeing with family), family (required, one of the six), label (required, max 255), description? (max 5000), display_order? (integer ≥ 0, default 0) }`. Send `key` and `family` **from one control** — a `bank-` slug under family `lor` is refused.
- **Update template:** any subset of `family`, `label`, `description`, `display_order`. **`key` is rejected** (400 `DOCUMENT_TEMPLATES_KEY_IMMUTABLE`), not dropped. `status`/`status_note` are likewise rejected. Changing `family` re-runs the agreement check against the existing `key`, so most family edits on an existing row fail — intended.
- **Change template status:** `{ status (required, one of draft|active|inactive), note? (max 2000) }`.

**Create-error precedence** — when a template payload trips more than one rule, they fire in this order: **serializer validation → uniqueness (`KEY_ALREADY_EXISTS`) → family agreement (`TEMPLATE_KEY_INVALID`)**. A malformed slug that is also a duplicate returns `VALIDATION_ERROR`; a well-formed duplicate that also mismatches its family returns `KEY_ALREADY_EXISTS`. Highlight the field named in `details` rather than guessing the rule.

## 8. Error codes

| Code                                                 | HTTP | Notes                                                                                                                 |
| ---------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------- |
| `DOCUMENT_TEMPLATES_ACTOR_FORBIDDEN`                 | 403  | Caller is not an Admin. Every route, `GET` included. Replaces `PERMISSION_DENIED`                                     |
| `DOCUMENT_TEMPLATES_SIGNATORY_NOT_FOUND`             | 404  | No signatory with that id                                                                                             |
| `DOCUMENT_TEMPLATES_TEMPLATE_NOT_FOUND`              | 404  | No template with that id                                                                                              |
| `DOCUMENT_TEMPLATES_STATUS_IMMUTABLE`                | 400  | A `PATCH` carried `status` or `status_note` — use the `/status/` action                                               |
| `DOCUMENT_TEMPLATES_SIGNATURE_FILE_IMMUTABLE`        | 400  | A `PATCH` carried `signature_file`. **Rejected, not dropped** — the only way to set it is to upload bytes             |
| `DOCUMENT_TEMPLATES_SIGNATURE_NOT_AN_IMAGE`          | 400  | Upload extension outside `png`/`jpg`/`jpeg`/`webp`                                                                    |
| `DOCUMENT_TEMPLATES_SIGNATURE_FILE_TOO_LARGE`        | 400  | Upload over 10 MB                                                                                                     |
| `DOCUMENT_TEMPLATES_SIGNATURE_FILE_CONTENT_MISMATCH` | 400  | Upload's leading bytes disagree with its extension. **Cannot be pre-empted client-side**                              |
| `DOCUMENT_TEMPLATES_KEY_IMMUTABLE`                   | 400  | A template `PATCH` carried `key`                                                                                      |
| `DOCUMENT_TEMPLATES_KEY_ALREADY_EXISTS`              | 400  | That slug is already registered (2nd in create precedence)                                                            |
| `DOCUMENT_TEMPLATES_TEMPLATE_KEY_INVALID`            | 400  | The slug and family disagree (3rd in create precedence)                                                               |
| `VALIDATION_ERROR`                                   | 400  | Missing required field, malformed slug/URL, over-long field, or an unrecognised `status`/`family` in the query string |

- **No 409 exists in this module** — no operation can conflict with another's state.
- **The upload endpoint re-codes the file module's errors at its own boundary** — a `/document-templates/` response never carries an `UPLOADED_FILES_*` code, so do not map for one. Sending JSON instead of multipart gives a bare **415** with **no error code in the body**.
- **401 bodies are not enumerated here** — a missing/expired/revoked token returns 401 with the `authenticate` module's codes (see §9).

## 9. Gaps

- **DATA ARTIFACT — the source §7 Signatory "Send (create)" block is corrupted.** The v1.1.0 rename (dropping `_np`/`_romanized` and renaming `_en`→bare) left the block repeating `name` and `title` with stale annotations. **The authoritative field set is the §4 model shape: `name`, `title`, `role`, `signature_image_url`** (with `status`/`is_active`/`status_note`/timestamps server-owned). This digest's §7 Request bodies uses that authoritative set, not the corrupted block.
- **Seed count discrepancy.** `seed_document_templates` loads **~42 seeded** rows, but the frontend renders **~53 template slugs** (`frontend_data-contract.md` heads its list "42 slugs" and then lists 53). **Unresolved.** The picker is populated from this catalogue — the only guard — so **un-seeded families are un-pickable**, and if 42 is correct, eleven rows would name templates the frontend cannot render.
- **This catalogue is advisory. `documents` does not enforce it** — the single most important thing to plan around. `POST /api/v1/documents/` accepts any well-formed `template_key` matching its family prefix, registered here or not, `active` or `inactive`. If you want only catalogued templates used, **your picker must be the only path to document creation** — there is no server-side guard and none is planned.
- **Signatory ids are unvalidated everywhere they are used.** `documents` stores `content.instructorId` / `content.directorId` as opaque strings; `document_history` freezes whatever it was given. Neither checks that the id names a real, or active, signatory. **A document can name a signatory that never existed** — a correct client just now has a real list to pick from.
- **`family` is an open enum with no endpoint that enumerates it.** A seventh family can appear with no version bump, yet `GET /templates/?family=…` rejects an unrecognised value with 400. A hardcoded list that lags cannot register the new family; one that leads breaks the catalogue filter. There is no metadata endpoint anywhere in the project.
- **~~No signature image storage.~~ Closed in v1.2.0** — signature images are uploaded to the file ledger. What remains: **`signature_image_url` is still an unvalidated external link** for signatories with no uploaded file, and if that link rots, every certificate from that signatory shows a broken image and nothing here reports it.
- **Replacing a signature rewrites the past.** `document_history` freezes a signatory's `id`, `name`, and `role` into a snapshot and **never the image**, so a reprint resolves the signature live. Replacing a director's signature changes what every historical certificate renders, beside a frozen historical name. The backend records this as a known non-repudiation weakness and will not fix it: **if a document class needs the image pinned, the client must freeze it at print time.**
- **No image content analysis and no provenance check.** Any valid PNG/JPEG/WEBP under 10 MB is accepted as a signature, and nothing verifies the uploader was entitled to that person's signature. The control is procedural — Admin-only plus an audit trail — not technical.
- **Two audit events per certificate render.** Two signers means two `file_downloaded` events, on the project's only audited read. The mitigation is a **client** contract, not a server one: fetch once per session and hold the object URL.
- **No concurrency control on the upload either.** Two Admins uploading for the same signatory is last-write-wins; both files are stored and audited, but only one ends up linked.
- **No template _definition_ of any kind** — no sections, field hints, signature slots, layout, preview, or version chain. The templates are frontend code. The concept's **Template Editor**, **Template Detail / Version History**, and **Template Preview** screens have **no backing endpoint**, deliberately — inventing a schema no consumer reads would guarantee drift.
- **No lookup-by-key endpoint.** Every route takes the UUID `id`. Holding a `documents.template_key` and wanting its label means listing the catalogue and matching client-side (cheap at ~53 rows) — there is no `?key=` filter and no `/by-key/<key>/`.
- **No concurrency control.** No ETag, `If-Match`, or `updated_at` precondition. Two Admins editing the same record is last-write-wins and neither is told.
- **No bulk reorder.** `display_order` is set one `PATCH` at a time with no transaction — reordering eleven bank templates is eleven independent writes that can half-apply.
- **`created_by_username` is a username string, no user id** — you cannot join to an `authenticate` user, render an avatar, or survive a username change.
- **No Bikram Sambat dates and no `?fiscal_year=` filter**, unlike `documents` and `document_history`.
- **The §7 permission keys are not enforced in the request path** — access is decided solely by the `admin` authority check. Do not build a client-side permission gate off them expecting the server to agree.
- **401 bodies are not enumerated** — distinguishing "refresh silently" from "redirect to login" requires the `authenticate` module's contract.

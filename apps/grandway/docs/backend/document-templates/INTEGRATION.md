# Integration — Document Templates

**Owner app:** `document_templates`
**Version:** 1.1.0
**Status:** Active
**Synced:** 2026-07-25 (from `.backend/backend/document_templates/docs/INTEGRATION.md`)

> Re-sync with `/sync-api grandway document_templates` when the backend's
> Change History moves past version 1.1.0.

---

## Change History

| Version | Date       | Summary                                                                                                                                                                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-24 | Initial integration contract — 10 endpoints, two resources                                                                                                                                                  |
| 1.0.1   | 2026-07-24 | `STATUS_INVALID_TRANSITION` renamed to `STATUS_IMMUTABLE` for the `PATCH` guard (no transition here is ever invalid); documented create-error precedence, the pagination cost of mirroring, four added gaps |
| 1.0.2   | 2026-07-24 | No endpoint/schema change. Corrected the claims that `uploaded_files` does not exist — it shipped 2026-07-24                                                                                                |
| 1.1.0   | 2026-07-25 | **Breaking:** English-only names — dropped the `_np`/`_romanized` columns and renamed `_en` fields to bare (Signatory `name`/`title`). Taken in place on `/api/v1/`                                         |

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

| Depends on     | Kind                                  | Why                                                                                                                                                                                | What breaks without it                                                                                                     |
| -------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `authenticate` | framework/JWT + FK (`PROTECT`)        | Issues the access JWT and supplies `authority_type` (the whole access check); `created_by` on both models references a user account.                                               | Every endpoint 401s; any non-Admin 403s; attribution unrecordable.                                                         |
| `documents`    | 3 Python imports — **no DB relation** | The `family` enum, the template-key slug validator, and the key/family agreement rule (a service function called at request time). **Signatories have no `documents` dependency.** | Template creation could not validate a key; this module's family vocabulary would drift from the one `documents` enforces. |
| `audit`        | service call                          | Every mutation appends one immutable event; this module stores no history of its own.                                                                                              | Records still save but leave no trace of who changed what.                                                                 |

- **No foreign key to `documents` in either direction.** This module writes to
  nothing outside itself, and nothing outside it writes here.
- **Two modules reference this one without a foreign key, and neither validates
  the reference:** `documents` stores a `Signatory.id` in
  `content.instructorId` / `content.directorId` (opaque, unvalidated JSON);
  `document_history` freezes the same id into `render_context.signatories[].id`
  at print time. Nothing stops either accepting an id that was never in the
  list — see §9.
- **`uploaded_files` (`/api/v1/files/`) exists but is not used here.** A
  signature is still a link, not an upload; a `Signatory` is not one of that
  module's five owner types, so a signature image cannot be attached there even
  by hand. See §3 and §9.

## 3. Conventions

- **Response/Error envelopes:** the standard project envelope — `{ success, message, data, meta }` / `{ success: false, error: { code, message, details }, meta: {} }`. `error.details` is always present (`{}` when there are no field-level errors). **Do not assert on `message`** — branch on HTTP status and `error.code`.
- **Auth failures:** 401 (with the `authenticate` module's codes, not enumerated here — see §9) for a missing/expired/revoked token; 403 `DOCUMENT_TEMPLATES_ACTOR_FORBIDDEN` for any non-Admin, `GET` included. This 403 code **replaces** the project-wide `PERMISSION_DENIED` — a handler keyed only on the global code will never fire here.
- **Nothing is ever deleted.** There is **no `DELETE` method on any endpoint**. Retirement is a status change; a retired record stays retrievable by id forever, so old documents and snapshots keep resolving.
- **The signature image is a URL you host, not a file you upload.** `signature_image_url` is a plain external link. The API stores and returns it verbatim, never fetches it, never checks that it resolves, and has **no upload endpoint**. **Do not ship a file-picker control.**
- **Pagination:** page-number based, `page`/`page_size` (**default 20, max 100**). `data` is the bare array of rows — **not** nested under `results`. `meta` carries `count` (total across all pages), `page`, `page_size`, `next`, `previous`. The **~53-row catalogue is three requests at the default size** — pass `?page_size=100` to mirror it in one call, and re-check that when the catalogue passes 100 rows (the max clamps silently).
- **Query parameters:** a recognised param with an invalid value is **rejected with 400** (`?status=enabled` → `VALIDATION_ERROR`); an unrecognised param (incl. a cache-buster `?_=…`) is silently ignored. `page_size` over 100 is **clamped, not rejected**. No multi-value syntax: `?status=draft,active` is one invalid value → 400.
- **IDs:** UUID strings. Every endpoint takes the UUID `id` in its path. A template's `key` is a unique slug but **is not an address** — there is **no lookup-by-key endpoint** (see §9).
- **Ordering** is fixed and **not client-controllable** (no `sort`/`ordering` param). Signatories: by `name` (alphabetical). Templates: by `family`, then `display_order`, then `label`.
- **Times.** `created_at`/`updated_at` are ISO 8601 UTC. **No Bikram Sambat sibling anywhere in this module** (unlike `documents`/`document_history`), and **no `?fiscal_year=` filter** — both timestamps are system bookkeeping on a reference library, not user-facing business dates.
- **Empty text fields are `""`, never `null`. No field on either resource is nullable.**
- **Request encoding:** `application/json`.
- **HTTP status codes.** Both collection `POST`s (create signatory, register template) return **201**; every other success (all four `GET`s, both `PATCH`es, both `POST .../status/`) returns **200**. Domain-rule violations are **400** — **this module has no 409 anywhere**, because no operation can conflict with another's state. 404 for a missing path record, 403 for authority, 405 (`METHOD_NOT_ALLOWED`) for an unrouted method.

## 4. Models

**Signatory** — one shape for **both list and detail** (there is no large column to withhold): `{ id, name, title, role, signature_image_url, status: enum, is_active, status_note, created_by_username, created_at, updated_at }`.

- **`is_active` is `status == "active"`.** A `draft` signatory is _not_ active. This is the boolean to gate a picker on.
- **`role` is free text, not an enum** (see §5). It describes who the person is, not which slot they may fill.
- **`signature_image_url` is a plain external link** and may be `""` — a signatory can exist without one, and a `draft` usually does. There is **no upload endpoint**.

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

| Endpoint                                              | Method | Policy key                                   | Auth  | Notes                                                            |
| ----------------------------------------------------- | ------ | -------------------------------------------- | ----- | ---------------------------------------------------------------- |
| `/api/v1/document-templates/signatories/`             | GET    | `document_templates.signatory.list`          | Admin | **The frontend's only call into this module** (`?status=active`) |
| `/api/v1/document-templates/signatories/`             | POST   | `document_templates.signatory.create`        | Admin | Always creates as `draft`                                        |
| `/api/v1/document-templates/signatories/<id>/`        | GET    | `document_templates.signatory.read`          | Admin | Resolves a single id (e.g. a retired signer)                     |
| `/api/v1/document-templates/signatories/<id>/`        | PATCH  | `document_templates.signatory.update`        | Admin | `status`/`status_note` **rejected** → use the status action      |
| `/api/v1/document-templates/signatories/<id>/status/` | POST   | `document_templates.signatory.change_status` | Admin | **The activate / retire button.** Any transition, any order      |
| `/api/v1/document-templates/templates/`               | GET    | `document_templates.template.list`           | Admin | `?family=`, `?status=`, `?search=`                               |
| `/api/v1/document-templates/templates/`               | POST   | `document_templates.template.create`         | Admin | `key` + `family` cross-validated                                 |
| `/api/v1/document-templates/templates/<id>/`          | GET    | `document_templates.template.read`           | Admin | Single-row inspection                                            |
| `/api/v1/document-templates/templates/<id>/`          | PATCH  | `document_templates.template.update`         | Admin | `key` **immutable, rejected not dropped**                        |
| `/api/v1/document-templates/templates/<id>/status/`   | POST   | `document_templates.template.change_status`  | Admin | **The publish / retire button.** No 409 possible                 |

**No `DELETE` on any route. No 409 anywhere. No lookup-by-key endpoint.**

### Request bodies

- **Create signatory:** `{ name (required, max 255), title? (max 255), role? (max 100), signature_image_url? (URL, max 500) }`. `status` is **not** a create field — the record is always `draft`. **The authoritative field set is the §4 model shape** — see the §9 data-artifact note; the raw source's "Send (create)" block is corrupted by the v1.1.0 rename and repeats `name`/`title`.
- **Update signatory:** any subset of the same fields. `status`/`status_note` are **rejected** (400 `DOCUMENT_TEMPLATES_STATUS_IMMUTABLE`), not ignored — change status via the dedicated action only.
- **Change signatory status:** `{ status (required, one of draft|active|inactive), note? (max 2000) }`. The note is optional on every transition. Setting the status it already has, with no note, is a no-op and writes no event.
- **Create template:** `{ key (required, max 100, slug agreeing with family), family (required, one of the six), label (required, max 255), description? (max 5000), display_order? (integer ≥ 0, default 0) }`. Send `key` and `family` **from one control** — a `bank-` slug under family `lor` is refused.
- **Update template:** any subset of `family`, `label`, `description`, `display_order`. **`key` is rejected** (400 `DOCUMENT_TEMPLATES_KEY_IMMUTABLE`), not dropped. `status`/`status_note` are likewise rejected. Changing `family` re-runs the agreement check against the existing `key`, so most family edits on an existing row fail — intended.
- **Change template status:** `{ status (required, one of draft|active|inactive), note? (max 2000) }`.

**Create-error precedence** — when a template payload trips more than one rule, they fire in this order: **serializer validation → uniqueness (`KEY_ALREADY_EXISTS`) → family agreement (`TEMPLATE_KEY_INVALID`)**. A malformed slug that is also a duplicate returns `VALIDATION_ERROR`; a well-formed duplicate that also mismatches its family returns `KEY_ALREADY_EXISTS`. Highlight the field named in `details` rather than guessing the rule.

## 8. Error codes

| Code                                      | HTTP | Notes                                                                                                                 |
| ----------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------- |
| `DOCUMENT_TEMPLATES_ACTOR_FORBIDDEN`      | 403  | Caller is not an Admin. Every route, `GET` included. Replaces `PERMISSION_DENIED`                                     |
| `DOCUMENT_TEMPLATES_SIGNATORY_NOT_FOUND`  | 404  | No signatory with that id                                                                                             |
| `DOCUMENT_TEMPLATES_TEMPLATE_NOT_FOUND`   | 404  | No template with that id                                                                                              |
| `DOCUMENT_TEMPLATES_STATUS_IMMUTABLE`     | 400  | A `PATCH` carried `status` or `status_note` — use the `/status/` action                                               |
| `DOCUMENT_TEMPLATES_KEY_IMMUTABLE`        | 400  | A template `PATCH` carried `key`                                                                                      |
| `DOCUMENT_TEMPLATES_KEY_ALREADY_EXISTS`   | 400  | That slug is already registered (2nd in create precedence)                                                            |
| `DOCUMENT_TEMPLATES_TEMPLATE_KEY_INVALID` | 400  | The slug and family disagree (3rd in create precedence)                                                               |
| `VALIDATION_ERROR`                        | 400  | Missing required field, malformed slug/URL, over-long field, or an unrecognised `status`/`family` in the query string |

- **No 409 exists in this module** — no operation can conflict with another's state.
- **401 bodies are not enumerated here** — a missing/expired/revoked token returns 401 with the `authenticate` module's codes (see §9).

## 9. Gaps

- **DATA ARTIFACT — the source §7 Signatory "Send (create)" block is corrupted.** The v1.1.0 rename (dropping `_np`/`_romanized` and renaming `_en`→bare) left the block repeating `name` and `title` with stale annotations. **The authoritative field set is the §4 model shape: `name`, `title`, `role`, `signature_image_url`** (with `status`/`is_active`/`status_note`/timestamps server-owned). This digest's §7 Request bodies uses that authoritative set, not the corrupted block.
- **Seed count discrepancy.** `seed_document_templates` loads **~42 seeded** rows, but the frontend renders **~53 template slugs** (`frontend_data-contract.md` heads its list "42 slugs" and then lists 53). **Unresolved.** The picker is populated from this catalogue — the only guard — so **un-seeded families are un-pickable**, and if 42 is correct, eleven rows would name templates the frontend cannot render.
- **This catalogue is advisory. `documents` does not enforce it** — the single most important thing to plan around. `POST /api/v1/documents/` accepts any well-formed `template_key` matching its family prefix, registered here or not, `active` or `inactive`. If you want only catalogued templates used, **your picker must be the only path to document creation** — there is no server-side guard and none is planned.
- **Signatory ids are unvalidated everywhere they are used.** `documents` stores `content.instructorId` / `content.directorId` as opaque strings; `document_history` freezes whatever it was given. Neither checks that the id names a real, or active, signatory. **A document can name a signatory that never existed** — a correct client just now has a real list to pick from.
- **`family` is an open enum with no endpoint that enumerates it.** A seventh family can appear with no version bump, yet `GET /templates/?family=…` rejects an unrecognised value with 400. A hardcoded list that lags cannot register the new family; one that leads breaks the catalogue filter. There is no metadata endpoint anywhere in the project.
- **No signature image storage.** `signature_image_url` is a link — no upload, no size/type check, no reachability check, no CDN. `uploaded_files` shipped 2026-07-24 but this field was deliberately not migrated (a `Signatory` is not one of its owner types, and repointing would change a shipped response shape). If the link rots, every certificate from that signatory shows a broken image and nothing here reports it.
- **No template _definition_ of any kind** — no sections, field hints, signature slots, layout, preview, or version chain. The templates are frontend code. The concept's **Template Editor**, **Template Detail / Version History**, and **Template Preview** screens have **no backing endpoint**, deliberately — inventing a schema no consumer reads would guarantee drift.
- **No lookup-by-key endpoint.** Every route takes the UUID `id`. Holding a `documents.template_key` and wanting its label means listing the catalogue and matching client-side (cheap at ~53 rows) — there is no `?key=` filter and no `/by-key/<key>/`.
- **No concurrency control.** No ETag, `If-Match`, or `updated_at` precondition. Two Admins editing the same record is last-write-wins and neither is told.
- **No bulk reorder.** `display_order` is set one `PATCH` at a time with no transaction — reordering eleven bank templates is eleven independent writes that can half-apply.
- **`created_by_username` is a username string, no user id** — you cannot join to an `authenticate` user, render an avatar, or survive a username change.
- **No Bikram Sambat dates and no `?fiscal_year=` filter**, unlike `documents` and `document_history`.
- **The §7 permission keys are not enforced in the request path** — access is decided solely by the `admin` authority check. Do not build a client-side permission gate off them expecting the server to agree.
- **401 bodies are not enumerated** — distinguishing "refresh silently" from "redirect to login" requires the `authenticate` module's contract.

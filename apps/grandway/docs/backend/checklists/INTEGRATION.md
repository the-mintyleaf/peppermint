# Integration — Checklists

**Owner app:** `checklists`
**Version:** 1.0.1
**Status:** Active
**Synced:** 2026-07-25 (from `.backend/backend/checklists/docs/INTEGRATION.md`)

> Re-sync with `/sync-api grandway checklists` when the backend's
> Change History moves past version 1.0.1.

---

## Change History

| Version | Date       | Summary                                                                                                                                                                                                                                                                                                                                          |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2026-07-24 | Initial integration contract — 18 endpoints                                                                                                                                                                                                                                                                                                      |
| 1.0.1   | 2026-07-24 | Corrections from the consumer-contract review: success status codes, the `error.details` deviation, filter semantics, how to fetch a cited evidence file, the create response shape, inheritance idempotency, `status_before_archive`, pagination on the safety-net view, attaching evidence without completing an item, and a ranked §9 rewrite |

---

## 1. Module

- **Name:** Checklists — the destination-country requirement lists an Admin
  authors, and each applicant's own copy of one. A checklist points at records
  in other apps (documents, files, journeys) and answers what none of them do:
  what is outstanding, who owns it, when is it due, is it done. An applicant
  whose journey names a catalogue country **automatically receives that
  country's list**; staff then track it item by item.
- **Base path:** `/api/v1/checklists/`
- **Auth:** Bearer access JWT on every endpoint. `admin` and `lead_manager`
  share read/write across the module — **except** the **four template-authoring
  routes** (`POST /templates/`, `PATCH /templates/<id>/`,
  `POST /templates/<id>/items/`, `PATCH /templates/<id>/items/<id>/`), which are
  **Admin-only**: a template is a policy statement that propagates to every
  future applicant for that country. A Lead Manager gets `403`
  `CHECKLISTS_ACTOR_FORBIDDEN` on those four. `superadmin` is refused on **every**
  route.

## 2. Requires

| Depends on           | Kind                           | Why                                                                                                                                             | What breaks without it                                                                                                             |
| -------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `applicant_journeys` | FK + service call + **signal** | A checklist attaches to a journey; the journey's `target_country_ref` triggers **automatic inheritance**. This module listens on journey saves. | No checklist can be created (`CHECKLISTS_JOURNEY_NOT_FOUND`), and auto-inheritance — the headline behaviour — never fires.         |
| `institutions`       | FK (`Country`) + service call  | A template is scoped to a catalogue country; the checklist copies that country.                                                                 | Templates cannot be scoped → no default → nothing is inherited. `POST /templates/` returns `CHECKLISTS_COUNTRY_NOT_FOUND`.         |
| `uploaded_files`     | FK (`PROTECT`) + service call  | An item may cite a stored file as evidence a requirement was met.                                                                               | `evidence_file` cannot be set; every attempt returns `CHECKLISTS_EVIDENCE_NOT_ALLOWED`. Items can still complete with a note only. |
| `authenticate`       | framework/JWT + FK             | Issues the bearer token; supplies the assignee, the completer, the archiver.                                                                    | Every endpoint 401s; `assigned_to` cannot be set.                                                                                  |
| `audit`              | service call                   | Every write appends one immutable event.                                                                                                        | Writes still succeed, but nothing records who changed what.                                                                        |
| `core`               | framework                      | Response envelope, pagination, exception handler.                                                                                               | Responses lose the `{ success, message, data, meta }` envelope; errors return raw DRF bodies.                                      |

**Note for consumers:** the dependency on `applicant_journeys` runs **one way and
is invisible from that side**. Nothing in the journeys app knows checklists
exist. A client that sets a journey's country will **not** see a checklist
mentioned in the journey response — it must ask this module.

## 3. Conventions

- **Response/Error envelopes:** the project standard — `{ success, message, data, meta }` / `{ success: false, error: { code, message, details }, meta }`. See `CORE_INTEGRATION.md` §3.
- **Auth failures:** `AUTHENTICATION_REQUIRED` (401) when the JWT is missing/invalid; `CHECKLISTS_ACTOR_FORBIDDEN` (403) when the authority type may not perform the action. **Both apply to all 18 endpoints** and are not repeated per endpoint below — a Superadmin gets 403 on every route, a Lead Manager on the four template-authoring routes.
- **Success statuses:** `201` for every create (`POST /templates/`, `POST /templates/<id>/items/`, `POST /`, `POST /<id>/items/`); `200` for every read, `PATCH`, and lifecycle action. No endpoint returns `204` — every response carries a body.
- **`error.details` is not always field→strings.** Two codes carry a richer value: `CHECKLISTS_REQUIRED_ITEMS_PENDING` puts an array of `{ id, label, status }` under `details.items`, and `CHECKLISTS_DEFAULT_TEMPLATE_EXISTS` puts a bare id string under `details.existing_template_id`. Type `details` as an open map and narrow by code.
- **Pagination:** every list endpoint — `page`/`page_size` (default 20, max 100). `meta` carries `count`, `page`, `page_size`, `next`, `previous` (absolute URLs or `null`). `data` is a **bare array**, not nested under `results`. `meta` is `{}` on every non-paginated response.
- **IDs:** UUID strings everywhere, including URL segments. **Times:** ISO 8601 UTC, `Z`-suffixed. Every user-facing date field carries a `_bs` sibling holding its Bikram Sambat rendering (`due_at` → `due_at_bs`, `completed_at` → `completed_at_bs`), or `null`. The `_bs` objects are **read-only — never send one**.
- **Filter params — `GET /templates/`:** `country`, `status`, `is_default`, `search` (matches `label` or `key`). No ordering param — templates sort by `display_order` then `label`.
- **Filter params — `GET /`:** `applicant`, `journey`, `status`, `origin`, `assigned_to`, `country`, `template`, `overdue`, `journey_missing_checklist`. No ordering param — checklists sort newest first. Filter semantics (several are not self-evident): `applicant` matches **through the journey** (so the caller never needs the journey id); `journey`/`assigned_to`/`template`/`country` are exact id matches; `country` matches the **copied** country, so a blank hand-built checklist never matches any value; `origin` distinguishes inherited (`auto`) from staff-created (`manual`); `overdue=true` matches only `draft`/`active` checklists past `due_at`. Filters combine with AND. A filter value that is not a valid UUID/enum returns `400 VALIDATION_ERROR` naming the offending param — never an empty page.
- **`journey_missing_checklist=true` overrides all other filters** and changes the returned resource (see §4 `JourneyAwaitingChecklist` and §7). `page`/`page_size` still apply.

## 4. Models

**ChecklistTemplate — retrieve shape** (`GET /templates/`, `GET /templates/<id>/`, create, update): `{ id, key, label, description, country?: CountryBrief, is_default, is_inheritable, status: enum, status_note, display_order, notes, items: ChecklistTemplateItem[], created_by: UserBrief, created_at, updated_at }`.

- `is_inheritable` is **derived**: `true` when the template is `active`, `is_default`, and has a country — the single field answering "will an applicant reaching this country get this list".
- `items` includes **retired** definitions (`is_active: false`), active ones sorted first.

**ChecklistTemplateItem** — `{ id, label, description, item_type: enum, is_required, display_order, default_due_offset_days?: int, is_active, created_at, updated_at }`. `default_due_offset_days` is days after instantiation.

**Checklist — list shape** (`GET /` rows): `{ id, journey, applicant: ApplicantBrief, source_template?, country?: CountryBrief, title, description, origin: enum, status: enum, assigned_to?: UserBrief, due_at?, due_at_bs?, progress: ChecklistProgress, created_at, updated_at }`.

**Checklist — retrieve shape** (`GET /<id>/`, `POST /`, `PATCH /<id>/`, every lifecycle action): list shape **plus** `{ notes, items: ChecklistItem[], activated_at?, completed_at?, completed_at_bs?, completed_by?: UserBrief, archive_reason, archived_at?, archived_by?: UserBrief, status_before_archive: enum }`.

- `progress` is on **every list row**, not just retrieve — that is what lets a worklist render progress bars without a request per checklist. What the list row omits is `items`, `notes`, and the lifecycle stamps.
- `journey` and `source_template` are **bare UUID strings**, not nested objects. `applicant` and `country` are nested briefs.
- `created_by` is **absent** from the Checklist response — an inherited checklist has no author.
- `status_before_archive` is empty except while `status` is `archived`, where it holds the status the checklist returns to on restore.

**ChecklistProgress** — `{ total, resolved, required_total, required_resolved, blocked, document_total, document_resolved }`. **All integers.** `resolved` counts items in `completed`, `waived`, or `not_applicable` — **`blocked` is NOT resolved**. `required_resolved == required_total` is the exact condition under which `POST /<id>/complete/` succeeds.

**ChecklistItem** — `{ id, checklist, source_template_item?, label, description, item_type: enum, is_required, display_order, status: enum, status_note, is_resolved, assigned_to?: UserBrief, due_at?, due_at_bs?, evidence_file?, evidence_note, completed_at?, completed_at_bs?, completed_by?: UserBrief, created_at, updated_at }`.

- `checklist`, `source_template_item`, and `evidence_file` are **bare UUID strings**.
- **`evidence_file` carries no filename, size, or type.** To show/download the cited file, call `uploaded_files` with that id: `GET /api/v1/files/<evidence_file>/` for metadata and `GET /api/v1/files/<evidence_file>/download/` for bytes (same bearer token). There is no nested file brief and no URL here.
- `ChecklistItem` has **no `is_active` and no delete.** An item that turns out not to apply is set to `not_applicable`, which counts as **resolved**. There is no way to remove one (see §9).

**JourneyAwaitingChecklist** — `{ id, applicant: ApplicantBrief, target_country_ref?: CountryBrief, stage, created_at }`. Returned **only** by `GET /?journey_missing_checklist=true`. `id` is the **journey's** id, not a checklist's.

**CountryBrief** — `{ id, code, name }`.
**ApplicantBrief** — `{ id, full_name, status }`.
**UserBrief** — `{ id, username, display_name }`.

- **Instantiation is a SNAPSHOT.** When a checklist is created, each active template item's `label`, `item_type`, `is_required`, and `description` are **copied onto `ChecklistItem` rows**. Editing a template afterwards **never rewrites a live checklist** — an Admin who adds a requirement to the Australia template changes what _future_ applicants inherit and nothing about anyone already being worked.
- **Completion is DERIVED** from item states, never stored. "In progress" / "partially complete" do not exist as statuses — they are `progress` counts, so a figure can never disagree with the items it summarizes.

## 5. Enums

- **`ChecklistTemplate.status`** (3): `draft` | `active` | `inactive`. Omitting `status` on create yields `draft`, which is **not** inheritable; send `active` to make it live. `inactive` retires it and frees its country's default slot.
- **`item_type`** (`ChecklistTemplateItem` and `ChecklistItem`, 3): `document` | `stage` | `task` — separates "what is this applicant still missing" (document) from "where are they in the process" (stage) from work to perform (task).
- **`Checklist.status`** (4): `draft` | `active` | `completed` | `archived`. Inherited/template-applied checklists arrive `active`; a blank hand-built one starts `draft`.
- **`Checklist.origin`** (2): `auto` (inherited when a journey's country was set) | `manual` (staff-applied or blank).
- **`ChecklistItem.status`** (5): `pending` | `completed` | `waived` | `blocked` | `not_applicable`. `resolved` = `completed` / `waived` / `not_applicable`; **`blocked` is NOT resolved** — it is precisely the status meaning the work did not happen, and it keeps blocking completion. `status_note` is **required** for `waived` and `blocked`.

## 6. Dependency order

1. A `Country` must exist in the institutions catalogue (`GET /api/v1/catalogue/countries/`) before a default template can be scoped.
2. `ChecklistTemplate` — nothing can be inherited until a country's list exists. **Start here.**
3. `ChecklistTemplateItem` needs a `ChecklistTemplate`.
4. `Checklist` needs an `ApplicantJourney`, and a `ChecklistTemplate` unless it is blank. It is created **automatically** when a journey's `target_country_ref` is set to a country whose default template is active (see §7).
5. `ChecklistItem` needs a `Checklist`; `ChecklistItem.evidence_file` needs an `UploadedFile` owned by the same journey or applicant.

## 7. Endpoints

All 18. Global auth failures (`AUTHENTICATION_REQUIRED` 401, `CHECKLISTS_ACTOR_FORBIDDEN` 403) apply to every row and are not repeated below.

| Endpoint                                             | Method | Policy key                        | Auth                  | Notes                                                                              |
| ---------------------------------------------------- | ------ | --------------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `/api/v1/checklists/templates/`                      | GET    | `checklists.template.list`        | Admin or Lead Manager | Filters `country`/`status`/`is_default`/`search`                                   |
| `/api/v1/checklists/templates/`                      | POST   | `checklists.template.create`      | **Admin only**        | Author a country's list                                                            |
| `/api/v1/checklists/templates/<id>/`                 | GET    | `checklists.template.read`        | Admin or Lead Manager | Returns retired items too — show greyed, not hidden                                |
| `/api/v1/checklists/templates/<id>/`                 | PATCH  | `checklists.template.update`      | **Admin only**        | `key` immutable. Also how a list is retired (`status: inactive`)                   |
| `/api/v1/checklists/templates/<id>/items/`           | POST   | `checklists.template_item.create` | **Admin only**        | Add one requirement                                                                |
| `/api/v1/checklists/templates/<id>/items/<item_id>/` | PATCH  | `checklists.template_item.update` | **Admin only**        | **No delete** — retire with `is_active: false`                                     |
| `/api/v1/checklists/`                                | GET    | `checklists.checklist.list`       | Admin or Lead Manager | List shape with `progress`. Archived included by default — filter `?status=active` |
| `/api/v1/checklists/`                                | POST   | `checklists.checklist.create`     | Admin or Lead Manager | Manual override; the normal path is auto-inheritance (calls no endpoint)           |
| `/api/v1/checklists/<id>/`                           | GET    | `checklists.checklist.read`       | Admin or Lead Manager | The only shape carrying `items`                                                    |
| `/api/v1/checklists/<id>/`                           | PATCH  | `checklists.checklist.update`     | Admin or Lead Manager | `title`/`description`/`assigned_to`/`due_at`/`notes` only — **not `status`**       |
| `/api/v1/checklists/<id>/activate/`                  | POST   | `checklists.checklist.activate`   | Admin or Lead Manager | `draft` → `active`; only ever a blank checklist                                    |
| `/api/v1/checklists/<id>/complete/`                  | POST   | `checklists.checklist.complete`   | Admin or Lead Manager | `active` → `completed`; requires every required item resolved                      |
| `/api/v1/checklists/<id>/reopen/`                    | POST   | `checklists.checklist.reopen`     | Admin or Lead Manager | `completed` → `active`; clears `completed_at`/`completed_by`                       |
| `/api/v1/checklists/<id>/archive/`                   | POST   | `checklists.checklist.archive`    | Admin or Lead Manager | Any live state → `archived`; `reason` required; frees re-inheritance               |
| `/api/v1/checklists/<id>/restore/`                   | POST   | `checklists.checklist.restore`    | Admin or Lead Manager | `archived` → `status_before_archive`; **not a reopen**                             |
| `/api/v1/checklists/<id>/items/`                     | POST   | `checklists.item.create`          | Admin or Lead Manager | One-off item for this applicant; never travels back to the template                |
| `/api/v1/checklists/<id>/items/<item_id>/`           | PATCH  | `checklists.item.update`          | Admin or Lead Manager | Descriptive fields only — `status` **not** editable here                           |
| `/api/v1/checklists/<id>/items/<item_id>/status/`    | POST   | `checklists.item.status`          | Admin or Lead Manager | The daily act. Returns the **item** (no `progress`) — re-read the checklist        |
| `/api/v1/checklists/?journey_missing_checklist=true` | GET    | `checklists.checklist.list`       | Admin or Lead Manager | Safety net — returns **journeys**, not checklists                                  |

### Request bodies

- **Template — create:** `{ key (required, unique, ^[a-z0-9](?:[a-z0-9_-]{0,48}[a-z0-9])?$), label (required), description?, country? (UUID), is_default? (bool), status?, status_note?, display_order?, notes? }`. Omit `status` → `draft`.
- **Template — update:** any create field **except `key`** (immutable).
- **Template item — create:** `{ label (required), description?, item_type?, is_required? (default true), display_order?, default_due_offset_days? (int) }`.
- **Template item — update:** any create field, plus `is_active` (send `false` to retire).
- **Checklist — create (two shapes):** from template → `{ journey (required), template (required) }` — every other field is ignored; the template supplies title, description, country, items. OR blank → `{ journey (required), title (required in this shape), description?, assigned_to?, due_at?, notes? }`.
- **Checklist — update:** `{ title?, description?, assigned_to?, due_at?, notes? }`. **`status` is not accepted** — status moves only through the lifecycle actions.
- **Lifecycle:** `archive` → `{ reason (required, non-blank) }`; `reopen` → `{ reason? }`; `activate`/`complete`/`restore` → empty body.
- **Item — create:** `{ label (required), description?, item_type?, is_required?, display_order?, assigned_to?, due_at? }`.
- **Item — update:** `{ label?, description?, item_type?, is_required?, display_order?, assigned_to?, due_at?, evidence_note? }`. `status` **not** accepted.
- **Item status:** `{ status (required — one of the five), status_note? (required when status is waived or blocked), evidence_file? (UUID), evidence_note?, clear_evidence? (bool — detach current evidence; explicit because on a partial update an omitted field and an explicit null are indistinguishable) }`. Setting `completed` stamps `completed_at`/`completed_by`; **any other status clears both**. `evidence_file` must already exist and belong to this checklist's journey or that journey's applicant. **To attach evidence without completing, send `{ status: "pending", evidence_file: "<id>" }`** — re-asserting the current status is accepted.

### Automatic inheritance (the headline behaviour — no endpoint)

Setting a journey's `target_country_ref` via `PATCH /api/v1/journeys/<journey_id>/` (cross-app: `applicant_journeys`) **auto-creates the country's default-template checklist** for that applicant, `origin: "auto"`, every item `pending`. No checklist endpoint is called; the journey response says **nothing** about it. Properties:

- **Asynchronous** — runs after the journey's transaction commits. A read issued in the same instant may find nothing. No latency bound, no completion signal, no polling endpoint. Retry once or twice, then fall back to `?journey_missing_checklist=true` rather than asserting the applicant has no requirements.
- **Idempotent** — it fires on **every** save of a journey that has a `target_country_ref` (including a `PATCH` that changes nothing), each time checking for an existing non-archived checklist from the same template first. Re-sending the same country **does** re-attempt, and produces a second copy **only if the first was archived**. Re-saving the journey is the supported retry.
- **Silent when it cannot act** — a country with no active default template produces no checklist and no error (an empty list would read as "nothing is required", which is never true). Those journeys surface only via the safety-net query.
- **Backfill** after authoring a country's template is the `apply_country_checklists` **management command** — **no endpoint exposes it.** An HTTP-only client must re-`PATCH` each journey with its existing `target_country_ref`, one request per journey, sourced from the safety-net query.

## 8. Error codes

| Code                                  | HTTP    | Notes                                                                                                                                                                              |
| ------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CHECKLISTS_ACTOR_FORBIDDEN`          | 403     | Superadmin on any route; Lead Manager on a template-authoring route                                                                                                                |
| `CHECKLISTS_REQUIRED_ITEMS_PENDING`   | 409     | `complete` with work outstanding. `details.items` lists **every** outstanding required item as `{ id, label, status }` — scroll to and highlight each; do not show a generic toast |
| `CHECKLISTS_DEFAULT_TEMPLATE_EXISTS`  | 409     | Country already has an active default. `details.existing_template_id` names it — link to it, offer "edit that one"                                                                 |
| `CHECKLISTS_DEFAULT_REQUIRES_COUNTRY` | 400     | `is_default: true` with no `country`                                                                                                                                               |
| `CHECKLISTS_COUNTRY_NOT_FOUND`        | 400     | `country` names no catalogue row                                                                                                                                                   |
| `CHECKLISTS_TEMPLATE_NOT_FOUND`       | 404/400 | 404 when the addressed resource (`/templates/<id>/`); 400 when a body field (`POST /` with `template`). Branch on status _and_ code                                                |
| `CHECKLISTS_TEMPLATE_ITEM_NOT_FOUND`  | 404     |                                                                                                                                                                                    |
| `CHECKLISTS_TEMPLATE_NOT_ACTIVE`      | 400     | Applying a draft or retired template                                                                                                                                               |
| `CHECKLISTS_TEMPLATE_HAS_NO_ITEMS`    | 400     | The template defines no active requirements                                                                                                                                        |
| `CHECKLISTS_TEMPLATE_ALREADY_APPLIED` | 409     | The journey already holds a non-archived checklist from that template — archive it first                                                                                           |
| `CHECKLISTS_JOURNEY_NOT_FOUND`        | 400     | Create — no journey with that id                                                                                                                                                   |
| `CHECKLISTS_CHECKLIST_NOT_FOUND`      | 404     |                                                                                                                                                                                    |
| `CHECKLISTS_ITEM_NOT_FOUND`           | 404     | Item routes are scoped to their checklist — a foreign item id is 404, not the other checklist's item                                                                               |
| `CHECKLISTS_INVALID_TRANSITION`       | 409     | The lifecycle action / item edit does not apply from the current status (e.g. editing a completed checklist)                                                                       |
| `CHECKLISTS_ARCHIVE_REASON_REQUIRED`  | 400     | Blank or missing `reason` on archive                                                                                                                                               |
| `CHECKLISTS_CHECKLIST_ARCHIVED`       | 409     | A live action / edit on an archived checklist — restore first                                                                                                                      |
| `CHECKLISTS_CHECKLIST_NOT_ARCHIVED`   | 409     | `restore` on a live checklist                                                                                                                                                      |
| `CHECKLISTS_STATUS_NOTE_REQUIRED`     | 400     | `waived` or `blocked` with no `status_note` — make the note required on the option, not discovered by failing                                                                      |
| `CHECKLISTS_EVIDENCE_NOT_ALLOWED`     | 400     | The file belongs to another applicant **or does not exist** (one code for both, so a caller cannot probe which ids exist) — scope the picker to this applicant's files             |
| `VALIDATION_ERROR`                    | 400     | Duplicate/malformed `key`; no `template` and no `title` on create; an invalid filter value                                                                                         |

## 9. Gaps

Ordered by how much they cost a real integration.

- **The caller's authority is not knowable from this module.** Every route's behaviour depends on Admin vs Lead Manager, but no payload carries the actor's authority type (`UserBrief` is `{ id, username, display_name }`). A client must obtain it from `authenticate` before deciding whether to render the template-authoring screens; letting the 403 happen is a poor fallback.
- **An item's evidence is one id and nothing else.** Showing "Passport scan.pdf, verified, 1.2 MB" beside a completed item takes a second call per item to `GET /api/v1/files/<id>/`, and there is no bulk file-fetch — twelve cited files is twelve extra requests, or a design that shows only "evidence attached".
- **No endpoint runs the backfill.** After authoring a country's template, journeys already naming that country are not covered automatically. The backend has `apply_country_checklists` as a management command; an HTTP-only consumer must re-`PATCH` each journey with its existing `target_country_ref`, one request per journey, sourced from `?journey_missing_checklist=true`.
- **Inheritance is asynchronous with no completion signal.** A read issued in the same instant as the `PATCH` may find nothing. No latency bound, no polling endpoint, no way to distinguish "not yet" from "no template" except by also querying `?journey_missing_checklist=true`. Retry once or twice, then fall back.
- **One operation returns two different resources.** `checklists.checklist.list` returns `Checklist` normally and `JourneyAwaitingChecklist` under `?journey_missing_checklist=true`, where `id` is a **journey** id. Treat the flag as a separate call site with its own return type.
- **Two codes appear with two statuses.** `CHECKLISTS_TEMPLATE_NOT_FOUND` is 404 as the addressed resource and 400 as a body field; `CHECKLISTS_CHECKLIST_ARCHIVED` is always 409. Branch on status _and_ code, not code alone.
- **A checklist item cannot be removed.** Template requirements retire with `is_active: false`; a `ChecklistItem` has no equivalent and no `DELETE`. An item added by mistake is permanent, and the nearest escape — `not_applicable` — counts as _resolved_, silently satisfying the completion check.
- **No bulk item-status endpoint.** Completing a twelve-item checklist is twelve requests, each returning the item without refreshed progress.
- **No concurrency control.** No `ETag`, `If-Match`, or `updated_at` precondition on any write. Two staff working one checklist is last-write-wins, silently.
- **No ordering parameter** on either list. Templates always sort `display_order` then `label`; checklists always newest first. Any other order is client-side.
- **Titles, labels, and names are single English strings.** `Checklist.title`, `ChecklistTemplate.label`, `CountryBrief.name`, `ApplicantBrief.full_name`, and every `description`/`status_note`/`notes` are one field each.
- **`assigned_to` accepts any active user id**, including a Superadmin — who is then refused on every route here. Nothing prevents assigning work to someone who cannot open it, and there is no user-list endpoint here to source a correct picker from.
- **`due_at` write format is not pinned down** beyond ISO 8601 — whether a date-only value is accepted, and whether an omitted timezone reads as UTC, is untested. The `_bs` sibling objects are read-only; never send one.
- **The `_bs` object's field set is documented from an observed payload** (`year`, `month`, `day`, `month_name`, `display`); its authoritative shape belongs to the project's Nepali calendar layer, not this module.
- **`meta` is `{}` on every non-paginated response** — whether that is guaranteed project-wide is a `core` question.

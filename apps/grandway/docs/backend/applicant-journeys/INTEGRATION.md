# Integration — Applicant Journeys

**Owner app:** `applicant_journeys`
**Version:** 1.0.0
**Status:** Active
**Synced:** 2026-07-23 (from `.backend/backend/applicant_journeys/docs/{API,DATA_CONTRACT,INTEGRATION,SECURITY}.md`)

> Re-sync with `/sync-api grandway applicant_journeys` when the backend's
> Change History moves past version 1.0.0.

---

## Change History

| Version | Date       | Summary                                    |
| ------- | ---------- | ------------------------------------------ |
| 1.0.0   | 2026-07-23 | Initial integration contract — 9 endpoints |

---

## 1. Module

- **Name:** Applicant Journeys — one overseas-study objective pursued by one
  applicant: destination, level, field, intake, financial preferences, stage,
  deferment, closure, outcome. Owns no person data (`applicants`) and no
  history table of its own.
- **Base path:** `/api/v1/journeys/`
- **Auth:** Bearer access JWT on every endpoint. `admin` and `lead_manager`
  have **identical rights, including creation** — unlike `applicants`, this is
  not Admin-gated. Shared, not owner-scoped. `superadmin` 403s
  `JOURNEYS_ACTOR_FORBIDDEN` on every endpoint.

## 2. Requires

| Depends on                  | Kind                     | Why                                                                                                                   | What breaks without it                                                                                      |
| --------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `applicants`                | FK (`PROTECT`)           | `applicant` — the person pursuing this objective. Immutable, never transferred.                                       | A journey couldn't be created without a valid applicant id; an applicant with any journey can't be removed. |
| `authenticate`              | framework/JWT + FK       | Supplies `authority_type`; `created_by`/`closed_by`/`deferred_by` reference users.                                    | Every endpoint 401s; attribution unresolvable.                                                              |
| `audit`                     | service call             | Every mutation appends one event; `history` reads it back.                                                            | `GET /journeys/<id>/history/` returns empty.                                                                |
| `leads`                     | inbound, one-directional | `leads.Lead.converted_journey` points here; `leads` calls `applicant_journeys.services.create_journey` at conversion. | This app carries no reference back to `leads`.                                                              |
| `core.constants.StudyLevel` | shared enum              | Not duplicated here — shared with `leads` (and later `education`).                                                    | N/A — informational; don't redefine the enum client-side either.                                            |

## 3. Conventions

- **Response/Error envelopes:** identical to `applicants`/`leads` — `{ success, message, data, meta }` / `{ success: false, error: { code, message, details } }`.
- **Auth failures:** 401; 403 `JOURNEYS_ACTOR_FORBIDDEN` for any `superadmin` call.
- **404 is always genuine** — `JOURNEYS_JOURNEY_NOT_FOUND` never means "not yours"; journeys are shared like applicants.
- **Pagination:** page-number based, `page`/`page_size` (default 20, max 100).
- **IDs:** UUID strings. **Times:** ISO 8601 UTC. `closed_at`/`deferred_at` carry a `_bs` sibling; `created_at`/`updated_at` never do.
- **Filter params — `GET /journeys/` only:** `applicant` (id — the per-person view), `stage`, `target_country` (partial match), `fiscal_year`. Newest first always.
- **The three non-active stages (`completed`, `closed`, `deferred`) are never settable via update or the stage action** — each has its own dedicated action; sending one to `/stage/` is a 400 with the field named in `error.details`.
- `applicant`, `creation_source`, `created_by` are immutable and never accepted on update.

## 4. Models

**ApplicantJourney — list shape** (`GET /journeys/` rows): `{ id, applicant: {id, full_name, status}, target_country, target_institution_name, target_program_name, study_level, field_of_study, preferred_intake, budget_amount, budget_currency, scholarship_interest, stage: enum, creation_source: enum, created_by: UserBrief, created_at, updated_at }`.

**ApplicantJourney — detail shape** (retrieve, create, update, every lifecycle action): list shape **plus** `{ notes, outcome, closure_reason, closed_at?, closed_at_bs?, closed_by?, deferred_at?, deferred_at_bs?, deferred_to_intake, deferment_reason, deferred_by?, stage_before_terminal }`.

- `budget_amount` is a decimal **string**, not a number.
- `outcome`/`closure_reason`/`closed_*` are blank/null until closed; `deferred_*` blank/null until deferred; `stage_before_terminal` blank unless currently terminal.

**HistoryEntry** — same shape as `applicants`/`leads`. `changes`/`metadata` never carry free text (notes, closure/deferment reasons stay on the record, not in the event).

## 5. Enums

- **`stage`** (9): `planning` | `profile_building` | `shortlisting` | `applying` | `offer_stage` | `visa_stage` | `completed` | `closed` | `deferred`.
- **Selectable stages** (6 — the only values a dropdown may offer, accepted by `/stage/`): `planning` | `profile_building` | `shortlisting` | `applying` | `offer_stage` | `visa_stage`.
- **`outcome`**: `successful` | `withdrawn` | `rejected` | `not_qualified` | `cancelled` | `other` — blank until closed; `other` requires `closure_reason`.
- **`creation_source`**: `lead_conversion` | `manual`.
- **`study_level`** (shared with `leads` via `core.constants`): `school` | `certificate` | `diploma` | `bachelors` | `postgraduate_diploma` | `masters` | `phd` | `other`.
- **`stage_before_terminal`**: same 9-value set, or blank.

## 6. Dependency order

1. An applicant must already exist (`applicants` app) before a journey can reference it.
2. `POST /journeys/` needs only a valid `applicant` id.
3. Everything else operates on an existing journey id.

## 7. Endpoints

| Endpoint                         | Method | Policy key                                | Auth                  | Notes                                                                  |
| -------------------------------- | ------ | ----------------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| `/api/v1/journeys/`              | GET    | `applicant_journeys.journey.list`         | Admin or Lead Manager | `applicant`/`stage` filters serve the per-person view and the worklist |
| `/api/v1/journeys/`              | POST   | `applicant_journeys.journey.create`       | Admin or Lead Manager | Not Admin-gated, unlike `applicants.applicant.create`                  |
| `/api/v1/journeys/<id>/`         | GET    | `applicant_journeys.journey.read`         | Admin or Lead Manager |                                                                        |
| `/api/v1/journeys/<id>/`         | PATCH  | `applicant_journeys.journey.update`       | Admin or Lead Manager | `applicant` immutable; `stage` not writable here                       |
| `/api/v1/journeys/<id>/stage/`   | POST   | `applicant_journeys.journey.change_stage` | Admin or Lead Manager | 6 selectable stages only                                               |
| `/api/v1/journeys/<id>/defer/`   | POST   | `applicant_journeys.journey.defer`        | Admin or Lead Manager | `to_intake` required                                                   |
| `/api/v1/journeys/<id>/close/`   | POST   | `applicant_journeys.journey.close`        | Admin or Lead Manager | `outcome` required                                                     |
| `/api/v1/journeys/<id>/reopen/`  | POST   | `applicant_journeys.journey.reopen`       | Admin or Lead Manager | Only way back from any terminal/deferred state                         |
| `/api/v1/journeys/<id>/history/` | GET    | `applicant_journeys.journey.list_history` | Admin or Lead Manager | Backed by `audit`                                                      |

### Request bodies

- **Create:** `{ applicant (required, id), target_country?, target_institution_name?, target_program_name?, study_level?, field_of_study?, preferred_intake?, budget_amount?, budget_currency?, scholarship_interest?, notes? }`. `stage` not accepted — always starts `planning`. (Corrected 2026-07-24 — an earlier revision of this digest dropped `notes` from this list by mistake; the raw backend's own `INTEGRATION.md` §7 always included it.)
- **Update:** same shape minus `applicant` (immutable, dropped by the serializer).
- **Change stage:** `{ stage (one of the 6 selectable) }`.
- **Defer:** `{ to_intake (required), reason? }`.
- **Close:** `{ outcome (required), reason? (required iff outcome is "other") }` — request field is `reason`, stored as `closure_reason`.
- **Reopen:** `{ stage? (defaults "planning") }`.

## 8. Error codes

| Code                                | HTTP | Notes                                                          |
| ----------------------------------- | ---- | -------------------------------------------------------------- |
| `JOURNEYS_ACTOR_FORBIDDEN`          | 403  | Superadmin on any endpoint                                     |
| `JOURNEYS_JOURNEY_NOT_FOUND`        | 404  | Always genuine                                                 |
| `JOURNEYS_APPLICANT_NOT_FOUND`      | 400  | Create — no applicant with that id                             |
| `JOURNEYS_STAGE_NOT_EDITABLE`       | 409  | Journey is terminal/deferred; reopen first (stage/defer/close) |
| `JOURNEYS_STAGE_INVALID_TRANSITION` | 400  | A terminal stage reached `/stage/` or `/reopen/` directly      |
| `JOURNEYS_DEFER_INTAKE_REQUIRED`    | 400  | `to_intake` missing on defer                                   |
| `JOURNEYS_OUTCOME_REQUIRED`         | 400  | `outcome` missing on close                                     |
| `JOURNEYS_OUTCOME_DETAIL_REQUIRED`  | 400  | `outcome: "other"` with no `reason`                            |
| `JOURNEYS_JOURNEY_NOT_TERMINAL`     | 409  | Reopen attempted on an already-active journey                  |

## 9. Gaps

- **No offer records, no visa case management, no institution/intake catalogue** — `target_institution_name`/`target_program_name`/`preferred_intake`/`deferred_to_intake` are unvalidated free text.
- **No priority/target-date field** — worklist can only sort newest-first.
- **Nothing prevents two open journeys for the same applicant/country/intake.**
- **No object-level permission-key enforcement yet** — inline authority check only, same interim pattern as `leads`/`applicants`.

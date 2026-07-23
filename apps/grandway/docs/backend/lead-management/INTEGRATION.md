# Integration — Leads

**Owner app:** `leads`
**Version:** 1.0.0
**Status:** Active
**Synced:** 2026-07-23 (from `.backend/backend/leads/docs/{API,DATA_CONTRACT,INTEGRATION,SECURITY}.md`, `.backend/backend/leads/{serializers,constants,views,exceptions}.py`)

> Re-sync with `/sync-api grandway leads` when the backend's Change History
> moves past version 1.0.0.

---

## Change History

| Version | Date       | Summary                                                               |
| ------- | ---------- | --------------------------------------------------------------------- |
| 1.0.0   | 2026-07-23 | Initial integration contract — 17 endpoints; conversion not yet built |

---

## 1. Module

- **Name:** Leads — tracks people who have shown interest in the consultancy
  but have not yet become applicants: who they are, how they found the
  consultancy, what they're considering, their current stage, when they were
  last followed up, and whether they were lost (converted isn't reachable yet).
- **Base path:** `/api/v1/leads/`
- **Auth:** Bearer access JWT on every endpoint. Two authority types may use
  this module: `admin` and `lead_manager`. A `superadmin` token is rejected
  with 403 `LEADS_ACTOR_FORBIDDEN` on **every** endpoint here — deliberate,
  to keep the platform-recovery credential out of business data.

## 2. Requires

| Depends on                    | Kind          | Why                                                                                                                               | What breaks without it                                                                |
| ----------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `authenticate`                | framework/JWT | Supplies `authority_type`, which decides all-leads vs own-leads-only vs 403.                                                      | Every endpoint 401s; an unresolvable authority type gets 403 `LEADS_ACTOR_FORBIDDEN`. |
| `authenticate`                | FK            | `created_by` and every attribution field (`last_followed_up_by`, `lost_by`, `converted_by`, note `author`) reference a user.      | Leads couldn't be created; attribution fields unresolvable.                           |
| `audit`                       | service call  | Every mutation appends one immutable event to the central audit log; `history` reads it back. Leads owns no history table itself. | `GET /leads/<id>/history/` returns empty — the lead still works, just no timeline.    |
| `applicants` (future)         | service call  | **Not built.** Conversion will call it to create the applicant record.                                                            | Conversion isn't exposed at all — no endpoint, no button.                             |
| `applicant_journeys` (future) | service call  | **Not built.** Conversion will call it to create the initial journey.                                                             | As above.                                                                             |

## 3. Conventions

- **Response:** `{ success: true, message, data, meta }`. Single resource → object in `data`; list → array in `data` (never nested under `results`).

  ```json
  {
    "success": true,
    "message": "Lead retrieved.",
    "data": { "id": "9d8c7b6a-…", "stage": "counselling" },
    "meta": {}
  }
  ```

- **Error:** `{ success: false, error: { code, message, details }, meta: {} }`.

  ```json
  {
    "success": false,
    "error": {
      "code": "LEADS_LOSS_DETAIL_REQUIRED",
      "message": "This loss reason requires an explanation.",
      "details": {
        "detail": ["This field is required for the selected reason."]
      }
    },
    "meta": {}
  }
  ```

- **Auth failures:** 401 (framework-produced) with no/expired/revoked token. 403 `LEADS_ACTOR_FORBIDDEN` — "Your authority level may not perform this action." — when the token is valid but the authority type may not act here (any `superadmin` call; a `lead_manager` create/edit under `/sources/` or `/loss-reasons/`).
- **Pagination:** page-number based, `page`/`page_size` (default 20, max 100). Paginated: lead list, notes list, history list — `meta` carries `count`, `page`, `page_size`, `next`, `previous` (absolute URLs or `null`). **Not paginated:** `/sources/` and `/loss-reasons/` — full array, `meta: {}`.
- **IDs:** UUID strings. **Times:** ISO 8601 UTC (`2026-07-23T04:00:00Z`). User-facing datetimes additionally carry a `<field>_bs` sibling (Bikram Sambat projection, see `BsDate` below); `created_at`/`updated_at` never have one.
- **Filter/search params — `GET /leads/` only:** `stage` (single value), `source` (a source id), `search` (case-insensitive OR match across `full_name_np`/`full_name_en`/`full_name_romanized`, trigram-indexed), `fiscal_year` (`YYYY/YY` Nepali fiscal year, filters on `created_at`). **No client-controlled ordering anywhere** — leads/notes/history always newest-first; sources/loss-reasons always `display_order` then `name_np`. **No `created_by`/owner filter exists.** `/sources/` and `/loss-reasons/` accept only `include_inactive=true`.

## 4. Models

**BsDate** — `{ year, month, day, month_name_en, month_name_np, display_en, display_np }` — never sent by a client.

**ReferenceEntry** (shape shared by `LeadSource` and `LossReason`) — `{ id, code, name_np, name_en, name_romanized, requires_detail, is_active, display_order, created_at, updated_at }`

- `code`: ASCII `^[a-z0-9](?:[a-z0-9_-]{0,48}[a-z0-9])?$`, unique, immutable after creation, lowercased on write — **runtime-configured, never hardcode a code or its meaning.**
- `name_romanized` is server-derived — never send it.
- `requires_detail: true` → the lead must supply an explanation (`source_detail` for a source, `detail` for a loss reason).
- `is_active: false` → retired: stays attached to old leads, must not appear in a picker. **No delete endpoint exists — "Retire," never "Delete."**

**ContactNumber** — `{ id, number, label: enum, is_primary: bool }`. `number` regex `^\+?[0-9][0-9 ()\-]{4,31}$`. No standalone endpoint — always nested on a lead; **sending `contact_numbers` replaces the whole set, never a delta.**

**StudyInterest** — `{ interested_countries: string[], study_level: enum, field_of_study, preferred_intake, budget_amount: string|null, budget_currency, scholarship_interest: bool, highest_qualification, language_test_status: enum, interest_notes }`. Every field optional/blankable — deliberately incomplete data. One per lead, upserted (never a separate create/delete). `budget_amount` is a decimal **string**, not a number.

**UserBrief** — `{ id, username, display_name }`.

**Lead — list shape** (`GET /leads/` rows): `{ id, full_name_np, full_name_en, full_name_romanized, email, address, source: ReferenceEntry, source_detail, stage: enum, created_by: UserBrief, contact_numbers: ContactNumber[], last_followed_up_at?, last_followed_up_at_bs?: BsDate, created_at, updated_at }`

**Lead — detail shape** (retrieve, create, update, and **every lifecycle action** — only the list endpoint returns the shorter shape above): list shape **plus** `{ study_interest?: StudyInterest|null, last_followed_up_by?: UserBrief, lost_reason?: ReferenceEntry, lost_detail, lost_at?, lost_at_bs?: BsDate, lost_by?: UserBrief, stage_before_loss, converted_at?, converted_at_bs?: BsDate, converted_by?: UserBrief }`.

- `study_interest` is `null` when absent.
- The five `lost_*`/`stage_before_loss` fields populate together on mark-lost, clear together on reopen; `stage_before_loss` is `""` unless currently lost.
- `converted_at`/`converted_at_bs`/`converted_by` are **always `null`** in this version — never render a "Convert" affordance.

**LeadNote** — `{ id, body, author: UserBrief, created_at }`. Append-only — no update/delete endpoint (405 if attempted).

**HistoryEntry** — `{ id, action: enum, actor_type: enum, actor_id?, actor_label, summary, reason, changes: json, metadata: json, created_at, created_at_bs: BsDate }`. Sourced from the central `audit` log, not a leads-owned table.

- `changes`: `{ "<field>": { "from": …, "to": … } }`, `{}` if none.
- `metadata` varies per `action` — treat as advisory, not a fixed schema.
- Note bodies, addresses, and loss explanations are deliberately never copied into `changes`/`metadata`.

## 5. Enums

- **`Lead.stage`** (8 total): `new` | `contact_attempted` | `contacted` | `counselling` | `follow_up` | `ready_for_conversion` | `converted` | `lost`
- **Selectable stages** (6 — the only values any Select/dropdown may offer; accepted by stage-change/follow-up/reopen): `new` | `contact_attempted` | `contacted` | `counselling` | `follow_up` | `ready_for_conversion`. `lost`/`converted` are reached only via their own dedicated actions.
- **`stage_before_loss`**: same 8-value set, or `""` if never lost.
- **`ContactNumber.label`**: `mobile` | `home` | `work` | `whatsapp` | `viber` | `other`
- **`StudyInterest.study_level`**: `school` | `certificate` | `diploma` | `bachelors` | `postgraduate_diploma` | `masters` | `phd` | `other`
- **`StudyInterest.language_test_status`**: `not_taken` | `preparing` | `booked` | `taken` | `not_required`
- **`HistoryEntry.actor_type`**: `superadmin` | `admin` | `lead_manager` | `system` | `ai`
- **`HistoryEntry.action`** (open vocabulary, values actually emitted by this app): `lead_created` | `lead_updated` | `lead_contact_changed` | `lead_source_changed` | `lead_interest_changed` | `lead_stage_changed` | `lead_followup_recorded` | `lead_marked_lost` | `lead_reopened` | `lead_note_added` | `lead_source_created` | `lead_source_updated` | `loss_reason_created` | `loss_reason_updated`. Defined but **never emitted yet**: `lead_converted`, `lead_applicant_created`.
- `LeadSource.code` / `LossReason.code` — **not a fixed enum**, runtime-configured; never hardcode.

## 6. Dependency order

1. `GET /leads/sources/` and `GET /leads/loss-reasons/` — no preconditions; may return an empty array if unconfigured (blocks lead creation / mark-lost respectively until an Admin configures at least one).
2. `POST /leads/` — needs at least one active source.
3. Everything else operates on an existing lead id.

## 7. Endpoints

### Reference data — `/api/v1/leads/{sources,loss-reasons}/`

| Endpoint                                  | Method | Policy key                 | Auth                  | Notes                                       |
| ----------------------------------------- | ------ | -------------------------- | --------------------- | ------------------------------------------- |
| `/api/v1/leads/sources/`                  | GET    | `leads.source.list`        | Admin or Lead Manager | `?include_inactive=true` to include retired |
| `/api/v1/leads/sources/`                  | POST   | `leads.source.create`      | Admin only            |                                             |
| `/api/v1/leads/sources/<source_id>/`      | PATCH  | `leads.source.update`      | Admin only            | No delete — `is_active: false` to retire    |
| `/api/v1/leads/loss-reasons/`             | GET    | `leads.loss_reason.list`   | Admin or Lead Manager | `?include_inactive=true` to include retired |
| `/api/v1/leads/loss-reasons/`             | POST   | `leads.loss_reason.create` | Admin only            |                                             |
| `/api/v1/leads/loss-reasons/<reason_id>/` | PATCH  | `leads.loss_reason.update` | Admin only            | No delete                                   |

### Leads — `/api/v1/leads/`

| Endpoint                             | Method | Policy key                   | Auth                                  | Notes                                                             |
| ------------------------------------ | ------ | ---------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| `/api/v1/leads/`                     | GET    | `leads.lead.list`            | Admin (all) / Lead Manager (own only) | Filters in §3; same endpoint serves both scopes                   |
| `/api/v1/leads/`                     | POST   | `leads.lead.create`          | Admin or Lead Manager                 | `stage` not accepted — always starts `new`                        |
| `/api/v1/leads/<lead_id>/`           | GET    | `leads.lead.read`            | scope-checked                         | 404 (not 403) if out of scope                                     |
| `/api/v1/leads/<lead_id>/`           | PATCH  | `leads.lead.update`          | scope-checked                         | `stage` silently ignored if sent — not writable here              |
| `/api/v1/leads/<lead_id>/stage/`     | POST   | `leads.lead.change_stage`    | scope-checked                         | 6 selectable stages only; no-op if same stage                     |
| `/api/v1/leads/<lead_id>/follow-up/` | POST   | `leads.lead.record_followup` | scope-checked                         | All fields optional; empty `{}` valid                             |
| `/api/v1/leads/<lead_id>/lost/`      | POST   | `leads.lead.mark_lost`       | scope-checked                         | `loss_reason` always required                                     |
| `/api/v1/leads/<lead_id>/reopen/`    | POST   | `leads.lead.reopen`          | scope-checked                         | Only way back from `lost`; `stage` optional, defaults `follow_up` |
| `/api/v1/leads/<lead_id>/notes/`     | GET    | `leads.note.list`            | scope-checked                         |                                                                   |
| `/api/v1/leads/<lead_id>/notes/`     | POST   | `leads.note.create`          | scope-checked                         | Append-only                                                       |
| `/api/v1/leads/<lead_id>/history/`   | GET    | `leads.lead.list_history`    | scope-checked                         | Backed by `audit`                                                 |

**Not implemented (do not build):** `POST /leads/<lead_id>/convert/` — no route exists (404 from the URL resolver). Reserved codes `LEADS_LEAD_ALREADY_CONVERTED`/`LEADS_CONVERSION_NOT_READY` exist for when it lands.

### Request bodies (write endpoints)

- **Create/Update lead:** `{ full_name_np (required), full_name_en?, email?, address?, source (required, id), source_detail? (required iff source.requires_detail), contact_numbers (required, ≥1 on create; whole-set-replace), study_interest? }`. Update = same shape, every field optional except the required-≥1 rule on `contact_numbers` when sent.
- **Stage change:** `{ stage (required, one of the 6 selectable) }`
- **Follow-up:** `{ note? (default ""), stage? (one of the 6 selectable), followed_up_at? (defaults now) }`
- **Mark lost:** `{ loss_reason (required, id), detail? (default "", required in practice when reason.requires_detail) }`
- **Reopen:** `{ stage? (one of the 6 selectable, defaults `follow_up`) }`
- **Note create:** `{ body (required) }`
- **Source/loss-reason create:** `{ code (required), name_np (required), name_en?, requires_detail?, is_active?, display_order? }`
- **Source/loss-reason update:** same minus `code` (immutable, omitted from the update shape entirely).

## 8. Error codes

| Code                             | HTTP | Message                                                                                                                                           | UI handling                                                    |
| -------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `LEADS_ACTOR_FORBIDDEN`          | 403  | "Your authority level may not perform this action."                                                                                               | Hide the whole module for `superadmin`; shouldn't be reachable |
| `LEADS_LEAD_NOT_FOUND`           | 404  | "Lead not found."                                                                                                                                 | Generic not-found — **never** "access denied"                  |
| `LEADS_CONTACT_REQUIRED`         | 400  | (field error on `contact_numbers`)                                                                                                                | Inline error on the contact-number repeater                    |
| `LEADS_STAGE_INVALID_TRANSITION` | 400  | "This stage cannot be selected directly; use the mark-lost or convert action."                                                                    | Shouldn't be reachable if the dropdown is built correctly      |
| `LEADS_STAGE_NOT_EDITABLE`       | 409  | "This lead is lost or converted; reopen it before changing its stage." (stage/follow-up) or "This lead is already lost or converted." (mark-lost) | Replace the stage control with "Reopen"; refetch               |
| `LEADS_LOSS_REASON_REQUIRED`     | 400  | "A loss reason is required to close a lead."                                                                                                      | Disable submit until a reason is picked                        |
| `LEADS_LOSS_DETAIL_REQUIRED`     | 400  | "This loss reason requires an explanation."                                                                                                       | Inline error on the detail field                               |
| `LEADS_SOURCE_NOT_FOUND`         | 404  | "Lead source not found."                                                                                                                          | Row-level error; refresh the list                              |
| `LEADS_SOURCE_INACTIVE`          | 400  | "That lead source is no longer available."                                                                                                        | Re-fetch sources, ask user to re-pick                          |
| `LEADS_SOURCE_DETAIL_REQUIRED`   | 400  | "This lead source requires a short description."                                                                                                  | Inline error under "Please specify"                            |
| `LEADS_SOURCE_CODE_TAKEN`        | 409  | (field error on `code`)                                                                                                                           | Inline error; suggest checking retired entries                 |
| `LEADS_LOSS_REASON_NOT_FOUND`    | 404  | "Loss reason not found."                                                                                                                          | Row-level error; refresh                                       |
| `LEADS_LOSS_REASON_INACTIVE`     | 400  | "That loss reason is no longer available."                                                                                                        | Re-fetch, ask user to re-pick                                  |
| `LEADS_LOSS_REASON_CODE_TAKEN`   | 409  | (field error on `code`)                                                                                                                           | Inline error; suggest checking retired entries                 |
| `LEADS_LEAD_NOT_LOST`            | 409  | "Only a lost or converted lead can be reopened."                                                                                                  | Refresh and hide the Reopen action                             |
| `LEADS_LEAD_ALREADY_CONVERTED`   | —    | reserved, unused (conversion not built)                                                                                                           | n/a                                                            |
| `LEADS_CONVERSION_NOT_READY`     | —    | reserved, unused (conversion not built)                                                                                                           | n/a                                                            |

## 9. Gaps

- **Conversion doesn't exist.** No endpoint, `converted` stage unreachable in practice, `converted_at`/`converted_by` always `null`. Do not build a Convert button.
- **Direct applicant creation** (Admin creating an applicant without a lead) belongs to a future `applicants` app — not this module.
- **No funnel/dashboard endpoint** — `stage`/`source`/`search`/`fiscal_year` filters exist but there's no server-side multi-stage or "needs attention" aggregate; a categorized dashboard must aggregate client-side (see the module's own plan for the chosen approach).
- **No `created_by`/owner filter** — an Admin cannot narrow the list to one Lead Manager's leads.
- **No object-level permission-key enforcement yet** — the real gate is the inline authority check in `access.py`, not `check_permission()`. Functionally equivalent today, just not wired through the shared policy registry yet.
- **`HistoryEntry.metadata` keys are not exhaustively specified** — render `summary` as the primary label, treat `metadata` as advisory extra detail.

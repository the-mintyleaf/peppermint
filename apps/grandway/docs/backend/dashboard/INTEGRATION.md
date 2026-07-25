# Integration — Dashboards

**Owner app:** `dashboards`
**Version:** 1.0.0
**Status:** Active
**Synced:** 2026-07-25 (from `.backend/backend/dashboards/docs/INTEGRATION.md`)

> Re-sync with `/sync-api grandway dashboard` when the backend's
> Change History moves past version 1.0.0.

> **Folder note.** The grandway frontend folder is singular (`dashboard/`) to
> match the API base path `/api/v1/dashboard/`; the backend app is plural
> (`dashboards`). One dashboard, assembled from eight sections.

---

## Change History

| Version | Date       | Summary                                                                         |
| ------- | ---------- | ------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-24 | Initial integration contract — 8 read-only section endpoints, one shared filter |

---

## 1. Module

- **Name:** Dashboards — the operational command centre. Eight read-only
  sections summarising what needs attention now, what is moving, and where work
  is stuck. It owns no data and writes nothing.
- **Base path:** `/api/v1/dashboard/` (singular path, plural app — there is one
  dashboard, assembled from eight sections).
- **Auth:** Bearer access JWT on every endpoint. Two authority types may use
  this module: `admin` and `lead_manager`, and they call the **same** eight
  endpoints. A `superadmin` token is refused with 403
  `DASHBOARDS_ACTOR_FORBIDDEN` everywhere — it is a platform authority that
  manages Admin accounts and does not participate in consultancy operations.
- **Read-only leaf.** This module owns no table, has no create/update/delete
  endpoint of any kind, and writes nothing — not even an audit event for its own
  reads. Every figure is derived **live at request time** by calling nine other
  modules. There is **no cache, no ETag, no nightly rollup, and no stored
  counter**.
- **Figures inherit each owning app's scoping.** The dashboard never widens what
  a caller may see. Because `leads` is owner-scoped, a Lead Manager's
  lead-derived numbers cover only their own leads, while applicant/journey/
  offer/checklist/document/file numbers are consortium-shared and not narrowed.
  **An Admin and a Lead Manager therefore see different numbers on the same
  URL.** Only `workload.is_scoped_to_caller` marks this in the payload; there is
  no per-field scoping flag (see §9).

## 2. Requires

Every dependency below is a **service call or indirect read** — this module holds
no foreign keys of its own and stores nothing.

| Depends on           | Kind             | Why                                                                                                                                                               | What breaks without it                                                                                                                                                  |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authenticate`       | framework/JWT    | Issues the access JWT and supplies `authority_type`, which decides whether the caller may read at all and how lead figures are scoped.                            | Every endpoint 401s. Without a recognised `authority_type` the caller gets 403 `DASHBOARDS_ACTOR_FORBIDDEN`.                                                            |
| `leads`              | service call     | Every lead figure — funnel counts, source conversion, stale leads, lead workload — read through this module, **incl. owner scoping**.                             | `pipeline.leads_by_stage`, `conversion.by_source`, `conversion.rates.lead_to_applicant`, `today.stale_leads`, `workload.leads`, `summary.alerts.stale_leads` empty.     |
| `applicants`         | service call     | Applicant status counts and the expiring-passport blocker.                                                                                                        | `pipeline.applicants_by_status`, `blockers.expiring_passports`, `outcomes.applicants_archived`, and the applicant-to-journey rate lose data.                            |
| `applicant_journeys` | service call     | Journey stage and outcome counts, and the denominator of two conversion rates. Also what the `country` filter resolves through.                                   | `pipeline.journeys_by_stage`, `outcomes.journey_outcomes`, and two of the four conversion rates lose data.                                                              |
| `offers`             | service call     | Offer status counts, decisions, the awaiting-response worklist, and the offer workload.                                                                           | `today.offers_awaiting_response`, `blockers.overdue_offers`, `pipeline.offers_by_status`, `outcomes.offer_decisions`, `workload.offers`, the acceptance rate lose data. |
| `checklists`         | service call     | Overdue/due-soon/blocked worklists, checklist status counts, assignee workload, and the journeys-without-a-checklist safety net — the largest single contributor. | Today's work and Blockers lose most content; `summary.alerts` loses three of eight figures.                                                                             |
| `documents`          | service call     | Document status counts and the stalled-draft list.                                                                                                                | `pipeline.documents_by_status` and `today.documents_in_progress` lose data.                                                                                             |
| `uploaded_files`     | service call     | File verification counts and the awaiting-verification and rejected worklists, **incl. that module's own per-record visibility rule**.                            | `today.files_awaiting_verification`, `blockers.rejected_files`, `pipeline.files_by_verification` lose data.                                                             |
| `audit`              | service call     | The entire recent-activity feed is a projection of the central audit log. This module stores no activity of its own.                                              | `GET /api/v1/dashboard/activity/` returns an empty page.                                                                                                                |
| `institutions`       | indirect FK read | The `country` filter is an `institutions.Country` id. This module never queries the catalogue; it passes the id to the apps that hold an FK to it.                | The `country` filter matches nothing. Every section still works unfiltered.                                                                                             |

**No inbound dependencies.** Nothing reads this module, nothing points at it, and
removing it would break no other app. It is a leaf.

## 3. Conventions

- **Response/Error envelopes:** the standard project envelope —
  `{ success, message, data, meta }` / `{ success: false, error: { code, message, details }, meta }`.
  Seven of the eight sections return a single **object** under `data`; only
  `activity` returns an **array**.
- **Auth failures:** 401 with no/expired/revoked token (from the auth
  framework, not this module); 403 `DASHBOARDS_ACTOR_FORBIDDEN` when the token
  is valid but the authority may not read (a `superadmin` on any endpoint).
- **Pagination applies to `activity` only.** Page-number based, `page`/`page_size`
  (default 20, max 100, **clamped not rejected**). Its `meta` carries `count`,
  `page`, `page_size`, `next`, `previous`. The other seven sections are
  unpaginated objects and their `meta` is `{}`.
- **Worklist previews.** Sections carrying a list of records return a
  `Preview = { total, has_more, items }`. `total` is the **real** backlog;
  `items` is capped at **10** rows with **no paging** — there is no `limit`/
  `offset`. `has_more` is `true` when `total` exceeds what was returned. Show
  `total`, use `has_more` to decide whether to show a "see all" link (do not
  compare lengths), and link to the owning module's list for the rest — this
  module is deliberately not a second list view.
- **IDs:** UUID strings. **Times:** ISO 8601 UTC for datetimes; `YYYY-MM-DD`
  for dates. User-facing **dates** carry a `<field>_bs` sibling holding a Bikram
  Sambat object; `created_at`/`updated_at` do not.
- **Filter params — one set, all eight endpoints, all optional:** `date_from`,
  `date_to`, `fiscal_year`, `country`, `institution`, `owner`, `journey_stage`,
  `offer_status`, `document_status`, `checklist_status`, `due_within_days`,
  `passport_within_days`. They narrow the same underlying data rather than
  selecting different dashboards, so the same values may be sent to every
  section. **Not every section honours every filter** — see §7 and §9. In
  particular `journey_stage`/`offer_status`/`document_status`/`checklist_status`
  are validated then **ignored** everywhere; `institution` narrows only offers;
  `owner` narrows only checklist worklists; `activity` honours only
  `fiscal_year`. The UI must not present an ignored control as active — read the
  per-section `*_is_*_filtered` booleans where provided (e.g.
  `documents_by_status_is_country_filtered`) and grey out or annotate ignored
  controls.
- **`date_to` is inclusive** — "up to the 24th" includes all of the 24th. Day
  boundaries are **Kathmandu days (UTC+05:45)**, not UTC days.
- **`fiscal_year` is the coarse control, `date_from`/`date_to` the fine one.**
  Sending both applies the explicit dates; the fiscal year does not widen them
  back. Format is `YYYY/YY`.
- **Zero-filled buckets.** Every count map returns **every** enum value,
  including zeros, across the full enum. An absent key means the field does not
  exist, never that the count is nil.
- **Ordering** is fixed per section and not client-controllable anywhere in this
  module.
- **No cross-section consistency guarantee.** The eight endpoints are separate
  live requests. A record changing between two of them makes the sections
  disagree, and nothing reconciles them — do not assert
  `summary.alerts.overdue_checklist_items == today.overdue_checklist_items.total`.

## 4. Models

### Shared shapes

**BsDate** — `{ year, month, day, month_name, display }`.

**UserBrief** — `{ id, username, display_name }`.

**Preview** — `{ total, has_more, items: […] }`. The wrapper every worklist uses.
`total` is the full count; `items` holds at most 10 rows.

**Rate** — `{ numerator, denominator, percent? }`. `percent` is `null` — **never
`0`** — when `denominator` is `0`. "Nobody arrived" and "people arrived and none
converted" are different facts.

**OwnerRow** — `{ owner_id?, owner_username, owner_display_name }`. `owner_id` is
`null` and `owner_display_name` reads `"Unassigned"` for the bucket of work
nobody owns — returned deliberately, since unowned work is the most likely to be
missed.

**SourceConversionRow** —
`{ source_id, source_code, source_name, total, converted, lost, in_progress }`.
Only sources with at least one lead in the window appear.
`in_progress = total − converted − lost`.

### Row shapes

**ChecklistItemRow** —
`{ id, label, status:[enum], item_type:[enum], is_required, due_at?, due_at_bs?:BsDate, status_note, checklist_id, checklist_title, journey_id, applicant_id, applicant_name, country_name, assigned_to?:UserBrief }`.
`country_name` is `""` for a checklist built by hand with no country.

**OfferRow** —
`{ id, status:[enum], institution_name, program_title, intake_label, response_deadline?, response_deadline_bs?:BsDate, is_response_overdue, journey_id, applicant_id, applicant_name }`.
Read `is_response_overdue` off the row — do **not** re-derive it from
`response_deadline` in the browser timezone; the backend computes it against
today in Nepal.

**FileRow** —
`{ id, original_filename, category:[enum], verification_status:[enum], rejection_reason, created_at, reviewed_at?, applicant_id?, journey_id? }`.
`applicant_id` and `journey_id` are both `null` when the file belongs to an
offer, document, or snapshot instead.

**DocumentRow** —
`{ id, label, family:[enum], status:[enum], updated_at, applicant_id?, applicant_name }`.
`applicant_id` is `null` and `applicant_name` is `""` for a standalone document.

**PassportRow** —
`{ applicant_id, applicant_name, passport_number, expiry_date, expiry_date_bs:BsDate, has_expired }`.
`has_expired` is computed against today in **Nepal**, not UTC. Already-expired
passports are **included**, not filtered out.

**LeadRow** —
`{ id, full_name, stage:[enum], last_followed_up_at?, created_at, owner_display_name }`.

**JourneyRow** —
`{ id, stage:[enum], applicant_id, applicant_name, country_id?, country_name }`.
`country_name` falls back to the journey's free-text destination when there is
no catalogue link.

**ActivityRow** —
`{ id, app_label, action, entity_type, entity_id?, actor_type:[enum], actor_label, summary, success, created_at, created_at_bs:BsDate }`.

**LeadWorkloadRow** — OwnerRow plus `{ open_leads }`.

**ChecklistWorkloadRow** — OwnerRow plus `{ open_items, overdue_items, blocked_items }`.

**OfferWorkloadRow** — OwnerRow plus `{ awaiting_response }`.

### Section response shapes

1. **summary** — `{ alerts:{…8 counts}, volumes:{…3 counts}, due_within_days }`.
   `alerts` = `overdue_checklist_items`, `due_soon_checklist_items`,
   `blocked_checklist_items`, `offers_awaiting_response`,
   `files_awaiting_verification`, `rejected_files`, `stale_leads`,
   `journeys_without_a_checklist` (all integers). `volumes` = `leads_total`,
   `applicants_active`, `journeys_total`. `alerts.stale_leads` is owner-scoped
   for a Lead Manager; the other seven are not.
2. **today** — six Preview blocks plus `due_within_days`:
   `overdue_checklist_items` + `due_soon_checklist_items` (list[ChecklistItemRow]),
   `offers_awaiting_response` (list[OfferRow]),
   `files_awaiting_verification` (list[FileRow]),
   `documents_in_progress` (list[DocumentRow]), `stale_leads` (list[LeadRow]).
3. **pipeline** — seven zero-filled count maps plus one boolean:
   `leads_by_stage`, `applicants_by_status`, `journeys_by_stage`,
   `offers_by_status`, `checklists_by_status`, `documents_by_status`,
   `files_by_verification`, and `documents_by_status_is_country_filtered`
   (always `false`).
4. **blockers** — five Preview blocks plus `passport_within_days`:
   `blocked_checklist_items` (list[ChecklistItemRow]),
   `journeys_without_a_checklist` (list[JourneyRow]),
   `expiring_passports` (list[PassportRow]), `overdue_offers` (list[OfferRow]),
   `rejected_files` (list[FileRow]).
5. **workload** —
   `{ is_scoped_to_caller, leads:[LeadWorkloadRow], checklist_items:[ChecklistWorkloadRow], offers:[OfferWorkloadRow] }`.
   `checklist_items` includes the `owner_id: null` "Unassigned" bucket. The three
   lists are **not** joinable into one row per person and **must not be summed**.
6. **conversion** —
   `{ by_source:[SourceConversionRow], rates:{ lead_to_applicant:Rate, applicant_to_journey:Rate, journey_to_offer:Rate, offer_acceptance:Rate } }`.
   `by_source` and `lead_to_applicant` are owner-scoped for a Lead Manager; the
   other three rates are not — so a Lead Manager's four rates are **not**
   internally consistent. Present them as four independent measures.
7. **outcomes** —
   `{ journey_outcomes:{…}, offer_decisions:{…}, journeys_completed, journeys_closed, applicants_archived, applicants_dormant, checklists_completed, checklists_archived }`.
   `journey_outcomes`/`offer_decisions` are windowed on **when the thing ended**;
   `journeys_completed`/`journeys_closed` on **creation** (like pipeline) — the
   two can legitimately disagree about the same journey.
8. **activity** — `list[ActivityRow]`, **paginated, newest first**. The only
   array `data` and the only paginated section.

- All monetary/decimal values (none surfaced here directly) follow the project
  string-decimal rule; the counts above are integers.

## 5. Enums

**Every enum this module surfaces is OWNED by another app.** The dashboard never
defines an enum — it re-exports the owning module's set. For display, prefer the
`summary`/`display` fields on rows (and `ActivityRow.summary`) rather than
branching on the raw value.

- **`filter.journey_stage` / `JourneyRow.stage` / ChecklistItemRow journey stage** (9): `planning` | `profile_building` | `shortlisting` | `applying` | `offer_stage` | `visa_stage` | `completed` | `closed` | `deferred` — owned by `applicant_journeys`.
- **`filter.offer_status` / `OfferRow.status`** (7): `draft` | `issued` | `accepted` | `rejected` | `withdrawn` | `deferred` | `expired` — owned by `offers`.
- **`filter.document_status` / `DocumentRow.status`** (3): `draft` | `ready` | `archived` — owned by `documents`.
- **`filter.checklist_status`** (4): `draft` | `active` | `completed` | `archived` — owned by `checklists`.
- **`ChecklistItemRow.status`** (5): `pending` | `completed` | `waived` | `blocked` | `not_applicable` — owned by `checklists`.
- **`ChecklistItemRow.item_type`** (3): `document` | `stage` | `task` — owned by `checklists`.
- **`LeadRow.stage`** (8): `new` | `contact_attempted` | `contacted` | `counselling` | `follow_up` | `ready_for_conversion` | `converted` | `lost` — owned by `leads`.
- **`FileRow.verification_status`** (3): `pending` | `verified` | `rejected` — owned by `uploaded_files`.
- **`FileRow.category`** (11): `passport` | `photograph` | `academic_transcript` | `academic_certificate` | `test_score_report` | `offer_letter` | `financial` | `sponsorship` | `signature_image` | `generated_document` | `other` — owned by `uploaded_files`.
- **`DocumentRow.family`** (6): `student` | `woda` | `lor` | `moi` | `bank_statement` | `bank_certificate` — owned by `documents`.
- **`ActivityRow.actor_type`** (5): `superadmin` | `admin` | `lead_manager` | `system` | `ai` — owned by `audit`.
- **`outcomes.journey_outcomes` keys** (6): `successful` | `withdrawn` | `rejected` | `not_qualified` | `cancelled` | `other` — owned by `applicant_journeys`.
- **`outcomes.offer_decisions` keys** (5): `accepted` | `rejected` | `withdrawn` | `deferred` | `expired` — the terminal subset of `offers` statuses; `draft` and `issued` never appear here.
- **`ActivityRow.action`** is **not** a fixed enum — every app contributes its own action strings. Render `summary` as the label rather than branching on `action`.

## 6. Dependency order

- Every section needs an authenticated `admin` or `lead_manager` session
  _(external module: `authenticate`)_.
- **Nothing in this module needs to be created first.** It owns no resources,
  accepts no writes, and has no create endpoint of any kind.
- Sections return **empty or zeroed** data on a fresh installation rather than
  failing. A dashboard with nothing on it is the correct answer for a system
  with nothing in it.
- The `country` filter needs an `institutions.Country` id, obtained from
  `GET /api/v1/catalogue/countries/` _(external module: `institutions`)_.
- The `owner` filter needs a user id, obtained from the `authenticate` module.

**Start here:** `GET /api/v1/dashboard/summary/`. It needs nothing but a session
and tells you which of the other seven sections is worth opening.

## 7. Endpoints

All eight are `GET`, read-only, low-to-medium risk, and accept the shared filter
set from §3. None takes a request body.

| Endpoint                        | Method | Policy key                   | Auth                  | Notes                                                                |
| ------------------------------- | ------ | ---------------------------- | --------------------- | -------------------------------------------------------------------- |
| `/api/v1/dashboard/summary/`    | GET    | `dashboards.summary.read`    | Admin or Lead Manager | Alert strip: 8 alert counts + 3 volumes + `due_within_days`          |
| `/api/v1/dashboard/today/`      | GET    | `dashboards.today.read`      | Admin or Lead Manager | 6 Preview worklists + `due_within_days`                              |
| `/api/v1/dashboard/pipeline/`   | GET    | `dashboards.pipeline.read`   | Admin or Lead Manager | 7 zero-filled count maps + `documents_by_status_is_country_filtered` |
| `/api/v1/dashboard/blockers/`   | GET    | `dashboards.blockers.read`   | Admin or Lead Manager | 5 Preview blocks + `passport_within_days` (default 180d)             |
| `/api/v1/dashboard/workload/`   | GET    | `dashboards.workload.read`   | Admin or Lead Manager | `is_scoped_to_caller` + 3 owner lists (incl. unassigned bucket)      |
| `/api/v1/dashboard/conversion/` | GET    | `dashboards.conversion.read` | Admin or Lead Manager | `by_source[]` + 4 independent rates                                  |
| `/api/v1/dashboard/outcomes/`   | GET    | `dashboards.outcomes.read`   | Admin or Lead Manager | Outcome/decision maps + completion/archival counts                   |
| `/api/v1/dashboard/activity/`   | GET    | `dashboards.activity.list`   | Admin or Lead Manager | **The only paginated section**; not narrowed by authority            |

### Per-section returns & honoured filters

- **summary** — top-line alerts and volumes; every figure is duplicated in a
  fuller section below. `due_within_days` echoed back so the client can label the
  due-soon figure without assuming the default.
- **today** — the worklist this module exists for. A checklist item appears only
  if it has a `due_at` and its checklist is `draft`/`active`; an offer only if it
  is `issued` **and** carries a `response_deadline`. **Overdue and due-soon are
  disjoint** — an already-late item is only in `overdue_checklist_items`, so
  summing those two totals is safe (nothing else on the page may be summed).
  `stale_leads` = "no follow-up in 7 days" (fixed 7, **not** `due_within_days`),
  falling back to creation date. `documents_in_progress` ordered **oldest edit
  first** (stalled work) and ignores `country`. `files_awaiting_verification`
  ordered **oldest upload first** (review queue); verification is a record of
  human judgement, **not a gate** — present as work outstanding, never blocked.
  Honours `owner` (checklist lists) and `institution` (offers).
- **pipeline** — seven zero-filled maps, **windowed on creation date** (a journey
  running two years is absent from a one-month window even though live today).
  `leads_by_stage` is owner-scoped for a Lead Manager; the other six are not.
  `files_by_verification` excludes archived/superseded files.
  `documents_by_status_is_country_filtered` is always `false` (a document belongs
  to an applicant, not a study plan) and exists so the panel can be labelled
  honestly when a country filter is applied elsewhere on screen. Honours
  `institution` (offers map only).
- **blockers** — five groups, **grouped by cause, never merged into one ranked
  list** (five different people act on them). `journeys_without_a_checklist` is
  the safety net behind automatic checklist inheritance — silence made visible;
  an empty group is the healthy state. `overdue_offers` holds **only** deadlines
  already past (approaching ones are in `today`). `expiring_passports`
  **includes already-expired** passports; horizon defaults to **180 days**, not
  `due_within_days`, overridable with `passport_within_days`. `rejected_files`
  shows only files still current. Honours `owner` (checklist list).
- **workload** — `is_scoped_to_caller` is `true` for a Lead Manager (`leads`
  holds at most their own row) and `false` for an Admin — **branch on the flag,
  do not infer team size from row count**. `checklist_items` includes the
  `owner_id: null` "Unassigned" bucket and is **not** owner-scoped even for a
  Lead Manager. `offers` counts by **who recorded** the offer ("recorded by"),
  not an assignee. The three lists must **not** be summed. This section ignores
  the `owner` filter (it partitions by owner itself).
- **conversion** — `by_source[]` (only sources with ≥1 lead in the window) plus
  four rates. **The four rates are not one funnel and must not be multiplied
  together** — each is windowed on its own stage. Every `Rate.percent` is `null`
  (not `0`) when its denominator is `0` → render "—", never "0%".
  `by_source`/`lead_to_applicant` are owner-scoped for a Lead Manager; the other
  three rates are not. `offer_acceptance` counts only **decided** offers, keyed on
  when the decision was recorded.
- **outcomes** — `journey_outcomes`/`offer_decisions` windowed on **when the
  thing ended**; `journeys_completed`/`journeys_closed` on **creation** — do not
  present the two as parts of one total. `journey_outcomes` counts only journeys
  carrying an outcome; `offer_decisions` has keys only for the five terminal
  statuses.
- **activity** — `list[ActivityRow]`, paginated, newest first. **Not narrowed by
  the caller's authority** (the audit log is not owner-scoped anywhere), so a
  Lead Manager sees events about records they cannot otherwise read — consistent
  with `GET /api/v1/audit/events/`. **Only `fiscal_year` is honoured**; every
  other filter is validated and **ignored**. Render `summary` as the label.

## 8. Error codes

| Code                         | HTTP | Notes                                                                                                                                                                                         |
| ---------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DASHBOARDS_ACTOR_FORBIDDEN` | 403  | A `superadmin` called any of the eight endpoints. Hide the nav entry — no section will ever answer for this authority.                                                                        |
| `VALIDATION_ERROR`           | 400  | A malformed filter value. `details` keys are the filter field names. Observed: `date_to` (range runs backwards), `fiscal_year` (malformed `YYYY/YY` label), `due_within_days` (out of range). |

- 401 (no/expired/revoked token) comes from the authentication framework, not
  this module — its body shape is specified by the `authenticate` contract.

## 9. Gaps

- **No appointments anywhere.** `concepts/dashboards.txt` asks for "upcoming
  appointments" and "appointments that were missed or are about to occur". There
  is no appointments module, so those figures are **absent, not zero** — do not
  build a panel expecting them.
- **No notifications.** The concept asks this module to summarise pending alerts
  and follow-ups from a `notifications` module. That module does not exist; no
  notification count appears in any response.
- **No branch filter, and no branch concept at all.** The concept lists "branch"
  among the useful filters. Nothing anywhere in this backend models a branch or
  office, so the control cannot be built and is absent from the filter set.
- **No test-score or other expiry blockers.** Only passport expiry is available;
  the `test_scores` module is specified but not built.
- **Four filters are accepted but change nothing.** `journey_stage`,
  `offer_status`, `document_status`, and `checklist_status` are validated and
  silently **ignored** by every section. Sending them changes nothing — **do not
  render them as active controls.**
- **`institution` narrows only offers** (`today.offers_awaiting_response`,
  `pipeline.offers_by_status`); ignored everywhere else.
- **`owner` narrows only checklist worklists** (the checklist item lists in
  `today` and `blockers`); ignored by every count map and by `workload` itself.
- **`activity` ignores every filter but `fiscal_year`.** A client rendering one
  filter bar over the whole page must say that panel is unfiltered.
- **Worklist previews cap at 10 rows with no way to page.** No `limit`/`offset`
  on the seven object sections; getting past the first 10 means calling the
  owning module's list endpoint.
- **No drill-down contract.** Rows carry the ids needed to navigate, but nothing
  states which query parameters reproduce a section's filtering on the target
  list endpoint. A "see all 47" link is a best-effort approximation; the count on
  the destination screen may legitimately differ.
- **No caching, no `Last-Modified`/ETag, no documented latency budget.** Every
  request runs live queries; a section over a large dataset may be slow and the
  contract does not say how slow. There is no polling interval, push channel, or
  staleness indicator — **the client decides when to refetch.**
- **No cross-section consistency guarantee.** The eight endpoints are separate
  live requests; a record changing between two of them makes the sections
  disagree, and nothing reconciles them.
- **Owner scoping is not uniform within a response, and nothing marks which
  figures were scoped** except `workload.is_scoped_to_caller`. For a Lead
  Manager, lead figures are narrowed and everything else is not — an Admin and a
  Lead Manager legitimately see different numbers on the same URL. There is no
  per-field flag.
- **No export, no scheduled report, no historical trend series.** Every section
  is a point-in-time snapshot for the requested window; a sparkline cannot be
  built from this module.
- **`VALIDATION_ERROR` messages are not fully enumerated** — details keys are the
  filter field names, but the complete message set is not documented (code is
  authoritative, per `CORE_INTEGRATION.md §9`).

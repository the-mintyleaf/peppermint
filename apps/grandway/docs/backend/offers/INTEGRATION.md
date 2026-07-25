# Integration — Offers

**Owner app:** `offers`
**Version:** 1.2.0
**Status:** Active
**Synced:** 2026-07-25 (from `.backend/backend/offers/docs/{INTEGRATION,API,DATA_CONTRACT,SECURITY}.md`)

> Re-sync with `/sync-api grandway offers` when the backend's
> Change History moves past version 1.2.0.
>
> Global conventions (envelopes, pagination, IDs, times, money, rate limits) live
> in `../CORE_INTEGRATION.md` — this file records only what `offers` adds or
> deviates from.

---

## Change History

| Version | Date       | Summary                                                                                                                                    |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2026-07-24 | Initial integration contract — 11 endpoints across two resources (Offer, Condition)                                                        |
| 1.0.1   | 2026-07-24 | No endpoint change. `uploaded_files` confirmed shipped; named the two file calls the Offer Detail supporting-files section makes           |
| 1.1.0   | 2026-07-24 | History entries gained `actor_id` (shape owned by `audit`, shared by every history endpoint). Additive. `audit` recorded as a read dep too |
| 1.2.0   | 2026-07-25 | **Breaking:** English-only names — dropped `_np`/`_romanized` columns, renamed `_en` snapshot fields to bare (`institution_name`)          |

---

## 1. Module

- **Name:** Offers — the formal admission decisions institutions make against
  applicant journeys: what was offered, for which program and intake, on what
  money terms, under what conditions, and how the applicant responded. It is
  **the source of truth for decision records**, not for the study plan — a
  journey's stage may say offers are awaited, but only this module knows what was
  actually offered.
- **Base path:** `/api/v1/offers/`
- **Auth — full rights for Admin AND Lead Manager, reads and writes alike.**
  Bearer access JWT on every endpoint. `admin` and `lead_manager` have
  **identical** rights on every route; a `superadmin` token is refused 403
  everywhere, reads included. **There is no read/write split** — deliberately
  unlike `institutions` (writes Admin-only) and `clients`. An offers screen needs
  **no authority-based control hiding**: do not carry a "hide write controls from
  Lead Managers" rule across from the catalogue screens. A `superadmin` has no
  reason to be on these screens at all.

## 2. Requires

| Depends on           | Kind                      | Why                                                                                                                                                                                                                | What breaks without it                                                                                                                      |
| -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `authenticate`       | framework/JWT             | Issues the access JWT and supplies `authority_type` (the whole access check). `created_by` (`PROTECT`), `decided_by`/`resolved_by` (`SET_NULL`) reference users.                                                   | Every endpoint 401s; a `superadmin` gets 403 `OFFERS_ACTOR_FORBIDDEN` everywhere, reads included; attribution unresolvable.                 |
| `applicant_journeys` | FK (required) + service   | **Every offer belongs to exactly one journey**, supplied on create and **never changeable**. The applicant's identity is reached _through_ the journey.                                                            | Offers cannot be created at all — there is nothing to attach them to. `POST` returns 400 `OFFERS_JOURNEY_NOT_FOUND` for an unresolvable id. |
| `institutions`       | FK (optional)             | Supplies the catalogue records a catalogue-sourced offer is built from, and the names copied into its snapshot. Manual offers use none.                                                                            | Catalogue-sourced offers become impossible; manual offers still work in full. The `institution`/`program` list filters return nothing.      |
| `audit`              | service call + read shape | Every mutation (conditions included) appends one immutable event carrying changed fields' previous/new values. This module stores no history; `/history/` reads audit's selector and renders audit's shared shape. | Module does not start. If only the write path failed, offers would still record but leave no trace, and `/history/` returns empty.          |

**This module writes to nothing outside itself.** Recording, issuing, or deciding
an offer does **not** change the journey's `stage`, the applicant's `status`, or
any catalogue record. A client that expects a journey to advance on acceptance
must call `applicant_journeys.journey.change_stage` itself (§7 flows).

**Offers is the first module that links `institutions` to `applicant_journeys`.**
Both shipped as islands — journeys still store their destination as free text
(`target_country`, `target_institution_name`, `target_program_name`) and do not
reference the catalogue. An offer references both but reconciles neither: a
journey saying "Melbourne" and an offer pointing at a catalogue Melbourne record
are two unconnected facts (§9).

## 3. Conventions

- **Response/Error envelopes:** the standard project envelope (`../CORE_INTEGRATION.md` §3) —
  `{ success, message, data, meta }` / `{ success: false, error: { code, message, details } }`.
  `error.details` is always present (`{}` when no field errors). **Do not assert on `message`** —
  branch on HTTP status and `error.code`.
- **`OFFERS_ACTOR_FORBIDDEN` (403) replaces the global `PERMISSION_DENIED`, it does not coexist with it.**
  You will not see `PERMISSION_DENIED` from `/api/v1/offers/`. It applies identically to all eleven
  endpoints (in practice only a `superadmin` ever triggers it) and is omitted from the per-endpoint
  error lists in §7.
- **404 is always genuine** — `OFFERS_OFFER_NOT_FOUND` / `OFFERS_CONDITION_NOT_FOUND` never mean "not
  yours". Nothing is owner-scoped or hidden from an authorised caller. A 404 is only ever about the
  record named in the **URL path** (the offer id or condition id).
- **Unknown ids in the request _body_ are 400, not 404.** A bad `journey`/`institution`/`campus`/`program`
  id returns 400 with a module code (`OFFERS_JOURNEY_NOT_FOUND` or `OFFERS_CATALOGUE_REFERENCE_INVALID`).
- **The reference block and `status` are immutable, and a `PATCH` carrying them is REJECTED, not ignored**
  (unlike `institutions`, which silently drops them). `journey`, `institution`, `campus`, `program`,
  `reference_source`, all six snapshot fields, `status`, and `conditions` → 400 `OFFERS_REFERENCE_IMMUTABLE`
  with each offending field in `details`. **Send only the fields the user actually changed** — do NOT
  reuse a read-modify-write-the-whole-object edit form from the catalogue screens, or every save fails.
- **Snapshot text is write-once.** `institution_name`, `campus_name`, `program_title`, `country_name`,
  `qualification_level`, `intake_label` are copied at creation and never change — a renamed program or
  a deactivated institution leaves them untouched. **Render these, not a freshly-fetched catalogue
  record**, anywhere the offer is displayed. Caller-supplied snapshot text wins over the catalogue on
  create.
- **A `PATCH` that changes nothing writes no audit event** — still 200 with the unchanged record. A UI
  reporting "saved, history updated" after a no-op save is lying.
- **Nothing is ever deleted — there is no `DELETE` on any endpoint.** An offer that no longer applies
  gets a terminal status via the decision action; a condition that does not apply becomes
  `not_applicable` with a note. Do not build a delete button; build a decision control and a
  condition-status control.
- **A decision is final — there is no reopen endpoint** (unlike `applicant_journeys`). Once `status` is
  terminal, no further decision is accepted (409). An institution that changes its position has issued a
  _new_ offer; record a second offer.
- **HTTP:** `POST /offers/` (create) → 201; `POST` that acts on an existing record (issue, decision,
  condition status) → 200; `GET`/`PATCH` → 200. Domain-rule violations → 400; state conflicts (issuing a
  non-draft, deciding a decided offer, accepting a second offer) → 409; missing URL record → 404;
  authority failure → 403; unrouted method → 405 `METHOD_NOT_ALLOWED`.
- **Pagination:** page-number based, `page`/`page_size` (default 20, max 100; over-max clamped). Applied
  to **every** list endpoint here — offers, conditions, and history. `data` is the **bare array**; page
  metadata (`count`, `page`, `page_size`, `next`, `previous`) lives in `meta`.
- **Ordering is fixed and not client-controllable** — no `sort`/`ordering` param. Offers by newest
  `created_at`; conditions by `display_order` then `created_at`; history newest-first.
- **Query params are validated, not ignored** — `?status=maybe` or `?deadline_before=soon` returns 400.
- **IDs:** UUID strings throughout. `offer_reference` is the _institution's_ own letter number — free
  text, not unique, not an addressable identifier.
- **Times — two rules.** System timestamps (`created_at`, `updated_at`) are ISO 8601 UTC with **no** `_bs`
  sibling. **User-facing dates carry a Bikram Sambat sibling** — `issue_date_bs`, `response_deadline_bs`,
  `deposit_due_date_bs`, `decided_at_bs`, and on conditions `due_date_bs`, `resolved_at_bs` — each an
  object `{ year, month, day, month_name, display }` or `null`, never a string. **Write the Gregorian
  field (`YYYY-MM-DD`); read either.** There is no BS input anywhere. `is_response_overdue` is computed in
  **Nepal time** (UTC+5:45) — trust the server flag rather than comparing dates locally near midnight NPT.
- **Money:** decimal **strings**, never numbers (`"49824.00"`, `Decimal(12,2)`, up to 10 integer digits).
  Never parse into a float. Every amount has a separate currency field and is `null` when unrecorded; an
  empty currency is `""`, not `null`. **Amounts are stored exactly as the institution quoted them and are
  never converted** — two offers on one journey may be in different currencies and nothing normalizes
  them. **Render the currency on every figure.**
- **Empty text fields are `""`, never `null`.** Nullable fields are the dates (`issue_date`,
  `response_deadline`, `deposit_due_date`, `due_date`), the amounts, `decided_at`, `resolved_at`, the
  three catalogue FKs, and the `*_username` fields.

## 4. Models

**Offer — list shape** (`GET /api/v1/offers/` rows): `{ id, journey, journey_stage: enum, applicant_id, applicant_name, institution_name, campus_name, program_title, qualification_level: enum, intake_label, offer_type: enum, status: enum, issue_date?, issue_date_bs?: json, response_deadline?, response_deadline_bs?: json, is_response_overdue, has_open_conditions, created_at }`.

- `applicant_name` and `journey_stage` are reached **through** the journey and are read-only here.
  `journey_stage` is `applicant_journeys`' enum, not this module's.
- `is_response_overdue` is true only when `status` is `issued` **and** the deadline has passed. An
  overdue `draft` reports `false` — a draft was never issued, so nothing is late.
- `has_open_conditions` is true when any condition is not `satisfied`/`waived`/`not_applicable`. It is
  **independent of `offer_type`** — an `unconditional` offer with a pending condition reports `true`.

**Offer — detail shape** (retrieve, create, update, issue, **and** decision): the list shape **plus**
`{ institution?, campus?, program?, reference_source: enum, country_name, offer_reference, tuition_amount?, tuition_currency, tuition_fee_period: enum, scholarship_amount?, scholarship_currency, scholarship_notes, deposit_amount?, deposit_currency, deposit_due_date?, deposit_due_date_bs?: json, deposit_notes, notes, is_terminal, decided_at?, decided_at_bs?: json, decision_reason, decided_by_username?, deferred_to_intake, created_by_username, conditions: list[Condition], updated_at }`.

- The detail shape is returned by retrieve, create, update, issue, **and** decision. Only the list
  returns the shorter shape.
- `institution`, `campus`, `program` are **bare UUID strings or `null`** — not nested objects. `null` on
  a manual offer. To show the live catalogue record, fetch it from `/api/v1/catalogue/`.
- **The snapshot fields, not the FKs, are what the offer means** — render them, not a fresh catalogue
  fetch (see §3).
- `deferred_to_intake` is non-empty only when `status` is `deferred`.
- `conditions` is always present, `[]` when there are none.

**Condition** (nested in the offer detail shape, and the row shape of the conditions list — identical):
`{ id, condition_type: enum, description, status: enum, is_resolved, due_date?, due_date_bs?: json, display_order, resolution_note, resolved_at?, resolved_at_bs?: json, resolved_by_username?, created_at, updated_at }`.

- Ordered by `display_order`, then `created_at`. Not client-controllable.
- Already nested in the offer detail response — you do **not** need the list endpoint to render Offer
  Detail. That endpoint exists for a standalone conditions view and for refreshing the panel alone.

**HistoryEvent** (`GET /api/v1/offers/<id>/history/` rows): `{ id, action: enum, actor_type: enum, actor_id: uuid|null, actor_label, summary, reason, changes: json, metadata: json, created_at, created_at_bs: json }`.

- Owned by the `audit` module (its `AuditEventHistoryEntry`); this app renders it, every module's
  `/history/` returns the identical shape. `actor_id` is the acting user's UUID or `null` for system/AI
  actors — prefer it over `actor_label` (a preserved username snapshot) when linking.
- `changes` maps field → `{ from, to }` (both stringified); `{}` on creation and condition events.
- `metadata` is free-form per action — check before relying on a key.
- **Condition events appear in the offer's history**, not a separate log: `offer_condition_created`,
  `offer_condition_updated`, `offer_condition_status_changed` all carry the _offer's_ id, with the
  condition's id in `metadata.condition_id`. The list is never empty for an existing offer — creation
  always writes one event.

## 5. Enums

- **`Offer.status`** (7): `draft` | `issued` | `accepted` | `rejected` | `withdrawn` | `deferred` | `expired`.
  - **Terminal** (`is_terminal` true, no further decision accepted): everything except `draft` and
    `issued`.
  - **No `awaiting_response`** — `issued` covers it. An issued offer is by definition awaiting a response.
  - **Nothing expires automatically** — `expired` is only ever set by a person through the decision
    action. Use `is_response_overdue` to surface offers that have lapsed.
- **`decision.outcome`** (request field, not a stored enum): `accepted` | `rejected` | `withdrawn` | `deferred` | `expired`.
  A strict subset of `Offer.status` — sending `draft` or `issued` is a serializer `VALIDATION_ERROR`.
- **`Offer.offer_type`** (2): `conditional` | `unconditional`. Defaults to `conditional`.
- **`Offer.reference_source`** (2): `catalogue` | `manual`. **Read-only, derived** at creation — `catalogue`
  when any catalogue FK resolved, `manual` otherwise. Never sent.
- **`Offer.qualification_level`**: `school` | `certificate` | `diploma` | `bachelors` | `postgraduate_diploma` | `masters` | `phd` | `other`, or `""`.
  The **same value set** as `institutions` `Program.qualification_level` and `applicant_journeys`
  `Journey.study_level`, deliberately.
- **`Offer.tuition_fee_period`**: `per_year` | `per_semester` | `total_program`, or `""`. Same set as
  `institutions` `Program.tuition_fee_period`. **Only tuition has a period** — scholarship and deposit do not.
- **`Condition.condition_type`** (7): `academic_result` | `english_test` | `document_submission` | `deposit_payment` | `interview` | `identity_confirmation` | `other`.
- **`Condition.status`** (4): `pending` | `satisfied` | `waived` | `not_applicable`.
  - **Resolved** (`is_resolved` true, no longer counts toward `has_open_conditions`): everything except
    `pending`.
- **`HistoryEvent.action`** (7): `offer_created` | `offer_updated` | `offer_issued` | `offer_decision_recorded` | `offer_condition_created` | `offer_condition_updated` | `offer_condition_status_changed`.
- **`HistoryEvent.actor_type`** (5): `superadmin` | `admin` | `lead_manager` | `system` | `ai` — the
  `audit` enum. In practice only `admin` and `lead_manager` appear here.
- **`intake_label` / `deferred_to_intake` / `offer_reference`** — **not enums.** Free text; intakes are
  not catalogued in this phase (§9), and `offer_reference` is the institution's own letter number.

## 6. Dependency order

1. An `Offer` needs an `ApplicantJourney` **(external module: `applicant_journeys`)** — supplied in the
   request body, **never changeable** afterwards. You cannot create anything in this module from empty.
2. Obtain a journey id first — from `GET /api/v1/journeys/` or the journey you are already viewing — then
   `POST /api/v1/offers/`.
3. A catalogue-sourced offer optionally needs a `Program`/`Institution`/`Campus` **(external module:
   `institutions`)**; a manual offer needs none. A `Condition` needs an `Offer`, supplied in the URL path
   on create.

## 7. Endpoints

All eleven are Admin **and** Lead Manager (identical rights); `OFFERS_ACTOR_FORBIDDEN` (403 — a
`superadmin`) applies to every one and is omitted below. **There is no `DELETE`.**

| Endpoint                                           | Method | Policy key                       | Auth       | Notes                                                                                                                                                                                                                      |
| -------------------------------------------------- | ------ | -------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/v1/offers/`                                  | GET    | `offers.offer.list`              | Admin + LM | Filters: `journey`, `applicant`, `institution`, `program` (exact UUID), `status`, `offer_type` (enum), `intake` (substring of `intake_label`), `deadline_before` (`YYYY-MM-DD`), `fiscal_year` (`YYYY/YY`). No text search |
| `/api/v1/offers/`                                  | POST   | `offers.offer.create`            | Admin + LM | 201. Journey FK required; reference via `program` OR `institution_name`+`program_title`; `conditions` may be created inline                                                                                                |
| `/api/v1/offers/<offer_id>/`                       | GET    | `offers.offer.read`              | Admin + LM | Detail shape with `conditions` nested                                                                                                                                                                                      |
| `/api/v1/offers/<offer_id>/`                       | PATCH  | `offers.offer.update`            | Admin + LM | Immutable fields **rejected** (`OFFERS_REFERENCE_IMMUTABLE`); send only changed fields                                                                                                                                     |
| `/api/v1/offers/<offer_id>/issue/`                 | POST   | `offers.offer.issue`             | Admin + LM | Requires status `draft`. Sole transition into `issued`. 409 otherwise                                                                                                                                                      |
| `/api/v1/offers/<offer_id>/decision/`              | POST   | `offers.offer.record_decision`   | Admin + LM | Requires status `draft` or `issued`. Final — no reopen. At most one `accepted` per journey (risk: high)                                                                                                                    |
| `/api/v1/offers/<offer_id>/history/`               | GET    | `offers.offer.list_history`      | Admin + LM | Backed by `audit`; includes condition events (`metadata.condition_id`). Never empty for an existing offer                                                                                                                  |
| `/api/v1/offers/<offer_id>/conditions/`            | GET    | `offers.condition.list`          | Admin + LM | One offer's conditions. Not needed to render Offer Detail (already nested)                                                                                                                                                 |
| `/api/v1/offers/<offer_id>/conditions/`            | POST   | `offers.condition.create`        | Admin + LM | 201. Allowed on a **decided** offer — do not disable                                                                                                                                                                       |
| `/api/v1/offers/conditions/<condition_id>/`        | PATCH  | `offers.condition.update`        | Admin + LM | **Un-nested.** Wording only (`condition_type`, `description`, `due_date`, `display_order`); **not `status`**                                                                                                               |
| `/api/v1/offers/conditions/<condition_id>/status/` | POST   | `offers.condition.change_status` | Admin + LM | The tick/waive control. Flips the offer's `has_open_conditions` (not returned here — refetch)                                                                                                                              |

### Request bodies

- **Create offer:** `journey` (**required**, UUID); **the reference, one of two ways** — either
  `program` (UUID, which implies its own institution and campus) **or** snapshot text `institution_name` +
  `program_title`; plus optionally `institution`, `campus`, `campus_name`, `country_name`,
  `qualification_level`, `intake_label`, `offer_type`, `offer_reference`, `issue_date`,
  `response_deadline`, the nine money fields (`tuition_amount`/`tuition_currency`/`tuition_fee_period`,
  `scholarship_amount`/`scholarship_currency`/`scholarship_notes`,
  `deposit_amount`/`deposit_currency`/`deposit_due_date`/`deposit_notes`), `notes`, and `conditions` (an
  array of `{ condition_type, description, due_date?, display_order? }`). Defaults: `offer_type` →
  `conditional`, `status` → `draft`; every unset text field `""`, every unset date/amount `null`.
  `reference_source` is derived, never sent. Caller-supplied snapshot text wins over the catalogue.
- **Update offer:** any subset of `offer_type`, `offer_reference`, `issue_date`, `response_deadline`, the
  nine money fields, `notes` — **and nothing else.** An immutable field is a 400, not a silent no-op.
  Money completeness is re-checked against the **merged** state (patching an amount onto an offer with no
  stored currency fails just as a create would).
- **Issue:** empty body (`{}` is fine).
- **Decision:** `outcome` (**required**); `reason` (**required for `rejected`/`withdrawn`**, optional
  otherwise); `to_intake` (**required for `deferred`**, ignored otherwise).
- **Create condition:** `condition_type` (**required**), `description` (**required**), `due_date`,
  `display_order`. `offer` is never sent in the body (ignored).
- **Update condition:** any subset of `condition_type`, `description`, `due_date`, `display_order` — **not
  `status`.**
- **Change condition status:** `status` (**required**); `note` (**required for `waived`/`not_applicable`**,
  optional otherwise — `satisfied` needs none). Re-sending the current status with no note is a no-op
  (200, no event). Moving back to `pending` is allowed and clears the resolution stamp.

## 8. Error codes

| Code                                 | HTTP | Notes                                                                                                                 |
| ------------------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------- |
| `OFFERS_ACTOR_FORBIDDEN`             | 403  | Any endpoint (reads included) — in practice a `superadmin`. Replaces `PERMISSION_DENIED`                              |
| `OFFERS_OFFER_NOT_FOUND`             | 404  | No offer with the id in the URL path. Always genuine                                                                  |
| `OFFERS_CONDITION_NOT_FOUND`         | 404  | No condition with the id in the URL path. Always genuine                                                              |
| `OFFERS_JOURNEY_NOT_FOUND`           | 400  | Create — the `journey` id in the body does not resolve                                                                |
| `OFFERS_PROGRAM_REFERENCE_REQUIRED`  | 400  | Create — neither a catalogue `program` nor `institution_name`+`program_title` was given                               |
| `OFFERS_CATALOGUE_REFERENCE_INVALID` | 400  | A catalogue id does not exist, or the campus/program does not belong to the institution                               |
| `OFFERS_AMOUNT_INCOMPLETE`           | 400  | A tuition, scholarship, or deposit amount was sent without its currency                                               |
| `OFFERS_REFERENCE_IMMUTABLE`         | 400  | `PATCH` carried the journey, a catalogue reference, a snapshot field, `status`, or `conditions`; `details` names each |
| `OFFERS_OFFER_NOT_ISSUABLE`          | 409  | Issue called on an offer that is not a `draft`                                                                        |
| `OFFERS_OFFER_NOT_DECIDABLE`         | 409  | Decision recorded against an already-terminal offer                                                                   |
| `OFFERS_ACCEPTED_OFFER_EXISTS`       | 409  | The journey already has an accepted offer                                                                             |
| `OFFERS_DECISION_REASON_REQUIRED`    | 400  | `rejected` or `withdrawn` sent with no reason                                                                         |
| `OFFERS_DEFER_INTAKE_REQUIRED`       | 400  | `deferred` sent with no `to_intake`                                                                                   |
| `OFFERS_CONDITION_NOTE_REQUIRED`     | 400  | `waived` or `not_applicable` sent with no note                                                                        |
| `VALIDATION_ERROR`                   | 400  | Serializer-level failure (bad enum choice, malformed filter, amount over `Decimal(12,2)`); fields in `details`        |

## 9. Gaps

**Blocking — features the concept describes with no endpoint here**

- **No supporting files _on this resource_.** The offer payload carries **no file references of any
  kind** — no count, no ids. The offer letter lives in `uploaded_files`, not here: attach with
  `POST /api/v1/files/` (`offer=<id>`, `category=offer_letter`), list with
  `GET /api/v1/files/?offer=<id>&is_archived=false`. A screen showing an offer and its letter makes two
  calls and joins them itself. A "download the saved PDF" link is not shippable — nothing generates or
  stores that PDF automatically.
- **No text search on the offer list.** There is no `q` parameter. `?intake=` is the only substring
  filter (partial match on `intake_label`); the snapshot institution and program names cannot be searched
  at all. "Find offers from Melbourne" can only filter by the catalogue `institution` id — **which misses
  every manual offer** — or fetch and filter client-side.

**Behavioural — things that will surprise a client**

- **The reference block and `status` are rejected on `PATCH`, not dropped** (the inverse of
  `institutions`). Send only changed fields; do not read-modify-write the whole object.
- **Recording, issuing, or deciding an offer never moves the journey's `stage`** — the two lifecycles are
  independent. A journey can sit at `planning` with three issued offers and no API flags the
  inconsistency. If acceptance should advance the journey, the client calls
  `applicant_journeys.journey.change_stage` itself.
- **A decision is final — no reopen.** Once terminal, no further decision (409). Record a second offer
  instead of undoing the first. `deferred` on an offer is **not** deferring the journey.
- **`has_open_conditions` is not returned by the condition status action** — the response is the condition
  alone. Refetch the offer or recompute locally before re-rendering the offer header.
- **Nothing expires automatically** — no background job, no deadline notification. `is_response_overdue`
  is computed on read only (in Nepal time). Poll `?status=issued` to build a deadline view.
- **No currency conversion or normalization anywhere.** Two offers on one journey may quote different
  currencies with no exchange rate stored — any cross-currency comparison is the client's problem. Render
  the currency on every figure.

**Open / unreconciled questions**

- **No `superseded_by` link.** The concept says an offer "may be superseded by a later offer", but
  nothing records that relationship. Infer it from the newest-first ordering of `?journey=<id>` and which
  offer is `accepted`. A "superseded" badge is the UI's own rule.
- **Intakes are free text.** `intake_label` and `deferred_to_intake` are unstructured — `institutions`
  has no Intake table in Phase 1. No date-based intake search, no reliable grouping; `?intake=` will miss
  `"February 2027"` when the stored value is `"Feb 2027"`. Normalise on input in the UI if grouping is
  needed.
- **Offer conditions are not `checklists`.** The `checklists` domain is named in the project overview and
  not built. Whether conditions should migrate onto it is open; today they are owned entirely by this
  module and are not reusable across offers.
- **Nothing reconciles a journey's free-text destination with the offer's catalogue reference.** A journey
  saying `target_institution_name: "Melbourne Uni"` and an offer pointing at the catalogue's "University
  of Melbourne" are both stored; nothing compares them and no endpoint reports a mismatch.

> **Note on the v1.2.0 rename.** The English-only rename dropped `_np`/`_romanized` columns and renamed
> `_en` snapshot fields to bare (`institution_name`). Some source "Send"/example lists in the backend
> docs may still carry stale duplicate names — **trust §4 Models above** (taken from `DATA_CONTRACT.md`)
> as the authoritative field set.

# Integration — Institutions

**Owner app:** `institutions`
**Version:** 1.2.0
**Status:** Active
**Synced:** 2026-07-25 (from `.backend/backend/institutions/docs/{INTEGRATION,API,DATA_CONTRACT,SECURITY}.md`)

> Re-sync with `/sync-api grandway institutions` when the backend's
> Change History moves past version 1.2.0.
>
> Global conventions (envelopes, pagination, IDs, times, money, rate limits) live
> in `../CORE_INTEGRATION.md` — this file records only what `institutions` adds or
> deviates from.

---

## Change History

| Version | Date       | Summary                                                                                                                                                                                                                                                                                                                |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-24 | Initial integration contract — 20 endpoints, five resources, Phase 1 catalogue spine                                                                                                                                                                                                                                   |
| 1.1.0   | 2026-07-24 | Documentation only — no endpoint change. Added HTTP codes, the `INSTITUTIONS_ACTOR_FORBIDDEN` body, query-param encoding, write defaults, ordering, immutability/no-op/availability-note rules, `is_usable` semantics, the `tuition_max` limitation, the institution→program country cascade, and `q`'s exact coverage |
| 1.2.0   | 2026-07-25 | **Breaking:** English-only names — dropped the `_np`/`_romanized` columns and renamed `_en` fields to a bare `name` on every catalogue model                                                                                                                                                                           |

---

## 1. Module

- **Name:** Institutions — the study-opportunity **catalogue**. Owns the
  countries, providers, campuses, and programs the consultancy can offer, each
  program's tuition, entry expectations, and current availability. It is
  **reference data, not an applicant's plan**: it says what _can_ be offered,
  never what a particular person is pursuing. Five resources — Field, Country,
  Institution, Campus, Program — and "institutions" is only one of them.
- **Base path:** `/api/v1/catalogue/` — **note this differs from the app name.**
- **Auth — reads shared, writes Admin-only.** Bearer access JWT on every
  endpoint. `admin` may do everything. **`lead_manager` may read (`GET`) any
  resource but is refused every write with 403 `INSTITUTIONS_ACTOR_FORBIDDEN`.**
  **`superadmin` is refused everything, reads included.** This is the first module
  in the project where the read population and the write population differ — search
  is the point of the catalogue, so every counsellor may read it, but one careless
  edit changes what every Lead Manager can offer, so writes are Admin-only.

## 2. Requires

| Depends on     | Kind                      | Why                                                                                                                                                                                  | What breaks without it                                                                                          |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `authenticate` | framework/JWT             | Issues the access JWT and supplies `authority_type`, which decides both whether the caller may act and whether they may write.                                                       | Every endpoint 401s; a `superadmin` gets 403 `INSTITUTIONS_ACTOR_FORBIDDEN` on every route including reads.     |
| `audit`        | service call + read shape | Every create and update appends one immutable event carrying each changed field's previous and new value. **This module stores no history of its own** and exposes no history route. | Edits still succeed but leave no trace of what changed; the concept's "previous values remain visible" is lost. |

**No FK to `authenticate`.** Catalogue records have no owner and no `created_by`
column — attribution lives entirely in the audit log.

**This module is standalone in Phase 1.** It depends on `applicants`,
`applicant_journeys`, and `leads` for nothing, and — as its own contract states —
none of them reference it. A journey still stores its destination as free text
(`target_country`, `target_institution_name`, `target_program_name`) and does
**not** point at these records. A client building a shortlisting screen must copy
the chosen values across itself — see §9.

**Referenced by other apps (inbound only).** `offers` holds three **optional**
`PROTECT` FKs _into_ this catalogue (`institution`, `campus`, `program`) and
snapshots the names it needs at creation, so editing a referenced record never
rewrites a recorded offer. (The backend `DATA_CONTRACT.md` also records
`applicant_journeys.target_country_ref` and `checklists.country` as later inbound
consumers; those are the other apps' contracts, not this one's surface.)

## 3. Conventions

- **Response/Error envelopes:** the standard project envelope (`../CORE_INTEGRATION.md` §3) —
  `{ success, message, data, meta }` / `{ success: false, error: { code, message, details } }`.
  `error.details` is always present (`{}` when no field errors). **Do not assert on `message`** —
  branch on HTTP status and `error.code`.
- **Access split — the single most important thing about this module.** `GET` is open to `admin`
  and `lead_manager`; `POST`/`PATCH` are `admin` **only**; `superadmin` is refused everything.
  Hide or disable every write control for a Lead Manager rather than letting it fail.
- **`INSTITUTIONS_ACTOR_FORBIDDEN` (403) replaces the global `PERMISSION_DENIED`, it does not
  coexist with it.** You will not see `PERMISSION_DENIED` from `/api/v1/catalogue/`. It is the most
  common error in the module (every Lead Manager write returns it) and is omitted from the
  per-endpoint error lists in §7. Its `message` is `"Admin authority is required to maintain the
catalogue."` for a refused write and `"This authority may not access catalogue records."` for a
  refused Superadmin read — branch on `code`, never `message`.
- **Nothing is ever deleted — there is no `DELETE` on any endpoint.** A record no longer offered is
  PATCHed to `availability_status: "inactive"` (or `is_active: false` on `Field`). Records referenced
  by others are additionally `PROTECT`ed at the database level. **Do not build a delete button; build a
  "withdraw from use" control** that PATCHes the status.
- **Immutable fields are SILENTLY IGNORED on `PATCH`, never rejected** — module-wide, no exceptions
  (`Field.code`, `Country.code`, `Campus.institution`, `Program.institution`). **This is the inverse of
  `documents`/`offers`/`clients`, which _reject_ immutable fields.** A round-trip edit form that reads
  an object and PATCHes the whole thing back works here with no field-stripping logic.
- **A `PATCH` that changes nothing writes no audit event** — all five resources. The response is still
  200 with the unchanged record. A UI reporting "saved, history updated" after a no-op is lying.
- **A non-`active` `availability_status` requires a non-empty `availability_note`** — on `Country`,
  `Institution`, `Campus`, `Program`, on create **and** update. `seasonal` is included. The rule is
  checked against the **resulting** record, so a `PATCH` sending only `availability_status` fails even
  when a note is already stored — the reason must be re-affirmed, not inherited. Returns 400
  `INSTITUTIONS_AVAILABILITY_NOTE_REQUIRED`. Treat status + note as **one control**.
- **`usable_only` is chain-aware on `/programs/` only, where it defaults to `true`.** On `/countries/`,
  `/institutions/`, and `.../campuses/` it filters on **that record's own** status, ignores ancestors,
  and defaults to `false` (a maintenance list shows everything). On every endpoint, passing
  `availability_status` explicitly **overrides** `usable_only` entirely.
- **Unknown referenced UUIDs are 400, not 404.** A `country`/`institution`/`field`/`campus` id in a
  request **body** that does not exist fails serializer validation → `VALIDATION_ERROR` with the field in
  `details`. A 404 is only ever about the record named in the **URL path** — the one exception being the
  campus routes' `<institution_id>`, which is in the path and returns 404 `INSTITUTIONS_INSTITUTION_NOT_FOUND`.
- **HTTP:** `POST` → 201; `GET`/`PATCH` → 200. Domain-rule violations → 400; duplicates → 409; missing
  URL record → 404; authority failure → 403; unrouted method (`DELETE`/`PUT` anywhere, `POST` on the
  un-nested `/campuses/<id>/`) → 405 with the project-wide `METHOD_NOT_ALLOWED` code. Every error carries
  the standard envelope **including 405** — except a path that resolves to no route at all
  (e.g. `GET /catalogue/campuses/`, which is not a route), which returns a bare 404 with no envelope.
- **Query parameter encoding.** Booleans (`is_active`, `usable_only`, `scholarship_available`) accept,
  case-insensitively: `true`/`false`, `1`/`0`, `t`/`f`, `y`/`n`, `yes`/`no`, `on`/`off`; anything else is 400. **Omitting a boolean ≠ sending `false`** — omitted means "do not filter" for `is_active` and
  `scholarship_available`, while `usable_only` falls back to its per-endpoint default. `tuition_max`
  accepts a plain decimal literal; non-numeric is 400. `page_size` over 100 is **clamped, not rejected**.
  **Invalid query params are rejected 400, not ignored** — `?qualification_level=wizardry` errors rather
  than returning an unfiltered set.
- **Defaults for omitted write fields:** `availability_status` → `"active"`, `is_active` (Field) →
  `true`, `institution_type` → `"university"`, `tuition_is_indicative` → `false`, `scholarship_available`
  → `false`, `display_order` → `0`. Every unset text field is `""`; `campus`, `duration_months`, and
  `tuition_amount` are `null`.
- **Ordering is fixed and not client-controllable** — no `sort`/`ordering` param anywhere. `Field`/
  `Country` by `display_order` then `name`; `Institution`/`Campus` by `name`; `Program` by `title`.
- **Pagination:** page-number based, `page`/`page_size` (default 20, max 100). Applied to **every** list
  endpoint. `data` is the bare array; `count`/`page`/`page_size`/`next`/`previous` live in `meta`.
- **IDs:** UUID strings. `code` on `Field`/`Country` is a separate, unique, immutable human-readable ASCII
  identifier — **not** the primary key; always address records by `id`.
- **Times:** ISO 8601 UTC. **No field in this module carries a `_bs` Bikram Sambat sibling** — the only
  dates are the system `created_at`/`updated_at`. This differs from `applicant_journeys`.
- **Empty text fields are `""`, never `null`.** The only nullable fields are `campus`, `duration_months`,
  and `tuition_amount` on `Program`.
- **Money:** decimal **strings** (`"49824.00"`), never numbers. Never parse into a float.

## 4. Models

**Field** — `{ id: string, code: string, name: string, is_active: boolean, display_order: number, created_at: string, updated_at: string }`

- The study-area classification. Carries `is_active` rather than `availability_status` — a pure
  reference table cannot be seasonal or paused.

**Country** — `{ id: string, code: string, name: string, availability_status: enum, availability_note: string, is_usable: boolean, notes: string, display_order: number, created_at: string, updated_at: string }`

- `is_usable` is a **read-only derived boolean**, true when **that record's own** `availability_status`
  is `active` or `seasonal`.

**Institution** — `{ id: string, country: CountryBrief, name: string, common_name: string, institution_type: enum, availability_status: enum, availability_note: string, is_usable: boolean, notes: string, created_at: string, updated_at: string }`

- `country` is a nested `CountryBrief` on read, but a **bare UUID string** on write.

**Campus** — `{ id: string, institution: InstitutionBrief, name: string, city: string, availability_status: enum, availability_note: string, is_usable: boolean, notes: string, created_at: string, updated_at: string }`

- `institution` is a nested `InstitutionBrief` on read and is **never sent in the body** on write
  (it comes from the URL). `name` is a locality in the destination country.

**Program (list shape)** — `{ id: string, title: string, institution: InstitutionBrief, campus: CampusBrief | null, country: CountryBrief, qualification_level: enum, field: FieldBrief, duration_months: number | null, intake_pattern: string, tuition_amount: string | null, tuition_currency: string, tuition_fee_period: enum, tuition_is_indicative: boolean, scholarship_available: boolean, availability_status: enum, availability_note: string, is_usable: boolean, created_at: string, updated_at: string }`

- `country` is **derived from the institution** and read-only — there is no country field on a program
  write. `campus`, `duration_months`, and `tuition_amount` are `null` when unset.

**Program (detail shape)** — the list shape **plus** `{ tuition_notes: string, academic_requirement: string, english_requirement: string, backlog_tolerance: string, document_expectation: string, selection_notes: string, scholarship_notes: string, notes: string }`

- Returned by retrieve, create, **and** update. Only the list returns the shorter shape — the five
  entry-expectation fields are long free text, deliberately absent from list rows.

**Brief shapes** (nested inside the above, always the exact field lists below — **none carries a derived
boolean**, so use their `availability_status` for chain checks):

- **CountryBrief** — `{ id: string, code: string, name: string, availability_status: enum }`
- **InstitutionBrief** — `{ id: string, name: string, common_name: string, availability_status: enum }`
- **CampusBrief** — `{ id: string, name: string, city: string, availability_status: enum }`
- **FieldBrief** — `{ id: string, code: string, name: string }`

> **`is_usable` is per-record, not per-chain.** It reflects only the record it sits on. A `Program`
> whose own status is `active` but whose country is `paused` returns `is_usable: true` while being
> excluded from the default search (which evaluates the whole chain program → campus → institution →
> country). Use `is_usable` to render **this record's own** availability badge; do **not** use it to
> decide whether a program can be offered. To decide that client-side, rely on the default search, or
> require the program's own `is_usable` **and** `availability_status ∈ {"active","seasonal"}` on each
> nested `campus` (when not `null`), `institution`, and `country` — which is why the briefs carry it.

## 5. Enums

- **`availability_status`** (on `Country`, `Institution`, `Campus`, `Program`): `active` | `paused` |
  `seasonal` | `inactive`.
  - **Usable statuses** (what `is_usable` returns true for, and what the default program search
    includes): `active` | `seasonal`. `seasonal` is offered, just not year-round.
- **`Institution.institution_type`**: `university` | `college` | `polytechnic` | `language_school` |
  `other`.
- **`Program.qualification_level`**: `school` | `certificate` | `diploma` | `bachelors` |
  `postgraduate_diploma` | `masters` | `phd` | `other`. **Same value set as `applicant_journeys`
  `Journey.study_level`**, deliberately — a journey's level passes straight into `?qualification_level=`.
- **`Program.tuition_fee_period`**: `per_year` | `per_semester` | `total_program` | `""` (empty when no
  tuition is recorded).
- **`Field.code` / `Country.code`** — **not enums.** Admin-assigned ASCII slugs matching
  `^[a-z0-9](?:[a-z0-9_-]{0,48}[a-z0-9])?$`, unique and immutable, **not** the primary key. Country codes
  are ISO 3166-1 alpha-2 by convention but this is not enforced.
- **`Program.intake_pattern`** — **not an enum.** Free text in Phase 1 (`"Feb / Jul"`) — see §9.
- **`tuition_currency`** — three ASCII letters, upper-cased on write; **not** checked against ISO 4217,
  so `"ZZZ"` is accepted.

## 6. Dependency order

- `Field` and `Country` need nothing — they are the roots (independent of each other).
- `Institution` needs a `Country` — a provider is always filed under a country.
- `Campus` needs an `Institution` — supplied in the URL path, not the body.
- `Program` needs an `Institution` **and** a `Field`; `Campus` is optional but, when given, must belong
  to the same institution.

**Start here:** create a `Country` and a `Field`, then an `Institution` under the country, then optionally
a `Campus` under the institution, then a `Program`. A client with an empty catalogue cannot create a
program first.

## 7. Endpoints

All 20 are behind the access split of §3; `INSTITUTIONS_ACTOR_FORBIDDEN` (403) applies to every one and
is omitted below. **There is no `DELETE`.** Writes (`POST`/`PATCH`) are Admin-only.

| Endpoint                                                    | Method | Policy key                        | Risk   | Notes                                                                                                      |
| ----------------------------------------------------------- | ------ | --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| `/api/v1/catalogue/fields/`                                 | GET    | `institutions.field.list`         | low    | Filters: `is_active` (omit → both), `q` (name)                                                             |
| `/api/v1/catalogue/fields/`                                 | POST   | `institutions.field.create`       | medium | 201. `code` + `name` required                                                                              |
| `/api/v1/catalogue/fields/<field_id>/`                      | GET    | `institutions.field.read`         | low    | —                                                                                                          |
| `/api/v1/catalogue/fields/<field_id>/`                      | PATCH  | `institutions.field.update`       | medium | `code` immutable (ignored). Uses `is_active`, not `availability_status`                                    |
| `/api/v1/catalogue/countries/`                              | GET    | `institutions.country.list`       | low    | Filters: `availability_status`, `usable_only` (default **false**), `q` (name)                              |
| `/api/v1/catalogue/countries/`                              | POST   | `institutions.country.create`     | medium | 201. `code` + `name` required                                                                              |
| `/api/v1/catalogue/countries/<country_id>/`                 | GET    | `institutions.country.read`       | low    | —                                                                                                          |
| `/api/v1/catalogue/countries/<country_id>/`                 | PATCH  | `institutions.country.update`     | high   | `code` immutable. Pausing does not cascade but drops programs from default search                          |
| `/api/v1/catalogue/institutions/`                           | GET    | `institutions.institution.list`   | low    | Filters: `country`, `institution_type`, `availability_status`, `usable_only` (default false), `q`          |
| `/api/v1/catalogue/institutions/`                           | POST   | `institutions.institution.create` | medium | 201. `country` (UUID) + `name` required. `(country, name)` **not** unique                                  |
| `/api/v1/catalogue/institutions/<institution_id>/`          | GET    | `institutions.institution.read`   | low    | —                                                                                                          |
| `/api/v1/catalogue/institutions/<institution_id>/`          | PATCH  | `institutions.institution.update` | high   | **`country` IS editable.** Changing it rewrites `country` on every program under it — warn first           |
| `/api/v1/catalogue/institutions/<institution_id>/campuses/` | GET    | `institutions.campus.list`        | low    | **Nested list.** Unknown institution → 404, not empty. Filters: `availability_status`, `usable_only`, `q`  |
| `/api/v1/catalogue/institutions/<institution_id>/campuses/` | POST   | `institutions.campus.create`      | medium | 201. **Institution from URL, never body.** `name` required                                                 |
| `/api/v1/catalogue/campuses/<campus_id>/`                   | GET    | `institutions.campus.read`        | low    | **Un-nested** retrieve                                                                                     |
| `/api/v1/catalogue/campuses/<campus_id>/`                   | PATCH  | `institutions.campus.update`      | medium | **Un-nested.** `institution` immutable. `(institution, name)` unique → duplicate fires on rename too       |
| `/api/v1/catalogue/programs/`                               | GET    | `institutions.program.list`       | low    | **The Program Search / Shortlist screen.** `usable_only` defaults **true**; chain-aware. See filters below |
| `/api/v1/catalogue/programs/`                               | POST   | `institutions.program.create`     | medium | 201. `institution` + `title` + `qualification_level` + `field` required                                    |
| `/api/v1/catalogue/programs/<program_id>/`                  | GET    | `institutions.program.read`       | low    | Detail shape — **the only source of entry expectations**                                                   |
| `/api/v1/catalogue/programs/<program_id>/`                  | PATCH  | `institutions.program.update`     | high   | `institution` immutable. `PATCH {"campus": null}` genuinely detaches (not ignored)                         |

**Program search parameters:** `country`, `institution`, `campus`, `field` (all exact UUIDs),
`qualification_level` (exact enum), `availability_status` (exact enum), `usable_only` (bool, default
**true** here only), `scholarship_available` (bool), `tuition_max` (decimal), `q`, `page`, `page_size`.

- **`q` searches exactly three fields:** `Program.title`, `Institution.name`, `Institution.common_name`.
  Substring, case-insensitive, unranked — no fuzzy tolerance.
- **`usable_only=true` evaluates the whole chain** (program + campus + institution + country all
  `active`/`seasonal`). `Field.is_active` is **not** part of the chain — a program under an inactive field
  still appears. Pass `usable_only=false` for the maintenance view.
- **`tuition_max` normalizes nothing** — no currency and no fee-period awareness, no `tuition_min`, no
  range. It only makes sense scoped to one `country` (hence one currency), and still mixes fee periods.
  It **excludes** null-tuition programs, and there is no way to list unpriced programs through it — fetch
  without it and filter client-side on `tuition_amount === null`.
- **`?campus=<id>` returns only programs at that campus.** Programs with no campus are excluded and
  cannot be queried for (no `campus=null`); filter client-side on `campus === null`.

### Request bodies

- **Field — create:** `code` (**required**), `name` (**required**), `is_active`, `display_order`.
  **update:** any subset of `name`, `is_active`, `display_order` — **not `code`**.
- **Country — create:** `code` (**required**), `name` (**required**), `availability_status`,
  `availability_note`, `notes`, `display_order`. **update:** any subset of `name`, `availability_status`,
  `availability_note`, `notes`, `display_order` — **not `code`**.
- **Institution — create:** `country` (**required**, UUID), `name` (**required**), `common_name`,
  `institution_type`, `availability_status`, `availability_note`, `notes`. **update:** any subset of the
  same fields, **including `country`**.
- **Campus — create:** `name` (**required**), `city`, `availability_status`, `availability_note`,
  `notes` (institution from URL). **update:** any subset of the same fields — `institution` never sent.
- **Program — create:** `institution` (**required**, UUID), `title` (**required**),
  `qualification_level` (**required**), `field` (**required**, UUID); then optional `campus`,
  `duration_months` (1–120), `intake_pattern`, `tuition_amount` (≥ 0), `tuition_currency`,
  `tuition_fee_period`, `tuition_is_indicative`, `tuition_notes`, `academic_requirement`,
  `english_requirement`, `backlog_tolerance`, `document_expectation`, `selection_notes`,
  `scholarship_available`, `scholarship_notes`, `availability_status`, `availability_note`, `notes`.
  **update:** any subset of the same fields **except `institution`**. A `tuition_amount` requires both
  `tuition_currency` and `tuition_fee_period` (checked against the resulting record).

## 8. Error codes

| Code                                       | HTTP | Notes                                                                                                     |
| ------------------------------------------ | ---- | --------------------------------------------------------------------------------------------------------- |
| `INSTITUTIONS_ACTOR_FORBIDDEN`             | 403  | Lead Manager writing, or Superadmin doing anything (reads included). Replaces `PERMISSION_DENIED`         |
| `INSTITUTIONS_FIELD_NOT_FOUND`             | 404  | No study field with that id                                                                               |
| `INSTITUTIONS_COUNTRY_NOT_FOUND`           | 404  | No country with that id                                                                                   |
| `INSTITUTIONS_INSTITUTION_NOT_FOUND`       | 404  | No institution with that id — also returned for an unknown `<institution_id>` in the campus paths         |
| `INSTITUTIONS_CAMPUS_NOT_FOUND`            | 404  | No campus with that id                                                                                    |
| `INSTITUTIONS_PROGRAM_NOT_FOUND`           | 404  | No program with that id                                                                                   |
| `INSTITUTIONS_CODE_DUPLICATE`              | 409  | A field or country already uses that `code`. Create-only (`code` is immutable)                            |
| `INSTITUTIONS_CAMPUS_DUPLICATE`            | 409  | The institution already has a campus with that name. Fires on **rename** too, not just create             |
| `INSTITUTIONS_AVAILABILITY_NOTE_REQUIRED`  | 400  | A non-active `availability_status` was set with no `availability_note`                                    |
| `INSTITUTIONS_CAMPUS_INSTITUTION_MISMATCH` | 400  | The chosen `campus` belongs to a different institution                                                    |
| `INSTITUTIONS_TUITION_INCOMPLETE`          | 400  | A `tuition_amount` without a currency or fee period (also fires when a `PATCH` clears one of them)        |
| `VALIDATION_ERROR`                         | 400  | Field-level serializer failure — includes an unknown referenced UUID in a **body** and a malformed `code` |
| `METHOD_NOT_ALLOWED`                       | 405  | `DELETE`/`PUT` anywhere, or `POST` on `/campuses/<id>/`. Project-wide code, not a module one              |

## 9. Gaps

**Blocking — features the concept describes with no endpoint here**

- **No link to `applicant_journeys`.** The largest gap, deliberate for Phase 1. A journey's
  `target_country`, `target_institution_name`, and `target_program_name` are free text with no reference
  to these records. A shortlisting client must copy the strings across; nothing guarantees they match a
  catalogue entry or stay in sync after a later edit. **There is no endpoint anywhere that associates a
  program with a journey.**
- **No history endpoint.** Audit events are written for every change but this module exposes no route to
  read them (unlike `applicant_journeys`'s `/history/`). Read catalogue history through the `audit`
  module's own list endpoint, filtered to `app_label` `institutions` plus the record's `entity_type` and
  `entity_id`. The five `entity_type` values are `catalogue_field`, `catalogue_country`,
  `catalogue_institution`, `catalogue_campus`, `catalogue_program` (all prefixed — the audit log is
  shared). **Take the exact query-parameter names from `audit/docs/INTEGRATION.md`.**
- **No Intake, Scholarship, or structured tuition resource.** `intake_pattern` is unstructured free text
  (no dates, deadlines, per-intake status, or fiscal-year filter — and no Bikram Sambat anywhere).
  Scholarships are only a `scholarship_available` boolean plus free-text `scholarship_notes` — not named,
  valued, filtered, or attachable. Tuition is program-level only — no per-campus/intake/year fee.

**Behavioural — things that will surprise a client**

- **Changing an institution's `country` cascades to every program under it.** `Program.country` is
  derived from the institution, so one `PATCH` silently rewrites the `country` reported by — and the
  `?country=` filter answered by — every program on that provider (hundreds of records, one audit event).
  Warn before submitting a country change on an institution that has programs.
- **`is_usable` is per-record, not chain-aware**, so it disagrees with search results whenever an
  ancestor is unavailable (see §4). It cannot be filtered on — use `usable_only` or `availability_status`.
- **`tuition_max` does not normalize currency or fee period** and cannot list unpriced programs — a
  budget filter is only meaningful within a single country (see §7).
- **Duplicates are allowed by design.** `(country, name)` on `Institution` is not unique, and programs
  have no code and no `(institution, campus, title)` uniqueness — two identical records can be created
  with nothing flagging it.
- **No `?code=` lookup on `Country` or `Field`.** Both have a unique immutable `code`, but neither list
  filters on it — `q` searches names only. Resolving `"au"` to an id means fetching the list and matching
  client-side.
- **No bulk import** — every record is created one at a time; no CSV, feed, or scraping endpoint.
- **No stale-reference handling for the journey copy** — shortlisting copies catalogue text into a
  journey's free-text fields, and nothing reconciles a later rename or withdrawal.

**Data caveat — trust Models over the source "Send" lists**

- The v1.2.0 English-only-names rename left **stale duplicate field names in the source
  `INTEGRATION.md` "Send" lists** (e.g. `name, name` on the Field/Country create and update field lists,
  a leftover from the dropped `_np`/`_romanized` columns). The §4 Models above — reconciled from
  `DATA_CONTRACT.md` — are the reliable shapes; where a source "Send" list and a Model disagree, **trust
  the Model** (a single bare `name` per catalogue record).

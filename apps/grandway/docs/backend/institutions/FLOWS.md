# FLOWS — Institutions

**Owner app:** `institutions`
**Synced:** 2026-07-25, adapted from `.backend/concepts/institutions_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **Three rules govern every flow below.**
>
> 1. **Reads are shared; writes are Admin-only.** A Lead Manager loads any screen
>    here but receives 403 `INSTITUTIONS_ACTOR_FORBIDDEN` on every create and
>    edit. **Hide or disable write controls for a Lead Manager** rather than
>    letting the call fail — this is the only module in the project with that
>    split. A `superadmin` is refused everything, reads included.
> 2. **There is no delete, anywhere.** No screen gets a delete button. Withdrawal
>    from use is an availability change — an ordinary `PATCH` setting
>    `availability_status` to `inactive`.
> 3. **A non-active status needs a reason.** Any `availability_status` other than
>    `active` requires a non-empty `availability_note` in the same request,
>    checked against the resulting record. Make status and note **one control**.

---

## Flow: Build the catalogue from empty

**Actor:** Admin · **Entry point:** Catalogue Dashboard

1. **Reference Maintenance** — create a study field → `POST /api/v1/catalogue/fields/` (`institutions.field.create`).
   - **Requires nothing.** This and step 2 are the two roots — either order works.
   - `INSTITUTIONS_CODE_DUPLICATE` (409) → inline error on the code input, "already in use".
   - `VALIDATION_ERROR` → inline field errors; the code input must reject non-ASCII, so show the ASCII rule before submit.
2. **Country List** — create a country → `POST /api/v1/catalogue/countries/` (`institutions.country.create`).
   - **Requires nothing.** `code` and `name` are both required.
   - `INSTITUTIONS_CODE_DUPLICATE` (409) → inline error on the code input.
3. **Institution List** — create an institution under that country → `POST /api/v1/catalogue/institutions/` (`institutions.institution.create`).
   - **Requires an existing country**, chosen from a picker fed by `institutions.country.list`.
   - `VALIDATION_ERROR` on `country` → the picker is stale; refetch it.
   - **Duplicate provider names are allowed and produce no error.** `(country, name)` is not unique — if the UI wants to warn, it must do so client-side from the list results.
4. **Institution Detail** — _(optional)_ add a campus → `POST /api/v1/catalogue/institutions/<institution_id>/campuses/` (`institutions.campus.create`).
   - **Requires the institution being viewed** — the parent is in the URL, so the form has **no institution picker** and `institution` is never sent in the body.
   - `INSTITUTIONS_CAMPUS_DUPLICATE` (409) → inline error on the name input; `(institution, name)` is unique.
   - **Skip this step** when the provider does not vary by location — `campus` on a program is optional.
5. **Program List** — create a program → `POST /api/v1/catalogue/programs/` (`institutions.program.create`).
   - **Requires an existing institution and field.** A campus is optional and its picker **must be filtered to the chosen institution**.
   - `INSTITUTIONS_CAMPUS_INSTITUTION_MISMATCH` → the campus picker was not filtered to the institution (a UI bug); reset and refilter.
   - `INSTITUTIONS_TUITION_INCOMPLETE` → highlight amount, currency, and period together — treat them as one composite control, filled or empty as a unit.

**Order is enforced by data, not the API.** Nothing stops calling step 5 first; it simply has no institution or field id to send. Present the dashboard so the roots are the obvious starting point.

## Flow: Shortlist programs for an applicant journey

**Actor:** Lead Manager or Admin · **Entry point:** Program Search / Shortlist, opened from an applicant journey

1. **Journey Detail** — read the objective the search is seeded from → `GET /api/v1/journeys/<journey_id>/` (`applicant_journeys.journey.read`, **cross-app: `applicant_journeys`**). Take `study_level`, `field_of_study`, `target_country`, and `budget_amount`.
2. **Program Search** — resolve the journey's free-text country to a catalogue id → `GET /api/v1/catalogue/countries/?q=<target_country>` (`institutions.country.list`).
   - **This step exists only because the two apps are not linked** — a journey stores its country as an unvalidated string.
   - **No match: do not block.** Run the search without the country filter and tell the user the journey names a country the catalogue does not hold.
3. **Program Search** — resolve the free-text field of study → `GET /api/v1/catalogue/fields/?q=<field_of_study>&is_active=true` (`institutions.field.list`).
   - Same reason and same fallback as step 2 — no match means run the search without the field filter.
4. **Program Search** — run the search → `GET /api/v1/catalogue/programs/?country=&qualification_level=&field=&q=` (`institutions.program.list`).
   - The journey's `study_level` maps **directly** onto `qualification_level` — same enum, no translation.
   - **Do not wire `budget_amount` straight into `tuition_max`** — it normalizes neither currency nor fee period, so an NPR budget against AUD tuition silently returns the wrong set. Omit it, or convert client-side first and render `tuition_currency` and `tuition_fee_period` on every row.
   - **Results are already restricted to what can be offered** — `usable_only` defaults to `true`, evaluated across program → campus → institution → country. Do not add a client-side availability filter, and do not expect a paused country's programs to appear.
   - `VALIDATION_ERROR` → a filter value was malformed; the API rejects rather than ignoring, so surface it instead of retrying unfiltered.
5. **Program Search** — compare candidates → `GET /api/v1/catalogue/programs/<program_id>/` (`institutions.program.read`).
   - The list row omits entry expectations; fetch the detail for the comparison panel.
   - **Render each row's availability from the nested `campus`/`institution`/`country` `availability_status`, not from `is_usable` alone** — `is_usable` reflects only the record it sits on, so a program under a paused country still reports `is_usable: true`.
6. **Journey Detail** — record the choice **on the journey** → `PATCH /api/v1/journeys/<journey_id>/` (`applicant_journeys.journey.update`, **cross-app: `applicant_journeys`**).
   - **The client copies the strings across** — write the program's institution and title into the journey's `target_institution_name` and `target_program_name`. There is **no endpoint in either app** that links a journey to a catalogue record, and nothing keeps the copy in sync afterward.
   - **The country is the exception — send it as a reference.** The journey's `target_country_ref` takes the catalogue country's id, and setting it **creates the applicant's document checklist** (**cross-app: `checklists`**), asynchronously and invisibly from this response. Writing only the free-text `target_country` leaves the applicant with no checklist and no error.

## Flow: Withdraw a record from use (and restore it)

**Actor:** Admin · **Entry point:** the detail screen of whichever record is being withdrawn

1. **\<Resource\> Detail** — set the availability status and state the reason → `PATCH /api/v1/catalogue/{countries|institutions|campuses|programs}/<id>/` (the matching `institutions.*.update`).
   - **Availability does not cascade** — children keep their own status. The event records the previous and new values.
   - `INSTITUTIONS_AVAILABILITY_NOTE_REQUIRED` → the note is mandatory for any non-active status. Selecting anything other than "active" must reveal a required reason box.
   - **Withdrawing an institution's `country` instead** (a correction, not a withdrawal) silently rewrites `country` on **every program under it** and changes which `?country=` filter they answer to — warn before submitting a country change on a provider that has programs.
2. **Program Search** — confirm the effect. The record disappears from the default search immediately. A record withdrawn _above_ a program — a paused country — removes that program from search while leaving its own status untouched; the maintenance view (`usable_only=false`) still shows it as `active`. Surface the reason, or the discrepancy reads as a bug.
3. **\<Resource\> Detail** — restore, when applicable → the same `PATCH`, setting `availability_status` back to `active`. The record and everything beneath it return at whatever individual statuses they held. **There is no delete step, and there never will be.**

## Flow: Maintain the catalogue as data ages

**Actor:** Admin · **Entry point:** Catalogue Dashboard → recently edited / needs review

1. **Program List** — find records to review → `GET /api/v1/catalogue/programs/?usable_only=false` (`institutions.program.list`).
   - **Pass `usable_only=false`** — the maintenance view must show paused and inactive records, unlike the shortlisting search.
   - **The "needs review" grouping is client-side** — there is no `needs_review` flag and no `?updated_before=` filter; sort on `updated_at` from the list response.
2. **Program Detail** — correct tuition, intake, or entry expectations → `PATCH /api/v1/catalogue/programs/<program_id>/` (`institutions.program.update`).
   - This is where the concept's **"previous values remain visible in history"** is met — the event carries each changed field's previous and new value; there is no version history to browse.
   - `INSTITUTIONS_TUITION_INCOMPLETE` also fires when **clearing** a currency on an already-priced program — the rule is checked against the resulting record, so a form that lets the three tuition inputs empty independently will hit it.
   - **A no-op save writes no audit event** — a UI showing "saved, history updated" after an unchanged submit is lying.

---

## Endpoint coverage

| Policy key                        | Method / path                                                    | Used by flow(s)                            | Notes                                                                            |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| `institutions.field.list`         | `GET /api/v1/catalogue/fields/`                                  | Shortlist (step 3); Build the catalogue    | Also feeds every field picker                                                    |
| `institutions.field.create`       | `POST /api/v1/catalogue/fields/`                                 | Build the catalogue                        | Admin only                                                                       |
| `institutions.field.read`         | `GET /api/v1/catalogue/fields/<field_id>/`                       | —                                          | Deep links / dependency root for update; the list carries picker data            |
| `institutions.field.update`       | `PATCH /api/v1/catalogue/fields/<field_id>/`                     | Withdraw a record (via `is_active`)        | Admin only. Uses `is_active`, not `availability_status`                          |
| `institutions.country.list`       | `GET /api/v1/catalogue/countries/`                               | Shortlist (step 2); Build the catalogue    | Also the country picker                                                          |
| `institutions.country.create`     | `POST /api/v1/catalogue/countries/`                              | Build the catalogue                        | Admin only                                                                       |
| `institutions.country.read`       | `GET /api/v1/catalogue/countries/<country_id>/`                  | Build the catalogue (Country Detail)       |                                                                                  |
| `institutions.country.update`     | `PATCH /api/v1/catalogue/countries/<country_id>/`                | Withdraw a record                          | Admin only. Highest-blast-radius edit in the module                              |
| `institutions.institution.list`   | `GET /api/v1/catalogue/institutions/`                            | Build the catalogue; Shortlist             | Institution List and the provider picker                                         |
| `institutions.institution.create` | `POST /api/v1/catalogue/institutions/`                           | Build the catalogue                        | Admin only. Duplicate names allowed                                              |
| `institutions.institution.read`   | `GET /api/v1/catalogue/institutions/<institution_id>/`           | Build the catalogue (Institution Detail)   |                                                                                  |
| `institutions.institution.update` | `PATCH /api/v1/catalogue/institutions/<institution_id>/`         | Withdraw a record                          | Admin only. `country` editable — cascades to program `country`                   |
| `institutions.campus.list`        | `GET /api/v1/catalogue/institutions/<institution_id>/campuses/`  | Build the catalogue                        | Nested. Institution Detail panel + campus picker                                 |
| `institutions.campus.create`      | `POST /api/v1/catalogue/institutions/<institution_id>/campuses/` | Build the catalogue                        | Admin only. Institution from URL                                                 |
| `institutions.campus.read`        | `GET /api/v1/catalogue/campuses/<campus_id>/`                    | —                                          | Un-nested; deep links / dependency root for update                               |
| `institutions.campus.update`      | `PATCH /api/v1/catalogue/campuses/<campus_id>/`                  | Withdraw a record                          | Admin only. Un-nested. `institution` immutable                                   |
| `institutions.program.list`       | `GET /api/v1/catalogue/programs/`                                | Shortlist (step 4); Maintain the catalogue | **The Program Search / Shortlist screen.** `usable_only` default differs by flow |
| `institutions.program.create`     | `POST /api/v1/catalogue/programs/`                               | Build the catalogue                        | Admin only                                                                       |
| `institutions.program.read`       | `GET /api/v1/catalogue/programs/<program_id>/`                   | Shortlist (step 5); Maintain the catalogue | The only source of entry expectations                                            |
| `institutions.program.update`     | `PATCH /api/v1/catalogue/programs/<program_id>/`                 | Maintain; Withdraw a record                | Admin only                                                                       |

**Screens from `concepts/institutions.txt`, and whether they are backed:**

- **Catalogue Dashboard** — backed by the list endpoints; its "recently edited" and "needs review" groupings are **composed client-side** from `updated_at` and `availability_status` (no dedicated endpoint).
- **Country List / Detail** — backed by `countries/` list + retrieve.
- **Institution List / Detail** — backed by `institutions/` list + retrieve; the campus panel by the nested campus list, the program panel by `?institution=` on the program search.
- **Program List / Detail** — backed by `programs/` list + retrieve (detail is the only source of entry expectations).
- **Program Search / Shortlist** — backed by `programs/`, `usable_only` defaulting `true` and chain-aware.
- **Reference Maintenance** — backed by `fields/` list/create/update.

## Cross-app dependencies

- **References (outbound):** none in the backend's own code — this module has no coupling to any other app at runtime. The shortlisting flow's `applicant_journeys.journey.read`/`.update` calls are made by the **client**, not the backend, and step 6's `PATCH` carries a further consequence in a **third** app: writing `target_country_ref` creates the applicant's checklist in `checklists`. All flows require an `authenticate` session; history is read from `audit`.
- **Referenced by other apps (inbound):** `offers` holds three optional `PROTECT` FKs into this catalogue and snapshots the names, so catalogue edits never rewrite a recorded offer. (`applicant_journeys` and `checklists` also gain inbound references per their own contracts.)

**The shortlisting flow is a client-side join, not a backend integration.** A journey stores its destination as free text, so the client resolves it against the catalogue by name each time. When the journey↔catalogue link is eventually built, step 5's "copy the strings across" becomes a real reference.

## Open questions

- Should programs have a stable internal code, or is institution + campus + title + intake enough? Phase 1 has neither a code nor any uniqueness constraint.
- Do some institutions need separate tuition by campus, intake, or year? The answer decides whether tuition stays inline or becomes its own table.
- Do scholarships attach only to programs, or also to countries and institutions? Phase 1 records only a boolean and a free-text note.
- How should intake windows carry dates, deadlines, and expiry? Phase 1 stores an unstructured `intake_pattern` string — no date-based search, and the one Phase 2 item that will need Bikram Sambat handling.
- When journeys are linked to catalogue records, how are the existing free-text institution and program names migrated — automatically matched, or reviewed by hand?

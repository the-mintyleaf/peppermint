# CONCEPT — Institutions

Grounding file, adapted from `.backend/concepts/institutions.txt`. Freeform prose —
the formal contract lives in `INTEGRATION.md`.

> **Phase 1 built (2026-07-24), English-only names shipped (2026-07-25).** The
> catalogue spine — Country, Institution, Campus, Program, and the Field
> reference table — is implemented. Where the build departed from the original
> concept the departure is authoritative: qualification level reuses the existing
> `StudyLevel` enum rather than a new table, availability is one status field
> (`active`/`paused`/`seasonal`/`inactive`) plus a mandatory note rather than a
> separate entity, and Intake, Scholarship, and per-campus/per-intake tuition
> remain concept only. Every catalogue record now carries a single English
> `name` — the `_np`/`_romanized` variants were dropped in v1.2.0.

## Purpose

The Institutions module owns Grandway's study-opportunity catalogue: the
countries, institutions, campuses, and programs staff draw on when planning an
applicant's options, together with each program's qualification level, field,
duration, intake pattern, tuition, entry expectations, scholarship flag, notes,
and availability. It exists so the consultancy has **one maintained source of
truth for what can be offered, where, and under what conditions.** Without a
shared catalogue the same university, fee, or requirement gets retyped across
journeys, offers, and documents, and the data drifts into inconsistent copy.

## Relationship to other records

The catalogue is **reference data, not the applicant's plan.** It defines the
available options; `applicant_journeys` records which options a person is
pursuing, along with their intent, progress, budget, and choice history. In
Phase 1 the two are **not linked** — a journey names its country, institution,
and program as free text, and shortlisting copies the chosen values across by
hand. Offers also lean on this module: an offer refers back to the catalogue
entry it came from and **snapshots the names** so that later tuition, duration,
or intake edits never erase the original reference point.

## Actors

**Reads shared, writes Admin-only.** This is the first module in the project
where the read population and the write population differ. Search _is_ the
catalogue's purpose — a Lead Manager counselling an applicant must be able to see
every country, program, tuition figure, and entry expectation, so reads are open
to both `admin` and `lead_manager`. But catalogue data is **shared
infrastructure**: one careless edit to a program's tuition or entry expectations
silently changes the advice every Lead Manager gives every applicant. The blast
radius, not the sensitivity of the data, is what narrows writes to Admins alone.
Superadmin — a platform authority that manages accounts rather than participating
in consultancy operations — is refused everything, reads included. The data
itself is the least sensitive in the project: it describes universities, not
people.

## Core entities

- **Country** — the top-level geographic container: name, a unique ASCII `code`,
  availability, and intake-planning notes. The first filter in every search.
- **Institution** — a university, college, polytechnic, language school, or other
  provider filed under a country: official name, common name, type, availability,
  notes. Its country is correctable; two distinct providers may legitimately share
  a name.
- **Campus** — a physical or logical site of an institution, for providers that
  price, schedule, or offer programs differently by location. A campus never
  moves between providers.
- **Program** — the specific study offering staff shortlist against: institution,
  optional campus, qualification level, field, title, duration, intake pattern,
  tuition, scholarship flag, entry expectations, and availability. The main
  operational record.
- **Qualification level** — the study level of a program. Not a catalogue table:
  it reuses the shared `StudyLevel` enum (`school` … `phd` … `other`) that
  `leads` and `applicant_journeys` already use, so "programs matching this
  journey's level" is an equality check, not a mapping problem.
- **Field** — the study-area classification (IT, business, health …) used to
  group and search programs. This one _is_ an admin-managed table, because study
  areas were only ever free text and are genuinely consultancy-specific. It
  carries a plain `is_active` rather than a full availability status — a filing
  label cannot be seasonal.
- **Tuition information** — amount, currency, fee period, an indicative flag, and
  free-text caveats, stored inline on the program. Recording an amount requires
  both a currency and a period; the figure is preserved with its context.
- **Entry expectation** — academic requirement, English-language expectation,
  backlog tolerance, document expectation, and selection notes, stored as long
  free text on the program.
- **Availability** — one `availability_status` per record — `active`, `paused`,
  `seasonal`, or `inactive` — with a **mandatory note** whenever it is not
  `active`. This is how the catalogue distinguishes "exists" from "currently
  usable." Availability **never cascades**; the search composes it across the
  whole chain at query time.

## Lifecycle

An Admin **builds the catalogue from the roots**: a country and a field (either
order), then an institution under the country, optionally a campus under the
institution, then a program. A record may be saved **incomplete or `inactive`**
until it is ready for operational use. When something is no longer offered it is
**withdrawn from use** — its `availability_status` set to `inactive` (or
`is_active: false` on a field), with a stated reason — never deleted. The record
stays retrievable by id forever, so any journey or offer that referenced it keeps
resolving, and it can be **restored** by setting the status back to `active`.
Pausing a country or institution drops its programs out of the default search
immediately while leaving each child's own status untouched, and un-pausing
restores them all at whatever individual statuses they held.

## History

Every create and update appends one immutable event to the central `audit` log,
and update events carry a `changes` map of each field's previous and new value —
this is how the concept's "previous values should remain visible in history"
requirement is met, since there is no versioned row history. A **no-op edit
writes no event**, so the log records only changes that actually happened. This
module exposes **no history route of its own**: catalogue history is read through
the `audit` module, filtered to this app and the record. Because the data is
non-sensitive, no field is withheld from the audit payload.

## UI screens & wireframe notes

- **Catalogue Dashboard** — the key sections at a glance (countries,
  institutions, campuses, programs), with recently edited and "needs review"
  groupings composed **client-side** from list `updated_at` and
  `availability_status` — there is no dedicated endpoint for them. Primary action:
  create a new catalogue record.
- **Country List / Detail** — countries with status, notes, and their
  institutions. The country is the highest-blast-radius edit in the module.
- **Institution List / Detail** — providers with filters for country, type, and
  status; detail shows campuses, linked programs, and notes. Primary actions: edit
  institution, add campus, add program.
- **Program List / Detail** — the main operational screen: title, institution,
  campus, country, level, field, duration, intake, tuition, scholarship flag, and
  availability; detail expands the entry expectations and notes.
- **Program Search / Shortlist** — the search-focused screen opened from an
  applicant journey. Filters by country, level, field, tuition ceiling,
  institution, and availability; supports comparing candidates. Its default view
  shows only programs that can actually be offered.
- **Reference Maintenance** — admin forms for the study fields (and, conceptually,
  other reusable references), managed centrally rather than hard-coded.

## Constraints / Out of scope

No application processing, no visa case handling, no automated eligibility
scoring (entry expectations are stored, never evaluated). No web scraping or
vendor feed import in V1 — catalogue maintenance is manual and accountable. No
duplicate free-text copies of a record that already has a reference. **No
deletion of historical catalogue records** — withdraw from use and preserve the
history instead. No per-campus/per-intake/per-year tuition, no structured intake
windows, and no scholarship records in Phase 1.

## Open questions

Settled in Phase 1: qualification level reuses `StudyLevel` while field is an
admin table; seasonality is one `availability_status` field plus a mandatory
note, composed across the chain at search time and never cascaded; tuition and
intake are inline program-level fields for now.

Still open, and blocking Phase 2:

- Should programs have a stable internal code, or is
  institution + campus + title + intake enough? Phase 1 has no program code and no
  uniqueness constraint at all.
- Do some institutions need separate tuition by campus, intake, or year? The
  answer decides whether tuition stays inline or becomes its own table.
- Do scholarships belong only to programs, or can they also attach to countries
  and institutions? Phase 1 records only a boolean and a free-text note.
- How should intake windows carry dates, deadlines, and expiry? Phase 1 stores an
  unstructured `intake_pattern` string, so no date-based search is possible — a
  real Intake table is the one Phase 2 item that will need Bikram Sambat handling.
- When journeys are eventually linked to catalogue records, how are the existing
  free-text institution and program names migrated — automatically matched, or
  reviewed by hand?

# CONCEPT — Offers

Grounding file, adapted from `.backend/concepts/offers.txt`. Freeform prose —
the formal contract lives in `INTEGRATION.md`.

> **Phase 1 built (2026-07-24).** Where the build departed from the original
> concept the departure is authoritative: the status vocabulary is **seven**
> values (`awaiting_response` collapsed into `issued`), a decision is **final**
> with no reopen, recording an offer **never moves the journey's stage**, and
> conditions are a dedicated sub-record rather than a reusable checklist. The
> v1.2.0 rename (2026-07-25) made all names **English-only** — the `_np` /
> `_romanized` columns are gone and the `_en` snapshot fields are now bare
> (`institution_name`).

## Purpose

The Offers module tracks the formal admission decisions institutions make against
an applicant journey. It records **what** an institution offered, **for which**
program and intake, **under which** conditions and money terms, and **how** the
applicant responded. Grandway needs this as a separate record because a journey
can sit in offer stage without the system knowing the exact offer details, and an
applicant may receive more than one offer over time. The module is the **source
of truth for the decision records**, not for the study plan.

## Relationship to other records

An offer always belongs to **one** applicant journey, supplied at creation and
never changeable afterwards. The journey remains the broader study plan — the
person's objective, progress, and final outcome; the offer is one concrete
institutional response within it. Journey stage can indicate that offers are being
awaited or reviewed, but only this module knows what was actually offered, and
**recording an offer does not move the journey's stage** — the two lifecycles are
independent in both directions. The applicant's identity is reached _through_ the
journey.

An offer optionally connects back to the `institutions` catalogue entry it was
based on — an institution, campus, and program — but it does not depend on one: a
**manually recorded** historical offer references no catalogue record at all.
Either way, **what the offer means is its snapshot**, not the live catalogue.
Offers is the first module that links `institutions` to `applicant_journeys`, but
it reconciles neither: a journey's free-text "Melbourne" and an offer pointing at
a catalogue "University of Melbourne" remain two unconnected facts.

## Offer information

A useful offer record captures the journey it belongs to; the institution,
campus, and program (by catalogue reference or as snapshot text); the intake the
offer applies to; the offer type (conditional or unconditional); issue date and
response deadline; the conditions attached; tuition, scholarship, and deposit
terms relevant to the decision; the acceptance, rejection, withdrawal, or
deferment outcome; and the current status. **Deposit amounts are recorded, never
collected** — there is no payment path in this module.

The offer must preserve what was true when the institution made the decision.
**Snapshot fields — `institution_name`, `campus_name`, `program_title`,
`country_name`, `qualification_level`, `intake_label` — are copied at creation
and never change.** A later catalogue edit, applicant update, or intake change
does not rewrite the historical offer. Money is stored exactly as the institution
quoted it, in its own currency, and is **never converted** — two offers on one
journey may be in different currencies, and nothing normalizes them.

## Core entities

- **Offer** — one institution's admission decision, recorded against one journey.
  A journey may hold several; a second offer never replaces a first, because
  comparing competing institutional responses is the reason the records are kept
  separate.
- **Offer condition** — one requirement that must be satisfied for an offer to
  become fully usable or unconditional (final academic results, an English test,
  document submission, a deposit, an interview, identity confirmation, or
  something institution-specific). Each carries its own status so staff can see
  what is pending, satisfied, waived, or not applicable at a glance. Conditions
  are a **dedicated sub-record owned by this module**, not a reusable checklist —
  `checklists` is a named future domain with no code behind it.
- **Reference block** — how the offer identifies its institution and program:
  either catalogue foreign keys or free snapshot text, with `reference_source`
  (`catalogue` / `manual`) derived from which resolved.

## Lifecycle

An offer is **created** — with a journey, a reference (catalogue or manual), and
whatever terms are known — at status `draft`. It is **issued** when the
institution has formally issued what was recorded (`draft` → `issued`, the sole
transition into `issued`). Once issued the consultancy is by definition
**awaiting a response**, so there is no separate `awaiting_response` status.
A **decision** then records what the applicant did — `accepted`, `rejected`,
`withdrawn`, `deferred`, or `expired` — and stamps who decided and when. A
decision may be recorded **directly on a draft**: a historical offer entered from
a paper file was resolved long before it was recorded, and forcing an issue step
first would fabricate an event that never happened.

**A decision is final.** There is no reopen action, unlike an applicant journey —
an offer records what an institution decided at a point in time, and an
institution that changes its position has issued a _new_ offer. At most **one
accepted offer per journey** at a time; any number of competing offers may be open
otherwise. **Nothing expires automatically** — `expired` is a status a person
sets, because nothing in this deployment runs on a schedule; a computed
`is_response_overdue` (in Nepal time) surfaces lapsed offers instead. **Nothing
is ever deleted** — an offer that no longer applies gets a terminal status, and a
condition that does not apply becomes `not_applicable` with a note.

## History

Every mutation — create, update, issue, decision, and every condition change —
appends one immutable event to the central `audit` log carrying the actor, their
authority type, and the changed fields' previous and new values. This module owns
no history table of its own. **Condition events are recorded against the parent
offer's id**, so an offer's history is one continuous trail; there is no separate
condition history. `decided_at` / `decided_by` on the offer and `resolved_at` /
`resolved_by` on each condition are additionally denormalized onto the row so
"who decided this, and when" is a field read rather than a log query.

## UI screens & wireframe notes

- **Offer List** — offers across journeys, newest first. Filters for applicant,
  institution, program, intake, status, and offer type; columns for applicant
  name, institution, program, intake, issue date, deadline, and status. **No text
  search** across the snapshot names — only the catalogue FKs filter, which miss
  manual offers.
- **Journey Detail → Offers panel** — the main operational entry point. All offers
  for that journey (`?journey=<id>`), with a clear "add offer" action. Each row
  shows institution, program, intake, status, and response deadline; use
  `is_response_overdue` for the deadline warning rather than comparing dates
  client-side.
- **Offer Detail** — the full record: linked journey, catalogue reference,
  conditions (already nested — no separate call needed), tuition/scholarship/
  deposit, notes, supporting files (a second call to `uploaded_files`), and
  history. Primary actions: record decision, edit details, update conditions.
- **New / Edit Offer Form** — the administrative form. It **must make clear which
  branch the user is in** — a catalogue offer (send `program`, which implies its
  institution and campus) or a manual historical record (send `institution_name`
  - `program_title`). Enter the real intake in `intake_label`; sending it beside a
    `program` overrides the catalogue's generic `intake_pattern`. Treat each of
    tuition, scholarship, and deposit as one composite control (amount + currency)
    that is filled or empty as a unit.
- **Decision Dialog** — a focused dialog for accept, reject, withdraw, defer, or
  mark expired. One form with a conditional required field: `reason` for rejected
  and withdrawn, `to_intake` for deferred; accepted and expired need neither. Hide
  it entirely when `is_terminal` is true — there is no reopen.

## Constraints / Out of scope

No application-submission workflow, no visa case management, no payments or
accounting (deposits are recorded, never collected), no automated eligibility
scoring, no silent rewriting of historical offers when the catalogue changes, and
no deletion of offer history — replaced or outdated offers stay visible as part of
the journey record. No authority-based control hiding: every Admin **and** Lead
Manager may do everything, read and write alike; a `superadmin` is denied
outright. This is deliberately **not** the `institutions` split, where writes are
Admin-only because catalogue data is shared infrastructure — an offer is
journey-scoped work with a blast radius of one applicant, and the Lead Manager
running the journey is the person who receives the letter and records the answer.

## Open questions

Settled in Phase 1: seven statuses, not eight (`awaiting_response` folded into
`issued`); conditions are a dedicated sub-record, not a checklist; no separate
expiry action (`response_deadline` plus computed `is_response_overdue`); any Admin
or Lead Manager may do everything, Superadmin none; a decision is final; recording
an offer never moves the journey.

Still open:

- Should offer conditions migrate onto `checklists` when that module ships, or
  stay owned here?
- Where should an offer letter PDF live long-term? `uploaded_files` now holds it
  (`POST /api/v1/files/` with `offer=<id>`), but an offer payload still carries no
  reference in the other direction — a screen joins the two calls itself.
- Should a journey's free-text destination be reconciled against the catalogue
  reference on its offers? Today both are stored and nothing compares them.
- Does the offer list need text search across the snapshot institution and program
  names? Today only the catalogue foreign keys can be filtered, which misses every
  manually recorded offer.

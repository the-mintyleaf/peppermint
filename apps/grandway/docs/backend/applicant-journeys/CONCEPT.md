# CONCEPT — Applicant Journeys

Grounding file, adapted from `.backend/concepts/applicant_journeys.txt`. Freeform
prose — the formal contract lives in `INTEGRATION.md`.

## Purpose

An applicant journey is one overseas-study objective pursued by one applicant.
A person is not the same thing as a plan — someone may try for a master's in
Australia, have it fall through, and try again for a diploma in Canada two
years later: two journeys, one applicant. The journey holds where they want to
go, what they want to study, when they intend to start, what they can afford,
how far along they are, and how it ended.

## Relationship to the applicant

One applicant has many journeys; a journey always belongs to exactly one
applicant and is never transferred. The applicant record holds identity —
name, contact, passport, family — the journey holds intent and progress.
Neither duplicates the other; a journey never stores a name or phone number,
only a reference. A journey's stage never changes the applicant's status, and
archiving an applicant never closes their journeys — the two lifecycles run
independently, by design.

## How a journey comes into existence

**Lead conversion** — when an Admin converts a lead, an initial journey is
created alongside the applicant, seeded from whatever preliminary study
interest the Lead Manager recorded. That seeding is a starting point, not a
commitment — the journey is authoritative from the moment it exists; the
lead's study interest is frozen history.

**Manual creation** — an Admin or Lead Manager creates a journey for an
existing applicant. Normal path for a second/third objective, or for
applicants created directly with no lead.

## Journey information

Target country, target institution and program (free text — no institution
catalogue exists yet; migrates to references when one does), intended study
level, preferred field, preferred intake, approximate budget + currency,
scholarship interest, current stage, notes.

## Journey stages

Selected manually from a dropdown, like lead stages — Grandway does not infer
progress. Recommended V1: **Planning** → **Profile Building** → **Shortlisting**
→ **Applying** → **Offer Stage** → **Visa Stage** → then one of the three
terminal states: **Completed**, **Closed**, **Deferred**. Visa Stage records
that a visa step is underway; Grandway doesn't manage the visa case itself.

Completed and Closed are reached only through the **close** action; Deferred
only through **defer** — none of the three can be picked from the stage
dropdown, the same reason a lead can't be marked lost from one: each demands
information a stage change alone doesn't capture.

## Final outcome

Every closed journey records why. Recommended: Successful, Withdrawn,
Rejected, Not qualified, Cancelled, Other (requires an explanation). Closing
with Successful sets stage to Completed; anything else sets Closed — keeping
"how did it end" one recorded fact rather than inferred from the stopping
stage.

## Deferment

The applicant intends to continue, not on the current timeline (missed
intake, delayed test result, family reason). Records the intake being
deferred to, an optional reason, and who/when. Resumed by reopening. Not an
outcome — closes nothing.

## Reopening

A completed, closed, or deferred journey may be reopened to an active stage.
Records who/when, clears closure/deferment state, preserves complete previous
history — reopening a completed journey doesn't undo that it was completed;
that stays in the history.

## History

Should record: created (lead conversion vs. manual), information changed,
stage changed, deferred, closed (with outcome), reopened. Never silently
rewritten or removed.

## Permissions

**Admin and Lead Manager** — identical rights: create a journey for any
applicant, view/edit any journey, change stage, defer, close, reopen, review
history. Journeys are shared, exactly as applicants are.

**Superadmin** — no access.

## No deletion

Never deleted. A journey that shouldn't have existed is closed Cancelled; the
record and history remain.

## UI screens & wireframe notes

**Journey List** — every journey across all applicants, newest first.
Columns: applicant name, target country, study level, intake, stage. Filters
for applicant, stage, target country. An operational worklist ("everything at
Offer Stage"), not a per-person view.

**Applicant Detail → Journeys panel** — the per-person view, and the primary
entry point; the standalone Journey List is secondary. Lists the applicant's
journeys with target country, intake, stage, plus "New journey".

**New Journey Form** — destination, institution/program (free text), level,
field, intake, budget, scholarship interest. Nothing required beyond the
applicant.

**Journey Detail** — header: applicant name (linking to their file), target
country, stage. Panels: objective details, closure/deferment state when
present, history. Actions: change stage, defer, close, reopen. Stage dropdown
offers only the six active stages.

**Close Journey dialog** — requires an outcome; reveals a required
explanation when Other is chosen; warns closing is reversible but recorded.

**Defer Journey dialog** — requires the target intake, optional reason.

## Constraints / Out of scope

No institution/program catalogue (free text until one exists), no offer
records, no visa case management, no documents/files/checklists, no automatic
stage progression from another module's activity, no journey transfer between
applicants, no deletion, no per-journey ownership/assignment.

## Open questions

- Is Visa Stage right for V1 given visa case management is out of scope? Might be better as "post-offer, pre-departure."
- Should a journey carry priority or a target date, to order the worklist better than "newest first"?
- Can an applicant have two open journeys for the same country/intake? V1 allows it.
- Should closing the last open journey prompt an applicant status change? V1 does nothing automatically.
- How does free-text institution/program data migrate once the institutions module lands?

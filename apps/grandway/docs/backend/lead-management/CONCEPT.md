# CONCEPT — Lead Management

Grounding file, adapted from `.backend/concepts/leads.txt`. Freeform prose —
the formal contract lives in `INTEGRATION.md`.

## Purpose

Lead Management tracks people who have shown interest in the consultancy but
have not yet entered the applicant lifecycle. It is operational tracking:
who the lead is, how they found the consultancy, what they're interested in,
their current stage, when they were last followed up, and whether they were
converted or lost.

It is intentionally simple — not a sales CRM, communication platform,
task-management system, or eligibility-assessment system.

## Lead ownership

Every lead is an independent unit owned by the Lead Manager who created it.
No branches, shared lead pools, reassignment, or transfers exist. A Lead
Manager manages only the leads they create; an Admin can view and manage all
leads without needing to assign them. Ownership stays with the original Lead
Manager even after conversion (preserving attribution).

## Lead information

Minimum info to identify, contact, and track someone: full name, multiple
contact numbers, one email address, address, lead source, current stage, last
follow-up time, notes, preliminary study interests, creator, timestamps.
Detailed applicant information (passport, family, academic records, test
results, uploaded files, permanent identity data) does not belong here.

## Lead source & preliminary study interest

Sources are Admin-configurable, not fixed in code. Study interest fields are
preliminary and may be incomplete — not a finalized applicant journey.

## Lead stages

Selected manually from a dropdown. Eight V1 stages: New → Contact Attempted →
Contacted → Counselling → Follow-up → Ready for Conversion, plus two terminal
outcomes: Converted (Admin-only conversion) and Lost (a
mandatory-reason close). No separate disqualified/duplicate/archived stage —
`Lost` is the single non-conversion terminal state.

## Manual follow-up tracking

Grandway does **not** schedule follow-ups or integrate with phone, email,
messaging, calendar, or notification services. Follow-up happens manually
outside the system; the lead record only shows _when_ someone was last
followed up, by whom, with an optional note, and an optional stage change.
No separate follow-up entity, schedule, reminder, or assigned owner.

## Notes and history

Notes preserve content, author, and timestamp — append-only. History is a
chronological record of important actions (created, contact/source/interest
changed, stage changed, follow-up recorded, marked lost, reopened, converted,
applicant created) and is never rewritten or removed.

## Marking a lead as lost / reopening

Closing = stage → `Lost`, with a mandatory reason (and mandatory detail when
the reason requires it). Doesn't delete the record or history. A lost (or
converted) lead may be reopened — records who/when, moves to an active stage
(default `Follow-up`), preserves complete history and any applicant link.
Reopening a converted lead never undoes the conversion or creates a second
applicant.

## Lead conversion

Only an Admin may convert a lead into an applicant — a deliberate action, not
a dropdown change. Any lead in an active stage qualifies (`ready_for_conversion`
is a signal, not a gate); a lost or already-converted lead must be reopened
first. Conversion creates an `Applicant` plus a seed `ApplicantJourney` in one
step, links both back onto the lead permanently, and moves the lead to its
terminal `converted` stage. Reopening a converted lead never undoes the
conversion or creates a second applicant/journey.

## Permissions

**Lead Manager** may: create/view/edit own leads, update contact info and
study interest, change stage, record follow-up, add notes, mark lost, reopen
a lost lead. May **not**: see another Lead Manager's leads, transfer/reassign,
convert, delete history, delete a lead, manage global source/reason config.

**Admin** may: everything above across all leads, plus configure sources and
loss reasons, and convert leads into applicants.

## No archive or deletion workflow

Leads remain available according to their stage — active stages are still
being tracked, `Lost` represents leads that didn't proceed. No separate
archival lifecycle.

## Out of scope

Branches, shared pools, assignment/reassignment/transfer, lead/priority
scoring, campaign management, marketing analytics, duplicate detection or
merging, automated eligibility decisions, follow-up scheduling/reminders,
phone/email/SMS/chat/calendar/appointment integration, task management,
archival, deletion workflows, applicant-level data (documents, offers, visa
processing).

## Core V1 principle

A simple, accountable enquiry tracker: a Lead Manager records and follows
their own leads; the system preserves origin, contact info, interest, stage,
last follow-up, notes, and history.

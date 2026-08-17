# CONCEPT — Reminders

Grounding file, adapted from `.backend/concepts/reminders.txt`. Freeform prose —
the formal contract lives in `INTEGRATION.md`.

> **V1 built (2026-08-17).** The concept records **no outstanding open questions**
> — every decision was settled at planning and the build matches it. Where this
> file and `INTEGRATION.md` could be read as disagreeing, `INTEGRATION.md` wins.

## Purpose

A lightweight reminder capability so staff can set a future note against a record
and be prompted to revisit it on a specific date. **This is for operational
follow-up, not task management.** A reminder can exist for any reason — payment
chase, document follow-up, callback, deadline check, or any other future action
the consultancy wants to remember.

The feature belongs with Grandway's existing record-centric model. It attaches to
the same records staff already work on rather than creating a separate to-do
system: the reminder lives as a note on the person or company record, and later
becomes a notification when its date arrives.

## Relationship to other records

A reminder is owned by **exactly one** record — an applicant **or** a client,
never both and never neither. The ownership is a hard database constraint
(`reminder_single_owner`) and is **immutable after creation**: a follow-up set on
the wrong record is dismissed and re-created, not moved.

Both owner foreign keys are `PROTECT`, so a record with reminders against it
cannot be deleted while they exist. Nothing in the project deletes applicants or
clients anyway, but the constraint is real and this module is the one creating it.

This module is also what ends `clients`' island status — it is the **first inbound
business-app foreign key** the clients directory has ever had. `clients/CONCEPT.md`
still describes the directory as depending on nothing and being depended on by
nothing; that is now true only in the outbound direction.

## Actors

**Read and write alike for Admin and Lead Manager; Superadmin denied outright.**
There is **no read/write split** — the same flat rule guards all seven endpoints,
and there is no owner scoping either: every Admin and Lead Manager sees every
reminder, including ones somebody else set.

The one asymmetry is about **delivery, not access**:

- **Admin** — creates and maintains reminders on records, **and receives** the due
  alert in the notification feed when the date arrives.
- **Lead Manager** — creates and maintains reminders exactly as an Admin does, but
  **never receives** the alert. That is `notifications` routing
  (`recipients_for_admins`), not an access rule here.

That asymmetry has a direct frontend consequence, and it is the single most
important thing on this page: **a Lead Manager's own follow-ups surface nowhere
automatically.** The contract's §9 says so explicitly and prescribes the fix —
a client that wants Lead Managers to see their due work must build it from this
module directly (`?status=active&due_before=<npt_today>`). Grandway does this with
the dashboard's Follow-ups card, which is therefore **not** an Admin-only surface.

## Core entity

**Reminder** — a future follow-up note with three essential parts: the source
record, a future due date, and a note explaining why the reminder exists.

- The due date is **date-only, not time-based**. The reminder is due at the start
  of the chosen day in Nepal time (`Asia/Kathmandu`, +05:45). This deliberately
  avoids time zones, exact hours, and per-user scheduling differences while still
  giving a clear future trigger. A date may be **today or later**; a today-dated
  reminder fires on the next nightly sweep.
- A reminder is **one-off**. It ends as `completed` (the follow-up happened) or
  `dismissed` (no longer relevant). Both are **terminal** — there is no reopen and
  no snooze. "Remind me again later" is a **new reminder**, not an edit to the
  finished one.
- While open it may be **rescheduled** to a new date or have its note corrected.
  Note-only edits are allowed. The backend distinguishes the two in history:
  moving the date writes `reminder_rescheduled`, correcting the note alone writes
  `reminder_updated`.
- Complete and dismiss both accept an **optional reason**, recorded in the history
  event only — it is not a column on the reminder and is not returned by any read.

## Key user flows

1. **Set a follow-up** — open an applicant or client record, add a reminder with a
   due date and a note; it sits on the record until its date.
2. **Due date arrives** — the reminder surfaces as an actionable alert in the
   normal notification layer, **visible to Admins only**. The Admin jumps from the
   alert back to the reminder and its record, then completes or dismisses it, and
   the alert clears. If nobody acts, the alert stays visible and **does not
   duplicate** — one alert per Admin per reminder per due date, never a nightly
   re-nag.
3. **Reschedule** — an open reminder is moved to a new date with an updated note;
   the change is traceable, any already-raised alert clears on the next sweep, and
   a fresh one fires on the new date.

## Screens the concept names

- **Reminders panel** (applicant detail **and** client detail): the record's
  reminders, most recent first, showing due date, note, status, and who set it.
  Primary actions: add reminder, reschedule, complete, dismiss. Serves flows 1
  and 3.
- **Notification feed** (existing): a due reminder appears as a normal alert whose
  link jumps back to the reminder and its record. Serves flow 2.
- **Reminder history** (within the panel): the audit trail of what was set, when,
  and what happened to it later. Reminders are **operational memory** — the
  consultancy should be able to tell why a reminder existed even after the date
  has passed.

The concept names **no due-reminders worklist screen**. `FLOWS.md` records this as
an open question and notes the endpoint is ready for one. Grandway's dashboard
Follow-ups card is that screen, built from the list endpoint.

## Constraints / out of scope

This feature is **not** a general task board, a recurring scheduler, a messaging
inbox, a CRM workflow engine, or a replacement for the underlying record.

Hard boundaries:

- Attachable to **applicants and clients only**.
- Date-only due dates, due at the start of the chosen day (Nepal time).
- One-off; **no snooze**.
- **Only Admins receive reminder notifications.**
- Lifecycle events stay traceable in the shared history model.
- **Nothing is ever deleted.** There is no `DELETE` method anywhere in the module;
  a closed reminder stays retrievable forever.

## Open questions

**None outstanding.** Settled at planning: due dates may be today or later;
note-only edits are allowed while open; completed/dismissed are final; an optional
reason on complete/dismiss is recorded in history only.

The two questions that remain are operational rather than product-level, and both
are recorded in `INTEGRATION.md` §9: the nightly sweep's run time is not exposed
through any endpoint, and there are no bulk complete/dismiss actions.

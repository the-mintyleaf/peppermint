# CONCEPT — Notifications

Grounding file, adapted from `.backend/concepts/notifications.txt`. Freeform
prose — the formal contract lives in `INTEGRATION.md`.

## Purpose

`notifications` is the user-facing alert layer for Grandway. It tells staff
what needs attention, why it matters, and where to go next. It owns **no
business state** — it reacts to state the other modules already own and turns
important changes and deadlines into a per-person inbox.

## Why it exists

The platform already tracks the real work elsewhere: `applicants` and
`applicant_journeys` hold the person and study plan; `documents`,
`document_history`, and `document_templates` handle document work;
`uploaded_files` handles files; `offers` handles admission decisions;
`checklists` handles outstanding work; `dashboards` summarizes operational
health; `audit` records important actions. `notifications` turns important
state changes and deadlines into actionable alerts, without duplicating any of
that data.

## What creates a notification

The core set: assignment, follow-up, missing information, missing documents,
appointment dates, checklist deadlines, offer expiry, passport or test expiry,
and important lifecycle changes. **Nothing here is created by a user** — there
is no compose screen and no way for one staff member to notify another.
Alerts appear because a nightly sweep found a deadline, or because a
`post_save` signal fired on a record in another app.

## What makes a good notification

A useful notification answers: what happened, who it is for, what record it
belongs to, why it needs attention, when it becomes urgent or overdue, and
what to do next. Notifications are short, specific, and linked to the source
record — never a generic "something changed."

## Notification types

A small, practical set: assignment alerts, follow-up reminders, missing
information alerts, missing document alerts, appointment reminders, checklist
due/overdue alerts, offer response reminders and expiry alerts, passport or
test expiry alerts, and lifecycle change alerts. The type drives priority,
iconography, and grouping — never business logic. **Three declared types have
no generator today** (missing information has no source definition anywhere
in the project; appointment reminders and test-score expiry wait on apps that
don't exist) — render them if they ever arrive, don't design a screen around
them.

## Recommended user experience

An inbox-like feed: unread/read state, due-now/due-soon/later grouping,
filters by type and source record, quick links to the underlying record, and
a dismiss action. The most important notifications stay visible until the
work is actually handled — dismissing an alert about a missing document does
not collect the document.

## Delivery model

Thought of first as an in-app alert stream. Future channels (email, SMS,
push) can be added later, but all would point back to the same notification
record as the source of truth for delivery status. **Only in-app delivery is
built today.**

## State model

A notification carries: a unique id, a recipient, a source app and source
record id, a type, a title and body, a priority, read/unread state, delivery
state, created time, a due/expiry time when relevant, and a resolved/dismissed
state.

## Relationship to other apps

Notifications point at, but never replace: `offers` (response/expiry),
`checklists` (overdue work), `documents`/`uploaded_files` (missing or rejected
files), `applicant_journeys` (stage changes), `applicants` (person-level
follow-up). If the source record changes, the notification is never silently
rewritten to match — it says what it said when it was raised.

## Lifecycle

1. Created (by the sweep or a signal).
2. Delivered — in-app delivery completes the moment the row exists.
3. Read or acknowledged.
4. Resolved (the sweep found the condition no longer true) or dismissed (the
   recipient decided no action is needed).

Some alerts stay active until the source issue is actually fixed (deadline
alerts); others are lifecycle facts that stay active until the recipient
dismisses them, since there's no "condition" left to re-check.

## Rules for useful alerts

Alert on things that need action, not every minor update. One clear
notification beats several noisy ones. Link each notification to the exact
record that caused it. Preserve the alert history even after the source issue
is fixed — the feed does not default to hiding resolved/dismissed rows.

## Boundaries

`notifications` does not own applicants, documents, offers, or checklists;
does not compute core business status itself; does not duplicate dashboards;
is not a general messaging inbox; and does not hide the original source
record — every alert links out to it.

## Resolved questions (from CONCEPT → what shipped)

- **Which notification types are mandatory in v1?** Eleven are actually
  produced (see `INTEGRATION.md` §5); three more are declared for forward
  compatibility but never raised.
- **Can users mute/snooze specific categories?** No — not built in v1.
- **Are emails required at launch?** No — only in-app.
- **How aggressively do overdue items resurface?** They don't resurface under
  the same key once dismissed. Crossing to a higher-severity type (due-soon →
  overdue) raises a genuinely new, separate alert — that's the only re-entry
  path, called escalation.
- **Does each role get a separate default feed?** No explicit per-role feed,
  but recipient routing (see `INTEGRATION.md` §"Recipient Routing") means most
  deadline alerts fan out to Admins today; Lead Managers receive alerts mainly
  through checklist assignment.

## Still open

- `leads` produces no notifications at all — lead follow-up is a named part
  of a Lead Manager's job with no alert type covering it.
- No snooze, no per-user mute, no un-dismiss.
- No push channel — a client must poll.

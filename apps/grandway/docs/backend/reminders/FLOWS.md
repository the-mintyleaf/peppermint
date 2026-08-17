# FLOWS — Reminders

**Owner app:** `reminders`
**Synced:** 2026-08-17, adapted from `.backend/concepts/reminders_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **Three things shape every flow below and are easy to get wrong from the frontend:**
>
> - **There is no delete and no reopen.** A reminder ends as `completed` or `dismissed`
>   and stays retrievable forever. Build complete/dismiss controls; never a delete
>   button, never an "undo", never a snooze. "Remind me again" is `POST /` a new one.
> - **A `PATCH` may carry only `due_date` and/or `note`.** Owner and lifecycle fields
>   are **rejected**, not ignored. A form that submits the whole record 400s.
> - **Closing the reminder is what clears the alert.** After completing or dismissing,
>   do **not** also dismiss the `custom_reminder` notification — the next nightly sweep
>   resolves it as `source_cleared`. Dismissing it by hand is a second, redundant write.

---

## Flow: Set a follow-up on a record

**Actor:** Admin or Lead Manager · **Entry point:** the Reminders panel on an applicant or client detail screen

1. **Reminders panel** — the panel mounts →
   `GET /api/v1/reminders/?applicant=<id>` (or `?client=<id>`) (`reminders.reminder.list`).
   - **Note:** omitting `status` returns open **and** closed reminders. That is the right
     call for a record panel whose job is operational memory — filter to open rows
     client-side if the user asks for it, rather than re-requesting.
   - **Ordering:** rows come back newest-**created** first, always. There is no
     `?ordering=` parameter, so a due-date reading order is a client-side sort of the
     page you already have.
   - **Requires state:** the record exists (**any** status — a reminder may be set on an
     archived applicant or a retired client).
   - A client id passed as `?applicant=` matches nothing rather than erroring. If a panel
     is mysteriously empty, check which filter it sent.

2. **Reminders panel** — "Add reminder" with a due date and a note →
   `POST /api/v1/reminders/` (`reminders.reminder.create`) → **201**.
   - **Send exactly one owner.** Zero or two → 400 `REMINDERS_OWNER_REQUIRED`.
   - **Requires state:** the owning record exists; `due_date` is Nepal's today or later.
   - **Side effects:** one `reminder_created` audit event; from the due date onward the
     nightly sweep raises a `custom_reminder` alert to every active Admin
     **(cross-app: `notifications`)**.
   - `VALIDATION_ERROR` → inline field errors (past date, blank note). Enforce the date
     floor client-side against **Nepal time**, not the browser's clock — near midnight NPT
     a locally computed "today" legitimately disagrees with the server.
   - `REMINDERS_OWNER_NOT_FOUND` → the record id is stale; refresh the record screen.

3. **Reminders panel** — the list refreshes and shows the new entry. Invalidate the list
   query rather than issuing a differently-filtered second request.

## Flow: Act on a due reminder alert

**Actor:** Admin (a Lead Manager never receives this alert) · **Entry point:** the notification drawer

1. **Notification drawer** — a `custom_reminder` alert appears →
   `GET /api/v1/notifications/` (`notifications.notification.list`) **(cross-app: `notifications`)**.
   - **Requires state:** the nightly sweep has run since the reminder's date began. "The
     alert appears on the due date" means "after that night's sweep" — and **no endpoint
     says when that is**. Do not print an expected time.
   - The alert's `source_entity_id` is the **reminder** id and `source_api_path` is
     `/api/v1/reminders/<id>/`.

2. Follow the alert to the reminder →
   `GET /api/v1/reminders/<id>/` (`reminders.reminder.read`).
   - `REMINDERS_REMINDER_NOT_FOUND` → should not occur; reminders are never deleted.

3. Jump to the owning record via the reminder's `applicant`/`client` id →
   `GET /api/v1/applicants/<id>/` **(cross-app: `applicants`)** or
   `GET /api/v1/clients/<id>/` **(cross-app: `clients`)**.
   - **The owner is a bare UUID, not a nested object.** A reminder row that wants to show
     the owner's name needs this call — or already has the name, if it is rendering inside
     that record's own screen.

4. The follow-up happened → "Complete" (or "Dismiss" if no longer relevant) →
   `POST /api/v1/reminders/<id>/complete/` or `.../dismiss/` → **200**.
   - Optional `reason` (≤2000 chars) is recorded **in the history event only**. It never
     appears on the reminder, so do not render it back from the response.
   - **Requires state:** the reminder is `active`.
   - **Side effects:** `closed_at`/`closed_by` stamped; one audit event; the pending Admin
     alert auto-resolves as `source_cleared` on the next sweep **(cross-app:
     `notifications`)** — **do not also dismiss the notification**.
   - `REMINDERS_REMINDER_ALREADY_CLOSED` (409) → a colleague got there first. **Refresh,
     do not retry.** Re-fetch to pick up `closed_at`/`closed_by_username`; the `details`
     object is `{}` and only the message names the current status.

## Flow: Reschedule a follow-up

**Actor:** Admin or Lead Manager · **Entry point:** the Reminders panel

1. "Reschedule" with a new date and/or revised note →
   `PATCH /api/v1/reminders/<id>/` (`reminders.reminder.update`) → **200**.
   - **Send only the fields that changed**, drawn from `{due_date, note}`. At least one is
     required — an empty `PATCH` is a 400.
   - `REMINDERS_FIELD_IMMUTABLE` → the form sent `applicant`, `client`, `status`,
     `closed_at`, or `closed_by`. Every offending field is listed in `details`. This is a
     client bug, not a user error; the fix is in the submit handler, not the form.
   - `REMINDERS_REMINDER_ALREADY_CLOSED` (409) → closed reminders cannot move. Offer
     "create a new reminder" instead — there is no reopen.
   - **A `PATCH` that changes nothing writes no audit event** and still returns 200 with
     the unchanged record. A quiet no-op is a valid outcome, not a failure.
   - **Side effects:** `reminder_rescheduled` (date moved) or `reminder_updated` (note
     only), with old→new values; any already-raised alert clears on the next sweep and a
     fresh one fires on the new date. The due date is part of the sweep's idempotency key,
     which is why a reschedule can mint a new alert at all.

2. Show what changed →
   `GET /api/v1/reminders/<id>/history/` (`reminders.reminder.list_history`).
   - Paginated, newest first. `changes` is `{ field: { from, to } }` with **both values
     stringified** — render them as text, never coerce back to a date object.

## Flow: The due-work card (Grandway-specific, no concept flow)

**Actor:** Admin or Lead Manager · **Entry point:** the `/admin` dashboard

The concept names no worklist screen, but `INTEGRATION.md` §9 explicitly prescribes this
shape as the way a Lead Manager ever sees their own due follow-ups.

1. `GET /api/v1/reminders/?status=active&page_size=100` — one request, bucketed
   client-side into overdue / due today / upcoming against **one** Nepal-time clock.
   - Do **not** issue three window-filtered requests. Three requests are three clocks, and
     a row can fall between them. This is the same rule the notifications feed follows for
     its due buckets.
   - `meta.count` is the honest total even when the page is capped.
   - `due_before`/`due_after` are **both inclusive**; `fiscal_year` (`YYYY/YY`) is a
     **Bikram Sambat** label resolved server-side, not a Gregorian year.

---

## Endpoint coverage

| `permission_key`                  | `METHOD /path`                          | Used by flow(s)                     | Notes                                                            |
| --------------------------------- | --------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `reminders.reminder.list`         | `GET /api/v1/reminders/`                | Set a follow-up · The due-work card | The only endpoint with filters; no `search`, no `ordering`       |
| `reminders.reminder.create`       | `POST /api/v1/reminders/`               | Set a follow-up                     | 201. Exactly one owner                                           |
| `reminders.reminder.read`         | `GET /api/v1/reminders/<id>/`           | Act on a due reminder alert         | The `source_api_path` target of a `custom_reminder` notification |
| `reminders.reminder.update`       | `PATCH /api/v1/reminders/<id>/`         | Reschedule                          | `due_date`/`note` only                                           |
| `reminders.reminder.complete`     | `POST /api/v1/reminders/<id>/complete/` | Act on a due reminder alert         | Also offered directly from the record panel                      |
| `reminders.reminder.dismiss`      | `POST /api/v1/reminders/<id>/dismiss/`  | Act on a due reminder alert         | The "no longer relevant" branch                                  |
| `reminders.reminder.list_history` | `GET /api/v1/reminders/<id>/history/`   | Reschedule                          | The concept's "operational memory"                               |

> **Permission keys are registry metadata, not the enforced gate.** No view consults one
> today. **Do not generate a client capability map from them** — the enforced rule is the
> flat authority check in `INTEGRATION.md` §3.

## Cross-app dependencies

- **Outbound:** `notifications.notification.list` (the due alert is the entry point of
  "Act on a due reminder alert"); `applicants.applicant.read` / `clients.client.read`
  (jumping from a reminder back to its record).
- **Inbound:** `notifications` names this module as the destination of a `custom_reminder`
  click-through, data-driven via `source_api_path`.

## Open questions

- **No due-reminders worklist screen is named in the concept.** Grandway answers this with
  the dashboard Follow-ups card above; if the product later wants a full route, the
  endpoint already supports it.
- **The sweep's run time is not exposed** (the same gap as `notifications`).
- **No bulk actions** — completing five reminders is five requests.
- **No user UUIDs** on the payload, only `created_by_username`/`closed_by_username`. An
  avatar or profile link needs an out-of-band lookup, and usernames are not guaranteed
  immutable.

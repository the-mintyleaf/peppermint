# Integration — Reminders

**Owner app:** `reminders`
**Version:** 1.0.0
**Status:** Active
**Synced:** 2026-08-17 (from `.backend/backend/reminders/docs/{INTEGRATION,API,DATA_CONTRACT}.md`)

> Re-sync with `/sync-api grandway reminders` when the backend's
> Change History moves past version 1.0.0.
>
> Global conventions (envelopes, pagination, IDs, times, money, rate limits) live
> in `../CORE_INTEGRATION.md` — this file records only what `reminders` adds or
> deviates from.

---

## Change History

| Version | Date       | Summary                                                      |
| ------- | ---------- | ------------------------------------------------------------ |
| 1.0.0   | 2026-08-17 | Initial integration contract — seven endpoints, one resource |

---

## 1. Module

- **Name:** Reminders — one-off, date-only follow-up notes set by staff against an
  applicant or client, surfaced to Admins as a notification when the date arrives.
- **Base path:** `/api/v1/reminders/`
- **Auth — full rights for Admin AND Lead Manager, reads and writes alike.**
  Bearer access JWT on every endpoint. `admin` and `lead_manager` have **identical**
  rights on all seven routes; a `superadmin` token is refused **403 everywhere,
  reads included**. **There is no read/write split** — the same shape as `offers`,
  deliberately unlike `institutions`/`clients`. A reminders panel needs **no
  authority-based control hiding**: do not carry a "hide write controls from Lead
  Managers" rule across from the catalogue screens.
- **No owner scoping.** Every Admin and Lead Manager sees **every** reminder,
  including ones somebody else set. There is no `?created_by=` filter and no
  "my reminders" concept.
- **Status:** active

## 2. Requires

| Depends on      | Kind                   | Why                                                                       | What breaks without it                                            |
| --------------- | ---------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `core`          | framework              | Envelope, pagination, Bikram Sambat rendering, Nepal-time "today"         | The due-date floor and BS siblings disappear                      |
| `authenticate`  | framework + FK         | JWT sessions, `authority_type`; FKs behind `created_by`/`closed_by`       | Every request is 401/403                                          |
| `applicants`    | FK (`PROTECT`)         | A reminder may be owned by an applicant                                   | Creating with `applicant` returns 400 `REMINDERS_OWNER_NOT_FOUND` |
| `clients`       | FK (`PROTECT`)         | A reminder may be owned by a client                                       | Creating with `client` returns 400 `REMINDERS_OWNER_NOT_FOUND`    |
| `audit`         | service call           | Every mutation appends one history event; `/history/` reads them back     | Mutations fail; history is empty                                  |
| `notifications` | service call (inbound) | The nightly sweep reads due reminders and raises `custom_reminder` alerts | Reminders still store and list, but no alert ever surfaces        |

Both owner FKs are `PROTECT` — a record with reminders against it cannot be removed
while they exist. This module is what makes `clients` no longer an island: it is
the directory's **first inbound business-app foreign key**.

## 3. Conventions — what this module adds or deviates from `../CORE_INTEGRATION.md`

- **Permission keys are registry metadata, not the enforced gate.** No view consults
  one today. **Do not generate a client capability map from them.** The enforced rule
  is the flat authority check in §1.
- **Nothing is ever deleted.** There is **no `DELETE` method on any endpoint in this
  module.** A reminder ends as `completed` or `dismissed` and stays retrievable
  forever. Build complete/dismiss controls, not a delete button.
- **No reopen, no snooze.** `completed` and `dismissed` are terminal. "Remind me
  again later" is a **new** reminder (`POST /`), never an edit to the finished one.
- **The owner and lifecycle fields are immutable, and a `PATCH` carrying them is
  REJECTED, not ignored.** `applicant`, `client`, `status`, `closed_at`, `closed_by`
  return 400 `REMINDERS_FIELD_IMMUTABLE` with every offending field in `details`.
  Send only the fields the user actually changed (`due_date`, `note`).
- **A `PATCH` that changes nothing writes no audit event.** The response is still 200
  with the unchanged record.
- **List ordering: newest-created first, always.** There is **no `?ordering=`**
  parameter — a due-date-ordered worklist sorts its page client-side or narrows with
  the due-window filters. There is **no `?search=`** either.
- **Pagination:** page-number, `page`/`page_size` (default 20, max 100 — over-max is
  **clamped, not rejected**). `data` is the **bare array of rows**, not nested under
  `results`. Applies to **both** list endpoints (reminders and history).
- **Query parameters are validated, not ignored** — a malformed one is a 400.
- **Times (deviation from the project-wide ISO-8601-UTC convention):** `updated_at`
  is ISO 8601 UTC with **no** `_bs` sibling. User-facing dates carry a Bikram Sambat
  sibling — `due_date_bs`, `closed_at_bs`, `created_at_bs` — each an **object or
  `null`, never a string**, shaped `{ year, month, day, month_name, display }`.
  **Write the Gregorian field; read either.** `POST`/`PATCH` accept `YYYY-MM-DD` only.
- **"Due" is a Nepal-calendar day.** A reminder is due at the start of its `due_date`
  in `Asia/Kathmandu` (+05:45), and the alert appears after the next nightly sweep —
  not at the stroke of midnight. **Near midnight NPT a client computing "due today"
  from the browser's clock will briefly disagree with the server.** Compute the date
  floor in Nepal time.
- **One alert per due date, never a nightly re-nag.** The due date is part of the
  sweep's idempotency key. A reminder left open past its date raises no further
  alerts; only a reschedule can produce a new one.
- **Empty text fields are `""`, never `null`.** Nullable fields are exactly
  `applicant`, `client` (one of the two is always set, the other `null`), `closed_at`,
  `closed_at_bs`, and `closed_by_username`.
- **Do not assert on `message`.** On the paginated branch it is `""`. Branch on the
  HTTP status and, for errors, on `error.code`.

## 4. Models

**Reminder** — the **same shape from every endpoint**; there is no list/detail split.

| Field                 | Type                                     | Nullable | Notes                                                              |
| --------------------- | ---------------------------------------- | -------- | ------------------------------------------------------------------ |
| `id`                  | `string` (UUID)                          | No       |                                                                    |
| `owner_type`          | `"applicant" \| "client"`                | No       | Derived from whichever FK is set; not a column                     |
| `applicant`           | `string \| null` (UUID)                  | Yes      | **Bare UUID, not a nested object**                                 |
| `client`              | `string \| null` (UUID)                  | Yes      | **Bare UUID, not a nested object**                                 |
| `due_date`            | `string` (`YYYY-MM-DD`)                  | No       | Gregorian only                                                     |
| `due_date_bs`         | `BsDate`                                 | No       | `{year, month, day, month_name, display}` — object, never a string |
| `note`                | `string`                                 | No       | ≤5000 chars, NFC-normalised                                        |
| `status`              | `"active" \| "completed" \| "dismissed"` | No       | Server-set, never accepted from a client                           |
| `is_active`           | `boolean`                                | No       | Derived: `status === "active"`                                     |
| `closed_at`           | `string \| null` (ISO 8601 UTC)          | Yes      | `null` while active                                                |
| `closed_at_bs`        | `BsDate \| null`                         | Yes      | `null` while active                                                |
| `closed_by_username`  | `string \| null`                         | Yes      | **No user UUID is exposed**                                        |
| `created_by_username` | `string`                                 | No       | **No user UUID is exposed**                                        |
| `created_at`          | `string` (ISO 8601 UTC)                  | No       |                                                                    |
| `created_at_bs`       | `BsDate`                                 | No       | When a reminder was set is itself operational memory               |
| `updated_at`          | `string` (ISO 8601 UTC)                  | No       | **No `_bs` sibling** — deliberate                                  |

**HistoryEvent** — owned by `audit` (there called `AuditEventHistoryEntry`); this app
renders it, it does not define it. `{ id, action, actor_type, actor_id: string | null,
actor_label, summary, reason, changes, metadata, created_at, created_at_bs }`.

`changes` is `{ "<field>": { "from": "…", "to": "…" } }` with **both values
stringified** — a reschedule carries `due_date`, a closure carries `status`.

### Worked example — active, applicant-owned

```json
{
  "id": "9a0b1c2d-3e4f-4a5b-8c6d-7e8f90123456",
  "owner_type": "applicant",
  "applicant": "1f2e3d4c-5b6a-4798-8695-a4b3c2d1e0f9",
  "client": null,
  "due_date": "2026-08-25",
  "due_date_bs": {
    "year": 2083,
    "month": 5,
    "day": 9,
    "month_name": "Bhadra",
    "display": "2083 Bhadra 9"
  },
  "note": "Chase IELTS certificate before the SOP review call.",
  "status": "active",
  "is_active": true,
  "closed_at": null,
  "closed_at_bs": null,
  "closed_by_username": null,
  "created_by_username": "adminuser",
  "created_at": "2026-08-17T05:12:30Z",
  "created_at_bs": {
    "year": 2083,
    "month": 5,
    "day": 1,
    "month_name": "Bhadra",
    "display": "2083 Bhadra 1"
  },
  "updated_at": "2026-08-17T05:12:30Z"
}
```

## 5. Enums

- `Reminder.owner_type`: `applicant` | `client`
- `Reminder.status`: `active` | `completed` | `dismissed` (terminal: `completed`, `dismissed`)
- `HistoryEvent.action`: `reminder_created` | `reminder_rescheduled` | `reminder_updated` | `reminder_completed` | `reminder_dismissed`
- `HistoryEvent.actor_type` (owned by `audit`): `superadmin` | `admin` | `lead_manager` | `system` | `ai`

`reminder_rescheduled` vs `reminder_updated` is a **real distinction**: moving the due
date writes `rescheduled`, correcting the note alone writes `updated`.

## 6. Dependency order

A `Reminder` needs an `Applicant` **or** a `Client` — exactly one, existing before the
create call. **Start here:** `POST /api/v1/reminders/` against a record you already have.

## 7. Endpoints

### Reminder — `/api/v1/reminders/`

**Use it when:** a record's reminders panel (filtered by `?applicant=`/`?client=`), a
due-window worklist, or setting a new follow-up.

| Method  | Path                      | Permission key              | Risk   | Success |
| ------- | ------------------------- | --------------------------- | ------ | ------- |
| `GET`   | `/api/v1/reminders/`      | `reminders.reminder.list`   | low    | 200     |
| `POST`  | `/api/v1/reminders/`      | `reminders.reminder.create` | medium | **201** |
| `GET`   | `/api/v1/reminders/<id>/` | `reminders.reminder.read`   | low    | 200     |
| `PATCH` | `/api/v1/reminders/<id>/` | `reminders.reminder.update` | medium | 200     |

**List filters** — all optional, all validated:

| Param         | Type                               | Notes                                                                                                                                              |
| ------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applicant`   | UUID                               | A client id passed here matches nothing rather than erroring                                                                                       |
| `client`      | UUID                               |                                                                                                                                                    |
| `status`      | `active \| completed \| dismissed` | **Omitting it returns open AND closed rows** — hide finished ones client-side                                                                      |
| `due_before`  | `YYYY-MM-DD`                       | **Inclusive**, on `due_date`                                                                                                                       |
| `due_after`   | `YYYY-MM-DD`                       | **Inclusive**, on `due_date`                                                                                                                       |
| `fiscal_year` | `YYYY/YY`                          | A **Nepali (Bikram Sambat)** fiscal-year label, e.g. `2082/83` (Shrawan 1 → Ashadh end), resolved server-side to a Gregorian range over `due_date` |
| `page`        | int                                | Default 1                                                                                                                                          |
| `page_size`   | int                                | Default 20, max 100 (clamped)                                                                                                                      |

**Request body — create:** exactly one of `applicant`/`client` (UUID), `due_date`
(`YYYY-MM-DD`, Nepal's today or later), `note` (required, ≤5000 chars).
**Request body — update:** `due_date` and/or `note`, at least one. Nothing else.
`status`, `closed_at`, `closed_by`, `created_by` are server-set and never accepted.

**Requires state:** the owner record must exist — **any status**; a reminder may be set
on an archived applicant or a retired client. For `PATCH`, the reminder must be `active`.

**Side effects:** every mutation appends one `HistoryEvent`. A create or reschedule also
determines what the nightly sweep does later — when `due_date` arrives, each active
Admin receives a `custom_reminder` notification; a reschedule of a still-open reminder
auto-resolves any already-raised alert on the next sweep, and a fresh one is raised when
the new date arrives.

### Complete / Dismiss — `/api/v1/reminders/<id>/complete/`, `/dismiss/`

| Method | Path                               | Permission key                | Risk   | Success |
| ------ | ---------------------------------- | ----------------------------- | ------ | ------- |
| `POST` | `/api/v1/reminders/<id>/complete/` | `reminders.reminder.complete` | medium | 200     |
| `POST` | `/api/v1/reminders/<id>/dismiss/`  | `reminders.reminder.dismiss`  | medium | 200     |

**Request body:** optional `reason` (≤2000 chars) — **recorded in the history event
only**, not on the reminder. Do not expect it back on the response.
**Returns:** the `Reminder`, now terminal, with `closed_at`/`closed_by_username` set.
**Requires state:** the reminder is `active`.
**Side effects:** one `HistoryEvent`. If a `custom_reminder` notification is already
active for this reminder, the **next nightly sweep auto-resolves it**
(resolution `source_cleared`) — **a client should not also dismiss the notification.**

### History — `/api/v1/reminders/<id>/history/`

`GET`, `reminders.reminder.list_history`, risk low, 200. Chronological, newest first,
paginated. No request body. **Requires state:** the reminder exists (any status).

## 8. Error codes

| Code                                | HTTP | Trigger                                                                 | `details`                                       |
| ----------------------------------- | ---- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| `REMINDERS_ACTOR_FORBIDDEN`         | 403  | A `superadmin` token, on **any** of the seven routes                    | `{}`                                            |
| `REMINDERS_OWNER_REQUIRED`          | 400  | Zero or two owner references in the create body                         | `{}`                                            |
| `REMINDERS_OWNER_NOT_FOUND`         | 400  | The named owner id does not exist                                       | `{ "applicant": ["Not found."] }`               |
| `REMINDERS_FIELD_IMMUTABLE`         | 400  | A `PATCH` carried `applicant`/`client`/`status`/`closed_at`/`closed_by` | one message array per offending field           |
| `REMINDERS_REMINDER_NOT_FOUND`      | 404  | The id in the **URL path**                                              | `{}`                                            |
| `REMINDERS_REMINDER_ALREADY_CLOSED` | 409  | `PATCH`/complete/dismiss on a closed reminder                           | `{}`; only the message names the current status |
| `VALIDATION_ERROR`                  | 400  | Past `due_date`, blank `note`, empty `PATCH`, malformed query param     | the offending fields                            |

- **A missing reminder named in the URL path is 404; an unknown owner id in the request
  body is 400.** They are different failures with different fixes.
- `REMINDERS_ACTOR_FORBIDDEN` **replaces** the project-wide `PERMISSION_DENIED` here.
- 401 on a missing, expired, or revoked token, produced by the auth framework.

## 9. Gaps

- **No reminder search** (`?search=`) — the list filters by owner/status/window only.
- **No per-owner convenience route** (`/api/v1/applicants/<id>/reminders/` does not
  exist); record panels use the `?applicant=`/`?client=` filters.
- **The sweep's run time is not exposed.** "The alert appears on the due date" means
  "after that night's sweep", and this module cannot tell a client when that is.
- **No bulk actions** — completing five reminders is five requests.
- **A Lead Manager never receives the due alert**, and cannot be shown anyone else's
  feed. Their own follow-ups therefore surface nowhere automatically. The contract's
  prescribed fix is to build it from this module directly:
  `GET /api/v1/reminders/?status=active&due_before=<npt_today>`. **Grandway does this
  with the dashboard's Follow-ups card, which is why that card is not Admin-only.**
- **No user UUIDs** — `created_by_username`/`closed_by_username` only. An avatar or
  profile link needs an out-of-band lookup, and usernames are not guaranteed immutable.

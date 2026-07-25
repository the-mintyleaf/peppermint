# Integration — Notifications

**Owner app:** `notifications`
**Version:** 1.0.1
**Status:** Active
**Synced:** 2026-07-26 (from `.backend/backend/notifications/docs/{API,DATA_CONTRACT}.md` —
**note: this domain has no `SECURITY.md`**, unlike checklists/dashboard/uploaded-files/audit;
access-model detail below is drawn from `API.md` §1 and `INTEGRATION.md` instead)

> Re-sync with `/sync-api grandway notifications` when the backend's
> Change History moves past version 1.0.1.

---

## Change History

| Version | Date       | Summary                                                                                                                                                                                                                                                                                                                                                                      |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-24 | Initial integration contract — seven endpoints                                                                                                                                                                                                                                                                                                                               |
| 1.0.1   | 2026-07-24 | Corrections from consumer-contract review: filter `type` renamed `notification_type`; a malformed `?fiscal_year=` returned 500, now 400. Added the lifecycle table, the source-triple table, worked 400/404 bodies, dedup guarantee, date-parameter formats/timezone, 405/trailing-slash/page-past-end behaviour, produced-type meanings, and the dismissed-but-unread state |

---

## 1. Module

- **Name:** Notifications — the in-app alert stream. Turns deadlines and
  lifecycle events in other modules into a per-person inbox: what needs
  attention, why, and which record to open next. Owns **no business state** —
  every alert points at a record another module owns.
- **Base path:** `/api/v1/notifications/`
- **Auth:** Bearer JWT. Admin and Lead Manager may reach every endpoint;
  Superadmin is refused on all seven. **Every endpoint operates on the calling
  user's own notifications only** — there is no way to read or act on another
  user's feed through this API, for any authority. Stricter than every other
  Grandway module: elsewhere an Admin can read anything business-related;
  here a notification is one person's queue, not a shared business record.
- **No `SECURITY.md` exists for this domain in `.backend/`** — the access
  model above is the fullest statement available; there is no separate
  security-risk writeup (contrast `uploaded-files`, which has one).

## 2. Requires

| Depends on           | Kind                          | Why                                                                                                                        | What breaks without it                                                                                                     |
| -------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `authenticate`       | framework + FK + service call | Issues the bearer token; supplies the recipient; `get_active_admins()` is the fan-out for alerts about records nobody owns | Every endpoint 401s. With no active Admin account, offer/passport/journey alerts are raised for nobody and silently vanish |
| `checklists`         | service call + signal         | Overdue/due-soon/missing-document alerts read that module's selectors; assignment alerts listen on its saves               | Those four alert types stop being produced; the feed still works otherwise                                                 |
| `offers`             | service call + signal         | Response-deadline/expiry alerts read `get_offers_awaiting_response`; decision alerts listen on offer saves                 | `offer_response_due`, `offer_expired`, `offer_decided` stop being produced                                                 |
| `applicants`         | service call                  | Passport-expiry alerts read `get_expiring_passports`                                                                       | `passport_expiring` stops being produced                                                                                   |
| `uploaded_files`     | signal                        | Rejection alerts listen on file saves                                                                                      | `file_rejected` stops being produced                                                                                       |
| `applicant_journeys` | signal                        | Stage-change/closure alerts listen on journey saves                                                                        | `journey_stage_changed`/`journey_closed` stop being produced                                                               |
| `audit`              | service call                  | Records dismissals and generator failures                                                                                  | Dismissal still works, but nothing records who closed what                                                                 |
| `core`               | framework                     | Envelope, pagination, date-window resolution, BS rendering                                                                 | Responses lose the standard envelope                                                                                       |

**Two notes for consumers:** every dependency above runs **one way** — no
module knows this one exists; a client that completes a checklist item sees
no mention of a notification in the checklist response. And **nothing depends
on `notifications`** — no other module imports it, which is what keeps a
failure to alert from ever becoming a failure to save the underlying work.

## 3. Conventions

- **Response/Error envelopes:** the project standard — `{ success, message, data, meta }` /
  `{ success: false, error: { code, message, details }, meta }`.
- **Auth failures:** `AUTHENTICATION_REQUIRED` (401); `NOTIFICATIONS_ACTOR_FORBIDDEN`
  (403) — Superadmin, the only 403 this app returns. Both apply to all seven
  endpoints.
- **Own-recipient scoping is absolute, and it changes what 404 means.**
  Fetching or acting on a notification belonging to another user returns
  **404, not 403** — identical to a made-up id. A 403 would confirm the id
  exists on somebody else's feed, and a title names an applicant and the
  document they're missing. **No `?recipient=` filter and no "notifications
  for user X" endpoint exist — an Admin cannot build one.**
- **Success statuses:** `200` on every endpoint — nothing here creates a
  resource (no `201`), nothing returns `204`. `PATCH`/`PUT`/`DELETE` on
  `/notifications/<id>/` and `POST` on the feed root all return **405**, never 404. Every path ends in a trailing slash.
- **Pagination:** `GET /` only — `page`/`page_size` (default 20, max 100).
  `data` is a **bare array**. `meta` carries `count`/`page`/`page_size`/`next`/`previous`.
  **Requesting a page past the end returns 404** (`NOT_FOUND`, "Invalid page.") —
  not an empty array.
- **`error.details` is field-name→array-of-strings on validation errors**, key
  = query parameter name. **One deviation:** `NOTIFICATIONS_ALREADY_TERMINAL`
  puts the current status under `details.status` as a **bare string**, not an
  array.
- **List/filter params on `GET /`:** `status`, `is_read`, `notification_type`,
  `priority`, `source_app`, `source_entity_id`, `due_bucket`,
  `due_within_days`, `date_from`, `date_to`, `fiscal_year`, `page`,
  `page_size`. Every parameter name is exactly its payload field name — no
  shortened alias (the pre-1.0.1 `type` bug is fixed). `GET /summary/`
  **validates the whole set but only honours `due_within_days`** —
  `?status=bogus` on summary still 400s. **No search parameter, no ordering
  parameter** on either — see Gaps, this is the module's most consequential
  omission. Repeating a parameter is not multi-value: the last occurrence wins.
- **Filter semantics:** `status` absent → **all statuses** including dismissed/resolved
  (send `?status=active` for a working inbox). `is_read` absent → all.
  `due_bucket` is computed from `due_at` against the request's own clock:
  `overdue`/`due_soon`/`later`/`none`. `due_within_days` (1–365, default 7)
  moves the `due_soon`/`later` boundary **for both the filter and the
  `due_bucket` rendered on every row** — two requests with different values
  legitimately return different buckets for the same notification; do not
  cache a row by id across screens using different windows. `date_from`/`date_to`
  are `YYYY-MM-DD` (not datetime); `fiscal_year` is `YYYY/YY`; all three window
  on `created_at`, `date_to` inclusive, boundaries at **Kathmandu midnight
  (UTC+05:45)**, not UTC. An explicit date range beats `fiscal_year` when both
  are given. Filters combine with AND; an unrecognized enum value is `400`,
  never an empty page.
- **IDs:** UUID strings. **Times:** ISO 8601 UTC. `due_at` carries a
  `due_at_bs` sibling (Bikram Sambat) or `null`. `created_at` has **no** `_bs`
  sibling — a system timestamp, not a date staff plan around.
- **Ordering is fixed** — newest-created first, `id` as tiebreaker. No
  `ordering` parameter exists (see Gaps).

## 4. Models

**Notification — identical on list and retrieve** (the feed row _is_ the
whole resource): `{ id, notification_type: enum, priority: enum, title, body,
source_app, source_entity_type, source_entity_id?, source_api_path, due_at?,
due_at_bs?: json, due_bucket: enum, is_read, read_at?, status: enum,
resolution: enum, resolved_at?, delivery_channel: enum, delivery_state: enum,
generated_by: enum, created_at }`.

- `source_app` + `source_entity_type` + `source_entity_id` are **strings and
  a bare UUID, never a nested object** — this module holds no FK into any
  other module. To show details, follow `source_api_path`.
- `source_api_path` is the **nearest retrievable endpoint**, not always the
  entity itself — e.g. `passport_expiring` points at the applicant, because a
  passport has no endpoint of its own. Treat it as "where to send the user."
- `title` ≤ 200 chars; `body` unbounded. Both plain English text — render
  escaped, never treat `body` as HTML.
- **`is_read` and `due_bucket` are derived at read time, never stored.**
  `is_read` = `read_at != null`.
- **Read state and status are independent.** A read alert is still `active`
  work. Dismissing does **not** mark an alert read — `status: "dismissed"`
  with `is_read: false` is a normal, renderable state.
- **Source-triple routing table** — build the client's routing table from
  `notification_type`, never parse `source_api_path`:

| `notification_type`                                    | `source_app`         | `source_entity_type`            | path shape                                                  |
| ------------------------------------------------------ | -------------------- | ------------------------------- | ----------------------------------------------------------- |
| `checklist_item_due`, `checklist_item_overdue`         | `checklists`         | `checklist_item`                | `/api/v1/checklists/<checklist id>/items/<id>/`             |
| `missing_documents`                                    | `checklists`         | `checklist`                     | `/api/v1/checklists/<id>/`                                  |
| `assignment_received`                                  | `checklists`         | `checklist_item` or `checklist` | matching path above                                         |
| `offer_response_due`, `offer_expired`, `offer_decided` | `offers`             | `offer`                         | `/api/v1/offers/<id>/`                                      |
| `passport_expiring`                                    | `applicants`         | `passport_detail`               | `/api/v1/applicants/<applicant id>/` — **not** the passport |
| `file_rejected`                                        | `uploaded_files`     | `uploaded_file`                 | `/api/v1/files/<id>/`                                       |
| `journey_stage_changed`, `journey_closed`              | `applicant_journeys` | `applicant_journey`             | `/api/v1/journeys/<id>/`                                    |

Neither `source_app` nor `source_entity_type` is a closed database enum —
treat both as open strings and don't fail on an unrecognized one. As
**filter** values, an unrecognized `source_app` matches nothing (free-text
exact match) and returns an empty page, not a 400.

### Lifecycle — three states, two possible transitions

| From        | To          | Caused by                                       | `resolution`        |
| ----------- | ----------- | ----------------------------------------------- | ------------------- |
| _(nothing)_ | `active`    | nightly sweep, or a source event                | `""`                |
| `active`    | `dismissed` | **the recipient**, via dismiss                  | `dismissed_by_user` |
| `active`    | `resolved`  | **the nightly sweep**, source condition cleared | `source_cleared`    |

`resolved_at` set on entry to either terminal state, `null` while active.
**No transition out of a terminal state, and none between the two terminal
states.** A dismissed alert is never later rewritten to `resolved`. **Only
sweep-raised alerts (`generated_by: "sweep"`) are ever auto-resolved** —
lifecycle alerts (`generated_by: "signal"`: assignment, file rejection,
journey stage, offer decision) record that something _happened_ and stay
`active` until the recipient dismisses them, indefinitely.

**One alert per condition per recipient, not one per night.** A still-overdue
item does not produce a new row each sweep run — it keeps its original
`created_at`/`title`. The only way the same condition produces a second alert
is **escalation** — see the dismiss endpoint below.

**FeedSummary** — `{ unread, active, by_priority: json, by_due_bucket: json }`.
All integers, both breakdown maps fully zero-filled (a key is never absent).
`unread` counts unread rows **in any status**; `active` and both breakdowns
count only `status: "active"` — `unread` can legitimately exceed `active`.
**Drive the bell badge from `unread`** (what "mark all read" clears to zero);
`active` matches the working inbox exactly but nothing drives it to zero
except dismissing everything. There is no single call combining both — get
`unread + active` with a second request (`?status=active&is_read=false&page_size=1`,
read `meta.count`) if the product needs it.

**BulkReadResult** — `{ marked_read: int }` — how many rows the call changed,
not the affected rows.

## 5. Enums

- **`notification_type`** (14 declared, 11 produced): `checklist_item_due` \|
  `checklist_item_overdue` \| `missing_documents` \| `missing_information`\*
  \| `offer_response_due` \| `offer_expired` \| `passport_expiring` \|
  `test_score_expiring`\* \| `appointment_reminder`\* \| `assignment_received`
  \| `file_rejected` \| `journey_stage_changed` \| `journey_closed` \|
  `offer_decided`. **\* = declared but never produced** — no source
  definition (`missing_information`) or the owning app doesn't exist yet
  (`appointment_reminder`, `test_score_expiring`). Render them if they ever
  arrive; do not design a screen around them.
- **`priority`** (4): `low` \| `normal` \| `high` \| `urgent` — **fixed per
  type at creation**, stored not derived: `offer_expired` → `urgent`;
  `checklist_item_overdue`/`offer_response_due`/`passport_expiring`/
  `test_score_expiring`/`file_rejected` → `high`; `journey_stage_changed` →
  `low`; everything else → `normal`. Read `priority` from the payload rather
  than recomputing.
- **`status`** (3): `active` \| `dismissed` \| `resolved`.
- **`resolution`** (3): `source_cleared` \| `dismissed_by_user` \| `""` (empty
  while active — not a fourth enum member).
- **`due_bucket`** (4, derived): `overdue` \| `due_soon` \| `later` \| `none`.
- **`delivery_channel`** (1 produced): `in_app` — the only value in this
  version.
- **`delivery_state`** (3 declared, 1 produced): `pending` \| `delivered` \|
  `failed` — only `delivered` is produced (in-app delivery completes the
  moment the row exists).
- **`generated_by`** (2): `sweep` \| `signal`.

**What each produced type means:** `checklist_item_due`/`_overdue` — a
checklist requirement approaching/past its due date. `missing_documents` — a
checklist holds document requirements with **no due date and nothing
collected** (a distinct alert because the two date-driven types can't see
these). `offer_response_due`/`offer_expired` — an **issued** offer's response
deadline approaching/passed (`offer_expired` names the deadline, not the
offer's own status, which stays `issued`). `passport_expiring` — expired or
expiring within ~6 months, raised for already-lapsed passports too.
`assignment_received` — a checklist or item assigned to you (the only
genuinely targeted, non-fan-out alert; there is no lead/applicant/offer
assignment concept to alert on). `file_rejected` — reason is in `body`.
`journey_stage_changed`/`_closed` — new stage / terminal stage.
`offer_decided` — a terminal offer status (accepted/rejected/withdrawn/deferred/expired).

## 6. Dependency order

- A `Notification` needs a **recipient** (`authenticate` — external).
- A `Notification` needs a **source record** in `checklists`, `offers`,
  `applicants`, `uploaded_files`, or `applicant_journeys` (external) — raised
  _from_ that record, cannot exist before it.
- **Nothing in this module needs anything else in this module** — no
  parent/child resource, no ordering constraint between calls.

**Start here:** there is nothing for a client to create.
`GET /api/v1/notifications/summary/` for the badge, then
`GET /api/v1/notifications/?status=active` for the inbox.

## 7. Endpoints

All 7. Global auth failures (`AUTHENTICATION_REQUIRED` 401,
`NOTIFICATIONS_ACTOR_FORBIDDEN` 403) apply to every row and are not repeated
below.

| Endpoint                              | Method | Policy key                                 | Notes                                                                                                 |
| ------------------------------------- | ------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `/api/v1/notifications/`              | GET    | `notifications.notification.list`          | Own feed only, paginated, newest first. No body accepted; other verbs 405                             |
| `/api/v1/notifications/summary/`      | GET    | `notifications.notification.summary`       | Two queries regardless of feed size. Only `due_within_days` changes the result (rest still validated) |
| `/api/v1/notifications/<id>/`         | GET    | `notifications.notification.read`          | 404 if absent **or** owned by another user                                                            |
| `/api/v1/notifications/<id>/read/`    | POST   | `notifications.notification.mark_read`     | No body. Idempotent — a second call keeps the **first** timestamp. Does not change `status`           |
| `/api/v1/notifications/<id>/unread/`  | POST   | `notifications.notification.mark_unread`   | No body. Clears `read_at`. Unused by any named flow — exists so opening a row is a safe act           |
| `/api/v1/notifications/read-all/`     | POST   | `notifications.notification.mark_all_read` | No body, no filters — clears **everything** unread, including dismissed/resolved rows                 |
| `/api/v1/notifications/<id>/dismiss/` | POST   | `notifications.notification.dismiss`       | No body, no reason field. **Permanent** — the only irreversible action in this app                    |

### Request bodies

All seven accept **no request body** — this is a read/act-only domain with no
create/update/delete surface anywhere.

## 8. Error codes

This module declares exactly **three** codes.

| Code                                   | HTTP | Notes                                                                                                                                              |
| -------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NOTIFICATIONS_ACTOR_FORBIDDEN`        | 403  | Superadmin — the only 403 this app returns                                                                                                         |
| `NOTIFICATIONS_NOTIFICATION_NOT_FOUND` | 404  | No such notification on the caller's own feed. **Also** returned for another user's notification, deliberately indistinguishable from a made-up id |
| `NOTIFICATIONS_ALREADY_TERMINAL`       | 409  | Dismissing an already-dismissed/resolved alert. `details.status` carries the current status as a **bare string**                                   |

Filter validation is answered by the project-wide `VALIDATION_ERROR` (400),
which names the offending parameter. `AUTHENTICATION_REQUIRED` (401) applies
project-wide.

## 9. Gaps

Ordered by how much they cost a real integration.

- **The feed cannot be ordered — the most consequential gap for an inbox.**
  No `ordering` parameter. Rows are always newest-created first, so an
  `urgent` alert from last week sits below a `low` one from this morning, and
  no request can reverse that; sorting client-side doesn't fix it because the
  rows that belong on page 1 may be on page 3. Workaround: separate filtered
  requests per priority/bucket rather than one re-sortable list.
  `?ordering=priority,due_at` is the obvious fix and is not built.
- **No search.** No way to find "the alert about Sita" beyond paging or
  filtering by `source_entity_id`, which requires already knowing the record.
- **No bulk action except all-or-one.** `read-all` takes no filters — no
  "dismiss these five" or "dismiss all overdue."
- **No retention policy, nothing ever deleted.** A long-lived account's
  unfiltered feed grows without bound; with no ordering, old rows are
  effectively unreachable in practice. Always send `?status=active` unless
  the history is genuinely wanted.
- **`leads` produces no notifications at all.** Lead follow-up is a named
  part of a Lead Manager's job with no alert type covering it — a real
  product hole, not a documentation gap.
- **No push channel.** No websocket/SSE/long-poll; a client must poll
  `/summary/`. No recommended interval, no `ETag`/`Last-Modified`/conditional
  request support anywhere — every poll is a full response against the
  shared rate limit.
- **Alerts resolve on a schedule, not the event.** Finishing work elsewhere
  doesn't close the alert immediately — the nightly `sweep_notifications` job
  does, and its run time is not exposed. A client cannot tell a user when an
  alert will clear.
- **No snooze, no un-dismiss, no per-user mute.** Dismissal is one-way.
- **No delivery beyond in-app** — `delivery_channel`/`delivery_state` exist in
  the payload but only ever hold `in_app`/`delivered`.
- **`source_api_path` is not guaranteed-resolvable for `source_entity_id`** —
  it's the nearest retrievable endpoint (e.g. `passport_detail` → the
  applicant), not the entity's own URL.
- **Lifecycle alerts are lossy by design.** A journey moved back to a stage
  it already held raises nothing; a file rejected/verified/rejected again
  raises one alert, not three. The feed is not a complete event log — `audit`
  is that, and it's a different module.
- **Recipient routing is invisible to the client** — decided server-side
  (assignee first, else every active Admin), not queryable or predictable.
- **No `SECURITY.md` for this domain** (unlike checklists/dashboard/
  uploaded-files/audit) — access-model detail here is drawn from `API.md`/`INTEGRATION.md`
  rather than a dedicated security writeup. If one is added later, re-sync
  and fold its content in.

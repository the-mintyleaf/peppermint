# FLOWS — Notifications

**Owner app:** `notifications`
**Synced:** 2026-07-26, adapted from `.backend/concepts/notifications_flows.md`
**Purpose:** Connects `CONCEPT.md`'s product intent to the callable endpoints in `INTEGRATION.md`.

> **Two things about this app shape every flow below, and are easy to get wrong from the
> frontend:**
>
> - **Nothing here is created by a user.** There is no compose screen, no create endpoint,
>   and no way for one staff member to notify another. Alerts appear because a nightly sweep
>   found a deadline or because something happened in another module. Every flow below is
>   therefore a _reading_ flow that ends by leaving this app.
> - **A notification is not the work.** Dismissing an alert about an overdue passport scan
>   does not collect the passport scan. Every flow that actually resolves something crosses
>   into the owning app — which is why most steps here are tagged `(cross-app: ...)`.

---

## Flow: Work the daily inbox

**Actor:** Admin or Lead Manager · **Entry point:** Notification Centre (reached from the bell badge in the global header)

1. **Global header (bell badge)** — the app shell loads, or the user returns to the tab →
   `GET /api/v1/notifications/summary/` (`notifications.notification.summary`).
   - **Which number to show:** `unread`, not `active`. `unread` is what "mark all as read"
     drives to zero, so a badge showing anything else will make that button look broken.
     `unread` counts closed-but-never-read alerts too, so it can read slightly higher than
     the `?status=active` list in step 2. The backend offers no single count that is both.
   - **Requires state:** an authenticated Admin or Lead Manager session. A user who has
     never received an alert gets a valid all-zero summary.
   - `NOTIFICATIONS_ACTOR_FORBIDDEN` → the caller is a Superadmin. Hide the bell entirely
     rather than showing an error badge — this authority has no inbox and never will.

2. **Notification Centre** — the user opens the inbox →
   `GET /api/v1/notifications/?status=active` (`notifications.notification.list`).
   - **Note:** send `status=active` explicitly. Omitting it returns dismissed and resolved
     history too, which is correct for an archive view and wrong for a working inbox.
   - `VALIDATION_ERROR` → only reachable by sending a bad filter value; treat as a client bug.

3. **Notification Centre** — the user groups the list into "due now / due soon / later" →
   no additional request. Every row already carries `due_bucket`. Group client-side rather
   than making three filtered requests; the three would be computed against three different
   clocks (`due_within_days` shifts the bucket boundary per request).

4. **Notification Centre** — the user opens an alert →
   `POST /api/v1/notifications/<id>/read/` (`notifications.notification.mark_read`). Sets
   `read_at` on this notification only. Refresh the badge, not the list — `status` is
   unchanged, so the row stays where it is.
   - `NOTIFICATIONS_NOTIFICATION_NOT_FOUND` → the alert was addressed to somebody else, or
     never existed. Remove the row and re-fetch; do not retry.

5. **Notification Centre** — the user clicks through to the underlying record → follow the
   row's `source_api_path` **(cross-app: `checklists` / `offers` / `applicants` /
   `uploaded_files` / `applicant_journeys`)**. Route on `source_app` + `source_entity_type`
   rather than parsing the path — neither is a closed enum, so treat both as open strings.
   - **Requires state:** the caller must independently hold permission for the target
     record. Receiving an alert does not grant it.
   - A 403 or 404 from the other module → show the alert's `title`/`body` as the whole of
     what the user gets, and say the record is not available to them. Do **not** treat this
     as a broken link.

6. **The owning app's screen** — the user does the actual work **(cross-app: owner of the
   source record)**. Nothing changes in this app immediately. The alert stays `active` until
   the next nightly sweep resolves it — there is no completion signal and no polling
   endpoint for when that runs.
   - **UI treatment:** on returning to the inbox, the alert will still be there. Either let
     the user dismiss it, or show resolved-but-unread alerts distinctly after the sweep runs.

## Flow: Clear an alert that needs no action

**Actor:** Admin or Lead Manager · **Entry point:** Notification Centre

1. **Notification Centre** — the user chooses "dismiss" on a row →
   `POST /api/v1/notifications/<id>/dismiss/` (`notifications.notification.dismiss`). The
   alert becomes `dismissed` and leaves the `?status=active` feed. It is **not deleted** and
   still appears in an unfiltered list. An audit event is written **(cross-app: `audit`)**.
   **No later sweep will raise this condition again.** Refresh both the list and the badge.
   - `NOTIFICATIONS_ALREADY_TERMINAL` (409) → another session already closed it. Re-fetch
     the single row with `notifications.notification.read` and show its current state — do
     not retry and do not show a generic error.
   - `NOTIFICATIONS_NOTIFICATION_NOT_FOUND` → as in the flow above.
   - **UI treatment — this one matters.** Present dismissal as a decision, not "hide for
     now." There is no snooze and no un-dismiss. A confirmation step is warranted on `high`
     and `urgent` rows.

2. **Notification Centre** — the user regrets it → no endpoint exists. The only way the
   condition returns is **escalation**: an item dismissed while merely due-soon will alert
   again if it later becomes overdue, because that is a different alert type (a different
   `notification_type` → a different dedupe key). Nothing the client can call reverses a
   dismissal.

## Flow: Clear the badge without deciding anything

**Actor:** Admin or Lead Manager · **Entry point:** Notification Centre

1. **Notification Centre** — the user clicks "mark all as read" →
   `POST /api/v1/notifications/read-all/` (`notifications.notification.mark_all_read`).
   Succeeds with `marked_read: 0` when nothing is unread — no need to disable the button.
   Every unread notification on the caller's feed becomes read, **including dismissed and
   resolved ones**. Nothing is dismissed or resolved. No other user is affected.

2. **Global header (bell badge)** — reconcile →
   `GET /api/v1/notifications/summary/` (`notifications.notification.summary`). `unread`
   drops to `0` and `active` does **not** change. If the badge is driven by `active` rather
   than `unread`, this button will appear broken — drive it from `unread`.

## Flow: Review the alert history for one record

**Actor:** Admin or Lead Manager · **Entry point:** any source-record detail screen (owned by another app)

1. **Source record detail screen** — the user opens an "alerts" panel →
   `GET /api/v1/notifications/?source_entity_id=<record id>` (`notifications.notification.list`).
   Omit `status` here — the point of this panel is the history, including resolved and
   dismissed alerts.
   - **UI treatment — do not mislabel this panel.** It returns only alerts **the calling
     user received**. Alerts about the same record sent to other staff are invisible. Title
     it "Your alerts for this record", never "All alerts". A complete cross-user history is
     what `audit` provides, not this module.

---

## Endpoint coverage

| Policy key                                 | Method / path                              | Used by flow(s)                                                 | Notes                                                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `notifications.notification.list`          | `GET /api/v1/notifications/`               | Work the daily inbox; Review the alert history for one record   | Two distinct call sites with different filters                                                                                                                                  |
| `notifications.notification.summary`       | `GET /api/v1/notifications/summary/`       | Work the daily inbox; Clear the badge without deciding anything | The only endpoint the app shell polls                                                                                                                                           |
| `notifications.notification.read`          | `GET /api/v1/notifications/<id>/`          | Clear an alert that needs no action (409 recovery)              | No flow opens a notification detail _screen_ — the feed row is the whole resource, so this is a re-fetch call, not a navigation target                                          |
| `notifications.notification.mark_read`     | `POST /api/v1/notifications/<id>/read/`    | Work the daily inbox                                            |                                                                                                                                                                                 |
| `notifications.notification.mark_unread`   | `POST /api/v1/notifications/<id>/unread/`  | —                                                               | The "put it back" affordance. Deliberately available and deliberately not part of a named journey: it exists so opening a row is a safe act, not because any flow depends on it |
| `notifications.notification.mark_all_read` | `POST /api/v1/notifications/read-all/`     | Clear the badge without deciding anything                       |                                                                                                                                                                                 |
| `notifications.notification.dismiss`       | `POST /api/v1/notifications/<id>/dismiss/` | Clear an alert that needs no action                             | The only irreversible action in this app                                                                                                                                        |

## Cross-app dependencies

- **This app references (outbound):** no other app's endpoint is called by a fixed route in
  any flow above. The click-through in "Work the daily inbox" step 5 follows the
  `source_api_path` the alert itself carries, which resolves into `checklists`, `offers`,
  `applicants`, `uploaded_files`, or `applicant_journeys` depending on the alert type — so
  the outbound edge is **data-driven, not hard-coded**. Route on `source_app` +
  `source_entity_type` rather than parsing the path.
- **Referenced by other apps (inbound):** none yet. No other app's flow calls a
  notifications endpoint. The natural future inbound reference is an "alerts" panel on the
  applicant, checklist, and offer detail screens — the fourth flow above.

## Open questions

- **Polling interval for the badge is undefined.** No push channel — no websocket, no SSE,
  no long-poll. No `ETag`/`Last-Modified` either, so every poll is a full response against
  the shared authenticated rate limit. Pausing on `document.hidden` and re-fetching on focus
  is the obvious mitigation and is the client's call to make.
- **The feed cannot be sorted.** No `ordering` parameter — rows come back newest-created
  first, always. An urgent alert from last week sits below a low-priority one from this
  morning. The only real remedy today is separate filtered requests
  (`?priority=urgent`, then `?due_bucket=overdue`) rather than one list the user re-sorts.
- **The sweep's run time is not exposed.** No endpoint reports when it last ran or when it
  will next run. A client cannot tell a user "this will clear overnight" with any accuracy.
- **No snooze, no un-dismiss, no per-category mute.** If a Notification Centre wireframe
  shows a snooze control, it has no endpoint behind it.
- **Three alert types are declared but never produced** — `missing_information`,
  `appointment_reminder`, `test_score_expiring`. Render them if they ever arrive, but do not
  design a screen around them.
- **Recipient routing is invisible to the client.** Who receives which alert is decided
  server-side (assignee first, falling back to every active Admin), and no endpoint reports
  or influences it. A UI cannot show "this was also sent to X".

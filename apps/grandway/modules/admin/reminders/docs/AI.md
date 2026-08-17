# Reminders Module — AI Navigation Map

## Purpose

Dated follow-up notes staff set against an applicant or a client, surfaced to
Admins as a notification when the date arrives. **Operational follow-up, not task
management** — not a task board, not a recurring scheduler, not a CRM workflow
engine. Backend base path is `/api/v1/reminders/`. Contract:
`apps/grandway/docs/backend/reminders/`.

## Module type

ModalModule — **no route of its own**, like `notifications`. A reminder is a note
about a record, so it lives on that record's screen; the only chrome it owns is a
form modal. There is no `/admin/reminders` page and there should not be.

## Entry points

| Surface                   | Export                 | Component                                        |
| ------------------------- | ---------------------- | ------------------------------------------------ |
| Applicant detail (tab)    | `RecordRemindersPanel` | \_shared/RecordRemindersPanel/…                  |
| Client drawer (tab)       | `RecordRemindersPanel` | \_shared/RecordRemindersPanel/…                  |
| Applicants **list row**   | `RecordRemindersPanel` | via `applicants`' `OpenRemindersButton` (modal)  |
| Notification row link     | `ReminderAlertLink`    | \_shared/ReminderAlertLink/…                     |
| Dashboard Follow-ups card | `useDueReminders`      | owned by `dashboard`, reads this module's `.api` |

Cross-module consumers import the **concrete file**, never this module's
`index.ts`, per the app doc's cycle rule.

## Access

`admin` and `lead_manager` have **identical, full rights on all seven
endpoints — there is no read/write split**; `superadmin` is refused 403
everywhere, reads included. There is also **no owner scoping**: every Admin and
Lead Manager sees every reminder, including ones somebody else set.

Gated by `caps.reminders` at each host surface, not by a `Require*` wrapper — the
panel is embedded inside already-guarded screens.

**The one asymmetry is about delivery, not access.** Only Admins _receive_ the
due alert (that is `notifications` routing). A Lead Manager may set and close
reminders freely but never gets alerted, which is why the dashboard's Follow-ups
card is **not** Admin-only. See `dashboard/docs/AI.md`.

## Data layer (module root)

| File                   | Holds                                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| reminders.types.ts     | `Reminder` (identical list/detail), `ReminderOwner` union, create/update/action payloads, filters, `ReminderHistoryEntry`                       |
| reminders.labels.ts    | Status label/colour/icon maps, history-action labels/icons, due-bucket labels                                                                   |
| reminders.queryKeys.ts | `reminderQueryKeys` (`createQueryKeys`) + `reminderHistoryKey(id)` (nested under detail) + `dueRemindersKey()` (**its own top-level slot**)     |
| reminders.api.ts       | `createResourceApi<Reminder, ReminderCreatePayload, ReminderUpdatePayload>` + `complete`/`dismiss` actions + hand-rolled `fetchReminderHistory` |
| reminders.hooks.ts     | `useReminderList`, `useReminder`, `useReminderHistory`, and four mutations                                                                      |
| reminders.constants.ts | `REMINDER_LAYER` — the form/picker/confirm overlay order (see below)                                                                            |
| reminders.utils.ts     | **`nepalToday()`**, `dueBucket`, `sortRemindersForPanel`, **`changedUpdateFields`**, `formatBs`, `formatDueDate`, `formatDueDistance`           |

### The three things that are load-bearing

1. **`nepalToday()`** — the module's single clock. The backend's date floor is
   Nepal's today (`Asia/Kathmandu`, +05:45), so a form validating against the
   browser clock disagrees with the server for ~5h45m every day. It feeds the
   Zod schema, the picker's `minDate`, the quick picks, and every due bucket.
   `dueBucket()` takes the clock as an **argument** so one pass over a list uses
   one value; a panel that let each row call `nepalToday()` could straddle
   midnight and split its own page.
2. **`changedUpdateFields()`** — the only safe way to build a `PATCH` body.
   `applicant`, `client`, `status`, `closed_at`, `closed_by` are **rejected**
   (400 `REMINDERS_FIELD_IMMUTABLE`), not ignored, and an empty `PATCH` is also a 400. Returns `null` for "nothing changed", which callers treat as a
   successful no-op rather than a request.
3. **`dueRemindersKey()` is a separate top-level cache slot**, so it is NOT
   covered by the `reminderQueryKeys.lists()` prefix every other invalidation
   relies on. Every mutation names it explicitly. Forgetting that line is exactly
   how the dashboard card goes stale after a reminder is closed from a record.

## Components

| Component              | Renders                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `RecordRemindersPanel` | The record's follow-ups. Props `{ owner: {applicant} \| {client} }` — a union, so "exactly one owner" is a compile-time guarantee, not a 400 |
| `ReminderRow`          | One reminder as **icon · content · actions**. Each row owns its own mutation hooks (the `NotificationRow` pattern)                           |
| `ReminderFormModal`    | Create + reschedule. `FormWrapper` only — no `FormShell`, no `ModalTableShell`                                                               |
| `ReminderAlertLink`    | The "View record" control on a `custom_reminder` notification                                                                                |

## Where the panel is opened from

The same `RecordRemindersPanel` serves three surfaces — the applicant detail
tab, the client drawer tab, and a **modal off the applicants list row**
(`applicants/pages/list/components/OpenRemindersButton`). One component, so
reading and writing behave identically everywhere and there is one thing to keep
correct.

The list-row modal exists because setting a follow-up is almost always an
interruption: an operator working down the list remembers they owe someone a
call and wants to leave a dated note without losing their filters or their
scroll position. That is the same reasoning behind this module having no route
of its own.

**Overlay stacking is explicit, not incidental** — `reminders.constants.ts`
(`REMINDER_LAYER`) states it once, and the order must stay strictly increasing:

    host modal (Mantine default 200) < form (400) < picker (450) < confirm (500)

Two compounding reasons. The panel can be hosted inside a modal (the applicants
list opens it that way), so the form it launches must clear 200 — two modals on
one layer leave the order to DOM insertion. And **once the form is above 200,
its own date picker is not**: a popover on Mantine's default 300 renders
_behind_ a form at 400, so the calendar opens invisibly and the field looks
broken. That is why `DateInput` carries `popoverProps={{ zIndex }}`.

## Card anatomy

Three columns, left to right:

| Column      | Carries                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Icon**    | The status glyph, tinted by **urgency** while open (red overdue / amber today / gray healthy), neutral once closed                  |
| **Content** | Title (the note — the note _is_ the reminder), then who set it and what it hangs off, then status + dates + how long until it fires |
| **Actions** | Complete ✓ and Reschedule 📅 as icon buttons; Dismiss ✕ held apart by a vertical rule                                               |

- **The icon takes the due tone, not the status tone**, so a column of cards is
  scannable before a word is read. It goes neutral when closed: a completed
  follow-up that happened to be late should not still shout.
- **Dismiss is separated by a `Divider`, not sitting flush against Complete.**
  An icon group is a small target and dismissal cannot be undone; the confirm is
  the real safety net, but adjacency is still the wrong shape.
- **No history on the card.** It is a scanning surface, not an archive — see the
  note in `index.ts` about the history data layer that remains.

## Panel behaviour

- **Real Mantine `Tabs`, one request.** `status` is omitted from the query, so
  the response carries open **and** closed rows; the Open/All tabs are panels
  over that one result, with the live counts on the strip. Loading and error sit
  **above** the tabs — they are properties of the request that feeds both views,
  and rendering them inside a panel would redraw the strip on every refetch. Two filtered requests would be two cache entries and
  a flash of empty on every toggle.
- **Rows are sorted for reading**, not in server order. This API has **no
  `ordering` parameter** and always returns newest-created first, so reading
  order (soonest due first, closed sunk) is the client's to own.
- Nepal's today is recomputed **per render**, not memoized on mount — the panel
  can sit open across midnight NPT in a tab.
- Truncation is disclosed against the record, not the visible rows: the page
  holds the 100 newest-**created**, so an older still-open follow-up can be
  missing entirely, and the notice says so.

## Row behaviour

- Urgency colours the **due badge**, never the status pill. An open reminder due
  next month is the healthy state of this feature; colouring every open row would
  make a well-kept panel look like a problem. The due badge is hidden on closed
  rows — "overdue" on completed work is a lie.
- Dismiss confirms first and names the real recovery path (set a new reminder).
- On a 409 the mutation refetches (`useRefetchOnConflict`), because
  `useAppMutation` only invalidates on success and the error copy promises a
  refresh. Scoped to 409/404 so a network blip does not stampede every list.

## Form behaviour

- Two fields, one component for both modes (create and reschedule) — there is no
  second reminder form. Full-width `DateInput` with `minDate={nepalToday()}` and
  Tomorrow / In a week / In a month quick picks; a ten-row `Textarea` (growing to
  twenty) with a counter that only appears near the 5,000 ceiling. The note is
  what a reader sees months later with no other context, so the field invites a
  few sentences rather than a fragment.
- The modal scrolls internally (`ScrollArea.Autosize`) — with a twenty-row note
  the submit footer would otherwise fall below the fold on a short viewport.
- **Edit sends only the changed subset.** "Nothing changed" closes without a
  request.
- Unsaved-changes guard on every close affordance.
- The catch returns `{ ok: true }` on purpose — `FormWrapper.handleSubmit` raises
  its own generic toast for any `{ ok: false }`, which would stack on top of the
  mutation's specific one. Same pattern as `EditFileModal`/`UploadFileModal`.
- Modal body padding is restored on a `Stack p="md"`, never via the modal's own
  `styles`; the confirm modal uses `styles.inner`.

## Cross-module edges

| Direction   | Edge                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Consumed by | `applicants` detail (tab between Files and Alerts) · `clients` drawer (tab) · `notifications` row (`ReminderAlertLink`) · `dashboard` (card) |
| Consumes    | Nothing. This module imports no other business module                                                                                        |

`custom_reminder` notifications name the **reminder** id, not the record, so
`resolveNotificationLink` returns `null` for that type and `ReminderAlertLink`
fetches the reminder to find its owner. See `notifications/docs/AI.md`.

## Do not do

- **Do not add a delete button.** There is no `DELETE` on any endpoint in this
  module, at all.
- **Do not add reopen, undo, or snooze.** `completed` and `dismissed` are
  terminal. "Remind me again" is a new `POST /`.
- **Do not PATCH the whole record.** Send the changed subset of
  `{due_date, note}` via `changedUpdateFields()`.
- **Do not dismiss the `custom_reminder` notification** after completing a
  reminder. Closing the reminder is what clears the alert; the next sweep
  resolves it as `source_cleared`.
- **Do not add sorting or search controls** — this API has neither `ordering`
  nor `search`.
- **Do not compute a due date from the browser clock.** Use `nepalToday()`.
- **Do not add a `/admin/reminders` route.** Reminders live on the record they
  belong to; the dashboard card is the worklist.
- **Do not open `ReminderFormModal` for a closed reminder** — a `PATCH` on one is
  a 409, and there is no reopen.
- **Do not drop the `REMINDER_LAYER` z-indexes**, and in particular do not
  remove `popoverProps` from the date field — that is the one that makes the
  calendar visible at all inside a modal. Do not build a second reminders
  surface either; reuse `RecordRemindersPanel`.
- **Do not put history back on the card.** It is a scanning surface. If a
  history view is wanted it needs its own home; note that the shared
  `HistoryTable` is a poor fit inside a profile column (`minWidth={560}` forces
  horizontal scrolling).
- **Do not replace the Open/All tabs with a `SegmentedControl`** or re-derive
  the counts anywhere else — the tab strip is the one place they render.
- Do not fetch in `useEffect`; do not import Mantine directly.

## Known gaps (from the contract)

- **No bulk actions.** Completing five reminders is five requests.
- **No user UUIDs** — only `created_by_username`/`closed_by_username`, so no
  avatars or profile links without an out-of-band lookup.
- **The nightly sweep's run time is not exposed.** "The alert appears on the due
  date" means "after that night's sweep"; never print an expected time.
- **Near midnight NPT** a browser-computed bucket can briefly disagree with the
  server. Accepted, and disclosed on the dashboard card.

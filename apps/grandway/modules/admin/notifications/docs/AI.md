# Notifications Module — AI Navigation Map

## Purpose

The in-app alert stream: deadlines and lifecycle events from other modules turned into
a per-person inbox. Owns no business state — every row points at a record another
module owns. Backend base path is `/api/v1/notifications/`. Contract:
`apps/grandway/docs/backend/notifications/`.

## Module type

ModalModule — **no route of its own**. The inbox is a right-hand `Drawer` opened from
the sidebar bell; there is no `/admin/notifications` page (removed 2026-08-01 — alerts
are glanced at and cleared without leaving the current screen, and every row already
links out to the record it concerns). No create/edit forms; every write is a bodyless
`POST /<id>/<verb>/` action (§7).

## Entry points

| Surface          | Export               | Component                                        |
| ---------------- | -------------------- | ------------------------------------------------ |
| Sidebar bell     | `NotificationDrawer` | drawer/NotificationDrawer/NotificationDrawer.tsx |
| Drawer body      | `NotificationFeed`   | \_shared/NotificationFeed/NotificationFeed.tsx   |
| Per-record embed | `RecordAlertsPanel`  | \_shared/RecordAlertsPanel/RecordAlertsPanel.tsx |

`layouts/admin/Admin.tsx` owns the drawer's open state and passes
`onNotificationsClick` into `buildAdminConfig` — the bell nav item carries `onClick`,
not `href`. It is mounted only when `canAccessNotifications`, so `RequireLeadAccess`
(which renders a full-page denial) is deliberately NOT used inside the drawer.

## Access (critical)

Stricter than every other Grandway module: every endpoint is scoped to the caller's
OWN feed, for any authority — there is no way to read or act on another user's
notifications, and no `?recipient=` filter exists. `superadmin` is refused all seven
endpoints. `RequireLeadAccess` (admin + lead_manager, excludes superadmin) is reused
here since it happens to match this domain's gate exactly.

## Read/act-only — no create, no update, no delete

There is no compose screen anywhere in the product and no create endpoint (§7 — all
seven endpoints accept no request body). The only writes are the four action verbs:
`read`, `unread`, `dismiss`, and the bulk `read-all`. Do not add a create/edit form or
a modal here.

## Data layer (module root)

| File                       | Holds                                                                                                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| notifications.types.ts     | `Notification` (identical list/detail), `FeedSummary`, `BulkReadResult`, filters. **15 declared types since backend v1.1.0** — `custom_reminder` is the newest, and the only one a _user_ ultimately causes |
| notifications.labels.ts    | Type/priority/due-bucket label, color, and icon maps                                                                                                                                                        |
| notifications.queryKeys.ts | `notificationQueryKeys` (`createQueryKeys`) + `summaryKey` (own cache slot)                                                                                                                                 |
| notifications.api.ts       | `createResourceApi<Notification, never, never>` + hand-rolled summary/read-all                                                                                                                              |
| notifications.hooks.ts     | `useNotificationSummary` (polled), `useNotificationList`, action mutations                                                                                                                                  |
| notifications.utils.ts     | Date formatting, `groupByDueBucket`/`orderedDueBucketGroups`, `resolveNotificationLink`                                                                                                                     |

- `TCreate`/`TUpdate` are `never` on the resource — there is nothing to create or
  update, so those methods can never be called by accident.
- `summaryKey()` is a distinct cache slot (`["notifications.summary", ...]`), NOT
  nested under `notificationQueryKeys` — `FeedSummary` is a different resource shape
  entirely from the feed row.
- **No ordering parameter exists anywhere in this API** (§9, the feed's most
  consequential gap). Do not add column-header sorting — it would silently do
  nothing. Rows are always newest-created first.
- **`due_within_days` shifts the due-bucket boundary per request** — never issue
  three filtered requests to split "overdue/due soon/later"; fetch once with
  `status=active` and group client-side with `orderedDueBucketGroups` (one clock).

## Common edit targets

| Task                                   | Files                                              |
| -------------------------------------- | -------------------------------------------------- |
| Inbox grouping / states                | \_shared/NotificationFeed/NotificationFeed.tsx     |
| Drawer chrome / mark-all-read lever    | drawer/NotificationDrawer/NotificationDrawer.tsx   |
| Per-row rendering + read/dismiss lever | \_shared/NotificationRow/NotificationRow.tsx       |
| Embeddable per-record alerts panel     | \_shared/RecordAlertsPanel/RecordAlertsPanel.tsx   |
| Source-triple → frontend route mapping | notifications.utils.ts (`resolveNotificationLink`) |
| Type/priority/due-bucket labels+colors | notifications.labels.ts                            |
| DTO shapes / API / keys / mutations    | notifications.{types,api,queryKeys,hooks}.ts       |

## Inbox (drawer)

- `useNotificationList({ status: "active", page_size: 100 })` — the working feed.
  Omitting `status` would also return dismissed/resolved history (§3), wrong for
  this screen.
- Grouped **client-side** into overdue / due soon / later / no-due-date via
  `orderedDueBucketGroups` — never three separate filtered requests (see above).
- "Mark all as read" (`useMarkAllRead`) clears **every** unread row including
  dismissed/resolved ones; `active` does not change. Never disable the button on
  `marked_read: 0` — that's a normal, valid result.
- The drawer header is fixed and carries "Mark all as read"; only the feed scrolls
  (`scrollAreaComponent={ScrollArea.Autosize}`), so the lever stays reachable.
- No pagination UI — a generous single page (`page_size: 100`, the API max) is
  fetched, with a truncation notice below the max. No consumer has asked for a
  pager yet; add one if the truncation notice starts showing up in practice.

## Row behavior (`NotificationRow`)

- Reused by both the inbox and `RecordAlertsPanel` — each rendered row is its own
  component instance and calls its own `useMarkRead`/`useDismiss` hooks directly
  (no id/callback prop-drilling needed).
- "View record" only renders when `resolveNotificationLink` can build a real
  frontend route from `notification_type` + `source_entity_type` +
  `source_entity_id` — **never parse `source_api_path`**.
- **`custom_reminder` is the one type whose link is a component, not a route.**
  Its `source_entity_id` is a _reminder_ id, there is no `/admin/reminders/<id>`
  route, and the payload names nothing about the applicant or client the
  follow-up concerns — so `resolveNotificationLink` returns `null` for it by
  design and the row renders `<ReminderAlertLink>` from
  `@/modules/admin/reminders/_shared/ReminderAlertLink` instead. That component
  _fetches_ the reminder to find its owner rather than guessing a URL from an
  id. It takes `onNavigate`, which the row wires to the same mark-as-read
  handler the generic link uses. Degrades to no link
  (title/body only) for `checklist_item_due`/`checklist_item_overdue` and the
  `checklist_item`-shaped `assignment_received` case, because `source_entity_id`
  there is the checklist ITEM id, not the parent checklist id the frontend route
  needs — do not guess a URL from an item id.
- Dismiss (`status === "active"` only) asks for confirmation first on
  `high`/`urgent` rows — irreversible, no un-dismiss, no snooze (§9).
- Body is rendered as a plain React text node (`{notification.body}`) — never
  `dangerouslySetInnerHTML`. The contract is explicit `body` is plain English text,
  not HTML.

## `RecordAlertsPanel` (embeddable)

- Props: `{ sourceEntityId: string }`. Calls `useNotificationList({ source_entity_id })`
  — **omits `status` deliberately**, showing the record's full alert history
  (active + dismissed + resolved), not just the working inbox.
- Titled **"Your alerts for this record"**, never "All alerts" — it only returns
  alerts addressed to the calling user. A cross-user history is `audit`, not this
  module.
- Not yet embedded anywhere — Phase 4 (cross-module wiring, orchestrator-owned)
  adds it to `ApplicantDetail`/`OfferDetail`/`JourneyDetail`.

## Polling (badge)

- `useNotificationSummary()` — the only sanctioned poll in this module (no push
  channel exists, §9). `refetchInterval: 30_000`, paused when the tab is hidden,
  refreshed on refocus. Exported from the module barrel for the orchestrator's
  later bell-badge wiring in `Admin.tsx`/`admin-nav.ts` — **do not wire the bell
  itself here**, that's a different phase/file.
- Drive any badge from `unread`, never `active` — `unread` counts unread rows in
  ANY status and is what "mark all read" drives to zero; `active` does not move on
  mark-all-read and would make that button look broken.

## Known risk / unverified

- `resolveNotificationLink`'s `/admin/checklists/<id>` path (for `missing_documents`
  and the `checklist`-shaped `assignment_received`) assumes the checklists module
  (built concurrently by a sibling agent) exposes a detail route at that exact
  pattern. Verify once that module lands; if it differs, fix only
  `notifications.utils.ts`.
- `due_at_bs`'s exact field shape isn't spelled out in `INTEGRATION.md` (just
  `"due_at_bs?: json"`) — `BsDate` here mirrors the flatter shape `offers`/
  `documents` use (`year/month/day/month_name/display`). If the real payload
  disagrees, fix only the `BsDate` interface in `notifications.types.ts`.

## Do not do

- Do not add a create/edit form or any write beyond the four action verbs — there is
  no compose surface in this domain, ever. (The drawer is the read surface, not an
  exception to this.)
- Do not re-add a `/admin/notifications` route — the bell opens the drawer.
- Do not add column-header sorting/ordering controls — no `ordering` parameter
  exists on this API.
- Do not issue separate filtered requests per due bucket — group one response
  client-side (`due_within_days` makes multiple requests inconsistent).
- Do not parse `source_api_path` for routing — route on `notification_type` +
  `source_entity_type` (`resolveNotificationLink`).
- Do not render `body` as HTML.
- Do not add a `case "custom_reminder"` to `resolveNotificationLink` returning
  `/admin/reminders/<id>` — that route does not exist, and the id is the
  reminder's, not the record's.
- Do not dismiss a `custom_reminder` on the reader's behalf after its reminder
  is completed. Closing the reminder is what clears the alert; the next nightly
  sweep resolves it as `source_cleared`.
- Do not add a `?recipient=`/"notifications for user X" filter — the backend has
  none, by design (own-feed-only, absolute).
- Do not fetch in `useEffect`; do not import Mantine directly.

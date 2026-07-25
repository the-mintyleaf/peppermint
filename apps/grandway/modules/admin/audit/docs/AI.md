# Audit Module — AI Navigation Map

## Purpose

The immutable activity/change log for Grandway — actor, scope, action, time,
reason, source, and old/new values for every important write across every
other module. Read-only from the frontend's perspective: there is no create
endpoint here; events are appended by other apps via an internal service
call. Backend base path `/api/v1/audit/events/`. Contract:
`apps/grandway/docs/backend/audit/{INTEGRATION,CONCEPT,FLOWS}.md`.

## Module type

ContainedModule — one list route, no create/edit modals (nothing here is
writable), a detail drawer instead of a detail page.

## Routes

| Route        | Entry export   | Component                          | Guard          |
| ------------ | -------------- | ---------------------------------- | -------------- |
| /admin/audit | `AuditLogList` | events/pages/list/AuditLogList.tsx | `RequireStaff` |

Access is **admin/superadmin only** — the one module in this set where
`superadmin` is included and `lead_manager` is excluded, the mirror image of
every other admin/lead_manager-shared module in this app
(`audit/docs/backend/INTEGRATION.md` §1).

## Entry files

- `index.ts` — exports `AuditLogList` (the list page — **not** `Module`-prefixed;
  this predates the `Module*` naming convention adopted for later modules in
  this app. Left as-is per this pass's verify-only scope — do not rename
  without also updating `app/admin/audit/page.tsx`'s import and re-checking
  for other consumers first), `useEntityAuditTrail`, and the `AuditEvent` type.
- `_shared/useEntityAuditTrail.ts` — **the cross-module embed point.** Any
  module wanting "history for this one record" calls
  `useEntityAuditTrail(entityType, entityId)` rather than re-deriving the
  filter shape. Newest-first, capped at 100 rows (no further paging built).

## Data layer (`_shared/`)

| File                     | Holds                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `audit.types.ts`         | `AuditEvent`, `AuditActorType` (5 values incl. `system`/`ai`), `AuditEventFilters`               |
| `auditQueryKeys.ts`      | `auditQueryKeys` via `createQueryKeys("audit.events")`                                           |
| `audit.api.ts`           | `fetchAuditEvents(params)` (paginated, `meta.count → total`), `getAuditEvent(id)`                |
| `useEntityAuditTrail.ts` | The reusable "one entity's history" hook — the template other modules' embedded-trail hooks copy |

- **No mutation functions anywhere in this module** — there is no write API;
  do not scaffold create/update/delete "for completeness."
- **No free-text search and no ordering param on the backend.** `fetchAuditEvents`
  deliberately never forwards `params.search`; the list's search box is left
  as a dead control (documented inline in `AuditLogList.tsx`) rather than
  silently mis-filtering, since the shell has no prop to hide search alone.
- Filters are exact-match, AND-combined only (`AuditEventFilters`) — no
  partial/substring matching on any field.

## Common edit targets

| Task                                       | Files                                                  |
| ------------------------------------------ | ------------------------------------------------------ |
| Embed "history for this record" elsewhere  | Import `useEntityAuditTrail` from this module's barrel |
| List columns                               | `events/pages/list/auditEvents.columns.tsx`            |
| Detail drawer                              | `events/pages/list/components/EventDetailDrawer/`      |
| List page / deep-link filters (URL params) | `events/pages/list/AuditLogList.tsx`                   |
| DTO shapes / API / keys                    | `_shared/{audit.types,audit.api,auditQueryKeys}.ts`    |

## Domain rules encoded here

- **`changes` is a compact before/after map**, `{}` when nothing changed
  (informational/read events). Don't assume every event carries a diff.
- **`actor_type` includes `system` and `ai`**, not just the three human
  authority tiers — a row with no human actor is normal, not a data error.
- **`metadata` is an open, non-secret bag** — AI provenance for
  `actor_type: "ai"` rows. Never assume a fixed shape.

## State ownership

- Server data: React Query (`useQuery`); no `useEffect` fetching.
- Deep-link filters (`actor_id`/`entity_type`/`entity_id`): URL search params,
  read via `useSearchParams()` and passed as `forceFilters` — shareable/bookmarkable.
- Detail drawer open state: local `useState`.

## Do not do

- Do not add a create/update/delete mutation — this module has no write API.
- Do not build a free-text search box that forwards to the backend — it has
  none; only the exact-match filters in `AuditEventFilters` are real.
- Do not assume every entity has a corresponding audit trail row set at
  `useEntityAuditTrail`'s 100-row cap is exhaustive for very busy records —
  no further paging is implemented yet.
- Do not fetch in `useEffect`; do not import Mantine directly.

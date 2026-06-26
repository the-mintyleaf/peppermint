# History Module — AI Navigation Map

## Purpose

Read-only event audit trail for an organisation — shows all `OrganizationEventLog` rows for the org, newest first, with event-type and actor filters.

## Module type

ContainedModule (read-only — no mutations anywhere)

## Route

`/admin/organization/[id]/event-log`

## Entry files

- `HistoryList.tsx`
- `index.ts`

## Common edit targets

| Task                        | Files                                   |
| --------------------------- | --------------------------------------- |
| Page layout + filter wiring | `pages/list/HistoryList.tsx`            |
| Event list UI (rows, diffs) | `_shared/EventLogList/EventLogList.tsx` |
| API function                | `history.api.ts`                        |
| Query key                   | `history.queryKeys.ts`                  |
| useHistory hook             | `history.hooks.ts`                      |
| Types                       | `history.types.ts`                      |

## State ownership

- Server data: React Query (`historyQueryKeys.list(orgId, params)`)
- Local UI state: `useState` (page, filters)

## Key patterns

- `orgId` from `useParams<{ id: string }>()`
- No `ModalTableShell` — uses `EventLogList` from `_shared/` directly
- Pagination: `page` state → `useHistory` params → `EventLogList.onPageChange`
- Filters reset page to 1 on change

## Do not do

- Do not add any mutation (no create, update, delete, revoke)
- Do not add `ModalTableShell` — this module does not use the shell
- Do not fetch data in `useEffect`
- Do not import from `@mantine/*` directly

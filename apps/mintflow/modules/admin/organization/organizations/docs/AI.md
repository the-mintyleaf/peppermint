# Organizations Module — AI Navigation Map

## Purpose

Manages organizational entity CRUD (ministry, agency, department, etc.) with status lifecycle via modal dialogs.

## Module type

ContainedModule

## Route

`/admin/organization`

## Entry files

- `index.ts` — exports `ModuleOrganizations`
- `pages/list/OrganizationsList.tsx` — main component

## Common edit targets

| Task                 | File                                                          |
| -------------------- | ------------------------------------------------------------- |
| List UI / tabs       | `pages/list/OrganizationsList.tsx`                            |
| Column definitions   | `pages/list/organizations.columns.tsx`                        |
| Create / edit form   | `form/OrganizationsForm.tsx`                                  |
| Status change action | `pages/list/OrganizationsList.tsx` + `organizations.hooks.ts` |
| API functions        | `organizations.api.ts`                                        |
| Query keys           | `organizations.queryKeys.ts`                                  |
| Types                | `organizations.types.ts`                                      |

## State ownership

- Server data: React Query (managed by `ModalTableShell`)
- Status change mutation: `useChangeOrganizationStatus` in `organizations.hooks.ts`
- Status dialog open/close: `useState` in `OrganizationsList.tsx`

## Status lifecycle

`draft → active | archived`
`active → inactive | suspended | archived`
`inactive → active | archived`
`suspended → active | inactive | archived`
`archived → (terminal — no transitions)`

Status changes go via `POST /api/v1/organization/organizations/<id>/status/` with `{ status, reason }`.
The `ReasonConfirmDialog` from `_shared` handles the confirm-with-reason UX.

## Do not do

- Do not add status as a form field in `OrganizationsForm` — status changes are a separate action
- Do not fetch data in `useEffect`
- Do not import from `@mantine/*` directly — always use `@peppermint/ui`
- Do not create separate routes for new/edit/view — all interactions are modals within the list

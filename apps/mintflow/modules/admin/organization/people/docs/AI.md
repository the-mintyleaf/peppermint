# People Module — AI Navigation Map

## Purpose

Manages organization membership (linking users to an org) with add-member modal, profile drawer showing unit/position placements, and task-verb status lifecycle actions.

## Module type

ContainedModule (org-scoped)

## Route

`/admin/organization/[id]/members`

## Entry files

- `index.ts` — exports `ModulePeople`
- `pages/list/PeopleList.tsx` — main component

## Common edit targets

| Task                               | File                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| List UI / tabs                     | `pages/list/PeopleList.tsx`                              |
| Column definitions                 | `pages/list/people.columns.tsx`                          |
| Add member form                    | `form/PeopleForm.tsx`                                    |
| Profile drawer                     | `components/PeopleProfileDrawer/PeopleProfileDrawer.tsx` |
| Status transitions / action labels | `people.constants.ts`                                    |
| Status change mutation             | `people.hooks.ts`                                        |
| API functions                      | `people.api.ts`                                          |
| Query keys                         | `people.queryKeys.ts`                                    |
| Types                              | `people.types.ts`                                        |

## State ownership

- Server data: React Query (managed by `ModalTableShell` + `usePersonDetail`)
- Status change mutation: `useChangeMembershipStatus` in `people.hooks.ts`
- Profile drawer + status dialog: `useState` in `PeopleList.tsx`

## Status lifecycle

`invited → active | ended | archived`
`active → inactive | suspended | ended | archived`
`inactive → active | ended | archived`
`suspended → active | inactive | ended | archived`
`transferred → ended | archived`
`ended → (terminal)`
`archived → (terminal)`

Status changes go via `PATCH /api/v1/organization/memberships/<id>/status/` with `{ status, reason }`.
Destructive transitions (`suspended`, `ended`, `archived`) require `ReasonConfirmDialog`.

## Do not do

- Do not add an edit modal — membership changes are status actions, not inline edits
- Do not add delete — memberships end via status transition
- Do not create separate `/new` or `/[memId]` routes
- Do not fetch data in `useEffect`
- Do not import from `@mantine/*` directly — always use `@peppermint/ui`
- Do not touch `organization-tree/`

# Delegations Module — AI Navigation Map

## Purpose

Manage authority delegations within an organisation — create, view, and revoke temporary transfers of organisational authority between position assignments.

## Module type

ContainedModule

## Route

`/admin/organization/[id]/delegations`

## Entry files

- `DelegationsList.tsx` (list + create modal + view drawer + revoke dialog)
- `index.ts`

## Common edit targets

| Task             | Files                                |
| ---------------- | ------------------------------------ |
| List columns     | `pages/list/delegations.columns.tsx` |
| List + drawer UI | `pages/list/DelegationsList.tsx`     |
| Create form      | `form/DelegationsForm.tsx`           |
| API functions    | `delegations.api.ts`                 |
| Query keys       | `delegations.queryKeys.ts`           |
| Types            | `delegations.types.ts`               |
| Revoke mutation  | `delegations.hooks.ts`               |

## State ownership

- Server data: React Query (`delegationsQueryKeys.list(orgId)`)
- Local UI state: `useState` (viewDelegation, revokeTarget)

## Key patterns

- `orgId` read from `useParams<{ id: string }>()` — always include in queryKey
- Create: `ModalTableShell` + `DelegationsForm` + `onCreateApi`
- View detail: `onReviewClick` → right-side `Drawer`
- Revoke: `ReasonConfirmDialog` (reason required) + `useRevokeDelegation(orgId)` hook
- No edit, no delete
- `fetchAssignmentOptions` in `delegations.api.ts` provides mock position assignment data for `PositionPicker` in the form

## Do not do

- Do not add edit form (`editFormComponent`) — delegations are immutable after creation
- Do not add delete — only revoke is permitted
- Do not fetch data in `useEffect`
- Do not import from `@mantine/*` directly

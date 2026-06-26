# Positions Module — AI Navigation Map

## Purpose

Read-only catalog of organisational positions scoped to one org, with deactivate action.

## Module type

ContainedModule (read + deactivate only — no create, no edit)

## Route

`/admin/organization/[id]/positions`

## Entry files

- `index.ts` — exports `ModulePositions`
- `pages/list/PositionsList.tsx` — main component

## Common edit targets

| Task                | File                                                  |
| ------------------- | ----------------------------------------------------- |
| List UI / tabs      | `pages/list/PositionsList.tsx`                        |
| Column definitions  | `pages/list/positions.columns.tsx`                    |
| View drawer content | `pages/list/PositionsList.tsx` (`<Drawer>` block)     |
| Deactivate action   | `pages/list/PositionsList.tsx` + `positions.hooks.ts` |
| API functions       | `positions.api.ts`                                    |
| Query keys          | `positions.queryKeys.ts`                              |
| Types               | `positions.types.ts`                                  |

## State ownership

- Server data: React Query (managed by `ModalTableShell`)
- Deactivate mutation: `useDeactivatePosition` in `positions.hooks.ts`
- View drawer: `useState<Position | null>` in `PositionsList.tsx`
- Deactivate dialog: `useState<Position | null>` in `PositionsList.tsx`

## OrgId scope

Reads `id` from `useParams<{ id: string }>()`. The orgId is part of the queryKey and passed to `fetchPositions(orgId, params)` via closure.

## Do not do

- Do not add a create form — slot creation belongs to the Organization Builder canvas
- Do not add edit functionality — positions are managed via the Builder
- Do not fetch data in `useEffect`
- Do not import from `@mantine/*` directly — always use `@peppermint/ui`

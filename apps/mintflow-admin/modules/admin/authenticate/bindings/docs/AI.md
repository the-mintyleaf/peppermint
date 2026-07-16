# Bindings Module — AI Navigation Map

## Purpose

Assign roles to users under a scope (`PermissionRoleBinding`), fronting the
Django `permissions` app. Split out of the former `roles-bindings/` tab
module — Roles and Bindings are now independent sibling sub-modules, not tabs.

## Module type

ContainedModule. Single route, staff-gated, `ModuleHeader` + `ModalPaper` +
`ModalTableShell`.

## Route

`/admin/authenticate/bindings`

## Entry files

- `pages/BindingsList.tsx` — `BindingsList` (`RequireStaff` wrapper) →
  `BindingsListContent` (`ModuleHeader` + `ModalPaper` + `ModalTableShell`).
- `index.ts` — exports `ModuleBindings`.
- `app/admin/authenticate/bindings/page.tsx` — one-line re-export.

## Common edit targets

| Task                       | Files                                                                 |
| -------------------------- | --------------------------------------------------------------------- |
| Bindings list UI / columns | `pages/BindingsList.tsx`, `bindings.columns.tsx`                      |
| Binding create form        | `form/RoleBindingForm.tsx` (uses shared `UserPicker` + `ScopeFields`) |
| Binding queries / API      | `bindings.queryKeys.ts`, `bindings.api.ts`                            |
| Binding types              | `bindings.types.ts`                                                   |

## State ownership

- Server data (bindings): React Query.
- Revoke-reason input, scope form fields: local `useState` / `@mantine/form`.

## Backend contract notes

- All endpoints under `/api/v1/permissions/` are staff-only.
- Bindings have no edit/PATCH endpoint — create + revoke only. `BindingsList`
  has no `editFormComponent`/`onDeleteApi`; revoke is a custom row action
  (`POST .../role-bindings/<id>/revoke/`) enabled only when
  `status === "active"`.
- `ModalTableShell` uses `enableServerQuery`, `dataKey="data"`,
  `paginationKey="meta"`; `bindings.api.ts` remaps `meta.count` → `meta.total`.

## Do not do

- Do not fetch data in `useEffect`.
- Do not import Mantine directly — use `@peppermint/ui`.
- Do not add an edit form for bindings — there is no PATCH endpoint.
- Do not add `onDeleteApi` (bindings are revoked, not deleted).

## Known deviation from a prior spec

An earlier task asked for a new `BindingScopeFields.tsx`. `_shared/ScopeFields`
(backed by `_shared/authenticate.types.ts#ScopeValue` and
`_shared/organizationScope.api.ts`) already implements that exact scope UI, so
`RoleBindingForm` reuses it instead of duplicating it.

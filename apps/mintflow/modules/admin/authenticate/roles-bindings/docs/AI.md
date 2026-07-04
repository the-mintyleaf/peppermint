# Roles & Bindings Module — AI Navigation Map

## Purpose

Manage reusable permission-key packages (`PermissionRole`) and assign them
to users under a scope (`PermissionRoleBinding`), fronting the Django
`permissions` app.

## Module type

ContainedModule (single route, two tabs — a UI/navigation merge only; Roles
and Bindings are two distinct backend resources with their own list, create,
and action calls, each represented by its own `ModalTableShell`).

## Route

/admin/authenticate/roles-bindings

## Entry files

- `RolesBindingsView.tsx` — top-level component, staff-gated, renders the
  `Tabs` shell wrapping `roles/pages/RolesList.tsx` and
  `bindings/pages/BindingsList.tsx`.
- `index.ts`

## Common edit targets

| Task                                   | Files                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| Roles list UI / columns                | `roles/pages/RolesList.tsx`, `roles/roles.columns.tsx`                         |
| Role create / edit forms               | `roles/form/RoleForm.tsx`, `roles/form/RoleEditForm.tsx`                       |
| Role Permission Editor (attach/detach) | `roles/pages/components/RolePermissionsDrawer/RolePermissionsDrawer.tsx`       |
| Role queries / API                     | `roles/roles.queryKeys.ts`, `roles/roles.api.ts`                               |
| Role types                             | `roles/roles.types.ts`                                                         |
| Bindings list UI / columns             | `bindings/pages/BindingsList.tsx`, `bindings/bindings.columns.tsx`             |
| Binding create form                    | `bindings/form/RoleBindingForm.tsx` (uses shared `UserPicker` + `ScopeFields`) |
| Binding queries / API                  | `bindings/bindings.queryKeys.ts`, `bindings/bindings.api.ts`                   |
| Binding types                          | `bindings/bindings.types.ts`                                                   |
| Tab shell / staff gate                 | `RolesBindingsView.tsx`                                                        |

## State ownership

- Server data (roles, bindings, role-permissions): React Query
- Drawer open state, revoke-reason input, scope form fields: local `useState`
  / `@mantine/form`

## Backend contract notes

- All endpoints under `/api/v1/permissions/` are staff-only.
- Roles are never deleted, only deprecated (`POST .../roles/<id>/deprecate/`)
  — `RolesList` has no `onDeleteApi`, which disables the delete button.
  Deprecating does **not** retroactively revoke existing bindings; the
  confirm-modal copy says so explicitly.
- Bindings have no edit/PATCH endpoint — create + revoke only. `BindingsList`
  has no `editFormComponent`/`onDeleteApi`; revoke is a custom row action
  (`POST .../role-bindings/<id>/revoke/`) enabled only when
  `status === "active"`.
- `ModalTableShell` requires `enableServerQuery`, `dataKey="data"`, and
  `paginationKey="meta"` against this backend's `{data, meta:{count}}`
  envelope — the wrapper's server total reads `meta.total`, so both
  `roles.api.ts` and `bindings.api.ts` remap `meta.count` → `meta.total`.

## Do not do

- Do not fetch data in `useEffect`.
- Do not import Mantine directly — use `@peppermint/ui`.
- Do not add `onDeleteApi` to either list (roles are deprecated, not
  deleted; bindings are revoked, not deleted).
- Do not add an edit form for bindings — there is no PATCH endpoint.
- Do not wrap `RolesList`/`BindingsList` in their own `ModalPaper` — the
  single `ModalPaper` lives in `RolesBindingsView.tsx` around the `Tabs`.

## Known deviation from a prior spec

An earlier task description asked for a new `bindings/BindingScopeFields.tsx`.
`_shared/ScopeFields` (backed by `_shared/authenticate.types.ts#ScopeValue`
and `_shared/organizationScope.api.ts`) already implements that exact scope
UI against the same two organization endpoints, so `RoleBindingForm` reuses
it instead of duplicating it.

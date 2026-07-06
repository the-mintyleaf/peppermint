# Roles Module — AI Navigation Map

## Purpose

Manage reusable permission-key packages (`PermissionRole`), fronting the Django
`permissions` app. Split out of the former `roles-bindings/` tab module — Roles
and Bindings are now independent sibling sub-modules, not tabs.

## Module type

ContainedModule. Single route, staff-gated, `ModuleHeader` + `ModalPaper` +
`ModalTableShell` (the standard authenticate list pattern).

## Route

`/admin/authenticate/roles`

## Entry files

- `pages/RolesList.tsx` — `RolesList` (`RequireStaff` wrapper) →
  `RolesListContent` (`ModuleHeader` + `ModalPaper` + `ModalTableShell` +
  `RolePermissionsDrawer`).
- `index.ts` — exports `ModuleRoles`.
- `app/admin/authenticate/roles/page.tsx` — one-line re-export.

## Common edit targets

| Task                                   | Files                                                              |
| -------------------------------------- | ------------------------------------------------------------------ |
| Roles list UI / columns                | `pages/RolesList.tsx`, `roles.columns.tsx`                         |
| Role create / edit forms               | `form/RoleForm.tsx`, `form/RoleEditForm.tsx`                       |
| Role Permission Editor (attach/detach) | `pages/components/RolePermissionsDrawer/RolePermissionsDrawer.tsx` |
| Role queries / API                     | `roles.queryKeys.ts`, `roles.api.ts`                               |
| Role types                             | `roles.types.ts`                                                   |

## State ownership

- Server data (roles, role-permissions): React Query.
- Permissions-drawer open state: local `useState`.

## Backend contract notes

- All endpoints under `/api/v1/permissions/` are staff-only.
- Roles are never deleted, only deprecated (`POST .../roles/<id>/deprecate/`) —
  `RolesList` has no `onDeleteApi`, which disables the delete button.
  Deprecating does **not** retroactively revoke existing bindings; the
  confirm-modal copy says so and points to the Bindings screen.
- `ModalTableShell` uses `enableServerQuery`, `dataKey="data"`,
  `paginationKey="meta"` against the `{data, meta:{count}}` envelope;
  `roles.api.ts` remaps `meta.count` → `meta.total`.

## Do not do

- Do not fetch data in `useEffect`.
- Do not import Mantine directly — use `@peppermint/ui`.
- Do not add `onDeleteApi` (roles are deprecated, not deleted).
- Do not re-merge Roles and Bindings into one tabbed screen.

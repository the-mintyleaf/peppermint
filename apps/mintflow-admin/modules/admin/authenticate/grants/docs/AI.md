# Grants Module — AI Navigation Map

## Purpose

Staff UI for the `permissions` app's direct-access grants: granting individual
permissions directly to a user, outside of role assignment (`PermissionGrant`).
Split out of the former `direct-access/` tab module — Grants and Denials are now
independent sibling sub-modules, not tabs.

## Module type

ContainedModule. Single route, staff-gated, `ModuleHeader` + `ModalPaper` +
`ModalTableShell`.

## Route

`/admin/authenticate/grants`

## Entry files

- `pages/GrantsList.tsx` — a `createListModule` config (the shared factory at
  `@/components/createListModule` renders `RequireStaff` + `ModuleHeader` +
  `ModalPaper` + `ModalTableShell`).
- `index.ts` — exports `ModuleGrants`.
- `app/admin/authenticate/grants/page.tsx` — one-line re-export.

## Common edit targets

| Task                  | Files                                                     |
| --------------------- | --------------------------------------------------------- |
| Grants list / columns | `pages/GrantsList.tsx`, `grants.columns.tsx`              |
| Grants form           | `form/GrantForm.tsx`                                      |
| Grants queries / API  | `grants.api.ts`, `grants.queryKeys.ts`                    |
| Grants types          | `grants.types.ts`                                         |
| Shared pickers        | `../_shared/{UserPicker,PermissionKeyPicker,ScopeFields}` |

## Backend contract

Base prefix `/api/v1/permissions/`. **All endpoints staff-only.**

- `GET grants/` (paginated, optional `?subject_user_id=`), `POST grants/`,
  `POST grants/<id>/revoke/`. `reason` optional on create — grants are
  additive, no client-side duplicate prevention. No edit endpoint.
- List returns `{data, meta:{count}}`; `grants.api.ts` normalizes `meta.count`
  → `meta.total`, requests `page_size=200`, and relies on `ModalTableShell`'s
  default client-side pagination (no `enableServerQuery`).

## Type boundary — form values vs. read entity

`Grant` is the **read** shape (`subject_user` is a nested user object). The
create payload uses `subject_user_id` (a string). `GrantForm` is typed
`ModalFormComponentProps<Grant, GrantFormValues>`, so `onSubmit` emits
`GrantFormValues` directly (no cast); `GrantsList` types the shell as
`<Grant, GrantFormValues>` and maps to `GrantCreatePayload` once at the
`onCreateApi` boundary. Do not make `Grant` double as the form's internal type.

## Row actions

Revoke is a dedicated `render` in the last ("Actions") column of
`grants.columns.tsx`, shown only when `status === "active"`. Each button owns
its own `useMutation` + `modals.openConfirmModal`. `disableReviewButton` hides
the shell's unrelated built-in bulk button.

## Do not do

- Do not merge `Grant` with `Denial` into one type or API layer — separate
  backend resources.
- Do not add `editFormComponent`/`onEditApi`/`onDeleteApi` — create + revoke
  only.
- Do not fetch in `useEffect`; do not import `@mantine/*` directly.
- Do not re-merge Grants and Denials into one tabbed screen.

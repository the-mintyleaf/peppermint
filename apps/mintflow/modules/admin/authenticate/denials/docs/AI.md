# Denials Module — AI Navigation Map

## Purpose

Staff UI for the `permissions` app's direct-access denials: denying individual
permissions directly to a user, outside of role assignment (`PermissionDeny`).
Split out of the former `direct-access/` tab module — Grants and Denials are now
independent sibling sub-modules, not tabs.

## Module type

ContainedModule. Single route, staff-gated, `ModuleHeader` + `ModalPaper` +
`ModalTableShell`.

## Route

`/admin/authenticate/denials`

## Entry files

- `pages/DenialsList.tsx` — `RequireStaff` + `ModuleHeader` + `ModalPaper` +
  `ModalTableShell`.
- `index.ts` — exports `ModuleDenials`.
- `app/admin/authenticate/denials/page.tsx` — one-line re-export.

## Common edit targets

| Task                      | Files                                          |
| ------------------------- | ---------------------------------------------- |
| Denials list / columns    | `pages/DenialsList.tsx`, `denials.columns.tsx` |
| Denials form              | `form/DenialForm.tsx`                           |
| Denials queries / API     | `denials.api.ts`, `denials.queryKeys.ts`       |
| Denials types             | `denials.types.ts`                            |
| Shared pickers            | `../_shared/{UserPicker,PermissionKeyPicker,ScopeFields}` |

## Backend contract

Base prefix `/api/v1/permissions/`. **All endpoints staff-only.**

- `GET denials/` (paginated, optional `?subject_user_id=`), `POST denials/`,
  `POST denials/<id>/revoke/`. `reason` is **required, non-blank** on create
  (validated client-side) — stricter than grants. `severity`
  (`low`/`medium`/`high`/`critical`, default `medium`) is denial-only. No edit
  endpoint.
- List returns `{data, meta:{count}}`; `denials.api.ts` normalizes `meta.count`
  → `meta.total`, requests `page_size=200`, and relies on `ModalTableShell`'s
  default client-side pagination (no `enableServerQuery`).

## Type boundary — form values vs. read entity

`Denial` is the **read** shape (`subject_user` is a nested user object). The
create payload uses `subject_user_id` (a string). `DenialForm` keeps an internal
`DenialFormValues` type and casts once at the `onSubmit` boundary
(`as unknown as Denial`); `DenialsList` casts back to `DenialCreatePayload` in
`onCreateApi`. Do not make `Denial` double as the form's internal type.

## Row actions

Revoke is a dedicated `render` in the last ("Actions") column of
`denials.columns.tsx`, shown only when `status === "active"`. Each button owns
its own `useMutation` + `modals.openConfirmModal`. `disableReviewButton` hides
the shell's unrelated built-in bulk button.

## Do not do

- Do not merge `Denial` with `Grant` into one type or API layer — separate
  backend resources.
- Do not add `editFormComponent`/`onEditApi`/`onDeleteApi` — create + revoke
  only.
- Do not fetch in `useEffect`; do not import `@mantine/*` directly.
- Do not re-merge Grants and Denials into one tabbed screen.

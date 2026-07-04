# Direct Access Module — AI Navigation Map

## Purpose

Staff UI for the `permissions` app's Phase 1 direct-access resources: granting
and denying individual permissions directly to a user, outside of role
assignment.

## Module type

ContainedModule — but with a two-tab twist: **one route fronts two distinct
backend resources.** Grants (`PermissionGrant`) and Denials (`PermissionDeny`)
are near-identical in shape (a user, a permission key, a scope, a reason, a
revoke action) but have separate endpoints, types, and mutations. This is a
UI/navigation merge, not a data merge — do not try to unify their types or
API calls.

## Route

`/admin/authenticate/direct-access`

## Entry files

- `DirectAccessView.tsx` — top-level: `RequireStaff` → `ModalPaper` → `Tabs`
  (Grants / Denials). **Owns the single `ModalPaper` for both tabs** — the
  nested `grants/pages/GrantsList.tsx` and `denials/pages/DenialsList.tsx`
  mount `ModalTableShell` directly, with no `ModalPaper` of their own. This
  deviates from the standalone ContainedModule pattern (which wraps
  `ModalTableShell` in its own `ModalPaper`) specifically because two shells
  share one `Tabs`/`ModalPaper` here.
- `index.ts` — exports `ModuleDirectAccess`.
- `app/admin/authenticate/direct-access/page.tsx` — one-line re-export.

## Sub-modules

- `grants/` — `PermissionGrant` CRUD-lite (create + revoke, no edit/delete).
- `denials/` — `PermissionDeny` CRUD-lite (create + revoke, no edit/delete).

Each sub-module is self-contained: `<name>.types.ts`, `<name>.queryKeys.ts`,
`<name>.api.ts`, `<name>.columns.tsx`, `form/<Name>Form.tsx` (+ `.types.ts` +
barrel), `pages/<Name>List.tsx`.

## Common edit targets

| Task                             | Files                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Grants list/columns              | `grants/grants.columns.tsx`                                                         |
| Grants form                      | `grants/form/GrantForm.tsx`                                                         |
| Grants queries/mutations         | `grants/grants.api.ts`, `grants/grants.queryKeys.ts`                                |
| Denials list/columns             | `denials/denials.columns.tsx`                                                       |
| Denials form                     | `denials/form/DenialForm.tsx`                                                       |
| Denials queries/mutations        | `denials/denials.api.ts`, `denials/denials.queryKeys.ts`                            |
| Tab structure                    | `DirectAccessView.tsx`                                                              |
| Shared pickers (user/perm/scope) | `../_shared/UserPicker`, `../_shared/PermissionKeyPicker`, `../_shared/ScopeFields` |

## Backend contract

Base prefix `/api/v1/permissions/`. **All endpoints staff-only.**

- `GET grants/` (paginated, optional `?subject_user_id=`), `POST grants/`,
  `POST grants/<id>/revoke/`. `reason` optional on create — grants are
  additive, no client-side duplicate prevention. No edit endpoint.
- `GET denials/` (paginated, optional `?subject_user_id=`), `POST denials/`,
  `POST denials/<id>/revoke/`. `reason` is **required, non-blank** on create
  (validated client-side too) — the one field stricter than grants. `severity`
  (`low`/`medium`/`high`/`critical`, default `medium`) is denial-only. No edit
  endpoint.

Both list endpoints return the paginated envelope `{data, meta: {count}}`
(unwrapped by `lib/api.ts`); `<name>.api.ts` normalizes `meta.count` to
`meta.total` for the shell. Each `fetchGrants`/`fetchDenials` requests
`page_size=200` and relies on `ModalTableShell`'s default client-side
pagination (no `enableServerQuery`) — there is no UI-level search/filter by
user in this module.

## Type boundary — form values vs. read entity

`Grant`/`Denial` are the **read** shapes (`subject_user` is a nested user
object). Create payloads use `subject_user_id` (a string) instead. Since
`ModalFormComponentProps<T>` forces `onSubmit`'s declared parameter type to
the list entity (`Grant`/`Denial`), `GrantForm`/`DenialForm` keep an internal
`GrantFormValues`/`DenialFormValues` type (the true create-payload shape) and
cast once at the `onSubmit` boundary (`as unknown as Grant`). `GrantsList.tsx`
/`DenialsList.tsx` cast back to `GrantCreatePayload`/`DenialCreatePayload` in
`onCreateApi`. Do not try to make `Grant`/`Denial` double as the form's
internal type — the shapes genuinely differ.

## Row actions

Revoke is **not** the shell's built-in bulk "Review" action — it's a
dedicated `render` in the last ("Actions") column of each `columns.tsx`,
showing a per-row Revoke button only when `status === "active"` (otherwise an
em-dash). Each button owns its own `useMutation` + `modals.openConfirmModal`
and invalidates its module's query key on success. `disableReviewButton` is
set on both `ModalTableShell`s to hide the unrelated built-in bulk button.

## State ownership

- Server data: React Query, via each sub-module's `.api.ts` / `.queryKeys.ts`.
- Form state: `@mantine/form` via `@peppermint/ui`'s `useForm`.
- No local/global UI state beyond the active tab (owned by Mantine `Tabs`).

## Do not do

- Do not merge `Grant` and `Denial` into one type or one set of API
  functions — they are separate backend resources.
- Do not add `editFormComponent`/`onEditApi`/`onDeleteApi` — neither
  resource has PATCH/DELETE endpoints; create + revoke only.
- Do not wrap `GrantsList`/`DenialsList` in their own `ModalPaper` —
  `DirectAccessView` already provides one for both tabs.
- Do not fetch data in `useEffect`.
- Do not import from `@mantine/*` directly.

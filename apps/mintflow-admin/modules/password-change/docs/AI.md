# Password Change Module — AI Navigation Map

## Purpose

Forced password-change page for an already-authenticated user who must set a
new password (temporary password issued by staff, or a
`password_change_required` flag) before they can reach `/admin`.

## Module type

RouteModule — owns its own layout (`layouts/app/App.tsx`), sits outside the
admin shell, and has no nav entry.

## Route

`/password-change`

## Entry files

- `PasswordChange.tsx` — exports `ModulePasswordChange`; thin wrapper around
  the shared `ChangePasswordForm`.
- `index.ts` — barrel, exports `ModulePasswordChange`.
- `app/password-change/page.tsx` — one-line re-export.

## Common edit targets

| Task                                      | Files                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| Heading / context copy                    | `PasswordChange.tsx`                                                            |
| Form fields, validation, submit, API call | `modules/admin/authenticate/_shared/ChangePasswordForm/` (shared — do not fork) |
| Post-success redirect                     | `PasswordChange.tsx` (`onSuccess` passed to `ChangePasswordForm`)               |

## Backend endpoint

- `POST /api/v1/auth/change-password/` `{old_password, new_password}` — see
  `ChangePasswordForm.api.ts` for the request. Handles
  `AUTH_PASSWORD_INVALID` (old password field error) and
  `AUTH_PASSWORD_REUSE_BLOCKED` (new password field error).

## State ownership

- All form state, validation, and the mutation live inside the shared
  `ChangePasswordForm` component — this module owns none of it directly.
- On success, `window.location.href = "/admin"`.

## Do not do

- Do not rebuild the password form here — always use the shared
  `ChangePasswordForm` from `modules/admin/authenticate/_shared/`.
- Do not fetch data in `useEffect`.
- Do not import from `@mantine/*` directly — always `@peppermint/ui`.

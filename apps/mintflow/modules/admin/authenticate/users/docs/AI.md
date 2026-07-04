# Users Module — AI Navigation Map

## Purpose

Staff-facing management of `authenticate` app user/actor records — create,
edit, enable/disable login, lock/unlock, force a password change, set a
temporary password, and drill into a per-user detail view (sessions, auth
events, MFA, service-account credentials).

## Module type

ContainedModule (`ModalTableShell`, single route, create/edit in modals).

## Route

`/admin/authenticate/users`

## Entry files

- `pages/list/UsersList.tsx` — mounts `ModalTableShell` inside `ModalPaper`,
  wrapped in `RequireStaff`. Owns the `detailUser` state that opens
  `UserDetailDrawer`.
- `index.ts` — exports `ModuleUsers`.
- `app/admin/authenticate/users/page.tsx` — one-line re-export.

## Common edit targets

| Task                                   | Files                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------- |
| List columns / status badges           | `pages/list/users.columns.tsx`                                             |
| Row actions (enable/disable/lock/etc.) | `pages/list/components/UserRowActionsMenu/`                                |
| Lock-account modal                     | `pages/list/components/LockAccountModalContent/`                           |
| Set-temporary-password modal           | `pages/list/components/SetTemporaryPasswordModalContent/`                  |
| Create form                            | `form/UserForm.tsx` (password required only when `actor_type === "human"`) |
| Edit form                              | `form/UserEditForm.tsx` (`display_name`, `email`, `actor_type` only)       |
| Detail drawer shell                    | `pages/list/components/UserDetailDrawer/UserDetailDrawer.tsx`              |
| Overview tab                           | `.../UserDetailDrawer/components/OverviewTab/`                             |
| Sessions tab (list + revoke-all)       | `.../UserDetailDrawer/components/SessionsTab/`                             |
| Auth events tab (list + filter)        | `.../UserDetailDrawer/components/AuthEventsTab/`                           |
| MFA tab (reset only)                   | `.../UserDetailDrawer/components/MfaTab/`                                  |
| Service accounts tab (non-human only)  | `.../UserDetailDrawer/components/ServiceAccountsTab/`                      |
| API calls                              | `users.api.ts`                                                             |
| Query keys                             | `users.queryKeys.ts`                                                       |
| Types                                  | `users.types.ts`                                                           |

## Backend endpoints (all under `/api/v1/auth/`, staff-only)

- `GET|POST users/`, `PATCH users/<id>/` — list/create/edit. Edit accepts only
  `{display_name, email, actor_type}` — there is no endpoint for status/staff/
  superuser fields in this build.
- `POST users/<id>/enable-login/` \| `disable-login/` — `AUTH_CANNOT_DISABLE_SELF`
  guarded client-side too (row actions disable + tooltip on the acting user's
  own row).
- `POST users/<id>/lock/` `{reason, duration_minutes?}` \| `unlock/` — same
  self-protection as disable-login applies to lock.
- `POST users/<id>/force-password-change/`, `set-temporary-password/`
  `{temporary_password}`.
- `GET users/<id>/sessions/`, `POST users/<id>/sessions/revoke-all/` →
  `{revoked_count}`.
- `GET users/<id>/auth-events/?event_type=` (26-value enum, see
  `AuthEventType` in `users.types.ts`).
- `POST users/<id>/mfa/reset/` — no read endpoint for enrollment status exists.
- `GET|POST users/<id>/service-account-credentials/`,
  `POST .../<credential_id>/revoke/` — create response includes a one-time
  `token`, shown via `OneTimeSecretModal` and never persisted.

Sessions, auth events, and service-account credentials only exist scoped to
one user (no global list endpoint), so their tabs are plain `useQuery` +
`Table` lists with local `page` state — not `DataTableShell`.

## State ownership

- Server data: React Query, keyed via `usersQueryKeys` (`users.list` string
  key for the shell; array keys for per-user sub-resources).
- Detail drawer open/target user: local `useState` in `UsersList.tsx`.
- Per-tab pagination/filter (`page`, `eventType`): local `useState` in each
  tab component.

## Known constraints — deviations from a literal read of the spec

- **No lock-state field on `User`.** The entity contract has no
  `is_locked`/`locked_until` field, so "Lock account" and "Unlock account" are
  both always-visible menu actions (not a toggle driven by row state, unlike
  "Enable/Disable login" which does toggle off `is_login_enabled`). The
  Overview tab's "can sign in" summary is computed from `is_active`,
  `is_login_enabled`, and `account_status === "active"` only — lock status
  cannot be factored in because it isn't exposed anywhere.
- **No MFA enrollment status endpoint.** The MFA tab only offers the reset
  action with explanatory copy — do not fabricate a status badge.

## Do not do

- Do not fetch data in `useEffect`.
- Do not import from `@mantine/*` directly.
- Do not add status/staff/superuser fields to the edit form — the `PATCH`
  endpoint rejects anything beyond `display_name`/`email`/`actor_type`.
- Do not persist a service-account credential token anywhere beyond the
  `OneTimeSecretModal` display.
- Do not use `DataTableShell`/`ModalTableShell` for sessions, auth events, or
  service-account credentials — those endpoints are scoped to one user and
  have no global list route.

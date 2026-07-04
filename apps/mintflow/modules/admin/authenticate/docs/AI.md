# Authenticate Module Group — AI Navigation Map

## Purpose

Identity & Access Management: staff-facing user/actor management, role and permission administration, and self-service account security, fronting the Django `authenticate` and `permissions` apps.

## Group structure

One grouped module folder, `modules/admin/authenticate/`, containing sub-modules nested per the sub-module rule instead of scattered as independent top-level modules. Sign In (`modules/sign-in/`) and Password Change (`modules/password-change/`) are the deliberate exception — they run pre-authentication on their own root-level routes with no admin shell and no nav presence, so they live outside this group.

| Sub-module          | Type                     | Route                                                                                                                         | Map                           |
| ------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `users/`            | ContainedModule          | `/admin/authenticate/users`                                                                                                   | `users/docs/AI.md`            |
| `roles-bindings/`   | ContainedModule (2 tabs) | `/admin/authenticate/roles-bindings`                                                                                          | `roles-bindings/docs/AI.md`   |
| `direct-access/`    | ContainedModule (2 tabs) | `/admin/authenticate/direct-access`                                                                                           | `direct-access/docs/AI.md`    |
| `access-tools/`     | Not-Contained (2 tabs)   | `/admin/authenticate/access-tools`                                                                                            | `access-tools/docs/AI.md`     |
| `account-security/` | Not-Contained            | `/admin/account/security` (off the staff nav — reachable via its own top-level nav item, visible to every authenticated user) | `account-security/docs/AI.md` |

All sub-modules except `account-security/` are wrapped in `<RequireStaff>` and only appear in the nav (`config/nav/admin-nav.ts`, id `authenticate`) when the current user is staff or superuser.

## Shared (`_shared/`)

| File                                                | Purpose                                                                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `useCurrentUser.ts`                                 | `GET /api/v1/auth/me/` via React Query, key `["auth","me"]` — exposes `{user, isStaff, isSuperuser, isLoading}` |
| `useLogout.ts`                                      | Revokes the refresh token and clears local tokens                                                               |
| `authenticate.types.ts`                             | `CurrentUser`, `ScopeType`, `ScopeValue`, `PermissionUserRef`                                                   |
| `UserPicker/`                                       | Searchable async user select, backed by `GET /api/v1/auth/users/?search=`                                       |
| `PermissionKeyPicker/`                              | Searchable, app-grouped permission-key select, backed by `policyTree.api.ts`                                    |
| `ScopeFields/`                                      | `scope_type` select + conditional organization/organization_unit pickers                                        |
| `OneTimeSecretModal/`                               | "Shown once, copy it now" reveal modal (MFA recovery codes, service-account tokens)                             |
| `ChangePasswordForm/`                               | Old/new password form, shared by `modules/password-change/` and `account-security/`                             |
| `policyTree.api.ts` / `.queryKeys.ts` / `.types.ts` | `core.policy_engine` catalog reads (`/api/v1/policy/apps/`, `/api/v1/policy/permissions/tree/`)                 |
| `organizationScope.api.ts` / `.types.ts`            | Minimal read-only Organization-app calls used only by `ScopeFields`                                             |

## Backend note

Every list endpoint in this group returns `meta.count`, but `@peppermint/admin`'s `DataTableWrapper` reads `meta.total` at the shell's `paginationKey`. Every `.api.ts` file in this group remaps `meta.count` → `meta.total` before returning — keep that mapping when adding new list-fetch functions here.

## Do not do

- Do not add a new top-level module folder for an auth/access-control feature — nest it under `authenticate/` per the group's own convention.
- Do not duplicate `UserPicker`/`PermissionKeyPicker`/`ScopeFields`/`OneTimeSecretModal`/`ChangePasswordForm` — they're already built and shared.
- Do not invent permission keys — always resolve them through `PermissionKeyPicker` (backed by `core.policy_engine`).
- Do not build a global sessions/auth-events/service-account-credentials list — the backend only exposes those scoped to one user (see `users/docs/AI.md`).

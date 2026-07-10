# Account Settings Modal — AI Navigation Map

## Purpose

Self-service settings modal where any authenticated user manages their own
identity, password, MFA (TOTP), active sessions, and sees the roles and direct
permission grants assigned to them.

## Module type

ModalModule — **not routed**. Opened via the "Profile" item in the user-avatar
menu (`UserInfoPopover`, `@peppermint/admin`), which `LayoutAdmin`
(`layouts/admin/Admin.tsx`) wires through `userMenu.onProfileClick`. The layout
mounts `<AccountSettingsModal>` **only while it is open** (`useDisclosure` +
conditional render), so none of the tab queries fire until the user opens it.
Visible to **every** authenticated user; deliberately **not** `RequireStaff`-
gated, unlike the rest of the `authenticate` module group.

## Entry files

- `AccountSettingsModal.tsx` — modal shell: left sidebar nav (Profile /
  Security / Sessions / Permissions) + scrollable content pane. Active tab is
  local `useState`; it resets to Profile on every open because the layout
  remounts the modal.
- `AccountSettingsModal.types.ts` — `AccountSettingsModalProps`, `SettingsTab`.
- `AccountSettingsModal.module.css` — sidebar/content split, mobile stacking.
- `index.ts` — exports `AccountSettingsModal`.

## Common edit targets

| Task                     | Files                                                   |
| ------------------------ | ------------------------------------------------------- |
| Profile (name/email)     | `components/ProfileTab.tsx`                             |
| Password change          | `components/PasswordCard.tsx` (wraps shared form)       |
| MFA setup/disable/codes  | `components/MfaCard.tsx`, `components/MfaCard.hooks.ts` |
| Sessions list/revoke     | `components/SessionsTab.tsx`                            |
| My roles / direct grants | `components/PermissionsTab.tsx`                         |
| Sidebar tabs / layout    | `AccountSettingsModal.tsx`, `.module.css`               |
| Auth API calls           | `account-settings.api.ts`                               |
| Types                    | `account-settings.types.ts`                             |

## Backend endpoints

Auth (all under `/api/v1/auth/`, none staff-gated):

- `PATCH me/` — `{display_name?, email?}` only. `AUTH_EMAIL_ALREADY_EXISTS` → email field error.
- `POST mfa/totp/setup/` → `{provisioning_uri, secret}`. Re-callable; discards prior unconfirmed setup.
- `POST mfa/totp/confirm/` `{code}` → `{recovery_codes[]}`. Errors: `AUTH_MFA_INVALID_CODE`, `AUTH_MFA_NOT_ENROLLED`.
- `POST mfa/disable/` — `AUTH_MFA_DISABLE_BLOCKED_BY_POLICY` shown specially (contact admin).
- `POST mfa/recovery-codes/regenerate/` → `{recovery_codes[]}`.
- `GET sessions/` (paginated), `POST sessions/<id>/revoke/`, `POST sessions/revoke-all/` → `{revoked_count}`.

Permissions tab (under `/api/v1/permissions/`, policy-engine gated — may 403
for non-staff users):

- `GET role-bindings/?subject_user_id=<me>` via `bindings/bindings.api.ts → fetchRoleBindingsForSubject`.
- `GET grants/?subject_user_id=<me>` via `grants/grants.api.ts → fetchGrantsForSubject`.
- `GET roles/` via `roles/roles.api.ts → fetchRoleDirectory` — resolves role
  ids on bindings to display names; on failure the raw role id is shown.
- A `PERMISSION_DENIED` error renders an honest "your account can't view this"
  message per section instead of an error/retry state. There is **no**
  "list my effective permissions" endpoint — this tab shows assignment sources
  (active bindings + active grants), not evaluated results.

## State ownership

- Server data: React Query. Profile invalidates `["auth","me"]`; sessions use
  `["auth","sessions"]`; permissions use `["permissions","role-bindings","subject",id]`,
  `["permissions","grants","subject",id]`, `["permissions","roles","directory"]`.
- Modal open/close: `useDisclosure` in `LayoutAdmin` (not a store).
- Active tab + MFA flow screen state: local `useState`.

## Known constraint — MFA enrollment status is NOT persisted client-side

The `/me/` response carries **no** MFA enrollment field, and there is **no GET
endpoint** to re-derive enrollment status. Therefore:

- On every fresh mount the MFA card starts in an `"unknown"` / "Not confirmed"
  state — we cannot tell whether the user already has MFA enabled.
- After a successful `confirm` we set local status to `"enrolled"` for the rest
  of the session only. Closing the modal loses that.
- Re-running Setup while already enrolled is harmless: `setup/` just replaces
  any unconfirmed device, and confirming again re-enrolls. This is an accepted,
  honest limitation given the backend gap — do **not** fabricate an enrollment
  flag or an `is_current` session flag.

## Do not do

- Do not fetch data in `useEffect`.
- Do not import from `@mantine/*` directly.
- Do not add a `RequireStaff` wrapper — this modal is for all users.
- Do not persist recovery codes anywhere; show once via `OneTimeSecretModal`.
- Do not re-add a route for this — it is intentionally modal-only.

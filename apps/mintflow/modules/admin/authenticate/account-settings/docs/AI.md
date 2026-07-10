# Account & Security Module — AI Navigation Map

## Purpose

Self-service settings page where any authenticated user manages their own
identity, password, MFA (TOTP), and active sessions.

## Module type

Not-Contained (a page composed of information cards — no CRUD table, no admin
shell). Visible to **every** authenticated user; deliberately **not**
`RequireStaff`-gated, unlike the rest of the `authenticate` module group.

## Route

`/admin/account/security` — intentionally outside `/admin/authenticate/*`
because the audience is every user, not staff. Reached via a top-level
`{kind:"page"}` nav entry in `config/nav/admin-nav.ts` (id `account-security`).
The module code still nests under `authenticate/` for group organization.

## Entry files

- `AccountSecurityView.tsx` — composes the four cards inside `ModalPaper`.
- `index.ts` — exports `ModuleAccountSecurity`.
- `app/admin/account/security/page.tsx` — one-line re-export.

## Common edit targets

| Task                    | Files                                                   |
| ----------------------- | ------------------------------------------------------- |
| Profile (name/email)    | `components/ProfileCard.tsx`                            |
| Password change         | `components/PasswordCard.tsx` (wraps shared form)       |
| MFA setup/disable/codes | `components/MfaCard.tsx`, `components/MfaCard.hooks.ts` |
| Sessions list/revoke    | `components/SessionsCard.tsx`                           |
| API calls               | `account-security.api.ts`                               |
| Types                   | `account-security.types.ts`                             |

## Backend endpoints (all under `/api/v1/auth/`, none staff-gated)

- `PATCH me/` — `{display_name?, email?}` only. `AUTH_EMAIL_ALREADY_EXISTS` → email field error.
- `POST mfa/totp/setup/` → `{provisioning_uri, secret}`. Re-callable; discards prior unconfirmed setup.
- `POST mfa/totp/confirm/` `{code}` → `{recovery_codes[]}`. Errors: `AUTH_MFA_INVALID_CODE`, `AUTH_MFA_NOT_ENROLLED`.
- `POST mfa/disable/` — `AUTH_MFA_DISABLE_BLOCKED_BY_POLICY` shown specially (contact admin).
- `POST mfa/recovery-codes/regenerate/` → `{recovery_codes[]}`.
- `GET sessions/` (paginated), `POST sessions/<id>/revoke/`, `POST sessions/revoke-all/` → `{revoked_count}`.

## State ownership

- Server data: React Query. Profile invalidates `["auth","me"]`; sessions use `["auth","sessions"]`.
- MFA flow screen state (`idle`/`setup`/`confirm`) and enrollment status: local `useState` in `MfaCard.hooks.ts`.

## Known constraint — MFA enrollment status is NOT persisted client-side

The `/me/` response carries **no** MFA enrollment field, and there is **no GET
endpoint** to re-derive enrollment status. Therefore:

- On every fresh page load the MFA card starts in an `"unknown"` / "Not
  confirmed" state — we cannot tell whether the user already has MFA enabled.
- After a successful `confirm` we set local status to `"enrolled"` for the rest
  of the session only. A page reload loses that.
- Re-running Setup while already enrolled is harmless: `setup/` just replaces
  any unconfirmed device, and confirming again re-enrolls. This is an accepted,
  honest limitation given the backend gap — do **not** fabricate an enrollment
  flag or an `is_current` session flag.

## Do not do

- Do not fetch data in `useEffect`.
- Do not import from `@mantine/*` directly.
- Do not add a `RequireStaff` wrapper — this page is for all users.
- Do not persist recovery codes anywhere; show once via `OneTimeSecretModal`.

# Security — Authentication & Accounts

**Owner app:** `authenticate`
**Version:** 1.3.0
**Status:** Active
**Created:** 2026-07-15

This document is required per project rulebook §19 (Documentation Requirements) because `authenticate` makes its own security-relevant decisions beyond the project's standard auth pattern. It is the reference SECURITY.md instance for the project.

> **Build status:** Sessions 1–4 are complete (identity; sessions & tokens; password flows & login defense; account administration & audit). The authentication app's initial scope is fully implemented.

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-15 | AI (Claude) | Password hashing/policy, superadmin provisioning, security-event log, generic-error and Django-admin posture. Token/cookie/session sections stubbed with the decided design. |
| 1.1.0 | 2026-07-15 | AI (Claude) | Session 2 implemented §5 (generic errors + timing equalization), §6 (JWT/session, `SessionJWTAuthentication`, refresh rotation + reuse detection), §7 (CSRF), §8 (device tracking). |
| 1.2.0 | 2026-07-15 | AI (Claude) | Session 3 implemented §9 (cooldown + auto-suspension), the first-login challenge, and own-password change with history reuse-prevention. |
| 1.3.0 | 2026-07-15 | AI (Claude) | Session 4 added §12 (authorization model: `permissions.py` role gates + service-layer object rules) and the superadmin-only audit feed. |

---

## 1. Password Hashing (Argon2)

- Argon2 is the primary hasher via Django's `Argon2PasswordHasher` (requirement §11.1), backed by `argon2-cffi`. `PASSWORD_HASHERS` in `core/settings/base.py`:
  1. `django.contrib.auth.hashers.Argon2PasswordHasher` (primary)
  2. `django.contrib.auth.hashers.PBKDF2PasswordHasher` (verify-only fallback for controlled migration)
- Passwords are only ever processed through Django's password framework (`set_password` / `check_password`) — never hashed manually, never stored in plaintext or reversibly.
- Test suite uses `MD5PasswordHasher` for speed; password flows that must prove Argon2 is real use `@override_settings(PASSWORD_HASHERS=[Argon2...])` (added with the login/password flows).

## 2. Password Policy (§11.2)

Enforced by `AUTH_PASSWORD_VALIDATORS` (Django built-ins + `authenticate/validators.py`): min length 8, max 128, ≥1 uppercase, ≥1 lowercase, ≥1 number, ≥1 symbol, not entirely numeric, not a common password, no surrounding whitespace, not similar to the username, not similar to the employee code / name. The backend is authoritative; frontend validation is supplementary only. Password history (current + previous 3) reuse prevention is enforced at each password-set point (wired with the password-change flows).

## 3. Superadmin Provisioning (§8)

- The single superadmin is created only by `manage.py provision_superadmin`, which reads `SUPERADMIN_USERNAME` / `SUPERADMIN_PASSWORD` from the environment (never CLI args, never migrations/fixtures, never source control).
- Idempotent: if a superadmin already exists, the command reports it and changes nothing. A DB partial-unique constraint (`role='superadmin'`) plus a manager guard make a second superadmin impossible.
- The password is validated against the full policy before creation and is never printed or logged. The superadmin is the only account with Django `is_superuser`/`is_staff` = `True`.

## 4. Security-Event Log (§18)

- `SecurityEvent` is append-only: `save()` on an existing row and all delete/bulk-mutation paths raise `SecurityEventImmutableError`.
- Actor/target usernames are snapshotted so events stay attributable after an account is deactivated. All actor/target FKs use `PROTECT`.
- `metadata` is sanitized on write — any key containing `password`, `token`, `secret`, `otp`, `cookie`, `authorization`, or `csrf` is dropped. The log never stores passwords, hashes, or tokens.
- Read access is restricted to the superadmin (enforced at the endpoint layer, session 4).

## 5. Generic Authentication Errors (§12.1)

All credential/state failures return one generic response (`AUTH_LOGIN_INVALID_CREDENTIALS`, message "Invalid username or password.") that does not reveal whether the username exists or whether the account is suspended, deactivated, or in cooldown. Operational detail is recorded only in the security log. Login timing is equalized by running a dummy Argon2 verification for unknown usernames.

## 6. JWT & Session Model

- Access token: JWT, 10-minute lifetime, `Authorization: Bearer`. Signed with a dedicated `JWT_SIGNING_KEY` (separate from Django `SECRET_KEY`, per-environment, rotatable). Claims are minimal: `user_id`, `username`, `role` (frontend convenience only — authority is server-side), `session_id`, `token_version`.
- `SessionJWTAuthentication` re-validates every request against server state: the referenced `AuthSession` must be active and unexpired, the account `active`, and the token's `token_version` must match the user's — so deactivation/suspension/password-change/logout-all revoke outstanding access tokens immediately.
- Refresh token: rotating, 7-day absolute cap (never extended on refresh), one active session per account, stored ONLY in a `Secure`, `HttpOnly` cookie (`mintway_refresh`, narrow path `/api/v1/auth/token/refresh/`). Never returned in JSON. Rotated-out jti replay is treated as compromise → the session is revoked and a `refresh_rejected` event recorded.
- **Refresh jti stored in plaintext, by design:** the stored `current_refresh_jti` is an identifier, not a credential — forging a refresh token still requires `JWT_SIGNING_KEY`. Hashing it would add no real security and would hinder auditing/debugging.

## 7. CSRF for Cookie Endpoints

Cookie-authenticated endpoints (`token/refresh/`, `logout/`, `logout-all/`) use stateless double-submit CSRF: login sets a JS-readable `mintway_csrf` cookie; the frontend echoes it in the `X-CSRFToken` header; the server compares them with `hmac.compare_digest`.

## 8. Known-Device Tracking (§14)

At most three known devices per account, identified by a long-lived `HttpOnly` `mintway_device` cookie (no invasive fingerprinting). A 4th device retires the oldest device with no active session; the active-session device is never retired.

## 9. Login Defense — Cooldown & Suspension (§12)

Consecutive failures: 5 → 5-minute cooldown, 10 → 10-minute cooldown, 15 → automatic suspension (superadmin recovery only). Attempts during cooldown are rejected without verifying the password and without incrementing the counter. Login and refresh are additionally IP-scoped throttled (`auth_login` 10/min, `auth_refresh` 120/hour, `auth_first_login` 10/hour).

## 10. Django Admin Posture (§19)

Django admin is mounted only when `ADMIN_ENABLED` is true (development / controlled maintenance) — never in production. Only the superadmin has `is_staff=True`, so admin access is inherently superadmin-only. All admin registrations are read-only for security fields, disable user deletion, and disable creation/mutation of the append-only event log.

## 11. Signing-Key Rotation

Rotating `JWT_SIGNING_KEY` (env change + restart) invalidates all outstanding access/refresh tokens; the `AuthSession` table is unaffected, so users simply re-authenticate. Keys differ across development, staging, and production and are never committed.

## 12. Authorization Model (Administration Endpoints)

Two layers, defense in depth (a documented deviation from CLAUDE.md §9's `is_staff` interim pattern, which requirement §7.5 forbids as a business-role signal):

- **Coarse role gates** — DRF permission classes in `authenticate/permissions.py` (`IsAdminOrSuperadmin`, `IsSuperadmin`) read only the application `role`. Failures return `PERMISSION_DENIED` (403).
- **Object-level rules** — enforced in the service layer: admins may only lifecycle `staff` accounts (acting on an `admin` → `AUTH_USER_TARGET_FORBIDDEN`); the superadmin account is never visible or targetable through the administration endpoints (selectors exclude it → `AUTH_USER_NOT_FOUND`); state transitions are validated (`AUTH_USER_STATE_CONFLICT`). Only the superadmin may suspend/unsuspend, reset passwords, revoke a target's sessions, or read the security-event log.

This is NOT the future policy-engine runtime enforcement bridge (endpoints declaring a `permission_key` that `check_permission()` evaluates) — that remains unbuilt (CLAUDE.md §9). Every endpoint is still registered in the policy engine for metadata/audit, but authorization at request time uses these role/service checks.

The security-event log is readable only by the superadmin; deactivated users remain attributable via snapshotted usernames on each event.

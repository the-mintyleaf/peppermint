# API Documentation — Authenticate

**App:** `authenticate`
**Version:** 1.1.0
**Base prefix:** `/api/v1/auth/`
**Auth:** Per-endpoint — see each section. Public endpoints are explicitly marked; everything else requires `IsAuthenticated` (DRF default), and staff endpoints additionally require `is_staff` **or `is_superuser`** per CLAUDE.md §9's interim pattern (see SECURITY.md §12 for the superuser bypass contract). Non-human actors may instead authenticate via `Authorization: ApiKey <key_id>.<secret>` (see §19-21).
**Throttle:** Default DRF throttle classes apply (anon 100/hour, user 1000/hour) unless a custom scope is noted.
**Access level:** Mixed — public auth endpoints, authenticated self-service, staff-only user management, authenticated MFA management (except `mfa/totp/verify/`, which is public).

---

## Change History

| Version | Date       | Author      | Summary                                                                                                                                                                                                                                                                                |
| ------- | ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-06-22 | AI (Claude) | Initial API documentation for all 27 endpoints                                                                                                                                                                                                                                         |
| 1.1.0   | 2026-06-22 | AI (Claude) | Adds §18 staff MFA reset and §19-21 service account credentials (31 endpoints total); documents `mfa_setup_recommended` on login/verify and the `AUTH_PASSWORD_REUSE_BLOCKED`/`AUTH_MFA_DISABLE_BLOCKED_BY_POLICY` codes becoming reachable; documents the superuser staff-gate bypass |

---

## Generic envelopes (referenced throughout)

**Success:**

```json
{ "success": true, "message": "...", "data": { ... }, "meta": {} }
```

**Generic pre-authentication failure** (used by every check in the login flow before password+MFA succeed — see SECURITY.md §7 for the account-enumeration rationale):

```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid credentials or account is not allowed to sign in.",
    "details": {}
  },
  "meta": {}
}
```

HTTP 401. Returned for: unknown identifier, wrong password, inactive account, login disabled, account status not active, manually locked, axes-locked.

---

## 1. Login

**URI:** `POST /api/v1/auth/login/`
**Auth:** Public (`AllowAny`)
**Throttle:** `auth_login` scope, 10/min
**Policy key:** `authenticate.user.login` (risk: high)

**Request:**

```json
{ "identifier": "j.doe", "password": "..." }
```

**Response (200, success):**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access": "eyJ...",
    "refresh": "eyJ...",
    "user": { "id": "...", "username": "j.doe", "...": "..." },
    "mfa_setup_recommended": false
  },
  "meta": {}
}
```

`mfa_setup_recommended` is `true` when staff has mandated MFA (`mfa_required=True`) but no device is enrolled yet — login still succeeds (see `DEBUG_HISTORY.md` for why this must not block); the client should prompt MFA setup (§13) immediately after.

**Response (200, MFA required — not an error):**

```json
{
  "success": true,
  "message": "MFA verification required.",
  "data": { "mfa_required": true, "challenge_id": "..." },
  "meta": {}
}
```

**Response (401, generic failure):** see Generic envelopes above.

**Response (409, device limit reached — safe to be specific, occurs only post-auth):**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_DEVICE_LIMIT_REACHED",
    "message": "Maximum number of active sessions reached. Revoke an existing session to log in from a new device.",
    "details": { "max_active_sessions": 3 }
  },
  "meta": {}
}
```

**Validation rules:** `identifier` and `password` required, non-blank.
**Error codes:** `AUTH_INVALID_CREDENTIALS` (401), `AUTH_DEVICE_LIMIT_REACHED` (409), `VALIDATION_ERROR` (400).
**Business rules:** Full algorithm documented in `services.py::authenticate_login` and `SECURITY.md §6` — normalize → lookup → eligibility checks → manual-lock check → temp-password-expiry check → `django.contrib.auth.authenticate(request=request, ...)` (lets django-axes observe the attempt) → MFA gate → device-limit check → issue tokens + create `UserSession` + create `AuthEvent`.
**AI debugging notes:** If django-axes appears not to be counting failed attempts, confirm the service is calling `django.contrib.auth.authenticate(request=request, ...)` and not `user.check_password()` directly — only the former flows through `AUTHENTICATION_BACKENDS`.

---

## 2. Refresh Session

**URI:** `POST /api/v1/auth/refresh/`
**Auth:** Public (`AllowAny`)
**Throttle:** `auth_refresh` scope, 30/min
**Policy key:** `authenticate.session.refresh` (risk: high)

**Request:** `{ "refresh": "eyJ..." }` (dev/test "body" mode) or no body — read from the `mintflow_refresh` HttpOnly cookie in staging/production ("cookie" mode, see SECURITY.md §4).
**Response (200):** `{ "success": true, "message": "Token refreshed.", "data": { "access": "eyJ...", "refresh": "eyJ..." }, "meta": {} }`
**Response (400):** `AUTH_REFRESH_REQUIRED` — no refresh token supplied.
**Response (401):** `AUTH_TOKEN_INVALID` — refresh token invalid, expired, or its `UserSession` is no longer active.
**Business rules:** Rotates `UserSession.refresh_token_jti` on the **same row** rather than creating a SimpleJWT blacklist entry (no `token_blacklist` app installed — see SECURITY.md §3).

---

## 3. Logout

**URI:** `POST /api/v1/auth/logout/`
**Auth:** Public (`AllowAny`) — gated by possessing a valid refresh token, not an access token
**Policy key:** `authenticate.session.logout` (risk: medium)

**Request:** `{ "refresh": "eyJ..." }` (or cookie). **Response (200):** `{ "success": true, "message": "Logged out.", "data": {}, "meta": {} }` — idempotent; an already-invalid/missing token still returns success.
**Business rules:** Revokes the matching `UserSession` (`is_active=False`, `revoked_at=now()`, `revoked_reason=logout`), creates `AuthEvent(logout_success)`.

---

## 4. Get / Update Current Actor Identity

**URI:** `GET /api/v1/auth/me/`, `PATCH /api/v1/auth/me/`
**Auth:** `IsAuthenticated`
**Policy keys:** `authenticate.user.read_self` (risk: low), `authenticate.user.update_self` (risk: medium)

**GET response (200):** the `User` contract (see DATA_CONTRACT.md §1) minus `password`.
**PATCH request:** any subset of `{"display_name": "...", "email": "..."}`. **Response (200):** updated `User` contract.
**Response (409):** `AUTH_EMAIL_ALREADY_EXISTS` if the new email collides with another user.
**Business rules:** Self-update cannot change `is_login_enabled` or `actor_type` directly — `is_login_enabled` requires staff action (§8); `actor_type` is changeable only via the staff update endpoint (§7). `is_staff`, `is_superuser`, and `account_status` have no endpoint in this build at all (Django-admin/shell only) — see SECURITY.md §12.

---

## 5. Change Own Password

**URI:** `POST /api/v1/auth/change-password/`
**Auth:** `IsAuthenticated`
**Policy key:** `authenticate.user.change_password` (risk: high)

**Request:** `{ "old_password": "...", "new_password": "..." }`. **Response (200):** `{ "success": true, "message": "Password changed.", "data": {}, "meta": {} }`.
**Response (400):** `AUTH_PASSWORD_INVALID` (wrong old password), `AUTH_PASSWORD_REUSE_BLOCKED` (matches the current password or one of the last `AUTH_PASSWORD_HISTORY_DEPTH` history entries), or `VALIDATION_ERROR` (new password fails Django's validators — min length 12, etc.).
**Business rules:** Updates `UserSecurityState.password_changed_at`, clears `password_change_required`, creates `AuthEvent(password_changed)`. Records the replaced hash into `UserPasswordHistory`, pruning beyond `AUTH_PASSWORD_HISTORY_DEPTH - 1` retained entries (see SECURITY.md §14).

---

## 6. List / Revoke Own Sessions

**URI:** `GET /api/v1/auth/sessions/`, `POST /api/v1/auth/sessions/<id>/revoke/`, `POST /api/v1/auth/sessions/revoke-all/`
**Auth:** `IsAuthenticated`
**Policy keys:** `authenticate.session.list_self` (medium), `authenticate.session.revoke_self` (high), `authenticate.session.revoke_all_self` (high)

**List response (200):** paginated list of `UserSession` contract items (DATA_CONTRACT.md §3) — never includes `refresh_token_jti` or raw tokens.
**Revoke-one response (200):** `{ "success": true, "message": "Session revoked.", "data": {}, "meta": {} }`. **404** (`NOT_FOUND`) if the session doesn't belong to the caller.
**Revoke-all response (200):** `{ "success": true, "message": "All sessions revoked.", "data": { "revoked_count": N }, "meta": {} }`.
**Query access pattern:** `selectors.list_active_sessions_for_user` filters `(user, is_active=True)`, backed by the `(user, is_active)` composite index.

---

## 7. Staff: Create / List / Read / Update Actor

**URI:** `POST /api/v1/auth/users/`, `GET /api/v1/auth/users/`, `GET /api/v1/auth/users/<id>/`, `PATCH /api/v1/auth/users/<id>/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy keys:** `authenticate.user.create` (critical), `authenticate.user.list` (high), `authenticate.user.read` (high), `authenticate.user.update` (critical)

**Create request:** `{ "username": "...", "password": "...", "display_name": "...", "email": "...", "actor_type": "human", "account_status": "pending", "is_login_enabled": true }`. **Response (201):** `User` contract.
**Response (409):** `AUTH_USERNAME_ALREADY_EXISTS` / `AUTH_EMAIL_ALREADY_EXISTS`.
**List query params:** `search`, `account_status`, `actor_type` — all optional, combined with AND.
**Update request (PATCH):** any subset of `{"display_name", "email", "actor_type"}` — does not change login-eligibility/lock/staff flags, which have their own dedicated endpoints below.
**Business rules:** No public self-registration exists — actor provisioning is staff-only, per the concept doc's explicit deployment policy.

---

## 8. Staff: Enable / Disable Login

**URI:** `POST /api/v1/auth/users/<id>/enable-login/`, `POST /api/v1/auth/users/<id>/disable-login/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy keys:** `authenticate.user.enable_login`, `authenticate.user.disable_login` (both critical)

**Response (200):** `{ "success": true, "message": "Login enabled."/"Login disabled.", "data": {}, "meta": {} }`.
**Response (400):** `AUTH_CANNOT_DISABLE_SELF` — a staff actor cannot disable their own login.
**Business rules:** Each creates an `AuthEvent` (`login_enabled` / `login_disabled`) with `metadata.actor_id` recording who made the change.

---

## 9. Staff: Lock / Unlock Actor

**URI:** `POST /api/v1/auth/users/<id>/lock/`, `POST /api/v1/auth/users/<id>/unlock/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy keys:** `authenticate.user.lock`, `authenticate.user.unlock` (both critical)

**Lock request:** `{ "reason": "manual", "duration_minutes": 60 }` (`duration_minutes` optional — omit for an indefinite lock until explicitly unlocked).
**Response (200):** `{ "success": true, "message": "Account locked."/"Account unlocked.", "data": {}, "meta": {} }`.
**Response (400):** `AUTH_CANNOT_DISABLE_SELF` — cannot lock one's own account.
**Business rules:** This is a **manual lock only** — distinct from django-axes' automatic brute-force lockout. See SECURITY.md §6 for the dual-layer explanation. Creates `AuthEvent(account_locked)` / `AuthEvent(account_unlocked)`.

---

## 10. Staff: Force Password Change / Set Temporary Password

**URI:** `POST /api/v1/auth/users/<id>/force-password-change/`, `POST /api/v1/auth/users/<id>/set-temporary-password/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy keys:** `authenticate.user.force_password_change`, `authenticate.user.set_temporary_password` (both critical)

**Set-temporary-password request:** `{ "temporary_password": "..." }` — must pass Django's password validators.
**Response (200):** `{ "success": true, "message": "...", "data": {}, "meta": {} }`.
**Business rules:** Setting a temporary password always sets `password_change_required=True` and `last_password_reset_at=now()`. The temporary password expires after `AUTH_TEMP_PASSWORD_EXPIRY_HOURS` (default 24h) — once expired, login is rejected (generic failure) until staff issues a new temporary password. Creates `AuthEvent(password_reset_completed)`.

---

## 11. Staff: List / Revoke-All Sessions For Actor

**URI:** `GET /api/v1/auth/users/<id>/sessions/`, `POST /api/v1/auth/users/<id>/sessions/revoke-all/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy keys:** `authenticate.session.list_for_user` (critical), `authenticate.session.revoke_all_for_user` (critical)

**List response (200):** paginated `UserSession` contract items, including revoked ones (`include_revoked=True`) so staff can see history.
**Revoke-all response (200):** `{ "success": true, "message": "All sessions revoked.", "data": { "revoked_count": N }, "meta": {} }`.

---

## 12. Staff: List Auth Events For Actor

**URI:** `GET /api/v1/auth/users/<id>/auth-events/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy key:** `authenticate.auth_event.list_for_user` (critical)

**Query params:** `event_type` (optional filter).
**Response (200):** paginated `AuthEvent` contract items.
**Query access pattern:** `selectors.list_auth_events_for_user` uses `select_related("user")`, backed by the `(user, created_at)` index — verified N+1-free in `tests/test_selectors.py`.

---

## 13. MFA: Begin TOTP Setup

**URI:** `POST /api/v1/auth/mfa/totp/setup/`
**Auth:** `IsAuthenticated`
**Policy key:** `authenticate.mfa.setup` (high)

**Response (200):** `{ "success": true, "data": { "provisioning_uri": "otpauth://totp/...", "secret": "BASE32SECRET" }, "meta": {} }` — render `provisioning_uri` as a QR code or show `secret` for manual entry.
**Business rules:** Creates an unconfirmed `django_otp.plugins.otp_totp.models.TOTPDevice` (deletes any prior unconfirmed device for the same user first). No custom OTP code — django-otp's own model is the source of truth.

---

## 14. MFA: Confirm TOTP Setup

**URI:** `POST /api/v1/auth/mfa/totp/confirm/`
**Auth:** `IsAuthenticated`
**Policy key:** `authenticate.mfa.confirm` (high)

**Request:** `{ "code": "123456" }`. **Response (200):** `{ "success": true, "data": { "recovery_codes": ["abcd1234", "..."] }, "meta": {} }` — 8 codes, shown once, never retrievable again (only regenerable, see §17).
**Response (400):** `AUTH_MFA_INVALID_CODE` (wrong code) or `AUTH_MFA_NOT_ENROLLED` (no pending setup — call setup first).

---

## 15. MFA: Verify Challenge (completes login)

**URI:** `POST /api/v1/auth/mfa/totp/verify/`
**Auth:** Public (`AllowAny`) — **intentionally public**: at this point in the login flow the caller has no access token yet (tokens are only issued after MFA passes). Gated instead by the signed, short-lived `challenge_id` issued from the Login endpoint (§1), which expires after 5 minutes.
**Throttle:** `auth_mfa_verify` scope, 5/min
**Policy key:** `authenticate.mfa.verify` (high)

**Request:** `{ "challenge_id": "...", "code": "123456" }`. **Response (200):** same shape as a successful login (§1) — `access`, `refresh`, `user`.
**Response (401):** `AUTH_TOKEN_INVALID` (challenge expired/invalid) or `AUTH_MFA_INVALID_CODE` (wrong code).
**Response (409):** `AUTH_DEVICE_LIMIT_REACHED` (same as login).
**Business rules:** Accepts either a valid TOTP code or an unused recovery/static code.

---

## 16. MFA: Disable

**URI:** `POST /api/v1/auth/mfa/disable/`
**Auth:** `IsAuthenticated`
**Policy key:** `authenticate.mfa.disable` (critical)

**Response (200):** `{ "success": true, "message": "MFA disabled.", "data": {}, "meta": {} }`.
**Response (400):** `AUTH_MFA_DISABLE_BLOCKED_BY_POLICY` — staff has mandated MFA (`mfa_required=True`) on this account; only a staff-initiated reset (§18) can clear the device in that case.
**Business rules:** Deletes the user's `TOTPDevice` and `StaticDevice` (cascades `StaticToken`) rows. Self-service disable also clears `UserSecurityState.mfa_required`, but only ever reaches that line when it was already `False` (the policy-block check above short-circuits otherwise).

---

## 17. MFA: Regenerate Recovery Codes

**URI:** `POST /api/v1/auth/mfa/recovery-codes/regenerate/`
**Auth:** `IsAuthenticated`
**Policy key:** `authenticate.mfa.regenerate_recovery_codes` (critical)

**Response (200):** `{ "success": true, "data": { "recovery_codes": [...] }, "meta": {} }` — invalidates all previously issued recovery codes.
**Response (400):** `AUTH_MFA_NOT_ENROLLED` if MFA isn't confirmed for this account yet.

---

## 18. Staff: Reset Actor MFA

**URI:** `POST /api/v1/auth/users/<id>/mfa/reset/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy key:** `authenticate.mfa.reset_for_user` (critical)

**Response (200):** `{ "success": true, "message": "MFA reset for this actor.", "data": {}, "meta": {} }`.
**Business rules:** Removes the actor's `TOTPDevice`/`StaticDevice` rows — for recovering a user who lost their device/recovery codes. Unlike self-disable, this is **not** blocked by `mfa_required` and deliberately does **not** clear it: the mandate survives, the user must re-enroll. Creates `AuthEvent(mfa_reset_by_staff)` with `metadata.actor_id`. Idempotent if no device exists.

---

## 19. Staff: Create Service Account Credential

**URI:** `POST /api/v1/auth/users/<id>/service-account-credentials/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy key:** `authenticate.service_account_credential.create` (critical)

**Request:** `{ "name": "CI pipeline key", "expires_at": null }` (both optional).
**Response (201):** the `ServiceAccountCredential` contract (DATA_CONTRACT.md §6) plus a one-time `token` field (`"<key_id>.<secret>"`) — **shown only in this response, never retrievable again**.
**Response (400):** `AUTH_SERVICE_ACCOUNT_ACTOR_TYPE_INVALID` if the target user's `actor_type` is `human`.
**Business rules:** `secret_hash` (sha256) is the only thing persisted. Creates `AuthEvent(service_account_credential_created)`.

---

## 20. Staff: List Service Account Credentials

**URI:** `GET /api/v1/auth/users/<id>/service-account-credentials/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy key:** `authenticate.service_account_credential.list` (high)

**Response (200):** paginated `ServiceAccountCredential` contract items — never includes `token`/`secret_hash`.

---

## 21. Staff: Revoke Service Account Credential

**URI:** `POST /api/v1/auth/users/<id>/service-account-credentials/<credential_id>/revoke/`
**Auth:** `IsAuthenticated` + `is_staff`
**Policy key:** `authenticate.service_account_credential.revoke` (critical)

**Response (200):** `{ "success": true, "message": "Service account credential revoked.", "data": {}, "meta": {} }`.
**Response (404):** if the credential doesn't belong to the specified user.
**Business rules:** Sets `is_active=False`, `revoked_at=now()`. Creates `AuthEvent(service_account_credential_revoked)`. A revoked credential is rejected immediately by `ServiceAccountAuthentication` — see SECURITY.md §15.

---

## Error code reference

All codes are defined in `authenticate/constants.py::AuthErrorCode`. See `authenticate/docs/SECURITY.md` for the account-enumeration defense governing which codes may be specific vs. generic.

| Code                                                         | HTTP    | Notes                                                                                     |
| ------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| `AUTH_INVALID_CREDENTIALS`                                   | 401     | Generic pre-auth failure — see Generic envelopes above                                    |
| `AUTH_DEVICE_LIMIT_REACHED`                                  | 409     | Post-auth only, safe to be specific                                                       |
| `AUTH_PASSWORD_INVALID`                                      | 400     | Wrong current password on change-password                                                 |
| `AUTH_PASSWORD_REUSE_BLOCKED`                                | 400     | Matches the current password or a retained `UserPasswordHistory` entry (§5)               |
| `AUTH_USERNAME_ALREADY_EXISTS` / `AUTH_EMAIL_ALREADY_EXISTS` | 409     | Staff create/update, self-update                                                          |
| `AUTH_CANNOT_DISABLE_SELF`                                   | 400     | disable-login / lock on one's own account                                                 |
| `AUTH_MFA_INVALID_CODE`                                      | 400/401 | Wrong TOTP/recovery code                                                                  |
| `AUTH_MFA_NOT_ENROLLED`                                      | 400     | Confirm without prior setup; regenerate without enrollment                                |
| `AUTH_MFA_DISABLE_BLOCKED_BY_POLICY`                         | 400     | Self-disable attempted while staff has mandated MFA (§16) — use staff reset (§18) instead |
| `AUTH_SERVICE_ACCOUNT_ACTOR_TYPE_INVALID`                    | 400     | Credential creation attempted for a `human` actor (§19)                                   |
| `AUTH_TOKEN_INVALID`                                         | 401     | Bad/expired refresh token, MFA challenge, or service-account key                          |
| `AUTH_REFRESH_REQUIRED`                                      | 400     | No refresh token supplied in body or cookie                                               |

`AUTH_TOKEN_EXPIRED`, `AUTH_TOKEN_REVOKED`, `AUTH_SESSION_NOT_FOUND`, `AUTH_SESSION_REVOKED`, `AUTH_STAFF_REQUIRED`, `AUTH_SUPERUSER_REQUIRED`, `AUTH_SUPERUSER_PROTECTED`, `AUTH_CANNOT_DELETE_SELF`, `AUTH_RATE_LIMITED`, `AUTH_AUDIT_EVENT_NOT_FOUND`, `AUTH_ACCOUNT_INACTIVE`, `AUTH_LOGIN_DISABLED`, `AUTH_ACCOUNT_LOCKED`, `AUTH_PASSWORD_CHANGE_REQUIRED`, `AUTH_MFA_REQUIRED`, `AUTH_USER_NOT_FOUND`, `AUTH_USER_ALREADY_EXISTS`, `AUTH_SERVICE_ACCOUNT_CREDENTIAL_NOT_FOUND` are defined for completeness per the concept doc's full code list; several map onto the generic `AUTH_INVALID_CREDENTIALS` envelope at the HTTP layer by design (enumeration defense) even though the internal `AuthEvent.failure_reason` distinguishes them. (`ServiceAccountCredentialRevokeView`'s 404 currently uses DRF's generic `NOT_FOUND` code rather than `AUTH_SERVICE_ACCOUNT_CREDENTIAL_NOT_FOUND` — the dedicated code is reserved for a future, more specific error path.)

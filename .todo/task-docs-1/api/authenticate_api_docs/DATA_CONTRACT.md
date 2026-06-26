# Data Contract — Authenticate

**Owner app:** `authenticate`
**Version:** 1.0.0
**Status:** Active
**Created:** 2026-06-22
**Purpose:** Identity, login eligibility, credential state, JWT session tracking, and authentication security events for MintFlow actors. Does **not** own organization structure, roles, or permission assignment — those belong to future apps (`organization`, `permissions`).

---

## Change History

| Version | Date       | Author      | Summary                                                                                                                                                                                           |
| ------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-06-22 | AI (Claude) | Initial contract for `User`, `UserSecurityState`, `UserSession`, `AuthEvent` and all auth endpoint payloads                                                                                       |
| 1.1.0   | 2026-06-22 | AI (Claude) | Adds `UserPasswordHistory` and `ServiceAccountCredential` contracts; adds staff MFA-reset and service-account-credential payloads; documents `mfa_setup_recommended` on the login/verify response |

---

## Deliberate deviations from the original concept draft

The concept doc (`.docs/authenticate_implementation.txt`) proposed three fields that this contract does **not** implement, found redundant during human review:

- **`UserSecurityState.failed_login_count`** — dropped. `django-axes` (added as the project's sole brute-force counting/lockout engine) already tracks per-username+IP failure counts correctly, including a `AXES_RESET_ON_SUCCESS` reset. A second, independently-incremented counter risked disagreeing with axes' own state for no real benefit.
- **`UserSecurityState.mfa_enrolled`** — dropped. Fully derivable at read-time from `django_otp.plugins.otp_totp.models.TOTPDevice.confirmed` via the `is_mfa_enrolled()` selector. Storing a parallel boolean risked silent drift if a device were ever removed outside `disable_mfa()` (e.g. via Django admin).
- **`UserSession.device_fingerprint_hash`** — dropped. No client-side device fingerprinting is built in this version; an always-blank column is dead weight. Add it back in a real migration if/when fingerprinting is implemented.

`UserSecurityState.locked_until`/`lock_reason` in this contract mean a **manual/staff-initiated lock only** — brute-force auto-lockout is owned entirely by django-axes and is not mirrored into this app's tables. See `authenticate/docs/SECURITY.md` for the full rationale.

---

## 1. User

**Purpose:** Represents a registered actor/principal in MintFlow — the entry point identity for the software. Distinguishes "exists as a record" from "can log in" (see fields below).

**Table:** `authenticate_user`

| Field            | Type                   | Required | Nullable | Generated | Description                                                                            |
| ---------------- | ---------------------- | -------- | -------- | --------- | -------------------------------------------------------------------------------------- |
| id               | UUID                   | —        | No       | Yes       | Primary key, `uuid4`                                                                   |
| username         | CharField(150)         | Yes      | No       | No        | Unique login identifier, indexed                                                       |
| email            | EmailField             | No       | Yes      | No        | Unique when set; multiple `NULL` allowed (Postgres)                                    |
| display_name     | CharField(255)         | Yes      | No       | No        | Human-readable name                                                                    |
| actor_type       | CharField(20), choices | No       | No       | No        | `human` \| `system` \| `ai` \| `external`. Default `human`                             |
| account_status   | CharField(20), choices | No       | No       | No        | `pending` \| `active` \| `suspended` \| `deactivated` \| `archived`. Default `pending` |
| is_login_enabled | Boolean                | No       | No       | No        | Default `True`. Software-login eligibility flag, independent of `is_active`            |
| is_active        | Boolean                | No       | No       | No        | Default `True`. Django-framework-level "record is valid" flag                          |
| is_staff         | Boolean                | No       | No       | No        | Default `False`. Temporary platform-access flag pending the future `permissions` app   |
| is_superuser     | Boolean                | No       | No       | No        | Default `False`. From `PermissionsMixin`. Emergency/root authority only                |
| password         | CharField(128)         | —        | No       | Yes       | Django-managed hash (Argon2 by default). Never serialized                              |
| last_login       | DateTimeField          | No       | Yes      | Yes       | Managed by Django/SimpleJWT                                                            |
| created_at       | DateTimeField          | —        | No       | Yes       | Auto on creation                                                                       |
| updated_at       | DateTimeField          | —        | No       | Yes       | Auto on update                                                                         |

`groups`/`user_permissions` M2M fields exist (from `PermissionsMixin`) but are **unused** — RBAC ownership belongs to the future `permissions` app, not `authenticate`.

**Validation rules:**

- `username`: required, unique, Django's default username validator
- `email`: optional; when provided must be a valid email and unique
- `display_name`: required, non-blank
- No organization, department, role, or position fields permitted on this model

**`USERNAME_FIELD`:** `username`. **`REQUIRED_FIELDS`:** `["display_name"]` (email intentionally not required).

**Example:**

```json
{
  "id": "9c4e3b7a-1f2d-4a6e-8b3c-7d5f1a2b3c4d",
  "username": "j.doe",
  "email": "j.doe@example.gov",
  "display_name": "Jane Doe",
  "actor_type": "human",
  "account_status": "active",
  "is_login_enabled": true,
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "last_login": "2026-06-22T10:15:00Z",
  "created_at": "2026-01-10T09:00:00Z",
  "updated_at": "2026-06-22T10:15:00Z"
}
```

**Security notes:** `password` is never included in any serializer output. Public-facing identifier is `id` (UUID); the internal auto-increment is not exposed (this model has no separate internal integer ID — `id` itself is the UUID primary key).

**Cross-app boundary note:** `authenticate.User` is the FK target every future app (`organization`, `permissions`, `events`, `audit`) will reference for actor identity. Those apps' own `DATA_CONTRACT.md` files must declare this dependency explicitly per CLAUDE.md §4.

---

## 2. UserSecurityState

**Purpose:** Tracks manual-lock and password-lifecycle/MFA-policy state for a user, separate from core identity fields.

**Table:** `authenticate_user_security_state`

**Lock reasons:** `manual`, `staff_lock`

| Field                    | Type                   | Required | Nullable | Generated | Description                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ---------------------- | -------- | -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                       | UUID                   | —        | No       | Yes       | Primary key                                                                                                                                                                                                                                                                                                     |
| user                     | OneToOne → User        | Yes      | No       | No        | CASCADE on delete                                                                                                                                                                                                                                                                                               |
| password_changed_at      | DateTimeField          | No       | Yes      | No        | Last successful self-service password change                                                                                                                                                                                                                                                                    |
| password_change_required | Boolean                | No       | No       | No        | Default `False`. Forces change on next login                                                                                                                                                                                                                                                                    |
| locked_until             | DateTimeField          | No       | Yes      | No        | **Manual/staff lock only** — set by `lock_user()`, cleared by `unlock_user()`                                                                                                                                                                                                                                   |
| lock_reason              | CharField(30), choices | No       | No       | No        | Blank, or `manual` / `staff_lock`                                                                                                                                                                                                                                                                               |
| mfa_required             | Boolean                | No       | No       | No        | Default `False`. Business policy flag — staff can force MFA onto an account. Self-disable of an enrolled device is blocked while this is `True` (`AUTH_MFA_DISABLE_BLOCKED_BY_POLICY`); only a staff reset (a different actor) may remove the device, and a staff reset deliberately leaves this flag untouched |
| last_failed_login_at     | DateTimeField          | No       | Yes      | No        | Informational only — not used for lockout decisions (axes owns that)                                                                                                                                                                                                                                            |
| last_successful_login_at | DateTimeField          | No       | Yes      | No        | Updated on every successful login                                                                                                                                                                                                                                                                               |
| last_password_reset_at   | DateTimeField          | No       | Yes      | No        | Set when a temporary password is issued by staff; used for temp-password expiry                                                                                                                                                                                                                                 |
| created_at               | DateTimeField          | —        | No       | Yes       | Auto                                                                                                                                                                                                                                                                                                            |
| updated_at               | DateTimeField          | —        | No       | Yes       | Auto                                                                                                                                                                                                                                                                                                            |

**Validation rules:**

- `lock_reason` must be set whenever `locked_until` is set, and cleared when `locked_until` is cleared
- Lockout changes (`lock_user`/`unlock_user`) must create an `AuthEvent`

**Example:**

```json
{
  "user": "9c4e3b7a-1f2d-4a6e-8b3c-7d5f1a2b3c4d",
  "password_changed_at": "2026-05-01T12:00:00Z",
  "password_change_required": false,
  "locked_until": null,
  "lock_reason": "",
  "mfa_required": true,
  "last_failed_login_at": null,
  "last_successful_login_at": "2026-06-22T10:15:00Z",
  "last_password_reset_at": null
}
```

**Security notes:** Never exposed via a public/self-service serializer in raw form for other users — only the owning user (via `/me/`, partially) and staff (via `/users/<id>/`) can read it. MFA enrollment status (`mfa_enrolled`-equivalent) is **not** stored here — see §6 `is_mfa_enrolled()`.

---

## 3. UserSession

**Purpose:** Tracks issued refresh-token sessions for session review/revocation and device-limit enforcement.

**Table:** `authenticate_user_session`

**Revoke reasons:** `logout`, `staff_revoked`, `device_limit_superseded`, `security_incident`

| Field             | Type                   | Required | Nullable | Generated | Description                                                           |
| ----------------- | ---------------------- | -------- | -------- | --------- | --------------------------------------------------------------------- |
| id                | UUID                   | —        | No       | Yes       | Primary key                                                           |
| user              | FK → User              | Yes      | No       | No        | CASCADE on delete                                                     |
| refresh_token_jti | CharField(255)         | Yes      | No       | No        | Unique, indexed. **Raw refresh token is never stored**                |
| device_label      | CharField(255)         | No       | No       | No        | Human-readable, regex-parsed from User-Agent (e.g. "Chrome on macOS") |
| ip_address        | GenericIPAddressField  | No       | Yes      | No        | Raw IP at session issuance                                            |
| user_agent_hash   | CharField(128)         | No       | No       | No        | sha256 of the raw User-Agent. **Raw User-Agent is never stored**      |
| issued_at         | DateTimeField          | Yes      | No       | No        | When the session/refresh token was issued                             |
| last_seen_at      | DateTimeField          | Yes      | No       | No        | Updated on every successful refresh                                   |
| expires_at        | DateTimeField          | Yes      | No       | No        | Matches refresh token expiry                                          |
| revoked_at        | DateTimeField          | No       | Yes      | No        | Set on logout/revocation                                              |
| revoked_reason    | CharField(30), choices | No       | No       | No        | Blank, or one of the revoke reasons above                             |
| is_active         | Boolean                | No       | No       | No        | Default `True`                                                        |
| created_at        | DateTimeField          | —        | No       | Yes       | Auto                                                                  |
| updated_at        | DateTimeField          | —        | No       | Yes       | Auto                                                                  |

**Indexes:** composite `(user, is_active)` — supports the device-limit check (`count_active_sessions_for_user`) which runs on every login.

**Validation rules:**

- A user may have at most `settings.AUTH_MAX_ACTIVE_SESSIONS_PER_USER` (default 3) rows with `is_active=True` and `expires_at` in the future
- Session list/revoke responses must never include `refresh_token_jti`, raw tokens, or raw User-Agent

**Example:**

```json
{
  "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "user": "9c4e3b7a-1f2d-4a6e-8b3c-7d5f1a2b3c4d",
  "device_label": "Chrome on macOS",
  "ip_address": "203.0.113.42",
  "issued_at": "2026-06-22T10:15:00Z",
  "last_seen_at": "2026-06-22T11:00:00Z",
  "expires_at": "2026-06-29T10:15:00Z",
  "revoked_at": null,
  "revoked_reason": "",
  "is_active": true
}
```

---

## 4. AuthEvent

**Purpose:** Append-only security event log for authentication activity. Distinct domain from `core.policy_engine.PolicyChangeLog` (which logs configuration/schema mutations, not actor activity) — deliberately **not** sharing an enforcement mechanism with it (see Cross-App Dependencies below).

**Table:** `authenticate_auth_event`

**Event types:** `login_success`, `login_failed`, `login_blocked_disabled`, `login_blocked_inactive`, `login_blocked_locked`, `login_blocked_device_limit`, `logout_success`, `refresh_success`, `refresh_failed`, `password_changed`, `password_reset_requested`, `password_reset_completed`, `account_locked`, `account_unlocked`, `login_enabled`, `login_disabled`, `mfa_challenge_created`, `mfa_challenge_failed`, `mfa_challenge_success`, `mfa_disabled`, `mfa_reset_by_staff`, `session_revoked`, `all_sessions_revoked`, `service_account_credential_created`, `service_account_credential_revoked`, `service_account_auth_failed`

**Failure reasons:** `invalid_credentials`, `account_inactive`, `login_disabled`, `account_locked`, `mfa_required`, `mfa_invalid`, `device_limit_reached`, `axes_locked`, `service_account_key_invalid`

| Field              | Type                   | Required | Nullable | Generated          | Description                                                           |
| ------------------ | ---------------------- | -------- | -------- | ------------------ | --------------------------------------------------------------------- |
| id                 | UUID                   | —        | No       | Yes                | Primary key                                                           |
| user               | FK → User              | No       | Yes      | No                 | `SET_NULL` — preserved even if the user record is later removed       |
| identifier_entered | CharField(255)         | No       | No       | No                 | What was typed, even if no matching user exists (security monitoring) |
| event_type         | CharField(40), choices | Yes      | No       | No                 | One of the event types above                                          |
| success            | Boolean                | Yes      | No       | No                 | —                                                                     |
| failure_reason     | CharField(40), choices | No       | No       | No                 | Blank on success                                                      |
| ip_address         | GenericIPAddressField  | No       | Yes      | No                 | —                                                                     |
| user_agent_hash    | CharField(128)         | No       | No       | No                 | sha256 only, raw UA never stored                                      |
| request_id         | CharField(64)          | No       | No       | No                 | Correlates to `core.middleware.RequestIDMiddleware`                   |
| metadata           | JSONField              | No       | No       | Yes (default `{}`) | Additional non-sensitive context                                      |
| created_at         | DateTimeField          | —        | No       | Yes                | Auto. **No `updated_at` — this model is genuinely append-only**       |

**Indexes:** `(user, created_at)`, `(event_type, created_at)`.

**Integrity rules:**

- `AuthEvent.save()` raises if called on an existing row (`not self._state.adding`) — enforced locally in `authenticate/models.py`, not via a shared base class.
- Never log passwords, JWTs, OTP codes, reset tokens, API keys, or `Authorization` headers in `metadata`.
- Internal `failure_reason` may be specific; the public API response must always remain generic (see `authenticate/docs/SECURITY.md`).

**Example:**

```json
{
  "id": "f1e2d3c4-b5a6-4978-8d6e-5f4c3b2a1908",
  "user": "9c4e3b7a-1f2d-4a6e-8b3c-7d5f1a2b3c4d",
  "identifier_entered": "j.doe",
  "event_type": "login_failed",
  "success": false,
  "failure_reason": "invalid_credentials",
  "ip_address": "203.0.113.42",
  "request_id": "8f14e45f-ceea-4a3a-9e7b-1f2a3b4c5d6e",
  "metadata": {},
  "created_at": "2026-06-22T10:14:55Z"
}
```

---

## 5. UserPasswordHistory

**Purpose:** Stores prior password hashes (never plaintext) so `change_password` can block reuse of the last `AUTH_PASSWORD_HISTORY_DEPTH` (default 5) passwords.

**Table:** `authenticate_user_password_history`

| Field         | Type           | Required | Nullable | Generated | Description                                                           |
| ------------- | -------------- | -------- | -------- | --------- | --------------------------------------------------------------------- |
| id            | UUID           | —        | No       | Yes       | Primary key                                                           |
| user          | FK → User      | Yes      | No       | No        | CASCADE on delete                                                     |
| password_hash | CharField(255) | Yes      | No       | No        | A prior `User.password` hash, pushed here right before being replaced |
| created_at    | DateTimeField  | —        | No       | Yes       | Auto                                                                  |
| updated_at    | DateTimeField  | —        | No       | Yes       | Auto (present from `BaseModel`, not meaningfully used)                |

**Indexes:** `(user, created_at)` — supports the recency-ordered lookup used by the reuse check.

**Integrity rules:**

- **Not append-only**, unlike `AuthEvent` — pruning entries beyond `AUTH_PASSWORD_HISTORY_DEPTH - 1` (the current password itself counts as 1 of the depth) is normal, expected behavior, done automatically on every `change_password`/`set_temporary_password` call.
- `change_password` checks the new password against `User.password` (current) plus the retained history hashes and raises `AUTH_PASSWORD_REUSE_BLOCKED` on a match.
- `set_temporary_password` (staff override) records history but does **not** gate on it — a staff-assigned temporary password is expected to be replaced again immediately via `password_change_required`.

**Example:**

```json
{
  "id": "b2c3d4e5-...",
  "user": "9c4e3b7a-...",
  "password_hash": "argon2$argon2id$v=19$...",
  "created_at": "2026-05-01T12:00:00Z"
}
```

**Security notes:** Only ever stores hashes produced by Django's configured `PASSWORD_HASHERS`; never plaintext. Never exposed via any serializer.

---

## 6. ServiceAccountCredential

**Purpose:** API-key-style credential for non-human actors (`actor_type` `system`/`ai`/`external`), authenticated via `authenticate.authentication.ServiceAccountAuthentication` — entirely separate from the human password+MFA login flow.

**Table:** `authenticate_service_account_credential`

| Field        | Type           | Required | Nullable | Generated | Description                                                             |
| ------------ | -------------- | -------- | -------- | --------- | ----------------------------------------------------------------------- |
| id           | UUID           | —        | No       | Yes       | Primary key                                                             |
| user         | FK → User      | Yes      | No       | No        | The non-human actor this credential authenticates as. CASCADE on delete |
| key_id       | CharField(32)  | Yes      | No       | No        | Unique, indexed, non-secret lookup prefix (`secrets.token_hex(8)`)      |
| secret_hash  | CharField(64)  | Yes      | No       | No        | sha256 hex digest of the secret. **Raw secret is never stored**         |
| name         | CharField(255) | No       | No       | No        | Staff-assigned label (e.g. "CI pipeline key")                           |
| last_used_at | DateTimeField  | No       | Yes      | No        | Updated on every successful authentication                              |
| expires_at   | DateTimeField  | No       | Yes      | No        | Optional; expired credentials are rejected at auth time                 |
| revoked_at   | DateTimeField  | No       | Yes      | No        | Set by `revoke_service_account_credential`                              |
| is_active    | Boolean        | No       | No       | No        | Default `True`. `False` after revocation                                |
| created_at   | DateTimeField  | —        | No       | Yes       | Auto                                                                    |
| updated_at   | DateTimeField  | —        | No       | Yes       | Auto                                                                    |

**Indexes:** `(user, is_active)`.

**Validation rules:**

- Can only be created for a `User` whose `actor_type != human` (`AUTH_SERVICE_ACCOUNT_ACTOR_TYPE_INVALID` otherwise).
- The plaintext token (`f"{key_id}.{secret}"`) is returned **exactly once**, at creation — never retrievable again, only revocable + replaceable.

**Example (list/read — never includes the token):**

```json
{
  "id": "c3d4e5f6-...",
  "key_id": "8f3a2b1c9d0e1f2a",
  "name": "CI pipeline key",
  "last_used_at": "2026-06-22T11:00:00Z",
  "expires_at": null,
  "revoked_at": null,
  "is_active": true,
  "created_at": "2026-06-20T09:00:00Z"
}
```

**Example (create response — token present exactly once):**

```json
{
  "id": "c3d4e5f6-...",
  "key_id": "8f3a2b1c9d0e1f2a",
  "token": "8f3a2b1c9d0e1f2a.AbCdEf...",
  "...": "..."
}
```

**Security notes:** Authenticated via `Authorization: ApiKey <key_id>.<secret>` (a distinct scheme from `Bearer <jwt>`, so both can coexist in `DEFAULT_AUTHENTICATION_CLASSES`). Secret comparison uses `hmac.compare_digest` (constant-time) against the stored sha256, never a plain `==`. Failed attempts create `AuthEvent(service_account_auth_failed)`; successful ones only update `last_used_at` (not logged per-request, to avoid unbounded `AuthEvent` growth for active service accounts).

---

## 7. Request/response payload contracts

### 7.1 Login — `POST /api/v1/auth/login/`

**Request:**

```json
{ "identifier": "j.doe", "password": "••••••••••••" }
```

**Response (success, dev body-token mode):**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access": "eyJ...",
    "refresh": "eyJ...",
    "user": {
      "id": "9c4e3b7a-...",
      "username": "j.doe",
      "display_name": "Jane Doe"
    },
    "mfa_setup_recommended": false
  },
  "meta": {}
}
```

`mfa_setup_recommended` is `true` when staff has mandated MFA (`mfa_required=True`) but the actor has not yet enrolled a device — login still succeeds (there is nothing to challenge against yet); the client should prompt the user to call MFA setup (§7.10) immediately. See `DEBUG_HISTORY.md` for why this doesn't block login.

**Response (MFA required, no tokens yet — only when a device IS enrolled):**

```json
{
  "success": true,
  "message": "MFA verification required.",
  "data": { "mfa_required": true, "challenge_id": "..." },
  "meta": {}
}
```

**Response (generic failure):**

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

**Validation rules:** `identifier` and `password` required, non-blank. Throttled via `auth_login` scope (10/min).

### 7.2 Refresh — `POST /api/v1/auth/refresh/`

**Request:** `{ "refresh": "eyJ..." }` (or cookie in prod/staging — see SECURITY.md).
**Response:** `{ "success": true, "message": "Token refreshed.", "data": { "access": "eyJ...", "refresh": "eyJ..." }, "meta": {} }`. Rotates `UserSession.refresh_token_jti` on the same row.

### 7.3 Logout — `POST /api/v1/auth/logout/`

**Request:** `{ "refresh": "eyJ..." }` (or cookie). **Response:** `{ "success": true, "message": "Logged out.", "data": {}, "meta": {} }`. Revokes the matching `UserSession`.

### 7.4 Me — `GET` / `PATCH /api/v1/auth/me/`

**GET response:** `{ "success": true, "message": "", "data": { "id": "...", "username": "j.doe", "email": "...", "display_name": "Jane Doe", "actor_type": "human", "account_status": "active" }, "meta": {} }`.
**PATCH request:** `{ "display_name": "Jane A. Doe" }` — only `display_name`/`email` are self-editable.

### 7.5 Change password — `POST /api/v1/auth/change-password/`

**Request:** `{ "old_password": "...", "new_password": "..." }`. **Response:** `{ "success": true, "message": "Password changed.", "data": {}, "meta": {} }`. Errors: `AUTH_PASSWORD_INVALID` (wrong old password), `AUTH_PASSWORD_REUSE_BLOCKED` (matches one of the last `AUTH_PASSWORD_HISTORY_DEPTH` passwords).

### 7.6 Staff user create — `POST /api/v1/auth/users/`

**Request:** `{ "username": "j.doe", "display_name": "Jane Doe", "email": "j.doe@example.gov", "actor_type": "human", "password": "..." }`. **Response:** the `User` contract shape above (§1 example), without `password`. `password` is omitted/null for non-human `actor_type` (`AUTH_SERVICE_ACCOUNT_ACTOR_TYPE_INVALID` is not raised here — that check belongs to `ServiceAccountCredential` creation, not `User` creation itself); a human `actor_type` without a password is rejected with a validation error.

### 7.7 User update — `PATCH /api/v1/auth/users/<id>/`

**Request:** any subset of `display_name`, `email`, `actor_type`. Never `is_staff`/`is_superuser`/`account_status` through this endpoint — those go through their own dedicated action endpoints.

### 7.8 Session list/revoke — `GET /api/v1/auth/sessions/`, `POST /api/v1/auth/sessions/<id>/revoke/`

**List response item:** `{ "id": "...", "device_label": "Chrome on macOS", "ip_address": "203.0.113.42", "issued_at": "...", "last_seen_at": "...", "expires_at": "...", "is_active": true }` — never `refresh_token_jti`. No `is_current` flag — the access token does not carry the refresh token's JTI, so there is no reliable way to mark "this session" from an access-token-authenticated request without adding a custom token claim; deliberately not built in this version rather than shipping an inaccurate flag.

### 7.9 Auth event list — `GET /api/v1/auth/users/<id>/auth-events/`

**List response item:** the `AuthEvent` contract shape above (§4 example), paginated per `core.pagination.StandardPagination`.

### 7.10 MFA setup/confirm/verify/disable/regenerate

**Setup response:** `{ "success": true, "data": { "provisioning_uri": "otpauth://totp/...", "secret": "BASE32SECRET" }, "meta": {} }`.
**Confirm request:** `{ "code": "123456" }`. **Confirm response:** `{ "success": true, "data": { "recovery_codes": ["abcd-1234", "..."] }, "meta": {} }` (shown once).
**Verify request (during login):** `{ "challenge_id": "...", "code": "123456" }`.
**Disable response (400, blocked by policy):** `{ "success": false, "error": { "code": "AUTH_MFA_DISABLE_BLOCKED_BY_POLICY", "message": "...", "details": {} }, "meta": {} }` — only when `mfa_required=True`; ask staff for a reset instead (§7.13).

### 7.11 Error envelope (generic, all pre-auth failures)

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

### 7.12 Device limit (post-auth, specific — not an enumeration risk)

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

### 7.13 Staff: reset actor MFA — `POST /api/v1/auth/users/<id>/mfa/reset/`

**Request:** none. **Response:** `{ "success": true, "message": "MFA reset for this actor.", "data": {}, "meta": {} }`. Removes the actor's `TOTPDevice`/`StaticDevice` rows; deliberately does **not** change `UserSecurityState.mfa_required` (see §2). Idempotent if no device exists.

### 7.14 Staff: create service account credential — `POST /api/v1/auth/users/<id>/service-account-credentials/`

**Request:** `{ "name": "CI pipeline key", "expires_at": null }` (both optional). **Response (201):** the `ServiceAccountCredential` contract (§6 create-response example) — `token` is present only in this one response.
**Response (400):** `AUTH_SERVICE_ACCOUNT_ACTOR_TYPE_INVALID` if the target user's `actor_type` is `human`.

### 7.15 Staff: list service account credentials — `GET /api/v1/auth/users/<id>/service-account-credentials/`

**Response:** paginated `ServiceAccountCredential` contract items (§6 list example) — never includes `token`/`secret_hash`.

### 7.16 Staff: revoke service account credential — `POST /api/v1/auth/users/<id>/service-account-credentials/<credential_id>/revoke/`

**Response:** `{ "success": true, "message": "Service account credential revoked.", "data": {}, "meta": {} }`. **404** if the credential doesn't belong to the specified user.

---

## Cross-App Dependencies

`authenticate` has no dependencies on other business apps. It is the FK target for future apps (`organization`, `permissions`, `events`, `audit`). It registers all endpoints with `core.policy_engine` through that app's existing public mechanism (`registry.py` + `sync_policy_registry`) — `core.policy_engine`'s own source code and models are never modified by this app, and `authenticate` does not import or reuse any of `core.policy_engine`'s internal model/manager classes (see SECURITY.md for the append-only-pattern independence rationale).

---

## Soft Delete

Not used. `User.account_status` (`archived`) and `is_active`/`is_login_enabled` cover the lifecycle states this app needs. `AuthEvent` rows are never deleted (append-only); retention policy is not yet decided (flagged in SECURITY.md as a future item).

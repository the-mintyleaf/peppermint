# API — Authentication & Accounts

**App:** `authenticate`
**Version:** 1.0.0
**Base prefix:** `/api/v1/auth/`
**Auth:** JWT bearer (`Authorization: Bearer <access>`) except the public login / refresh endpoints.
**Throttle:** scoped throttles on public endpoints (see per-endpoint notes); authenticated endpoints use the global `user` rate.
**Access level:** mixed — see each endpoint.

---

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-15 | AI (Claude) | Session 2 — login, token refresh, current user, logout, logout-all, own sessions. |
| 1.1.0 | 2026-07-15 | AI (Claude) | Session 3 — first-login password change + own password change; login now issues a first-login challenge (replacing the transitional 403); cooldown/auto-suspension documented. |
| 1.2.0 | 2026-07-15 | AI (Claude) | Session 4 — account administration (list/create/read/profile/deactivate/reactivate/suspend/unsuspend/reset-password/sessions/revoke) and the superadmin security-event feed. |
| 1.2.1 | 2026-07-15 | AI (Claude) | Fidelity fix — superadmin reset now enforces password history; create rejects a temp password similar to the employee name/code. Documented `AUTH_PASSWORD_HISTORY_REUSED` on reset and similarity on create. |

---

## Response Envelopes

**Success:**
```json
{ "success": true, "message": "...", "data": { }, "meta": { } }
```

**Error:**
```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "...", "details": { } }, "meta": { } }
```

## AI Debugging Notes (app-wide)

- Every access token is bound to an `AuthSession`; `SessionJWTAuthentication` rejects a token whose session is revoked/expired, whose account is not active, or whose `token_version` no longer matches — so logout / new-login / deactivation take effect immediately, not after the 10-minute access-token TTL.
- The refresh token lives ONLY in the `mintway_refresh` HttpOnly cookie; it is never in a response body.
- Cookie endpoints (`token/refresh/`, `logout/`, `logout-all/`) require the double-submit CSRF header `X-CSRFToken` matching the `mintway_csrf` cookie.

---

## 1. Session

### 1.1 Log In — POST `/api/v1/auth/login/`

**Auth:** public. **Throttle:** `auth_login` (10/min per IP). **Policy key:** `authenticate.session.login` (high).

**Request:**
```json
{ "username": "aayush.karki", "password": "S3cret#Pass" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": { "access_token": "<jwt>", "access_expires_at": "2026-07-15T06:25:00+00:00" },
  "meta": {}
}
```
Sets three cookies: `mintway_refresh` (Secure, HttpOnly, path `/api/v1/auth/token/refresh/`), `mintway_csrf` (JS-readable), `mintway_device` (HttpOnly). The refresh token is never in the body.

**Validation rules:** `username` required (normalized lowercase); `password` required.

**First-login response (200):** if `password_change_required` is set, login does NOT create a session; it returns a challenge instead:
```json
{ "success": true, "message": "Password change required before sign-in.",
  "data": { "password_change_required": true, "next_action": "first_login_password_change",
            "challenge_token": "<opaque>", "challenge_expires_at": "..." }, "meta": {} }
```

**Error codes:**
- `AUTH_LOGIN_INVALID_CREDENTIALS` (401) — any credential/state failure (unknown user, wrong password, suspended, deactivated, cooldown). Body is byte-identical across causes (§12.1).

**Business rules:** establishes exactly one active session; a successful login revokes any previous active session and its tokens. **Login defense (§12):** 5 consecutive failures → 5-minute cooldown; 10 → 10-minute cooldown; 15 → automatic suspension (superadmin recovery only). Attempts during cooldown are rejected generically without verifying the password or incrementing the counter. A full successful login resets the failure state.

### 1.2 Refresh Access Token — POST `/api/v1/auth/token/refresh/`

**Auth:** refresh cookie + CSRF header (no bearer). **Throttle:** `auth_refresh` (120/hour per IP). **Policy key:** `authenticate.session.refresh` (high).

**Request:** no body. Sends `mintway_refresh` cookie + `X-CSRFToken` header.

**Response (200):** same shape as login `data` (new access token); rotates and re-sets the `mintway_refresh` cookie.

**Error codes:**
- `AUTH_CSRF_FAILED` (403) — missing/mismatched `X-CSRFToken`.
- `AUTH_TOKEN_INVALID` (401) — missing/expired/rotated/reused refresh token, revoked session, inactive account, or `token_version` mismatch. Replaying a rotated-out token revokes the session (reuse detection).

**Business rules:** refresh rotates the token every call; the session's absolute 7-day expiry is never extended.

### 1.3 Log Out — POST `/api/v1/auth/logout/`

**Auth:** bearer + CSRF header. **Policy key:** `authenticate.session.logout` (medium).

**Response (200):** `{ "success": true, "message": "Logged out.", ... }`; clears the refresh cookie. Idempotent.

**Error codes:** `AUTH_CSRF_FAILED` (403).

### 1.4 Log Out All — POST `/api/v1/auth/logout-all/`

**Auth:** bearer + CSRF header. **Policy key:** `authenticate.session.logout_all` (medium).

**Response (200):** `data: { "sessions_revoked": <int> }`; bumps `token_version` (invalidating every outstanding token) and clears the refresh cookie.

**Error codes:** `AUTH_CSRF_FAILED` (403).

### 1.5 List Own Sessions — GET `/api/v1/auth/sessions/`

**Auth:** bearer. **Policy key:** `authenticate.session.list_self` (low).

**Response (200):** `data` is a list of known-device summaries:
```json
[ { "id": "<uuid>", "ua_summary": "Chrome on macOS", "first_seen_at": "...", "last_seen_at": "...", "last_ip": "203.0.113.5", "is_current": true } ]
```
No tokens are ever exposed.

---

## 2. User

### 2.1 Current User — GET `/api/v1/auth/me/`

**Auth:** bearer. **Policy key:** `authenticate.user.read_self` (low).

**Response (200):** approved account + employee profile (requirement §17), with a singular `role`. See `DATA_CONTRACT.md §1` / `§2`.
```json
{
  "success": true,
  "message": "Current user retrieved.",
  "data": {
    "id": "<uuid>", "username": "aayush.karki", "role": "staff",
    "account_status": "active", "password_change_required": false,
    "last_login_at": "2026-07-15T06:15:00Z",
    "employee_profile": { "employee_code": "EMP-0012", "first_name": "Aayush", "last_name": "Karki", "job_title": "...", "employment_start_date": "2026-07-01", "employment_status": "active", "email": null, "phone": null, "profile_image": null, "middle_name": "", "preferred_name": "", "employment_end_date": null }
  },
  "meta": {}
}
```

**Error codes:** standard `AUTHENTICATION_FAILED` (401) when unauthenticated.

### 2.2 Complete First-Login Password Change — POST `/api/v1/auth/password/first-login-change/`

**Auth:** public (uses the login challenge). **Throttle:** `auth_first_login` (10/hour per IP). **Policy key:** `authenticate.user.complete_first_login` (high).

**Request:**
```json
{ "challenge_token": "<from login>", "new_password": "N3w#Secret", "new_password_confirm": "N3w#Secret" }
```

**Response (200):** `{ "data": { "next_action": "login" }, ... }` — the account then signs in normally. The challenge is single-use, expires after 10 minutes, and clearing it revokes any sessions.

**Error codes:**
- `AUTH_CHALLENGE_INVALID` (401) — missing/expired/consumed challenge.
- `AUTH_PASSWORD_POLICY_VIOLATION` (400) — new password fails policy (`details.password` lists reasons).
- `AUTH_PASSWORD_HISTORY_REUSED` (400) — matches the current or a recent password.
- `VALIDATION_ERROR` (400) — `new_password_confirm` mismatch.

### 2.3 Change Own Password — POST `/api/v1/auth/password/change/`

**Auth:** bearer. **Policy key:** `authenticate.user.change_password` (high).

**Request:**
```json
{ "current_password": "...", "new_password": "N3w#Secret", "new_password_confirm": "N3w#Secret" }
```

**Response (200):** `{ "data": { "next_action": "login" }, ... }`. **Revokes all sessions** (including the current one) and clears the refresh cookie — the user must sign in again.

**Error codes:**
- `AUTH_PASSWORD_CURRENT_INCORRECT` (400) — wrong current password.
- `AUTH_PASSWORD_POLICY_VIOLATION` (400) — new password fails policy.
- `AUTH_PASSWORD_HISTORY_REUSED` (400) — matches the current or a recent password.
- `VALIDATION_ERROR` (400) — `new_password_confirm` mismatch.

---

## 3. Account Administration

All endpoints require an authenticated administrator. **Access:** `admin` or `superadmin` unless marked *superadmin-only*. Admins may only act on `staff` accounts for lifecycle operations; the superadmin account is never visible or targetable through these endpoints (returns `AUTH_USER_NOT_FOUND`). Object-level rules are enforced in the service layer; coarse role gates in `authenticate/permissions.py`. Bearer-authenticated (no CSRF).

| Action | Method + Path | Policy key | Risk | Access |
|---|---|---|---|---|
| List accounts | GET `/users/` | `authenticate.user.list` | medium | admin, superadmin |
| Create account | POST `/users/` | `authenticate.user.create` | high | admin, superadmin |
| Read account | GET `/users/<id>/` | `authenticate.user.read` | medium | admin, superadmin |
| Update profile | PATCH `/users/<id>/profile/` | `authenticate.employee_profile.update` | medium | admin, superadmin |
| Deactivate | POST `/users/<id>/deactivate/` | `authenticate.user.deactivate` | critical | admin (staff only), superadmin |
| Reactivate | POST `/users/<id>/reactivate/` | `authenticate.user.reactivate` | high | admin (staff only), superadmin |
| Suspend | POST `/users/<id>/suspend/` | `authenticate.user.suspend` | critical | superadmin |
| Unsuspend | POST `/users/<id>/unsuspend/` | `authenticate.user.unsuspend` | critical | superadmin |
| Reset password | POST `/users/<id>/reset-password/` | `authenticate.user.reset_password` | critical | superadmin |
| List target sessions | GET `/users/<id>/sessions/` | `authenticate.session.list_target` | medium | superadmin |
| Revoke target sessions | POST `/users/<id>/revoke-sessions/` | `authenticate.session.revoke` | critical | superadmin |
| Security events | GET `/security-events/` | `authenticate.security_event.list` | high | superadmin |

**List/create (`/users/`):** list is paginated (`StandardPagination`, `?page`, `?page_size`, plus `?role`, `?status`, `?search`); each item is the admin user shape (account + `employee_profile`). Create body: `{ username, temporary_password, role (admin|staff), employee_code, first_name, last_name, job_title, employment_start_date, middle_name?, preferred_name?, contact_email?, contact_phone?, remarks? }` → `201` with the created account (temp password never returned; `password_change_required=true`).

**Lifecycle actions:** deactivate/suspend take `{ reason }`; reset-password takes `{ temporary_password }`. Deactivate/suspend/reset revoke the target's sessions and bump its `token_version`. Reactivate/unsuspend take no body; unsuspend also clears cooldown/failure state.

**Profile update:** only non-security fields (`first_name`, `middle_name`, `last_name`, `preferred_name`, `job_title`, `contact_email`, `contact_phone`, `employment_end_date`, `employment_status`, `remarks`) — `username`, `role`, `employee_code`, and `employment_start_date` are not editable here.

**Security events (`/security-events/`):** superadmin-only, paginated, filterable by `?event_type` and `?target_id`. Never contains passwords, hashes, or tokens.

**Admin error codes:** `AUTH_USER_NOT_FOUND` (404), `AUTH_USER_TARGET_FORBIDDEN` (403 — e.g. admin acting on an admin), `AUTH_USER_STATE_CONFLICT` (409 — invalid lifecycle transition), `AUTH_USER_ROLE_INVALID` (400), `AUTH_USER_USERNAME_TAKEN` (409), `AUTH_USER_EMPLOYEE_CODE_TAKEN` (409), `AUTH_PASSWORD_POLICY_VIOLATION` (400 — weak temporary password, or too similar to the employee's name/code on create), `AUTH_PASSWORD_HISTORY_REUSED` (400 — a superadmin reset may not repeat the target's current/recent password). Role-gate failures use `PERMISSION_DENIED` (403).

---

## Error Code Reference

Codes are defined in `authenticate/constants.py` (`AuthErrorCode`).

| Code | HTTP | Meaning |
|------|------|---------|
| `AUTH_LOGIN_INVALID_CREDENTIALS` | 401 | Generic login failure (never reveals account state) |
| `AUTH_TOKEN_INVALID` | 401 | Refresh token/session invalid, expired, revoked, or reused |
| `AUTH_CSRF_FAILED` | 403 | Missing/mismatched CSRF token on a cookie endpoint |
| `AUTH_CHALLENGE_INVALID` | 401 | First-login challenge missing, expired, or already used |
| `AUTH_PASSWORD_POLICY_VIOLATION` | 400 | New password fails the policy (details list reasons) |
| `AUTH_PASSWORD_CURRENT_INCORRECT` | 400 | Wrong current password on change |
| `AUTH_PASSWORD_HISTORY_REUSED` | 400 | New password repeats the current or a recent one |
| `AUTH_PASSWORD_CHANGE_REQUIRED` | 403 | Reserved (defense-in-depth); login now returns a challenge instead |
| `AUTH_USER_NOT_FOUND` | 404 | Target account not found or not visible (incl. the superadmin) |
| `AUTH_USER_TARGET_FORBIDDEN` | 403 | Action not permitted on this target (e.g. admin acting on an admin) |
| `AUTH_USER_STATE_CONFLICT` | 409 | Account is not in a state that allows the action |
| `AUTH_USER_ROLE_INVALID` | 400 | Role invalid for the operation (e.g. creating a superadmin) |
| `AUTH_USER_USERNAME_TAKEN` | 409 | Username already in use |
| `AUTH_USER_EMPLOYEE_CODE_TAKEN` | 409 | Employee code already in use |

Framework-level auth failures use the core codes `AUTHENTICATION_REQUIRED` / `AUTHENTICATION_FAILED` (401), `PERMISSION_DENIED` (403), `RATE_LIMIT_EXCEEDED` (429).

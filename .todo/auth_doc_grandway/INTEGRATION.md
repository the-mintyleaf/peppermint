## 1. Module
- **Name:** Authentication & Accounts (`authenticate`)
- **Base path:** `/api/v1/auth/`
- **Auth:** JWT bearer (`Authorization: Bearer <access>`) on all endpoints except the public `login/` and `token/refresh/`.

## 2. Conventions  (extracted from the doc — not assumed)
- **Response:** `{ success, message, data, meta }`.
- **Error:** `{ success, error: { code, message, details }, meta }`.
- **Auth failures:** `AUTHENTICATION_FAILED` / `AUTHENTICATION_REQUIRED` (401), `PERMISSION_DENIED` (403), `RATE_LIMIT_EXCEEDED` (429).
- **Pagination:** not used by these endpoints.
- **IDs:** UUID string. **Times:** ISO 8601 UTC.
- **List/search/filter/order params:** none.

## 3. Models
**Access token response**
`{ access_token, access_expires_at }`
- refresh token is never in the body — it is set in the `mintway_refresh` HttpOnly cookie

**CurrentUser**
`{ id, username, role[enum], account_status[enum], password_change_required, last_login_at?, employee_profile }`
- `employee_profile`: `{ employee_code, first_name, middle_name, last_name, preferred_name, profile_image?, email?, phone?, job_title, employment_start_date, employment_end_date?, employment_status[enum] }`

**SessionDevice**
`{ id, ua_summary, first_seen_at, last_seen_at, last_ip?, is_current }`

**UserAdmin** (administration list/read/create)
`{ id, username, role[enum], account_status[enum], password_change_required, last_login_at?, created_at, deactivated_at?, suspended_at?, employee_profile }`

**SecurityEvent** (superadmin audit)
`{ id, event_type[enum], success, actor_username, target_username, session_id?, device_id?, ip?, ua_summary, reason_code, metadata:json, created_at }`

## 4. Enums
- `User.role: superadmin | admin | staff`
- `User.account_status: active | suspended | deactivated`
- `EmployeeProfile.employment_status: active | ended`

## 5. Dependency order
- `token/refresh/`, `logout/`, `logout-all/`, `sessions/`, `me/`, `password/change/` all need a prior `login/`.
- `password/first-login-change/` needs a challenge from a first-login attempt at `login/`.
- **Start here:** `POST /api/v1/auth/login/`.

## 6. Endpoints

### Session — /api/v1/auth/
**Use it when:** signing in, keeping a session alive, signing out, and showing the user their devices.

**Methods:**
- POST `/api/v1/auth/login/`
- POST `/api/v1/auth/token/refresh/`
- POST `/api/v1/auth/logout/`
- POST `/api/v1/auth/logout-all/`
- GET `/api/v1/auth/sessions/`

**Send (login):**
- `{ username (required), password (required) }`

**Send (refresh/logout/logout-all):** none — send the `mintway_refresh` cookie (refresh) / bearer token, plus the `X-CSRFToken` header matching the `mintway_csrf` cookie.

**Returns:**
- login: `Access token response` (+ sets `mintway_refresh`/`mintway_csrf`/`mintway_device` cookies); OR, for a first-login account, `{ password_change_required, next_action, challenge_token, challenge_expires_at }` with NO session/cookies
- refresh: `Access token response` (rotates `mintway_refresh`)
- logout / logout-all: message (logout-all also returns `{ sessions_revoked }`)
- sessions: list[`SessionDevice`]

**Notes:**
- Only one active session per account — a new login revokes the previous one.
- Refresh rotates the token every call; the 7-day absolute session cap is never extended; replaying a rotated-out token revokes the session.
- Logout is idempotent and clears the refresh cookie; logout-all revokes every session and invalidates outstanding access tokens.
- Login defense: 5 failures → 5-min cooldown, 10 → 10-min, 15 → suspension; cooldown attempts are rejected without verifying the password.

**Errors:**
- `AUTH_LOGIN_INVALID_CREDENTIALS` (401) — generic login failure (incl. cooldown)
- `AUTH_TOKEN_INVALID` (401) — refresh token/session invalid, expired, revoked, or reused
- `AUTH_CSRF_FAILED` (403) — missing/mismatched CSRF header on a cookie endpoint

### User — /api/v1/auth/
**Use it when:** loading the signed-in user, completing a forced first-login password change, or changing your own password.

**Methods:**
- GET `/api/v1/auth/me/`
- POST `/api/v1/auth/password/first-login-change/`
- POST `/api/v1/auth/password/change/`

**Send (first-login-change):**
- `{ challenge_token (required), new_password (required), new_password_confirm (required) }`

**Send (change):**
- `{ current_password (required), new_password (required), new_password_confirm (required) }`

**Returns:**
- me: `CurrentUser`
- first-login-change / change: `{ next_action: "login" }`

**Notes:**
- The first-login challenge is single-use and expires after 10 minutes.
- Changing your own password revokes ALL sessions (including the current one) and clears the refresh cookie.

**Errors:**
- `AUTH_CHALLENGE_INVALID` (401) — first-login challenge missing/expired/used
- `AUTH_PASSWORD_CURRENT_INCORRECT` (400) — wrong current password
- `AUTH_PASSWORD_POLICY_VIOLATION` (400) — new password fails policy
- `AUTH_PASSWORD_HISTORY_REUSED` (400) — repeats the current or a recent password
- `VALIDATION_ERROR` (400) — password confirmation mismatch

## 7. Flows

**Sign in and load the app**
1. `POST /api/v1/auth/login/` → `{ access_token }` (+ cookies)
   - `AUTH_LOGIN_INVALID_CREDENTIALS` → show a generic "invalid username or password" message
   - first-login response (`password_change_required`) → go to the first-login flow below
2. `GET /api/v1/auth/me/` (bearer) → render the user

**First-login password change**
1. `POST /api/v1/auth/login/` → `{ challenge_token }`
2. `POST /api/v1/auth/password/first-login-change/` with the challenge + new password → `{ next_action: "login" }`
   - `AUTH_CHALLENGE_INVALID` → restart from login
3. `POST /api/v1/auth/login/` with the new password → normal session

**Keep the session alive**
1. On access-token expiry, `POST /api/v1/auth/token/refresh/` with the cookie + `X-CSRFToken` → new access token
   - `AUTH_TOKEN_INVALID` → session ended; send the user back to login

**Sign out**
1. `POST /api/v1/auth/logout/` (bearer + CSRF) → session revoked, refresh cookie cleared

### Administration — /api/v1/auth/users/ and /security-events/
**Use it when:** administrators manage accounts and the superadmin audits security activity.

**Methods:**
- GET `/api/v1/auth/users/` (paginated: `page`, `page_size`, `role`, `status`, `search`)
- POST `/api/v1/auth/users/`
- GET `/api/v1/auth/users/<id>/`
- PATCH `/api/v1/auth/users/<id>/profile/`
- POST `/api/v1/auth/users/<id>/deactivate/`
- POST `/api/v1/auth/users/<id>/reactivate/`
- POST `/api/v1/auth/users/<id>/suspend/` (superadmin)
- POST `/api/v1/auth/users/<id>/unsuspend/` (superadmin)
- POST `/api/v1/auth/users/<id>/reset-password/` (superadmin)
- GET `/api/v1/auth/users/<id>/sessions/` (superadmin)
- POST `/api/v1/auth/users/<id>/revoke-sessions/` (superadmin)
- GET `/api/v1/auth/security-events/` (superadmin; `event_type`, `target_id` filters)

**Send (create):**
- `{ username (required), temporary_password (required), role (admin|staff), employee_code (required), first_name (required), last_name (required), job_title (required), employment_start_date (required), middle_name?, preferred_name?, contact_email?, contact_phone?, remarks? }`

**Send (profile update):**
- any of `{ first_name?, middle_name?, last_name?, preferred_name?, job_title?, contact_email?, contact_phone?, employment_end_date?, employment_status?, remarks? }`

**Send (deactivate/suspend):** `{ reason }`. **Send (reset-password):** `{ temporary_password }`. **Send (reactivate/unsuspend/revoke-sessions):** none.

**Returns:**
- list: paginated `UserAdmin` items. create/read/profile: `UserAdmin` (account + profile).
- lifecycle actions: message; revoke-sessions: `{ sessions_revoked }`.
- target sessions: list of session summaries. security-events: paginated events.

**Notes:**
- Admins may only lifecycle `staff`; the superadmin is never visible/targetable (returns `AUTH_USER_NOT_FOUND`).
- Deactivate/suspend/reset revoke the target's sessions and invalidate its tokens; temporary password is never returned.
- Bearer-authenticated; no CSRF header required (not cookie-authenticated).

**Errors:**
- `AUTH_USER_NOT_FOUND` (404), `AUTH_USER_TARGET_FORBIDDEN` (403), `AUTH_USER_STATE_CONFLICT` (409)
- `AUTH_USER_ROLE_INVALID` (400), `AUTH_USER_USERNAME_TAKEN` (409), `AUTH_USER_EMPLOYEE_CODE_TAKEN` (409)
- `AUTH_PASSWORD_POLICY_VIOLATION` (400) — weak temporary password or too similar to the employee's name/code
- `AUTH_PASSWORD_HISTORY_REUSED` (400) — a reset may not repeat the target's current/recent password
- `PERMISSION_DENIED` (403) — role not permitted

## 8. Gaps
- No pagination on the own-`sessions/` endpoint (a user has at most 3 devices); the admin list and security-event feed are paginated.
- Policy-engine runtime enforcement (views declaring `permission_key`) is not wired — authorization uses the app's own role checks (§9 interim).

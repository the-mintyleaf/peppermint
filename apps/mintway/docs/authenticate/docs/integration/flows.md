# Flows

End-to-end sequences that span more than one entity. Each step names the
endpoint, the key inputs, and the branches the UI must handle. Field/error detail
lives in the entity files — this is the choreography.

## Sign in (with first-login branch)

1. `POST /api/v1/auth/login/` `{ username, password }`.
   - **Session branch** (`data.password_change_required` absent/false): store
     `data.access_token` in memory; the refresh/CSRF/device cookies are set. Go to
     step 3.
   - **First-login branch** (`data.password_change_required === true`): the account
     must change its password first — **no session was created**. Capture
     `data.challenge_token` and go to step 2.
   - `AUTH_LOGIN_INVALID_CREDENTIALS` (401) → one generic error; never branch on
     cause (wrong password, suspended, cooldown all look identical).
   - `RATE_LIMIT_EXCEEDED` (429) → "too many attempts"; back off.
2. `POST /api/v1/auth/password/first-login-change/`
   `{ challenge_token, new_password, new_password_confirm }` (**public** — no
   bearer) → `data.next_action: "login"`. Return the user to the sign-in form and
   repeat step 1 with the new password.
   - `AUTH_CHALLENGE_INVALID` (401) → challenge expired/used; send back to login
     for a fresh one.
   - `AUTH_PASSWORD_POLICY_VIOLATION` (400) → show `details.password` reasons.
   - `AUTH_PASSWORD_HISTORY_REUSED` (400) → require a different password.
   - `VALIDATION_ERROR` (400) → `new_password_confirm` mismatch.
3. `GET /api/v1/auth/me/` → hydrate `id`, `role`, `account_status`, and the nested
   `employee_profile`; branch app UI on `role`.

## Keep the session alive / sign out

1. Before/at access-token expiry: `POST /api/v1/auth/token/refresh/` (cookie +
   `X-CSRFToken`, no body) → new `access_token`. Run this single-flight.
   - `AUTH_CSRF_FAILED` (403) → re-read `mintway_csrf`, resend header.
   - `AUTH_TOKEN_INVALID` (401) → session gone (expired/revoked/reused); drop local
     auth and redirect to login.
2. `POST /api/v1/auth/logout/` (bearer + `X-CSRFToken`) → clears the refresh
   cookie; idempotent.
3. `POST /api/v1/auth/logout-all/` (bearer + `X-CSRFToken`) → `data.sessions_revoked`;
   invalidates every outstanding token. Expect the current access token to 401 on
   its next use.

## Change your own password

1. `POST /api/v1/auth/password/change/`
   `{ current_password, new_password, new_password_confirm }` (bearer) →
   `data.next_action: "login"`.
   - `AUTH_PASSWORD_CURRENT_INCORRECT` (400) → field error on `current_password`.
   - policy / history / confirm-mismatch errors as in the first-login flow.
2. **All sessions are revoked, including the current one**, and the refresh cookie
   is cleared → clear local auth state and route to sign-in.

## Admin creates and manages a staff account

1. `POST /api/v1/auth/users/` (admin/superadmin) with the flat account + profile
   body → `UserAdmin` (`201`, `password_change_required=true`). Share the temp
   password out-of-band (it is never returned).
   - `AUTH_USER_USERNAME_TAKEN` / `AUTH_USER_EMPLOYEE_CODE_TAKEN` (409) → field
     errors.
   - `AUTH_USER_ROLE_INVALID` (400) → role must be `admin` or `staff`.
   - `AUTH_PASSWORD_POLICY_VIOLATION` (400) → temp password weak or too similar to
     the employee name/code.
2. `PATCH /api/v1/auth/users/<id>/profile/` → edit non-security fields (contact as
   `contact_email`/`contact_phone`); returns the updated `UserAdmin`.
3. `POST /api/v1/auth/users/<id>/deactivate/` `{ reason }` (admin, staff targets
   only) → empty-data success; re-fetch to see `account_status=deactivated`.
   Deactivation revokes the target's sessions.
   - `AUTH_USER_TARGET_FORBIDDEN` (403) → admin tried to act on an admin.
   - `AUTH_USER_STATE_CONFLICT` (409) → invalid transition for current state.

## Superadmin recovers / audits an account

1. `POST /api/v1/auth/users/<id>/unsuspend/` (no body) → lifts a suspension and
   clears cooldown/failure state (used to recover an auto-suspended account after
   15 failed logins).
2. `POST /api/v1/auth/users/<id>/reset-password/` `{ temporary_password }` → forces
   a new temp password (`password_change_required=true`); revokes sessions.
   - `AUTH_PASSWORD_HISTORY_REUSED` (400) → cannot repeat a recent password.
3. `GET /api/v1/auth/users/<id>/sessions/` → inspect the target's `AuthSession`
   rows; `POST .../revoke-sessions/` force-signs-them-out (`data.sessions_revoked`).
4. `GET /api/v1/auth/security-events/?target_id=<id>` → the account's audit trail;
   filter by `?event_type=`.

# `Session` — sign-in, the rotating refresh session, and known-device visibility

**Endpoint base:** `/api/v1/auth/login/`, `.../token/refresh/`, `.../logout/`,
`.../logout-all/`, `.../sessions/`
**Access:** `login/` and `token/refresh/` are **public**; `logout/`,
`logout-all/`, and `sessions/` require a **bearer** token (the two logout
endpoints additionally require the **CSRF header**). Every authenticated role
(`staff` / `admin` / `superadmin`) uses these identically.
**Owns:** the single active refresh session per account and the up-to-3
known-device records. The §1 table describes the **own-session device summary**
(the only persistent read shape here); the token payloads returned by
login/refresh are request/response objects, typed in §2.

## 1. Fields (rows)

Fields below are the **own-session device summary** returned by `GET
/api/v1/auth/sessions/`. There is **one row per known device**; `is_current` marks
the device backing the caller's active session. No tokens are ever exposed here.

| Field           | TS type          | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes                                   |
| --------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | ---- | ---------- | --------------------------------------- |
| `id`            | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | UUID       | Known-device id                         |
| `ua_summary`    | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | ≤255       | Coarse "Browser on OS" (no fingerprint) |
| `first_seen_at` | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | ISO 8601   | First login from this device            |
| `last_seen_at`  | `string`         | ✗      | ✓      | —   | No       | ✓          | —    | ISO 8601   | Most recent login from this device      |
| `last_ip`       | `string \| null` | ✗      | ✓      | —   | Yes      | ✓          | —    | IP         | Last IP seen                            |
| `is_current`    | `boolean`        | ✗      | ✓      | —   | No       | ✓          | —    | —          | Backs the caller's active session       |

## 2. Types

```ts
// GET /api/v1/auth/sessions/ — one per known device (plain array in `data`)
interface SessionDevice {
  id: string;
  ua_summary: string;
  first_seen_at: string;
  last_seen_at: string;
  last_ip: string | null; // Nullable=Yes
  is_current: boolean;
}

// POST /api/v1/auth/login/ — request
interface LoginRequest {
  username: string; // normalized to lowercase server-side
  password: string;
}

// POST /api/v1/auth/login/ — success `data` (a session was created)
interface LoginResult {
  access_token: string; // JWT, 10-min lifetime; keep in memory
  access_expires_at: string; // ISO 8601
}

// POST /api/v1/auth/login/ — alternate `data` when the account must change its
// password first (NO session is created; refresh/access are NOT issued)
interface FirstLoginChallengeResult {
  password_change_required: true;
  next_action: "first_login_password_change"; // see enums.md
  challenge_token: string; // opaque; pass to first-login-change
  challenge_expires_at: string; // ISO 8601, 10 min out
}

type LoginResponse = LoginResult | FirstLoginChallengeResult;

// POST /api/v1/auth/token/refresh/ — success `data` (same shape as LoginResult)
type RefreshResult = LoginResult;

// POST /api/v1/auth/logout-all/ — success `data`
interface LogoutAllResult {
  sessions_revoked: number;
}
```

## 3. Endpoints

### `POST /api/v1/auth/login/`

- **Purpose:** sign in.
- **Request:** `LoginRequest` (`username`, `password`).
- **Returns:** `LoginResult` (200) **or** `FirstLoginChallengeResult` (200) — both
  are HTTP 200; branch on `data.password_change_required`. On the session branch,
  sets the `mintway_refresh`, `mintway_csrf`, and `mintway_device` cookies.
- **Side effects:** establishes exactly one active session — a successful login
  **revokes any previous active session** and its tokens. Records a security
  event.
- **Throttle:** `auth_login` (10/min per IP).
- **Policy key:** `authenticate.session.login`

### `POST /api/v1/auth/token/refresh/`

- **Purpose:** mint a fresh access token before the current one expires.
- **Request:** no body; sends the `mintway_refresh` cookie + `X-CSRFToken` header.
- **Returns:** `RefreshResult` (200); rotates and re-sets the `mintway_refresh`
  cookie.
- **Side effects:** rotates the refresh token every call. The absolute 7-day
  session expiry is **never** extended.
- **Throttle:** `auth_refresh` (120/hour per IP).
- **Policy key:** `authenticate.session.refresh`

### `POST /api/v1/auth/logout/`

- **Purpose:** sign out the current session.
- **Request:** no body; bearer + `X-CSRFToken` header.
- **Returns:** `{}` `data` (200); clears the refresh cookie. **Idempotent.**
- **Policy key:** `authenticate.session.logout`

### `POST /api/v1/auth/logout-all/`

- **Purpose:** sign out everywhere.
- **Request:** no body; bearer + `X-CSRFToken` header.
- **Returns:** `LogoutAllResult` (200); bumps `token_version` (invalidating every
  outstanding token) and clears the refresh cookie.
- **Policy key:** `authenticate.session.logout_all`

### `GET /api/v1/auth/sessions/`

- **Purpose:** show the user their known devices.
- **Request:** bearer.
- **Returns:** `SessionDevice[]` (200) — **plain array**, not paginated.
- **Policy key:** `authenticate.session.list_self`

## 4. Validations & business rules

- `username` and `password` are both required; `username` is normalized to
  lowercase before lookup.
- **One active session per account:** a new login revokes the prior session.
- **Refresh rotation + reuse detection:** every refresh rotates the token;
  presenting a rotated-out (replayed) token is treated as compromise and
  **revokes the session** (subsequent calls then fail with `AUTH_TOKEN_INVALID`).
- **Login defense (server-side):** 5 consecutive failures → 5-min cooldown; 10 →
  10-min cooldown; 15 → automatic suspension (superadmin recovery only). Attempts
  during cooldown are rejected generically without checking the password or
  incrementing the counter. A full successful login resets the failure state. All
  of this surfaces to the client as the **same** `AUTH_LOGIN_INVALID_CREDENTIALS`.
- Cookie endpoints require `X-CSRFToken` to match the `mintway_csrf` cookie.

## 5. Errors

| Code                             | HTTP | Trigger                                                                                                       | Suggested UI handling                                                   |
| -------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `AUTH_LOGIN_INVALID_CREDENTIALS` | 401  | Any login failure — wrong password, unknown user, suspended, deactivated, cooldown.                           | Show one generic "invalid username or password"; never branch on cause. |
| `AUTH_CSRF_FAILED`               | 403  | Missing/mismatched `X-CSRFToken` on refresh/logout/logout-all.                                                | Re-read `mintway_csrf`; re-send header; if persistent, re-login.        |
| `AUTH_TOKEN_INVALID`             | 401  | Refresh token missing/expired/rotated/reused, session revoked, account inactive, or `token_version` mismatch. | Drop the session and redirect to login.                                 |
| `RATE_LIMIT_EXCEEDED`            | 429  | IP throttle exceeded (`auth_login` / `auth_refresh`).                                                         | "Too many attempts — try again shortly"; back off.                      |

## 6. Examples

```jsonc
// POST /api/v1/auth/login/ — request
{ "username": "aayush.karki", "password": "S3cret#Pass" }

// 200 — response.data (session created)
{ "access_token": "<jwt>", "access_expires_at": "2026-07-15T06:25:00+00:00" }

// 200 — response.data (first-login challenge; NO session yet)
{
  "password_change_required": true,
  "next_action": "first_login_password_change",
  "challenge_token": "<opaque>",
  "challenge_expires_at": "2026-07-15T06:25:00+00:00",
}

// GET /api/v1/auth/sessions/ — response.data (plain array)
[
  {
    "id": "b1d2…",
    "ua_summary": "Chrome on macOS",
    "first_seen_at": "2026-07-10T02:00:00Z",
    "last_seen_at": "2026-07-15T06:15:00Z",
    "last_ip": "203.0.113.5",
    "is_current": true,
  },
]

// POST /api/v1/auth/logout-all/ — response.data
{ "sessions_revoked": 1 }
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version`.
- **Two-branch login:** `POST /login/` returns HTTP 200 for **both** the
  signed-in and the must-change-password cases. Switch on
  `data.password_change_required` — if `true`, do **not** treat the user as
  authenticated; route to the first-login form with `data.challenge_token` (see
  `current-user.md`).
- **Token handling:** keep `access_token` in memory only; the refresh token lives
  solely in the `HttpOnly` `mintway_refresh` cookie and is never in a body. Run a
  single-flight `token/refresh/` before/at access-token expiry.
- **CSRF:** on `token/refresh/`, `logout/`, `logout-all/`, read `mintway_csrf`
  (JS-readable) and send it as `X-CSRFToken`.
- **Immediate revocation:** logout / new login / logout-all / admin actions revoke
  outstanding access tokens server-side immediately — expect a `401`
  (`AUTH_TOKEN_INVALID`) on the next call and redirect to login.
- **Server-computed (never send):** everything in `SessionDevice`, all token
  fields, cookies.
- **Media / streaming:** none.

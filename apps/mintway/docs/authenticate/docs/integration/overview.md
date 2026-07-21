# Overview — Authentication & Accounts (`authenticate`)

**Pack version:** 1.0.0 · **Backend source version:** API 1.2.1 / DATA_CONTRACT 1.1.0 · **Synced:** 2026-07-19

> Frontend `/sync-api` pins to this version. When the backend Change History
> below moves past it, re-sync and bump.

## Change history

| Version | Date       | Summary                                                                                                                                                                                                                                                |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2026-07-19 | Initial pack — converted from the legacy single-file `INTEGRATION.md` to the per-entity folder. Covers login/refresh/logout/sessions, first-login + own-password change, `/me/`, admin account administration, and the superadmin security-event feed. |

## Purpose

Owns application identity (accounts), the operational employee profile, the
rotating refresh-token session and known-device records, password-reuse history,
the forced first-login password change, and the append-only authentication
security-event log. It does **not** own business authorization/RBAC (a future
`permissions` app + `core.policy_engine` metadata) or applicant/document data.
Other apps reference a user only by the opaque UUID `id` and the singular `role`.

## Base path

| Prefix          | Holds                                                                             |
| --------------- | --------------------------------------------------------------------------------- |
| `/api/v1/auth/` | Sign-in, tokens, sessions, `/me/`, password flows, account admin, security events |

## Auth

Three request-auth modes are in play — read each endpoint's header for which
applies:

- **Bearer (most endpoints):** `Authorization: Bearer <access>`. The access token
  is a JWT with a **10-minute** lifetime, returned in the login/refresh response
  **body** (`data.access_token`, with `data.access_expires_at`). Every request is
  re-validated server-side against session/account state — logout, a new login,
  deactivation, suspension, password change, and logout-all revoke outstanding
  access tokens **immediately** (not after the 10-minute TTL). Unauthenticated →
  **401**; on a hard 401, run the single-flight refresh, then redirect to login.
- **Public:** `login/`, `token/refresh/` (cookie-authenticated, no bearer), and
  `password/first-login-change/` (challenge-authenticated).
- **Refresh cookie + CSRF (cookie endpoints):** `token/refresh/`, `logout/`,
  `logout-all/` require the double-submit CSRF header `X-CSRFToken` matching the
  `mintway_csrf` cookie.

**Cookies set on login:**

| Cookie            | Flags                                                       | Purpose                                                             |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `mintway_refresh` | Secure, HttpOnly, narrow path `/api/v1/auth/token/refresh/` | The rotating refresh token. **Never** appears in any response body. |
| `mintway_csrf`    | JS-readable                                                 | Echo its value in the `X-CSRFToken` header on cookie endpoints.     |
| `mintway_device`  | HttpOnly                                                    | Long-lived known-device identifier (no invasive fingerprinting).    |

> **Env note (project convention, CLAUDE.md §1):** the refresh token is carried by
> the `HttpOnly` cookie. The access token is returned in the response **body** in
> every environment; the frontend keeps it in memory and refreshes via the cookie
> endpoint. Do not expect the refresh token in JSON anywhere.

## Response envelope

Every JSON response is wrapped. **Map the envelope to your UI shape at the API
layer** so components never see the raw wrapper.

```jsonc
// success
{ "success": true, "message": "...", "data": { /* the resource */ }, "meta": {} }
// error
{ "success": false, "error": { "code": "...", "message": "...", "details": {} }, "meta": {} }
```

- `data` is the resource (or list payload). Unwrap to `data`.
- `error.code` is the machine-readable key — **switch UI behavior on `code`, not
  on `message`** (message is human copy, may change).
- `error.details` carries per-field serializer errors when present (e.g. password
  policy reasons under `details.password`; the full shape is not enumerated → see
  `gaps.md`).

## Pagination

The two admin **list** endpoints (`/users/`, `/security-events/`) are paginated
(`StandardPagination`). `meta` carries `{ count, page, page_size, next, previous }`.

- Request: `?page`, `?page_size` (**default 20, max 100**).
- `next` / `previous` are full absolute URLs (or `null`).
- **Map `meta.count` → `total`** at the API layer.

The two **session** list endpoints (own `sessions/` and admin
`users/<id>/sessions/`) return a **plain array** in `data` — not paginated.

## IDs, dates, money

- **IDs** are string UUIDs everywhere.
- **Timestamps** are ISO 8601 strings.
- **Money:** this module has **no** money fields.
- **Bikram Sambat siblings:** `authenticate` currently exposes **no** `*_bs` date
  siblings — its date fields (`employment_start_date`, `employment_end_date`,
  `last_login_at`, timestamps) are plain ISO/date strings. (The `*_bs` convention
  applies to other modules; noted here so integrators don't look for it.)
- **Empty vs null.** A field marked `Nullable=Yes` in an entity table can come
  back `null`. An **optional text/enum** field marked `Nullable=No` (Django
  `blank=True`, not DB-null) comes back as an **empty string `""`** when unset —
  never `null`. So the DTO types it `string`, and code that wants a fallback must
  test `value === ""`, not `value == null`. Only `Nullable=Yes` fields are typed
  `| null`.

## Throttling

Public auth endpoints are IP-scoped: `auth_login` **10/min**, `auth_refresh`
**120/hour**, `auth_first_login` **10/hour**. Authenticated endpoints use the
global `user` rate. A throttled request returns **429** (`RATE_LIMIT_EXCEEDED`) —
surface a "try again shortly" state and back off.

## Role model

Three application roles: `staff`, `admin`, `superadmin`. Access is **role-based
and enforced server-side** — never rely on the frontend to hide protected data.

| Surface                                          | staff | admin              | superadmin |
| ------------------------------------------------ | ----- | ------------------ | ---------- |
| Login / refresh / logout / `/me/` / own password | ✅    | ✅                 | ✅         |
| Own sessions (`sessions/`)                       | ✅    | ✅                 | ✅         |
| List / create / read accounts                    | ❌    | ✅                 | ✅         |
| Update employee profile                          | ❌    | ✅                 | ✅         |
| Deactivate / reactivate accounts                 | ❌    | ✅ (staff targets) | ✅         |
| Suspend / unsuspend / reset password             | ❌    | ❌                 | ✅         |
| Target sessions list / revoke                    | ❌    | ❌                 | ✅         |
| Security-event feed                              | ❌    | ❌                 | ✅         |

Two consequences the UI must respect:

1. **Two authorization layers.** Coarse role gates (DRF permission classes) return
   `PERMISSION_DENIED` (403) when the role is wrong. Object-level rules in the
   service layer add: admins may only lifecycle **`staff`** accounts (acting on an
   admin → `AUTH_USER_TARGET_FORBIDDEN` 403), and the **superadmin account is
   never visible or targetable** through the admin endpoints (returns
   `AUTH_USER_NOT_FOUND` 404, non-disclosing).
2. **Generic login errors.** Every credential/state failure returns one identical
   `AUTH_LOGIN_INVALID_CREDENTIALS` (401) body — it never reveals whether the
   username exists or whether the account is suspended, deactivated, or in
   cooldown. Do not try to branch the UI on the cause.

## Optimistic concurrency

**None.** No `authenticate` resource carries `record_version`; no write takes a
version. There is no `*_VERSION_CONFLICT` error in this module. (Account safety
comes from server-side re-validation of the session/token on every request, not
from optimistic row versioning.)

## Dependency order (start here →)

1. **Login** (`session.md`) — obtain an access token (or a first-login challenge).
2. **First-login password change** (`current-user.md`) — only when login returns
   `password_change_required`; then log in normally.
3. **`GET /me/`** (`current-user.md`) — hydrate the signed-in user + role.
4. **Refresh / logout / own sessions** (`session.md`) — keep the token fresh; sign
   out.
5. **Account administration** (`user-account.md`, `employee-profile.md`) — needs
   an admin/superadmin token.
6. **Security events** (`security-event.md`) — superadmin only.

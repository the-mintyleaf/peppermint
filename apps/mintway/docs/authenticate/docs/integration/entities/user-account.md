# `UserAccount` — admin account administration (create, read, lifecycle, sessions)

**Endpoint base:** `/api/v1/auth/users/` (+ nested `/users/<user_id>/...`
actions) and `/users/<user_id>/sessions/` · `/revoke-sessions/`
**Access:** **`admin` / `superadmin`** for list / create / read / profile /
deactivate / reactivate. **`superadmin` only** for suspend / unsuspend /
reset-password / target-sessions / revoke-sessions. Admins may only lifecycle
**`staff`** accounts; the **superadmin account is never visible or targetable**
(returns `AUTH_USER_NOT_FOUND`, non-disclosing).
**Owns:** the account record as administered by operators — identity + lifecycle
state, with the employee profile nested (owned by `employee-profile.md`). The
admin session summary (`AuthSession`) surfaces only through the target-sessions
read below.

## 1. Fields (rows)

Account-level fields of the `UserAdmin` read (used by both the detail read and
each list row). `temporary_password` is the only account-level create input.
**Create also accepts the employee-profile fields flat at the top level**
(`employee_code`, `first_name`, `last_name`, `job_title`,
`employment_start_date` required; `middle_name`, `preferred_name`,
`contact_email`, `contact_phone`, `remarks` optional) — see
`employee-profile.md` §1 for their constraints.

| Field                      | TS type               | In req | In res | Req | Nullable | Server-set | Enum             | Validation                                               | Notes                                        |
| -------------------------- | --------------------- | ------ | ------ | --- | -------- | ---------- | ---------------- | -------------------------------------------------------- | -------------------------------------------- |
| `id`                       | `string`              | ✗      | ✓      | —   | No       | ✓          | —                | UUID                                                     | Opaque account id                            |
| `username`                 | `string`              | ✓      | ✓      | ✓   | No       | ✗          | —                | 3–32, `^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$`, not reserved | Lowercased; immutable after create           |
| `temporary_password`       | `string`              | ✓      | ✗      | ✓   | —        | ✗          | —                | password policy (see §4)                                 | **Write-only**; never returned               |
| `role`                     | `UserRole`            | ✓      | ✓      | ✓   | No       | ✗          | `role`           | create ∈ {`admin`,`staff`}                               | **Immutable after create**; not `superadmin` |
| `account_status`           | `AccountStatus`       | ✗      | ✓      | —   | No       | ✓          | `account_status` | —                                                        | Changes only via lifecycle actions           |
| `password_change_required` | `boolean`             | ✗      | ✓      | —   | No       | ✓          | —                | —                                                        | `true` after create / reset                  |
| `last_login_at`            | `string \| null`      | ✗      | ✓      | —   | Yes      | ✓          | —                | ISO 8601                                                 |                                              |
| `created_at`               | `string`              | ✗      | ✓      | —   | No       | ✓          | —                | ISO 8601                                                 |                                              |
| `deactivated_at`           | `string \| null`      | ✗      | ✓      | —   | Yes      | ✓          | —                | ISO 8601                                                 | Set on deactivate                            |
| `suspended_at`             | `string \| null`      | ✗      | ✓      | —   | Yes      | ✓          | —                | ISO 8601                                                 | Set on suspend                               |
| `employee_profile`         | `EmployeeProfileRead` | ✗¹     | ✓      | —   | No       | ✗          | —                | —                                                        | ¹ profile fields sent **flat** on create     |

### Target-session summary (`AuthSession`) — read-only, superadmin

Returned by `GET /users/<user_id>/sessions/` (plain array). Never includes tokens.

| Field               | TS type          | In res | Nullable | Enum            | Notes                                 |
| ------------------- | ---------------- | ------ | -------- | --------------- | ------------------------------------- |
| `id`                | `string`         | ✓      | No       | —               | Session id (= JWT `session_id` claim) |
| `is_active`         | `boolean`        | ✓      | No       | —               |                                       |
| `created_at`        | `string`         | ✓      | No       | —               | ISO 8601                              |
| `last_used_at`      | `string`         | ✓      | No       | —               | ISO 8601                              |
| `revoked_at`        | `string \| null` | ✓      | Yes      | —               | ISO 8601                              |
| `revoke_reason`     | `string`         | ✓      | No       | `revoke_reason` | `""` while active                     |
| `created_ip`        | `string \| null` | ✓      | Yes      | —               | IP at creation                        |
| `device_ua_summary` | `string \| null` | ✓      | Yes      | —               | `null` when no device is attached     |

## 2. Types

```ts
import type { EmployeeProfileRead } from "./employee-profile";

type UserRole = "superadmin" | "admin" | "staff"; // see enums.md
type AccountStatus = "active" | "suspended" | "deactivated"; // see enums.md
type SessionRevokeReason =
  | "logout"
  | "logout_all"
  | "new_login"
  | "password_change"
  | "password_reset"
  | "deactivated"
  | "suspended"
  | "admin_revoke"
  | "token_reuse"
  | "expired"; // see enums.md

// GET /api/v1/auth/users/<id>/ and each list row (same serializer)
interface UserAdmin {
  id: string;
  username: string;
  role: UserRole;
  account_status: AccountStatus;
  password_change_required: boolean;
  last_login_at: string | null; // Nullable=Yes
  created_at: string;
  deactivated_at: string | null; // Nullable=Yes
  suspended_at: string | null; // Nullable=Yes
  employee_profile: EmployeeProfileRead;
}
type UserListRow = UserAdmin;

// POST /api/v1/auth/users/ — request (account + profile fields, all FLAT)
interface UserCreate {
  username: string;
  temporary_password: string;
  role: "admin" | "staff"; // superadmin is never creatable
  employee_code: string;
  first_name: string;
  last_name: string;
  job_title: string;
  employment_start_date: string; // YYYY-MM-DD
  middle_name?: string;
  preferred_name?: string;
  contact_email?: string;
  contact_phone?: string;
  remarks?: string;
}
// No account Update type here — profile edits go through employee-profile.md
// (PATCH .../profile/); status changes go through the lifecycle actions below.

// GET /api/v1/auth/users/<id>/sessions/ — one per session (plain array)
interface AdminSession {
  id: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string;
  revoked_at: string | null; // Nullable=Yes
  revoke_reason: SessionRevokeReason | ""; // "" while active
  created_ip: string | null; // Nullable=Yes
  device_ua_summary: string | null; // Nullable=Yes
}

// Lifecycle request bodies
interface ReasonRequest {
  reason: string;
} // deactivate, suspend
interface ResetPasswordRequest {
  temporary_password: string;
}
// reactivate / unsuspend take no body.

// POST /api/v1/auth/users/<id>/revoke-sessions/ — success `data`
interface RevokeSessionsResult {
  sessions_revoked: number;
}
```

## 3. Endpoints

### `GET /api/v1/auth/users/`

- **Purpose:** the accounts table.
- **Request:** admin/superadmin bearer.
- **Returns:** paginated `UserListRow[]` (in `data`, with pagination `meta`).
- **Query params (list):** `role`, `status`, `search`, `page`, `page_size`.
- **Policy key:** `authenticate.user.list`

### `POST /api/v1/auth/users/`

- **Purpose:** create an `admin` or `staff` account + its profile.
- **Request:** `UserCreate` (flat account + profile fields).
- **Returns:** the created `UserAdmin` (`201`). The temp password is **never**
  returned; `password_change_required` is `true`.
- **Side effects:** records an `account_created` event.
- **Policy key:** `authenticate.user.create`

### `GET /api/v1/auth/users/<user_id>/`

- **Returns:** `UserAdmin`.
- **Policy key:** `authenticate.user.read`

### `POST /api/v1/auth/users/<user_id>/deactivate/` · `.../reactivate/`

- **Purpose:** soft-retire / restore an account. **Admin (staff targets only) /
  superadmin.**
- **Request:** deactivate `ReasonRequest`; reactivate **no body**.
- **Returns:** `{}` `data` with a message (`200`). Deactivate revokes the
  target's sessions and bumps `token_version`.
- **Policy keys:** `authenticate.user.deactivate` / `.reactivate`

### `POST /api/v1/auth/users/<user_id>/suspend/` · `.../unsuspend/`

- **Purpose:** suspend / lift suspension. **Superadmin only.**
- **Request:** suspend `ReasonRequest`; unsuspend **no body** (also clears
  cooldown/failure state).
- **Returns:** `{}` `data` with a message (`200`). Suspend revokes sessions and
  bumps `token_version`.
- **Policy keys:** `authenticate.user.suspend` / `.unsuspend`

### `POST /api/v1/auth/users/<user_id>/reset-password/`

- **Purpose:** superadmin sets a new temporary password. **Superadmin only.**
- **Request:** `ResetPasswordRequest`.
- **Returns:** `{}` `data` with a message (`200`). Revokes sessions, bumps
  `token_version`, sets `password_change_required=true`.
- **Policy key:** `authenticate.user.reset_password`

### `GET /api/v1/auth/users/<user_id>/sessions/`

- **Purpose:** superadmin inspects a target's sessions. **Superadmin only.**
- **Returns:** `AdminSession[]` — **plain array**, not paginated.
- **Policy key:** `authenticate.session.list_target`

### `POST /api/v1/auth/users/<user_id>/revoke-sessions/`

- **Purpose:** superadmin force-signs-out a target. **Superadmin only.**
- **Request:** no body.
- **Returns:** `RevokeSessionsResult` (`200`).
- **Policy key:** `authenticate.session.revoke`

## 4. Validations & business rules

- **Role scope:** admins may only lifecycle `staff` accounts; acting on an `admin`
  → `AUTH_USER_TARGET_FORBIDDEN`. Suspend/unsuspend/reset/target-sessions/revoke
  are superadmin-only (wrong role → `PERMISSION_DENIED`).
- **Superadmin invisibility:** the superadmin account is excluded from every
  admin selector — reads/actions on it return `AUTH_USER_NOT_FOUND` (404), never
  revealing it exists.
- **Immutable identity:** `username` and `role` cannot change after create;
  `role` on create must be `admin` or `staff` (`superadmin` → `AUTH_USER_ROLE_INVALID`).
- **Uniqueness:** `username` (`AUTH_USER_USERNAME_TAKEN`) and `employee_code`
  (`AUTH_USER_EMPLOYEE_CODE_TAKEN`) must be free.
- **Password policy (create + reset):** the `temporary_password` must satisfy the
  full policy (8–128 chars; upper/lower/number/symbol; not all-numeric; not a
  common password; no surrounding whitespace; **not similar to the employee's
  name/code**). A superadmin reset additionally may not repeat the target's
  current or recent password (`AUTH_PASSWORD_HISTORY_REUSED`).
- **State transitions** are validated — e.g. reactivating an already-active
  account or suspending a deactivated one → `AUTH_USER_STATE_CONFLICT`.

## 5. Errors

| Code                             | HTTP | Trigger                                                       | Suggested UI handling                                  |
| -------------------------------- | ---- | ------------------------------------------------------------- | ------------------------------------------------------ |
| `AUTH_USER_NOT_FOUND`            | 404  | Target not found / not visible (incl. the superadmin).        | Not-found state.                                       |
| `AUTH_USER_TARGET_FORBIDDEN`     | 403  | Action not permitted on this target (e.g. admin on an admin). | Hide the action for that row; toast if attempted.      |
| `AUTH_USER_STATE_CONFLICT`       | 409  | Invalid lifecycle transition for the account's state.         | Refresh the row; re-derive available actions.          |
| `AUTH_USER_ROLE_INVALID`         | 400  | Invalid role for the operation (e.g. creating a superadmin).  | Field error on `role`.                                 |
| `AUTH_USER_USERNAME_TAKEN`       | 409  | Username already in use.                                      | Field error on `username`.                             |
| `AUTH_USER_EMPLOYEE_CODE_TAKEN`  | 409  | Employee code already in use.                                 | Field error on `employee_code`.                        |
| `AUTH_PASSWORD_POLICY_VIOLATION` | 400  | Weak temp password / too similar to the employee name/code.   | Show `details.password` reasons on the password field. |
| `AUTH_PASSWORD_HISTORY_REUSED`   | 400  | Reset repeats the target's current/recent password.           | Field error: pick a different temp password.           |
| `PERMISSION_DENIED`              | 403  | Caller's role fails the coarse gate.                          | Hide the surface; treat as no access.                  |
| `VALIDATION_ERROR`               | 400  | A create/reason/reset field fails its constraint.             | Map `error.details` to the offending field.            |

## 6. Examples

```jsonc
// POST /api/v1/auth/users/ — request (account + profile fields, flat)
{
  "username": "sita.rai",
  "temporary_password": "T3mp#Start1",
  "role": "staff",
  "employee_code": "EMP-0044",
  "first_name": "Sita",
  "last_name": "Rai",
  "job_title": "Applicant Data Entry Officer",
  "employment_start_date": "2026-07-19",
  "contact_email": "sita@example.com",
}

// 201 — response.data
{
  "id": "9a1b…",
  "username": "sita.rai",
  "role": "staff",
  "account_status": "active",
  "password_change_required": true,
  "last_login_at": null,
  "created_at": "2026-07-19T04:00:00Z",
  "deactivated_at": null,
  "suspended_at": null,
  "employee_profile": {
    "employee_code": "EMP-0044",
    "first_name": "Sita",
    "middle_name": "",
    "last_name": "Rai",
    "preferred_name": "",
    "profile_image": null,
    "email": "sita@example.com",
    "phone": "",
    "job_title": "Applicant Data Entry Officer",
    "employment_start_date": "2026-07-19",
    "employment_end_date": null,
    "employment_status": "active",
  },
}

// POST /api/v1/auth/users/<id>/deactivate/ — request
{ "reason": "Left the organization." }
// 200 — response (empty data; act on success + message)
{ "success": true, "message": "Account deactivated.", "data": {}, "meta": {} }

// GET /api/v1/auth/users/<id>/sessions/ — response.data (plain array)
[
  {
    "id": "5c7e…",
    "is_active": true,
    "created_at": "2026-07-15T06:15:00Z",
    "last_used_at": "2026-07-15T06:40:00Z",
    "revoked_at": null,
    "revoke_reason": "",
    "created_ip": "203.0.113.5",
    "device_ua_summary": "Chrome on macOS",
  },
]

// POST /api/v1/auth/users/<id>/revoke-sessions/ — response.data
{ "sessions_revoked": 1 }
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version`.
- **Lifecycle actions return no resource** — they respond with `success` +
  `message` and empty `data`. Re-fetch the account (or the list) to reflect the
  new `account_status` / stamps.
- **Role-gated controls:** show suspend / unsuspend / reset-password /
  target-sessions / revoke only to the superadmin; show deactivate / reactivate
  to admins only for `staff` targets. The server still enforces this.
- **Flat create, nested read:** send profile fields flat on create; read them back
  under `employee_profile` (with contact as `email` / `phone` — see
  `employee-profile.md`).
- **Temp password:** never displayed back; surface a "share it out-of-band" note.
  New accounts are forced to change it (`password_change_required=true`) — the
  first sign-in routes through the first-login flow (`session.md` /
  `current-user.md`).
- **Server-computed (never send):** `id`, `account_status`,
  `password_change_required`, `last_login_at`, timestamps, all `AdminSession`
  fields, `sessions_revoked`.
- **Dates:** all plain ISO/`YYYY-MM-DD` strings — no `*_bs` siblings.

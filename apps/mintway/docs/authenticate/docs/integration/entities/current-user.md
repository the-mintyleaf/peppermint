# `CurrentUser` — the signed-in account (`/me/`) and its own password changes

**Endpoint base:** `/api/v1/auth/me/`, `.../password/first-login-change/`,
`.../password/change/`
**Access:** `me/` and `password/change/` require a **bearer** token (any role);
`password/first-login-change/` is **public** — it authenticates with the opaque
challenge token returned by login, not a bearer.
**Owns:** the caller's own account read projection and the two self-service
password-change flows. The nested `employee_profile` object is fully described in
`employee-profile.md`.

## 1. Fields (rows)

Fields below are the `GET /api/v1/auth/me/` response — the signed-in account plus
its nested employee profile. All are **read-only** here (profile edits go through
the admin endpoint in `employee-profile.md`; there is no self-edit of these).

| Field                      | TS type                       | In req | In res | Req | Nullable | Server-set | Enum             | Validation           | Notes                              |
| -------------------------- | ----------------------------- | ------ | ------ | --- | -------- | ---------- | ---------------- | -------------------- | ---------------------------------- |
| `id`                       | `string`                      | ✗      | ✓      | —   | No       | ✓          | —                | UUID                 | Opaque account id                  |
| `username`                 | `string`                      | ✗      | ✓      | —   | No       | ✓          | —                | 3–32, `^[a-z0-9]...` | Lowercase; immutable via this API  |
| `role`                     | `UserRole`                    | ✗      | ✓      | —   | No       | ✓          | `role`           | —                    | Singular; immutable after creation |
| `account_status`           | `AccountStatus`               | ✗      | ✓      | —   | No       | ✓          | `account_status` | —                    | For a signed-in user, `active`     |
| `password_change_required` | `boolean`                     | ✗      | ✓      | —   | No       | ✓          | —                | —                    | Forced-replacement flag            |
| `last_login_at`            | `string \| null`              | ✗      | ✓      | —   | Yes      | ✓          | —                | ISO 8601             | Previous successful login          |
| `employee_profile`         | `EmployeeProfileRead \| null` | ✗      | ✓      | —   | Yes      | ✓          | —                | —                    | Nested; see `employee-profile.md`  |

## 2. Types

```ts
import type { EmployeeProfileRead } from "./employee-profile";

type UserRole = "superadmin" | "admin" | "staff"; // see enums.md
type AccountStatus = "active" | "suspended" | "deactivated"; // see enums.md

// GET /api/v1/auth/me/ — response `data`
interface CurrentUser {
  id: string;
  username: string;
  role: UserRole;
  account_status: AccountStatus;
  password_change_required: boolean;
  last_login_at: string | null; // Nullable=Yes
  employee_profile: EmployeeProfileRead | null; // Nullable=Yes
}

// POST /api/v1/auth/password/first-login-change/ — request
interface FirstLoginPasswordChangeRequest {
  challenge_token: string; // from the login challenge
  new_password: string;
  new_password_confirm: string; // must equal new_password
}

// POST /api/v1/auth/password/change/ — request
interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  new_password_confirm: string; // must equal new_password
}

// success `data` for both password endpoints
interface PasswordChangeResult {
  next_action: "login"; // see enums.md — go back to sign-in
}
```

## 3. Endpoints

### `GET /api/v1/auth/me/`

- **Purpose:** hydrate the signed-in user after login / on app boot.
- **Request:** bearer; no body.
- **Returns:** `CurrentUser` (200).
- **Policy key:** `authenticate.user.read_self`

### `POST /api/v1/auth/password/first-login-change/`

- **Purpose:** satisfy the forced first-login password change before signing in.
- **Request:** `FirstLoginPasswordChangeRequest` (**public** — uses the challenge
  token, no bearer).
- **Returns:** `PasswordChangeResult` (200) → `next_action: "login"`. The
  challenge is **single-use**, expires 10 minutes after issue, and clearing it
  revokes any sessions.
- **Throttle:** `auth_first_login` (10/hour per IP).
- **Policy key:** `authenticate.user.complete_first_login`

### `POST /api/v1/auth/password/change/`

- **Purpose:** the signed-in user changes their own password.
- **Request:** `PasswordChangeRequest` (bearer).
- **Returns:** `PasswordChangeResult` (200) → `next_action: "login"`.
- **Side effects:** **revokes all sessions including the current one** and clears
  the refresh cookie — the user must sign in again.
- **Policy key:** `authenticate.user.change_password`

## 4. Validations & business rules

- `new_password` must equal `new_password_confirm` (else `VALIDATION_ERROR`, field
  `new_password_confirm`).
- **Password policy** (server-authoritative; mirror as supplementary client
  validation): 8–128 chars, ≥1 uppercase, ≥1 lowercase, ≥1 number, ≥1 symbol, not
  entirely numeric, not a common password, no surrounding whitespace, not similar
  to the username or the employee code/name. Failures return
  `AUTH_PASSWORD_POLICY_VIOLATION` with reasons under `details.password`.
- **History reuse:** the new password may not match the current or the previous 3
  (`AUTH_PASSWORD_HISTORY_REUSED`).
- **`current_password`** must be correct on the self-service change
  (`AUTH_PASSWORD_CURRENT_INCORRECT`).
- The first-login challenge must be present, unexpired, and unconsumed
  (`AUTH_CHALLENGE_INVALID`).

## 5. Errors

| Code                              | HTTP | Trigger                                                  | Suggested UI handling                                         |
| --------------------------------- | ---- | -------------------------------------------------------- | ------------------------------------------------------------- |
| `AUTHENTICATION_FAILED`           | 401  | `GET /me/` or `password/change/` without a valid bearer. | Redirect to login.                                            |
| `AUTH_CHALLENGE_INVALID`          | 401  | First-login challenge missing / expired / already used.  | Send the user back to login to obtain a fresh challenge.      |
| `AUTH_PASSWORD_POLICY_VIOLATION`  | 400  | New password fails policy.                               | Show `details.password` reasons under the new-password field. |
| `AUTH_PASSWORD_HISTORY_REUSED`    | 400  | New password repeats the current or a recent one.        | Field error: "choose a password you haven't used recently".   |
| `AUTH_PASSWORD_CURRENT_INCORRECT` | 400  | Wrong `current_password` on self-service change.         | Field error on `current_password`.                            |
| `VALIDATION_ERROR`                | 400  | `new_password_confirm` does not match `new_password`.    | Field error on `new_password_confirm`.                        |

## 6. Examples

```jsonc
// GET /api/v1/auth/me/ — response.data
{
  "id": "6f9c1e64-3b2a-4a1e-9c2d-0f1b2c3d4e5f",
  "username": "aayush.karki",
  "role": "staff",
  "account_status": "active",
  "password_change_required": false,
  "last_login_at": "2026-07-15T06:15:00Z",
  "employee_profile": {
    "employee_code": "EMP-0012",
    "first_name": "Aayush",
    "middle_name": "",
    "last_name": "Karki",
    "preferred_name": "",
    "profile_image": null,
    "email": "",
    "phone": "",
    "job_title": "Applicant Data Entry Officer",
    "employment_start_date": "2026-07-01",
    "employment_end_date": null,
    "employment_status": "active",
  },
}

// POST /api/v1/auth/password/change/ — request
{
  "current_password": "S3cret#Pass",
  "new_password": "N3w#Secret",
  "new_password_confirm": "N3w#Secret",
}

// 200 — response.data (both password endpoints)
{ "next_action": "login" }

// 400 AUTH_PASSWORD_POLICY_VIOLATION — response.error
{
  "code": "AUTH_PASSWORD_POLICY_VIOLATION",
  "message": "Password does not meet the policy.",
  "details": { "password": ["This password is too common.", "Add a symbol."] },
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version`.
- **Role projection:** uniform — `/me/` returns the same shape for every role.
- **Dates:** `last_login_at` and profile dates are plain ISO/date strings — no
  `*_bs` siblings in this module.
- **Server-computed (never send):** everything in `CurrentUser` (it is read-only
  here); `next_action` is a server hint.
- **State mapping:** after **either** password endpoint succeeds, all sessions are
  gone (own-change revokes the current one; first-login never created one) — clear
  local auth state and route to sign-in per `next_action: "login"`.
- **First-login is public:** the first-login form must call
  `password/first-login-change/` **without** a bearer, passing the
  `challenge_token` from the login response.

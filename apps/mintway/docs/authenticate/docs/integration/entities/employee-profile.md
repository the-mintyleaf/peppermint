# `EmployeeProfile` — operational employee data attached 1:1 to an account

**Endpoint base:** read-only nested in `GET /me/` and the admin account reads;
edited via `PATCH /api/v1/auth/users/<user_id>/profile/`.
**Access:** the profile object is **read** by the account owner (in `/me/`) and by
`admin` / `superadmin` (in account reads). It is **edited only** by
`admin` / `superadmin`. There is no standalone create — a profile is created
together with its account (see `user-account.md`).
**Owns:** the person's operational details (name, contact, job, employment span).
Not HR/payroll. This file also owns the reusable `EmployeeProfileRead` DTO that
`current-user.md` and `user-account.md` nest.

## 1. Fields (rows)

`Req` marks fields required **when the account is created** (`user-account.md`
create body). On `PATCH .../profile/` **every field is optional** (partial
update). Note two asymmetries: contact fields are **read** as `email` / `phone`
but **written** as `contact_email` / `contact_phone`; and `remarks` is
**write-only** (accepted on update, never returned).

| Field                   | TS type            | In req | In res | Req | Nullable | Server-set | Enum                | Validation                                  | Notes                                                 |
| ----------------------- | ------------------ | ------ | ------ | --- | -------- | ---------- | ------------------- | ------------------------------------------- | ----------------------------------------------------- |
| `employee_code`         | `string`           | ✗      | ✓      | ✓   | No       | ✗          | —                   | `^[A-Z0-9][A-Z0-9-]*[A-Z0-9]$`, ≤20, unique | Set at account create; **not** editable here          |
| `first_name`            | `string`           | ✓      | ✓      | ✓   | No       | ✗          | —                   | ≤100                                        |                                                       |
| `middle_name`           | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                   | ≤100                                        | `""` when unset                                       |
| `last_name`             | `string`           | ✓      | ✓      | ✓   | No       | ✗          | —                   | ≤100                                        |                                                       |
| `preferred_name`        | `string`           | ✓      | ✓      | ✗   | No       | ✗          | —                   | ≤100                                        | `""` when unset                                       |
| `profile_image`         | `string \| null`   | ✗      | ✓      | ✗   | Yes      | ✓          | —                   | absolute URL                                | Read-only URL; **no upload endpoint** (see `gaps.md`) |
| `email`                 | `string`           | ✗¹     | ✓      | ✗   | No       | ✗          | —                   | email                                       | ¹ write as `contact_email`; `""` when unset           |
| `phone`                 | `string`           | ✗¹     | ✓      | ✗   | No       | ✗          | —                   | ≤32                                         | ¹ write as `contact_phone`; `""` when unset           |
| `job_title`             | `string`           | ✓      | ✓      | ✓   | No       | ✗          | —                   | ≤150                                        |                                                       |
| `employment_start_date` | `string`           | ✗      | ✓      | ✓   | No       | ✗          | —                   | date `YYYY-MM-DD`                           | Set at account create; **not** editable here          |
| `employment_end_date`   | `string \| null`   | ✓      | ✓      | ✗   | Yes      | ✗          | —                   | date `YYYY-MM-DD`                           | Nullable; may be sent `null` to clear                 |
| `employment_status`     | `EmploymentStatus` | ✓      | ✓      | ✗   | No       | ✗          | `employment_status` | —                                           | Default `active`                                      |
| `remarks`               | `string`           | ✓      | ✗      | ✗   | No       | ✗          | —                   | text                                        | Admin-only note; **write-only**, never returned       |

## 2. Types

```ts
type EmploymentStatus = "active" | "ended"; // see enums.md

// The nested read DTO — used by /me/ and the admin account reads.
// contact fields surface as email/phone; remarks is never returned.
interface EmployeeProfileRead {
  employee_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_name: string;
  profile_image: string | null; // Nullable=Yes
  email: string; // "" when unset
  phone: string; // "" when unset
  job_title: string;
  employment_start_date: string;
  employment_end_date: string | null; // Nullable=Yes
  employment_status: EmploymentStatus;
}

// PATCH /api/v1/auth/users/<user_id>/profile/ — request (all optional; partial).
// Contact fields are written under contact_* names (not email/phone).
interface EmployeeProfileUpdate {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  preferred_name?: string;
  job_title?: string;
  contact_email?: string;
  contact_phone?: string;
  employment_end_date?: string | null;
  employment_status?: EmploymentStatus;
  remarks?: string;
}
// No standalone Create type — a profile is created with its account (see
// user-account.md, UserCreate).
```

## 3. Endpoints

### `PATCH /api/v1/auth/users/<user_id>/profile/`

- **Purpose:** an admin edits a target account's non-security profile fields.
- **Request:** `EmployeeProfileUpdate` (partial). **Not editable here:**
  `username`, `role`, `employee_code`, `employment_start_date`, and `profile_image`.
- **Returns:** the updated **account** — a `UserAdmin` object (see
  `user-account.md`), not the bare profile. `200`.
- **Side effects:** records a `profile_security_changed` security event.
- **Policy key:** `authenticate.employee_profile.update`

> The profile is **read** (never written) inside `GET /me/` and the admin account
> reads/list — see `current-user.md` and `user-account.md` for those responses.

## 4. Validations & business rules

- Editable set is limited to non-security fields; sending `username`, `role`,
  `employee_code`, or `employment_start_date` here has no effect (they are not on
  the update serializer).
- `employee_code` (immutable) must match `^[A-Z0-9][A-Z0-9-]*[A-Z0-9]$`, ASCII
  only — validated at account create, shown here for reference.
- All text is Unicode-normalized server-side.

## 5. Errors

| Code                  | HTTP | Trigger                                                    | Suggested UI handling                       |
| --------------------- | ---- | ---------------------------------------------------------- | ------------------------------------------- |
| `AUTH_USER_NOT_FOUND` | 404  | Target account not found / not visible (incl. superadmin). | Not-found state.                            |
| `PERMISSION_DENIED`   | 403  | Caller is not `admin` / `superadmin`.                      | Hide the edit UI; treat as no access.       |
| `VALIDATION_ERROR`    | 400  | A field fails its constraint (e.g. bad email).             | Map `error.details` to the offending field. |

## 6. Examples

```jsonc
// PATCH /api/v1/auth/users/<user_id>/profile/ — request
{
  "job_title": "Senior Data Entry Officer",
  "contact_email": "aayush@example.com",
  "contact_phone": "+9779800000000",
  "remarks": "Promoted 2026-07.",
}

// 200 — response.data (the UserAdmin account; profile nested, contact as email/phone)
{
  "id": "6f9c1e64-…",
  "username": "aayush.karki",
  "role": "staff",
  "account_status": "active",
  "password_change_required": false,
  "last_login_at": "2026-07-15T06:15:00Z",
  "created_at": "2026-07-01T04:00:00Z",
  "deactivated_at": null,
  "suspended_at": null,
  "employee_profile": {
    "employee_code": "EMP-0012",
    "first_name": "Aayush",
    "middle_name": "",
    "last_name": "Karki",
    "preferred_name": "",
    "profile_image": null,
    "email": "aayush@example.com",
    "phone": "+9779800000000",
    "job_title": "Senior Data Entry Officer",
    "employment_start_date": "2026-07-01",
    "employment_end_date": null,
    "employment_status": "active",
  },
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — no `record_version`.
- **Read/write name mismatch:** bind the read fields `email` / `phone` for
  display, but submit them as `contact_email` / `contact_phone`. `remarks` never
  comes back — keep its form value client-side or re-fetch is not enough to show
  it.
- **Immutable fields:** don't render `employee_code` / `employment_start_date` /
  `username` / `role` as editable — the update endpoint ignores them.
- **Profile image:** `profile_image` is a **read-only absolute URL** (or `null`);
  there is currently **no endpoint to upload/change it** — see `gaps.md`.
- **Dates:** `employment_start_date` / `employment_end_date` are plain `YYYY-MM-DD`
  strings — no `*_bs` siblings.
- **Server-computed (never send):** `employee_code`, `employment_start_date`,
  `profile_image`.

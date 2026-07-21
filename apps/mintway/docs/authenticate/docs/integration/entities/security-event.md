# `SecurityEvent` — superadmin-only append-only authentication audit feed

**Endpoint base:** `/api/v1/auth/security-events/`
**Access:** **superadmin only** (any other role → `PERMISSION_DENIED`). Read-only.
**Owns:** the append-only record of authentication and account-security activity.
Rows are never created, updated, or deleted through the API — this is a read feed.
It never contains passwords, hashes, or tokens.

## 1. Fields (rows)

Every field is **read-only, server-authored** — there is no write path. `metadata`
is sanitized on write (credential-like keys dropped) and may be `{}`.

| Field             | TS type                   | In req | In res | Req | Nullable | Server-set | Enum         | Validation | Notes                                     |
| ----------------- | ------------------------- | ------ | ------ | --- | -------- | ---------- | ------------ | ---------- | ----------------------------------------- |
| `id`              | `string`                  | ✗      | ✓      | —   | No       | ✓          | —            | UUID       | Event id                                  |
| `event_type`      | `SecurityEventType`       | ✗      | ✓      | —   | No       | ✓          | `event_type` | —          | Also a list filter (`?event_type=`)       |
| `success`         | `boolean`                 | ✗      | ✓      | —   | No       | ✓          | —            | —          | Outcome flag                              |
| `actor_username`  | `string`                  | ✗      | ✓      | —   | No       | ✓          | —            | ≤32        | Snapshot; `""` for system/no actor        |
| `target_username` | `string`                  | ✗      | ✓      | —   | No       | ✓          | —            | ≤32        | Snapshot; `""` when no target             |
| `session_id`      | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —            | UUID       | Related session (denormalized)            |
| `device_id`       | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —            | UUID       | Related known-device (denormalized)       |
| `ip`              | `string \| null`          | ✗      | ✓      | —   | Yes      | ✓          | —            | IP         | Where reliable                            |
| `ua_summary`      | `string`                  | ✗      | ✓      | —   | No       | ✓          | —            | ≤255       | Coarse "Browser on OS"; `""` when unknown |
| `reason_code`     | `string`                  | ✗      | ✓      | —   | No       | ✓          | —            | ≤64        | Stable internal reason; `""` when none    |
| `metadata`        | `Record<string, unknown>` | ✗      | ✓      | —   | No       | ✓          | —            | —          | Sanitized context; may be `{}`            |
| `created_at`      | `string`                  | ✗      | ✓      | —   | No       | ✓          | —            | ISO 8601   | When the event occurred                   |

## 2. Types

```ts
// see enums.md
type SecurityEventType =
  | "login_succeeded"
  | "login_failed"
  | "login_rejected_cooldown"
  | "cooldown_started"
  | "account_auto_suspended"
  | "logout"
  | "logout_all"
  | "session_revoked_new_login"
  | "refresh_succeeded"
  | "refresh_rejected"
  | "account_created"
  | "account_deactivated"
  | "account_reactivated"
  | "account_suspended"
  | "account_unsuspended"
  | "password_changed"
  | "password_reset"
  | "first_login_challenge_issued"
  | "first_login_password_completed"
  | "username_changed"
  | "profile_security_changed"
  | "session_revoked_admin";

// GET /api/v1/auth/security-events/ — each list row
interface SecurityEvent {
  id: string;
  event_type: SecurityEventType;
  success: boolean;
  actor_username: string; // "" when none
  target_username: string; // "" when none
  session_id: string | null; // Nullable=Yes
  device_id: string | null; // Nullable=Yes
  ip: string | null; // Nullable=Yes
  ua_summary: string; // "" when unknown
  reason_code: string; // "" when none
  metadata: Record<string, unknown>; // sanitized; may be {}
  created_at: string;
}
// Read-only feed — no Create / Update types.
```

## 3. Endpoints

### `GET /api/v1/auth/security-events/`

- **Purpose:** the superadmin audit table.
- **Request:** superadmin bearer.
- **Returns:** paginated `SecurityEvent[]` (in `data`, with pagination `meta`).
- **Query params (list):** `event_type` (an `event_type` enum value),
  `target_id` (a user UUID), `page`, `page_size`.
- **Policy key:** `authenticate.security_event.list`

## 4. Validations & business rules

- Read-only: no `POST` / `PATCH` / `DELETE` are exposed. The log is append-only
  and retained indefinitely.
- Attributability survives deactivation — `actor_username` / `target_username` are
  snapshots taken at event time.
- `metadata` is sanitized server-side: keys containing `password`, `token`,
  `secret`, `otp`, `cookie`, `authorization`, or `csrf` are dropped. Do not expect
  those keys.

## 5. Errors

| Code                    | HTTP | Trigger                       | Suggested UI handling              |
| ----------------------- | ---- | ----------------------------- | ---------------------------------- |
| `PERMISSION_DENIED`     | 403  | Caller is not the superadmin. | Hide the feed; treat as no access. |
| `AUTHENTICATION_FAILED` | 401  | Missing / invalid bearer.     | Redirect to login.                 |

## 6. Examples

```jsonc
// GET /api/v1/auth/security-events/?event_type=login_failed — one response.data row
{
  "id": "e12a…",
  "event_type": "login_failed",
  "success": false,
  "actor_username": "",
  "target_username": "aayush.karki",
  "session_id": null,
  "device_id": null,
  "ip": "203.0.113.5",
  "ua_summary": "Chrome on macOS",
  "reason_code": "invalid_password",
  "metadata": {},
  "created_at": "2026-07-15T06:14:00Z",
}
```

> The response is wrapped in the standard envelope with pagination `meta`
> (`{ count, page, page_size, next, previous }`) — see `overview.md`.

## 7. UI / integration notes

- **Concurrency:** N/A — read-only feed, no `record_version`.
- **Role projection:** superadmin-only; there is no reduced projection for other
  roles — they get `403`.
- **Filtering:** combine `?event_type=` and `?target_id=` to scope the feed;
  reference the `event_type` values from `enums.md` for a filter dropdown.
- **Empty strings vs null:** `actor_username`, `target_username`, `ua_summary`,
  `reason_code` are `""` (not `null`) when absent; `session_id`, `device_id`, `ip`
  are genuinely `| null`.
- **Server-computed (never send):** every field — this is a read-only feed.
- **Dates:** `created_at` is a plain ISO string — no `*_bs` sibling.

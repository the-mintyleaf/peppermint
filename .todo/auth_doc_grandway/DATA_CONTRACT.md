# Data Contract — Authentication & Accounts

**Owner app:** `authenticate`
**Version:** 1.1.0
**Status:** Active
**Created:** 2026-07-15
**Purpose:** Owns application identity (accounts), the operational employee profile, password-reuse history, the append-only authentication security-event log, and refresh-session/known-device records. It does NOT own business authorization/RBAC (future `permissions` app + `core.policy_engine` metadata) or applicant/document data. Other apps must reference a user only by the opaque UUID `id` and the singular `role`, never by name string.

---

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-15 | AI (Claude) | Initial contract — `User`, `EmployeeProfile`, `PasswordHistory`, `SecurityEvent` (session 1: identity foundation). |
| 1.1.0 | 2026-07-15 | AI (Claude) | Added `AuthSession`, `KnownDevice`, `FirstLoginChallenge` (session 2: sessions & tokens). |

---

## Deliberate Deviations

The frontend reference docs (`.concept/frontend_*.md`) are informative only. Where they conflict with this contract, this contract wins (confirmed with the user):
- Login identifier is `username`, not `email`.
- API exposes a singular `role`, never a `roles` array.
- The response envelope follows CLAUDE.md §7 (`core.responses`), not the requirement doc's `errors/fields` illustrative shape.

---

## 1. User

**Purpose:** An application account that can authenticate. Holds security-sensitive identity and lifecycle state, separated from operational employee data (requirement §6). Extends `AbstractBaseUser` + `PermissionsMixin` on `core.models.BaseModel`.
**Table:** `authenticate_user`
**`role` choices:** `superadmin`, `admin`, `staff`
**`account_status` choices:** `active`, `suspended`, `deactivated`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Public primary key (opaque, non-sequential) |
| username | string(32) | Yes | No | No | Lowercase ASCII identifier; unique case-insensitively; normalized NFKC→strip→lower before storage |
| password | string | Yes | No | No | Argon2 hash (Django framework); never exposed |
| role | string | Yes | No | No | Exactly one application role; **immutable after creation** |
| account_status | string | — | No | No | Lifecycle state; default `active` |
| is_staff | bool | — | No | No | Django admin-site gate ONLY; `True` only for the superadmin (never the consultancy `staff` role, §7.5) |
| is_superuser | bool | — | No | No | Django superuser; `True` only for the single superadmin |
| password_change_required | bool | — | No | No | First-login / post-reset forced replacement flag |
| failed_login_count | int | — | No | No | Consecutive failed logins (cooldown progression) |
| cooldown_tier | int | — | No | No | 0 = none, 1 = after 5th failure, 2 = after 10th |
| cooldown_expires_at | datetime | — | Yes | No | When the current cooldown ends |
| token_version | int | — | No | No | Bumped to globally invalidate outstanding tokens/sessions; default 1 |
| last_login | datetime | — | Yes | No | Last successful login (service-managed) |
| last_password_change_at | datetime | — | Yes | No | Last password change/reset time |
| created_by | UUID FK→User | — | Yes | No | Creator account (null only for the provisioned superadmin); `PROTECT` |
| deactivated_at / deactivated_by / deactivation_reason | datetime / UUID FK→User / text | — | Yes | No | Soft-delete audit trail; FK `PROTECT` |
| suspended_at / suspended_by / suspension_reason | datetime / UUID FK→User / text | — | Yes | No | Suspension audit (`suspended_by` null = automatic); FK `PROTECT` |
| created_at | datetime | — | No | Yes | Row creation (`BaseModel`) |
| updated_at | datetime | — | No | Yes | Row update (`BaseModel`) |

**Validation Rules:**
- Username: length 3–32, regex `^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$` (no leading/trailing separator); API-created accounts additionally reject reserved names (`admin`, `superadmin`, `root`, …). The operational superadmin is exempt (provisioned out-of-band).
- Exactly one account may have `role=superadmin` (partial unique constraint).
- `role` cannot change after creation (enforced in `save()` and required by §10.6).
- Password must satisfy the full policy (§11.2) — enforced at every set point via Django validators.

**Indexes:** `username` (unique); partial unique constraint `authenticate_single_superadmin` on `role` where `role='superadmin'`.

**Soft Delete:** Users are NEVER physically deleted (requirement §10.5). `delete()` (instance and queryset) raises `UserDeletionForbiddenError`. Retirement = `account_status='deactivated'` with `deactivated_at/by/reason` recorded. All FKs into `User` use `PROTECT`.

**Example:**
```json
{
  "id": "6f9c1e64-3b2a-4a1e-9c2d-0f1b2c3d4e5f",
  "username": "aayush.karki",
  "role": "staff",
  "account_status": "active",
  "password_change_required": false,
  "last_login_at": "2026-07-15T06:15:00Z"
}
```

**Security Notes:** `password`, `token_version`, cooldown internals, and history are never serialized to clients (§17). `is_active` is a derived property (`account_status == 'active'`), not a stored field.

---

## 2. EmployeeProfile

**Purpose:** Operational employee information, one-to-one with an account (requirement §6.2). Not an HR/payroll system.
**Table:** `authenticate_employeeprofile`
**`employment_status` choices:** `active`, `ended`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| user | UUID FK→User (1:1) | Yes | No | No | Owning account; `PROTECT` |
| employee_code | string(20) | Yes | No | No | Unique uppercase ASCII identifier |
| first_name | string(100) | Yes | No | No | Given name |
| middle_name | string(100) | — | No | No | Optional (blank) |
| last_name | string(100) | Yes | No | No | Family name |
| preferred_name | string(100) | — | No | No | Optional display name (blank) |
| profile_image | image | — | Yes | No | Managed media; ≤5 MB; JPEG/PNG/WebP; content-sniffed |
| contact_email | email | — | No | No | Optional contact only (not a login identifier); normalized lowercase |
| contact_phone | string(32) | — | No | No | Optional contact |
| job_title | string(150) | Yes | No | No | Designation |
| employment_start_date | date | Yes | No | No | Employment start |
| employment_end_date | date | — | Yes | No | Employment end |
| employment_status | string | — | No | No | Default `active` |
| remarks | text | — | No | No | Admin-only notes (blank) |
| created_by / updated_by | UUID FK→User | — | Yes | No | Audit; `PROTECT` |
| created_at / updated_at | datetime | — | No | Yes | `BaseModel` timestamps |

**Validation Rules:**
- `employee_code`: unique, regex `^[A-Z0-9][A-Z0-9-]*[A-Z0-9]$` (ASCII code field, §39.7).
- `profile_image`: max 5 MB; extension ∈ {jpg, jpeg, png, webp}; Pillow-decoded format must match an approved type (rejects spoofed content, §6.4); stored under an opaque generated name.

**Indexes:** `employee_code` (unique).

**Soft Delete:** N/A — a profile is retired with its user (the account is deactivated, not deleted). The profile row is preserved; `PROTECT` on `user` prevents orphaning.

**Example:**
```json
{
  "employee_code": "EMP-0012",
  "first_name": "Aayush",
  "last_name": "Karki",
  "job_title": "Applicant Data Entry Officer",
  "employment_start_date": "2026-07-01",
  "employment_status": "active"
}
```

---

## 3. PasswordHistory

**Purpose:** Stores recent password hashes to prevent reuse of the current or previous three passwords (requirement §11.3).
**Table:** `authenticate_passwordhistory`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| user | UUID FK→User | Yes | No | No | Owning account; `PROTECT` |
| password_hash | string(255) | Yes | No | No | Argon2 hash of a former password |
| created_at / updated_at | datetime | — | No | Yes | `BaseModel` timestamps |

**Validation Rules:** Only the newest 3 rows per user are retained (trimmed by the service on each password change). Contains hashes only — never plaintext.

**Soft Delete:** N/A — history rows are trimmed (hard-removed beyond depth 3) by the service; they carry no audit-retention obligation of their own.

**Security Notes:** Never serialized to any client.

---

## 4. SecurityEvent

**Purpose:** Append-only record of authentication and account-security activity (requirement §18). Readable only by the superadmin.
**Table:** `authenticate_securityevent`
**`event_type` choices:** `login_succeeded`, `login_failed`, `login_rejected_cooldown`, `cooldown_started`, `account_auto_suspended`, `logout`, `logout_all`, `session_revoked_new_login`, `refresh_succeeded`, `refresh_rejected`, `account_created`, `account_deactivated`, `account_reactivated`, `account_suspended`, `account_unsuspended`, `password_changed`, `password_reset`, `first_login_challenge_issued`, `first_login_password_completed`, `username_changed`, `profile_security_changed`, `session_revoked_admin`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| event_type | string(64) | Yes | No | No | Event kind (indexed) |
| success | bool | — | No | No | Outcome flag; default `true` |
| actor | UUID FK→User | — | Yes | No | Who performed the action; `PROTECT` |
| actor_username | string(32) | — | No | No | Snapshot of actor username at event time |
| target | UUID FK→User | — | Yes | No | Account acted upon; `PROTECT` |
| target_username | string(32) | — | No | No | Snapshot of target username at event time |
| session_id | UUID | — | Yes | No | Related session id (denormalized) |
| device_id | UUID | — | Yes | No | Related known-device id (denormalized) |
| ip | inet | — | Yes | No | Request IP where reliable |
| ua_summary | string(255) | — | No | No | Normalized user-agent summary |
| reason_code | string(64) | — | No | No | Stable internal reason code |
| metadata | json | — | No | Yes | Sanitized context (credential keys stripped) |
| created_at / updated_at | datetime | — | No | Yes | `BaseModel` timestamps |

**Validation Rules:** Append-only — `save()` on an existing row and all `delete()`/bulk-`update()`/bulk-`delete()` raise `SecurityEventImmutableError`. `metadata` is sanitized on write: keys containing `password`, `token`, `secret`, `otp`, `cookie`, `authorization`, or `csrf` are dropped (§18.3).

**Indexes:** `(event_type, created_at)`, `(target, created_at)`; plus `event_type` single-column index.

**Soft Delete:** N/A — the log is append-only and retained indefinitely (§18.3); rows are never updated or deleted.

**Security Notes:** Never contains passwords, hashes, or tokens. Read access is restricted to the superadmin (enforced at the endpoint layer in a later session).

---

## 5. AuthSession

**Purpose:** The single active refresh session for an account (requirement §14). The model `id` is the `session_id` carried in JWT claims; a partial unique constraint guarantees at most one active session per user.
**Table:** `authenticate_authsession`
**`revoke_reason` choices:** `logout`, `logout_all`, `new_login`, `password_change`, `password_reset`, `deactivated`, `suspended`, `admin_revoke`, `token_reuse`, `expired`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key = JWT `session_id` claim |
| user | UUID FK→User | Yes | No | No | Owning account; `PROTECT` |
| current_refresh_jti | string(64) | — | No | No | jti of the currently valid refresh token (indexed); rotated each refresh |
| rotation_count | int | — | No | No | Number of refreshes performed |
| expires_at | datetime | Yes | No | No | Absolute expiry = login + 7 days; never extended |
| device | UUID FK→KnownDevice | — | Yes | No | Device backing the session; `SET_NULL` |
| last_used_at | datetime | Yes | No | No | Last login/refresh time |
| revoked_at | datetime | — | Yes | No | When revoked |
| revoke_reason | string(32) | — | No | No | Why revoked (blank while active) |
| is_active | bool | — | No | No | Active flag; default `true` |
| created_ip | inet | — | Yes | No | IP at session creation |
| created_at / updated_at | datetime | — | No | Yes | `BaseModel` timestamps |

**Validation Rules:** At most one active session per user (partial unique constraint `authenticate_one_active_session_per_user`). Refresh rotation clamps the new token's expiry to `expires_at`. Presenting a rotated-out jti revokes the session (reuse detection).

**Indexes:** partial unique `(user)` where `is_active=true`; `current_refresh_jti`.

**Soft Delete:** N/A — sessions are revoked (`is_active=false` + reason), not deleted; retained for the session's audit trail.

**Security Notes:** `current_refresh_jti` is an identifier, not a credential (forging a token still requires `JWT_SIGNING_KEY`); stored in plaintext by design. Never serialized to clients.

---

## 6. KnownDevice

**Purpose:** Device/session record for security visibility (requirement §14.1). At most three per account.
**Table:** `authenticate_knowndevice`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key = `mintway_device` cookie value |
| user | UUID FK→User | Yes | No | No | Owning account; `PROTECT` |
| ua_summary | string(255) | — | No | No | Coarse "Browser on OS" summary (no fingerprinting) |
| first_seen_at | datetime | Yes | No | No | First login from this device |
| last_seen_at | datetime | Yes | No | No | Most recent login from this device |
| last_ip | inet | — | Yes | No | Last IP seen |
| created_at / updated_at | datetime | — | No | Yes | `BaseModel` timestamps |

**Validation Rules:** A 4th device retires the oldest device with no active session; the active-session device is never retired.

**Soft Delete:** N/A — retired devices are hard-deleted beyond the 3-device cap; `SecurityEvent.device_id` snapshots preserve the audit trail. `AuthSession.device` is `SET_NULL` on delete.

**Security Notes:** Exposed to the owning user via `sessions/` as a safe summary; never includes tokens.

---

## 7. FirstLoginChallenge

**Purpose:** Short-lived, single-purpose token authorizing the forced first-login password change (requirement §9.4). Opaque and DB-backed so it can be consumed once and revoked.
**Table:** `authenticate_firstloginchallenge`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| user | UUID FK→User | Yes | No | No | Account that must change its password; `PROTECT` |
| token_hash | string(64) | Yes | No | No | sha256 of the one-time token (raw value returned once, never stored); unique |
| expires_at | datetime | Yes | No | No | Expiry (10 minutes from issue) |
| consumed_at | datetime | — | Yes | No | When consumed |
| created_ip | inet | — | Yes | No | IP at issue |
| created_at / updated_at | datetime | — | No | Yes | `BaseModel` timestamps |

**Validation Rules:** Issuing a new challenge consumes prior unconsumed ones. The issuance/consumption logic lands in a later session; the model is present now.

**Soft Delete:** N/A — challenges are single-use and expire; consumed/expired rows carry no retention obligation.

**Security Notes:** Only the hash is stored. Never serialized to clients.

---

## Cross-App Dependencies

- `core.policy_engine` records the actor of metadata changes as string identifiers (`created_by_type` / `created_by_identifier`), NOT a FK to `authenticate.User` — so this app's introduction of a custom user model does not couple the two at the database level.
- Future apps (applicants, documents, permissions) will reference `authenticate.User` by its UUID `id` for ownership/audit and read the singular `role` for authorization. Such references must be documented here and in the referencing app's `DATA_CONTRACT.md` (CLAUDE.md §4).

---

## Soft Delete

`User` is the only soft-deleted model: retirement is `account_status='deactivated'` with actor/time/reason recorded; physical deletion is blocked at the model layer and all inbound FKs use `PROTECT`. `EmployeeProfile`, `PasswordHistory`, and `SecurityEvent` do not implement independent soft delete (profiles are retired with their user; history is trimmed; the event log is append-only and permanent). `AuthSession` is revoked in place (`is_active=false` + reason), not deleted. `KnownDevice` and `FirstLoginChallenge` are transient records (retired beyond the 3-device cap / single-use respectively) with no retention obligation of their own; device audit continuity is preserved via `SecurityEvent.device_id` snapshots.

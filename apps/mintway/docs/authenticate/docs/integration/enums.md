# Enums

Every enum value the module returns or accepts, in one place. Values are the
**wire values** (send/receive these verbatim). "UI label" is a suggested display
string — the frontend owns copy; the backend never sends a label.

> Type each of these as a TS string-literal union and reference it from the
> entity field tables (the `Enum` column names the set here).

## Account

**`role`** — the singular application role. **Immutable after account creation.**
Only `admin` / `staff` are creatable via the API; `superadmin` is provisioned
out-of-band and is never targetable through the admin endpoints.

| Value        | UI label   |
| ------------ | ---------- |
| `superadmin` | Superadmin |
| `admin`      | Admin      |
| `staff`      | Staff      |

**`account_status`** — account lifecycle state (default `active`).

| Value         | UI label    |
| ------------- | ----------- |
| `active`      | Active      |
| `suspended`   | Suspended   |
| `deactivated` | Deactivated |

## Employee profile

**`employment_status`** — default `active`.

| Value    | UI label |
| -------- | -------- |
| `active` | Active   |
| `ended`  | Ended    |

## Session

**`revoke_reason`** — why an auth session was revoked (blank `""` while active).
Appears on the admin target-session summary (`user-account.md`).

| Value             | UI label                     |
| ----------------- | ---------------------------- |
| `logout`          | Logout                       |
| `logout_all`      | Logout all                   |
| `new_login`       | New login                    |
| `password_change` | Password change              |
| `password_reset`  | Password reset               |
| `deactivated`     | Account deactivated          |
| `suspended`       | Account suspended            |
| `admin_revoke`    | Administrative revocation    |
| `token_reuse`     | Refresh-token reuse detected |
| `expired`         | Session expired              |

## Security event

**`event_type`** — the kind of audit event (`security-event.md`). Read-only; the
feed can also be filtered by this value via `?event_type=`.

| Value                            | UI label                          |
| -------------------------------- | --------------------------------- |
| `login_succeeded`                | Login succeeded                   |
| `login_failed`                   | Login failed                      |
| `login_rejected_cooldown`        | Login rejected during cooldown    |
| `cooldown_started`               | Cooldown started                  |
| `account_auto_suspended`         | Account automatically suspended   |
| `logout`                         | Logout                            |
| `logout_all`                     | Logout all devices                |
| `session_revoked_new_login`      | Session revoked by new login      |
| `refresh_succeeded`              | Refresh succeeded                 |
| `refresh_rejected`               | Refresh rejected                  |
| `account_created`                | Account created                   |
| `account_deactivated`            | Account deactivated               |
| `account_reactivated`            | Account reactivated               |
| `account_suspended`              | Account suspended                 |
| `account_unsuspended`            | Account unsuspended               |
| `password_changed`               | Password changed by user          |
| `password_reset`                 | Password reset by superadmin      |
| `first_login_challenge_issued`   | First-login challenge issued      |
| `first_login_password_completed` | First-login password completed    |
| `username_changed`               | Username changed by superadmin    |
| `profile_security_changed`       | Employee security profile changed |
| `session_revoked_admin`          | Session revoked administratively  |

## Response `next_action` hints

Not a backend `TextChoices` set — these are the literal `data.next_action` /
`data.password_change_required` signals some responses carry to tell the UI what
to do next. Switch the flow on them.

| Field                      | Value                         | Meaning                                                             |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| `password_change_required` | `true`                        | Login returned a first-login challenge — do not treat as signed in. |
| `next_action`              | `first_login_password_change` | Send the user to the first-login password form.                     |
| `next_action`              | `login`                       | Password changed; send the user back to the sign-in form.           |

# Enums

Every enum value the module returns or accepts, in one place. Values are the
**wire values** (send/receive these verbatim). "UI label" is a suggested display
string — the frontend owns copy; the backend never sends a label.

> Type each of these as a TS string-literal union and reference it from the
> entity field tables (the `Enum` column names the set here).

## Database backup

**`backup_status`** — lifecycle of a backup record. Response-only; the client
never sends it. Transitions one way: `in_progress` → `completed`, or
`in_progress` → `failed`.

| Value         | UI label    |
| ------------- | ----------- |
| `in_progress` | In progress |
| `completed`   | Completed   |
| `failed`      | Failed      |

**`dump_format`** — the `pg_dump` archive format. Response-only, server-set.
Currently only ever `custom` (pg_dump `-Fc`, restored with `pg_restore`). Type it
as a single-value union until the backend adds more (see `gaps.md`).

| Value    | UI label       |
| -------- | -------------- |
| `custom` | Custom (`-Fc`) |

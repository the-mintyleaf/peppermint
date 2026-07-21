# `DatabaseBackup` — an immutable audit record of one `pg_dump` archive

**Endpoint base:** `/api/v1/ops/database/backups/` (list + create); download at
`/api/v1/ops/database/backups/<backup_id>/download/`.
**Access:** **superadmin only.** Anonymous → `401`; admin / staff → `403`. No role
projection — the field set does not vary by caller.
**Owns:** one row per on-demand database backup — its lifecycle, provenance
(who / when / why), and integrity metadata. The dump archive itself lives on disk
under `DB_BACKUP_ROOT`; this row stores only its `filename` and the path is always
re-derived server-side. Records are **immutable** — there is no update or delete.

## 1. Fields (rows)

| Field             | TS type          | In req | In res | Req | Nullable | Server-set | Enum            | Validation   | Notes                                                          |
| ----------------- | ---------------- | ------ | ------ | --- | -------- | ---------- | --------------- | ------------ | -------------------------------------------------------------- |
| `id`              | `string`         | ✗      | ✓      | —   | No       | ✓          | —               | UUID         | Primary key (public identifier)                                |
| `filename`        | `string`         | ✗      | ✓      | —   | No       | ✓          | —               | ≤128 chars   | `backup_<YYYYMMDD_HHMMSS>.dump` (UTC, sortable, unique)        |
| `database_name`   | `string`         | ✗      | ✓      | —   | No       | ✓          | —               | ≤128 chars   | Name of the database that was dumped                           |
| `dump_format`     | `DumpFormat`     | ✗      | ✓      | —   | No       | ✓          | `dump_format`   | —            | Always `custom` (pg_dump `-Fc`)                                |
| `status`          | `BackupStatus`   | ✗      | ✓      | —   | No       | ✓          | `backup_status` | —            | Default `in_progress`; a successful create returns `completed` |
| `size_bytes`      | `number \| null` | ✗      | ✓      | —   | Yes      | ✓          | —               | —            | Archive byte count; `null` until `completed`                   |
| `checksum_sha256` | `string`         | ✗      | ✓      | —   | No       | ✓          | —               | 64 hex chars | SHA-256 of the archive; `""` until `completed`                 |
| `reason`          | `string`         | ✓      | ✓      | ✗   | No       | ✗          | —               | ≤1000 chars  | Optional operator note; `""` when unset                        |
| `error_message`   | `string`         | ✗      | ✓      | —   | No       | ✓          | —               | —            | Failure description (credential-free); `""` unless `failed`    |
| `created_by`      | `string`         | ✗      | ✓      | —   | No       | ✓          | —               | —            | Superadmin **username** who triggered the backup               |
| `created_at`      | `string`         | ✗      | ✓      | —   | No       | ✓          | —               | ISO 8601     | Creation timestamp (UTC; no `_bs` sibling)                     |

> `reason` is the **only** writable field — everything else is server-set and must
> never appear in a request body.

## 2. Types

```ts
type BackupStatus = "in_progress" | "completed" | "failed"; // see enums.md
type DumpFormat = "custom"; // see enums.md

interface DatabaseBackup {
  id: string;
  filename: string;
  database_name: string;
  dump_format: DumpFormat;
  status: BackupStatus;
  size_bytes: number | null; // Nullable=Yes → null until completed
  checksum_sha256: string; // "" until completed (blank, not null)
  reason: string; // "" when unset (blank, not null)
  error_message: string; // "" unless failed (blank, not null)
  created_by: string; // superadmin username
  created_at: string; // ISO 8601
}

// Create payload — only the optional operator note is writable.
interface DatabaseBackupCreate {
  reason?: string;
}

// No update/delete endpoints: DatabaseBackup rows are immutable.
```

## 3. Endpoints

### `POST /api/v1/ops/database/backups/`

- **Purpose:** take a new point-in-time database backup (runs `pg_dump`
  synchronously; can block up to the server's dump timeout, default 300s).
- **Request:** `DatabaseBackupCreate` — optional `{ reason? }`.
- **Returns:** the created `DatabaseBackup` (**201**), `status: "completed"` on
  success.
- **Side effects:** commits an `in_progress` row, runs `pg_dump -Fc` into
  `DB_BACKUP_ROOT`, then stamps `size_bytes` + `checksum_sha256` + `completed` (or
  `failed` + `error_message`). **Non-idempotent** — each call is a distinct
  snapshot.
- **Throttle:** `db_backup` — `10/hour` (scoped). → **429** when exceeded.
- **Policy key:** `operations.database_backup.create`

### `GET /api/v1/ops/database/backups/`

- **Purpose:** list prior backups (newest first) to pick one to download or to
  audit history.
- **Request:** pagination query params only — `?page`, `?page_size` (max 100).
- **Returns:** `list[DatabaseBackup]`, paginated, **newest first** (element 0 is
  the latest).
- **Query params (list):** none beyond pagination — no search / filter / ordering.
- **Throttle:** default per-user rate.
- **Policy key:** `operations.database_backup.list`

### `GET /api/v1/ops/database/backups/<backup_id>/download/`

- **Purpose:** download the archive bytes of a completed backup.
- **Request:** none (the `backup_id` UUID is in the path; a filename is never
  accepted from the client).
- **Returns:** **streamed raw bytes** — `application/octet-stream` with
  `Content-Disposition: attachment; filename="<filename>"`. **Not** the JSON
  envelope. Restore with `pg_restore -d <db> <file>`, not `psql`.
- **Throttle:** `db_backup` — `10/hour` (scoped). → **429** when exceeded.
- **Policy key:** `operations.database_backup.download` — **requires**
  `operations.database_backup.list`.

## 4. Validations & business rules

- `reason` is optional, ≤1000 chars, and Unicode-normalized server-side.
- `filename` is generated by the service (never client-supplied) and unique;
  clients never send or choose it.
- `status` is a one-way lifecycle: `in_progress` → `completed` **or**
  `in_progress` → `failed`. `size_bytes` and `checksum_sha256` are populated only
  when a backup reaches `completed`.
- Backups are **non-idempotent** — each `POST` produces a new snapshot; there is
  no dedupe.
- A crashed / killed dump process can leave a row stuck at `in_progress`
  (partially recoverable); such a backup is **not** downloadable.
- Download requires `status === "completed"` **and** the file present on disk;
  otherwise `409 OPERATIONS_BACKUP_NOT_READY`.

## 5. Errors

| Code                          | HTTP | Trigger                                                                | Suggested UI handling                                                           |
| ----------------------------- | ---- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `OPERATIONS_BACKUP_FAILED`    | 500  | `pg_dump` exited non-zero or timed out (a `failed` row is recorded)    | toast "Backup failed"; offer retry; the failed record still appears in the list |
| `OPERATIONS_BACKUP_NOT_FOUND` | 404  | no backup with that UUID (download)                                    | not-found; refresh the backup list                                              |
| `OPERATIONS_BACKUP_NOT_READY` | 409  | backup exists but `status ≠ completed`, or the file is missing on disk | disable/hide the download control; message "not available yet"; re-list         |
| `—`                           | 401  | request is unauthenticated                                             | redirect to login                                                               |
| `—`                           | 403  | authenticated but not superadmin                                       | "superadmin only" — hide the operations surface entirely                        |
| `—`                           | 429  | `db_backup` throttle exceeded (create / download)                      | "slow down / try again shortly"; back off before retrying                       |

> Field-validation failures (e.g. `reason` over 1000 chars) return the standard
> error envelope with per-field `error.details`; no app-specific code is documented
> for them (see `gaps.md`). The exact 401 / 403 body is likewise not enumerated —
> switch on the HTTP status for those.

## 6. Examples

```jsonc
// POST /api/v1/ops/database/backups/ — request
{ "reason": "pre-migration snapshot" }

// 201 — response.data
{
  "id": "5fefc7dd-9f6a-4c06-a9d8-66decb9f2565",
  "filename": "backup_20260715_155501.dump",
  "database_name": "mintway_prod",
  "dump_format": "custom",
  "status": "completed",
  "size_bytes": 4194304,
  "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "reason": "pre-migration snapshot",
  "error_message": "",
  "created_by": "superadmin",
  "created_at": "2026-07-15T10:10:10Z"
}
```

```jsonc
// GET /api/v1/ops/database/backups/ — response envelope (list; newest first)
{
  "success": true,
  "message": "...",
  "data": [{ "id": "5fefc7dd…", "status": "completed" /* …DatabaseBackup… */ }],
  "meta": {
    "count": 1,
    "page": 1,
    "page_size": 20,
    "next": null,
    "previous": null,
  },
}
```

```jsonc
// GET /api/v1/ops/database/backups/<id>/download/ — 200
// NOT JSON: response body is the raw archive bytes.
// Headers:
//   Content-Type: application/octet-stream
//   Content-Disposition: attachment; filename="backup_20260715_155501.dump"

// 409 — response.data (backup not completed / file missing)
{
  "success": false,
  "error": {
    "code": "OPERATIONS_BACKUP_NOT_READY",
    "message": "This backup is not available for download.",
    "details": {},
  },
  "meta": {},
}
```

## 7. UI / integration notes

- **Concurrency:** N/A — immutable audit rows; no `record_version`, no update or
  delete endpoint.
- **Role projection:** uniform — superadmin only; admin / staff get `403` and
  should never see the operations surface.
- **Dates:** `created_at` is UTC ISO 8601 with **no `_bs` sibling** (system-
  internal). Render it as-is.
- **Server-computed (never send):** everything except `reason` —
  `id`, `filename`, `database_name`, `dump_format`, `status`, `size_bytes`,
  `checksum_sha256`, `error_message`, `created_by`, `created_at`.
- **Media / streaming:** the download endpoint returns **raw bytes, not JSON** —
  request it with a blob/stream responseType at the api layer and save via the
  `Content-Disposition` filename; do **not** unwrap it as an envelope. Only offer
  the control when `status === "completed"`.
- **State mapping:** `201` → show the new `completed` backup at the top of the
  list. `500 OPERATIONS_BACKUP_FAILED` → the create failed but a `failed` row is
  still recorded. `404 OPERATIONS_BACKUP_NOT_FOUND` / `409
OPERATIONS_BACKUP_NOT_READY` → the download is unavailable; refresh the list.
  `429` → back off. `size_bytes === null` / `checksum_sha256 === ""` → the backup
  is not `completed`, so it is not downloadable.

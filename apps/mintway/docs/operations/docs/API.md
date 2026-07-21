# API Documentation — Platform Operations

**App:** `operations`
**Version:** 1.0.0
**Base prefix:** `/api/v1/ops/`
**Auth:** Superadmin only — every endpoint uses `authenticate.permissions.IsSuperadmin` (JWT session, CLAUDE.md §9). Not public.
**Throttle:** Backup creation (POST) and download use the scoped `db_backup` rate (`10/hour`); list (GET) uses the default per-user rate.
**Access level:** Superadmin-only (single superadmin account). No public endpoints.

---

## Change History

| Version | Date       | Author      | Summary                                            |
| ------- | ---------- | ----------- | -------------------------------------------------- |
| 1.0.0   | 2026-07-15 | AI (Claude) | Initial API — database backup create/list/download |

---

## Generic envelopes (referenced throughout)

**Success:**

```json
{ "success": true, "message": "...", "data": { ... }, "meta": {} }
```

**Error:**

```json
{
  "success": false,
  "error": { "code": "...", "message": "...", "details": {} },
  "meta": {}
}
```

**AI debugging notes (app-wide):** All endpoints deny by default — anonymous → 401, any non-superadmin
(admin/staff) → 403. The download endpoint streams a raw file (`FileResponse`), so a 200 response body
is the archive bytes, not the JSON envelope; all error paths still use the JSON envelope.

---

## 1. Database Backup

### 1.1 Create backup — `POST /api/v1/ops/database/backups/`

**Policy key(s):** `operations.database_backup.create` (risk: critical)
**Throttle:** `db_backup` (`10/hour`, scoped) — POST only.
**Request:** optional body; `reason` is an operator note.

```json
{ "reason": "pre-migration snapshot" }
```

**Response:** `201 Created` — the created backup record (see `DATA_CONTRACT.md §1`), status `completed`.
**Validation rules:** `reason` optional, ≤1000 chars, Unicode-normalized.
**Error codes:**

- `OPERATIONS_BACKUP_FAILED` (500 — `pg_dump` exited non-zero or timed out; a `failed` row is recorded).
  **Business rules:** Runs `pg_dump -Fc` synchronously into `settings.DB_BACKUP_ROOT` as
  `backup_<UTC-timestamp>.dump`; on success computes SHA-256 + size. Intentionally **non-idempotent** —
  each call is a distinct point-in-time snapshot. The record is committed as `in_progress` before the
  subprocess runs, so a crashed/killed process can leave an `in_progress` row (partially recoverable, §15).
  **AI debugging notes:** The DB password is passed to `pg_dump` via the `PGPASSWORD` env var, never on
  argv and never logged. A synchronous dump can block up to `DB_BACKUP_TIMEOUT_SECONDS` (default 300).

### 1.2 List backups — `GET /api/v1/ops/database/backups/`

**Policy key(s):** `operations.database_backup.list` (risk: medium)
**Throttle:** default per-user rate.
**Response:** `200 OK` — paginated list of backup records (`DATA_CONTRACT.md §1`), **newest first**
(element 0 is the latest). Standard pagination `meta` (page size 20, max 100).
**Query access pattern:** `selectors.list_database_backups` — `select_related("created_by")` to avoid
N+1 on the actor username across a page.
**Error codes:** none beyond the standard 401/403.

### 1.3 Download backup — `GET /api/v1/ops/database/backups/<backup_id>/download/`

**Policy key(s):** `operations.database_backup.download` (risk: critical) — requires
`operations.database_backup.list`.
**Throttle:** `db_backup` (`10/hour`, scoped).
**Response:** `200 OK` — streams the archive as `application/octet-stream` with
`Content-Disposition: attachment; filename="<filename>"`. Body is the raw dump, not JSON.
**Error codes:**

- `OPERATIONS_BACKUP_NOT_FOUND` (404 — no backup with that UUID).
- `OPERATIONS_BACKUP_NOT_READY` (409 — backup exists but status ≠ `completed`, or the file is missing from storage).
  **Business rules:** The file path is derived server-side from the stored `filename` and confined to
  `DB_BACKUP_ROOT` (a resolved path outside the root is rejected as 409 — traversal defense in depth).
  **AI debugging notes:** The archive is a custom-format `pg_dump` file; restore with
  `pg_restore -d <db> <file>`, not `psql`.

---

## Known limitations (not implemented)

- **Synchronous** backups only (no Celery/async). Guarded by the `db_backup` throttle.
- No retention/rotation, and no delete endpoint — archives accumulate under `DB_BACKUP_ROOT`.
- No restore endpoint — restore is a deliberately manual `pg_restore` operation.

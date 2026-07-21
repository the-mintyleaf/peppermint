# Flows

End-to-end sequences that span more than one call. Each step names the endpoint,
the key inputs, and the branches the UI must handle. Field / error detail lives in
the entity file — this is the choreography.

## Take a backup, then download it

1. `POST /api/v1/ops/database/backups/` `{ reason? }` → returns the new
   `DatabaseBackup` `id` with `status: "completed"`.
   - Runs `pg_dump` **synchronously** — the request can block up to the server's
     dump timeout (default 300s). Show a busy / progress state; do not
     double-submit.
   - `OPERATIONS_BACKUP_FAILED` (500) → the dump failed or timed out; a `failed`
     row is still recorded. Surface the error, offer retry.
   - `429` → the `db_backup` throttle (`10/hour`) is exhausted; back off.
2. `GET /api/v1/ops/database/backups/` → confirm the new backup is **element 0**
   (newest first). Use it to render the history list and pick a backup to
   download.
3. `GET /api/v1/ops/database/backups/<id>/download/` → the archive **bytes**
   (`application/octet-stream`, `attachment`). Save via the `Content-Disposition`
   filename; this is not the JSON envelope.
   - `OPERATIONS_BACKUP_NOT_READY` (409) → the backup is not `completed` (e.g. a
     stuck `in_progress` row) or the file is missing on disk; hide the download
     control and re-list.
   - `OPERATIONS_BACKUP_NOT_FOUND` (404) → the UUID is unknown; refresh the list.
   - `429` → download shares the `db_backup` throttle; back off.

> Restore is deliberately **manual and out of band** — there is no restore
> endpoint. Restore a downloaded archive with `pg_restore -d <db> <file>`.

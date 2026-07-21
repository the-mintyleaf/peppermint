# Security — Platform Operations

**Owner app:** `operations`
**Version:** 1.0.0
**Status:** Active
**Created:** 2026-07-15

This document is required per project rulebook §19 (Documentation Requirements) because `operations`
makes its own security-relevant decisions beyond the project's standard auth pattern: it shells out to
`pg_dump` with database credentials and streams full-database archives.

## Change History

| Version | Date       | Author      | Summary                        |
| ------- | ---------- | ----------- | ------------------------------ |
| 1.0.0   | 2026-07-15 | AI (Claude) | Initial security documentation |

---

## 1. Sensitivity of backup archives

A `pg_dump` archive contains the ENTIRE database — including Argon2 password hashes, security-event
logs, and all applicant PII. Consequently:

- Archives are written to `settings.DB_BACKUP_ROOT`, a directory OUTSIDE any public/media tree, and
  never receive a public URL. `backups/` is git-ignored so an archive can never be committed.
- The only way to retrieve an archive over the API is the download endpoint, restricted to the single
  superadmin account (`IsSuperadmin`).
- Every endpoint denies by default (401 anonymous, 403 for admin/staff).

## 2. Subprocess & credential handling

- `pg_dump` is invoked with an explicit **argv list** and `shell=False` (`operations.services._run_pg_dump`).
  No user input reaches the argv, and there is no shell to interpret metacharacters → no command injection.
- The database password is passed via the `PGPASSWORD` environment variable of the subprocess only —
  never on the command line (where it would appear in `ps`) and never logged (§17). Failure logs record
  only the backup UUID and a sanitized, credential-free message (`_sanitize_error`).
- The subprocess is bounded by `DB_BACKUP_TIMEOUT_SECONDS` (default 300); a timeout marks the row
  `failed` and removes any partial file.

## 3. Path traversal defense

- The download endpoint accepts only a backup **UUID**, never a filename. The file path is re-derived
  server-side as `DB_BACKUP_ROOT / <stored filename>`.
- Before streaming, the resolved path is asserted to live within the resolved `DB_BACKUP_ROOT` and to
  be an existing file; anything else returns 409 rather than streaming. This is defense in depth — the
  filename is system-generated, so traversal is not reachable through the normal path, but the check
  guards against tampering or misconfiguration.

## 4. Resource-exhaustion throttling

- Backup creation and download are heavy operations (a full dump / a large file stream). Both carry the
  scoped `db_backup` throttle (`10/hour`) to bound abuse and accidental hammering. Listing uses the
  default per-user rate.

## 5. Auditability

- Every backup attempt — success or failure — is recorded as an immutable `DatabaseBackup` row with the
  triggering superadmin (`created_by`), timestamp, status, and (on success) a SHA-256 checksum of the
  archive for integrity verification.

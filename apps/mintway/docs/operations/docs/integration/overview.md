# Overview — Platform Operations (`operations`)

**Pack version:** 1.0.0 · **Backend source version:** 1.0.0 · **Synced:** 2026-07-19

> Frontend pins to this version. When the backend Change History below moves past
> it, re-sync and bump.

## Change history

| Version | Date       | Summary                                                              |
| ------- | ---------- | -------------------------------------------------------------------- |
| 1.0.0   | 2026-07-19 | Initial pack — database backup create / list / byte-stream download. |

## Purpose

Owns operational / maintenance capabilities for the platform. The first is the
on-demand **database backup**: a synchronous `pg_dump` archive written to disk,
with an immutable `DatabaseBackup` audit row per attempt, plus an authenticated
download of the archive bytes. Does **not** own authentication (`authenticate`),
applicant data (`applicant`), or the access-control metadata registry
(`core.policy_engine`); it references `authenticate.User` only as the actor.

## Base paths

| Prefix                          | Holds                                         |
| ------------------------------- | --------------------------------------------- |
| `/api/v1/ops/`                  | All operations endpoints                      |
| `/api/v1/ops/database/backups/` | Backup list + create, and per-backup download |

## Auth

- JWT bearer / session: `Authorization: Bearer <access>`. **Every** endpoint is
  **superadmin-only** (`IsSuperadmin`). There are **no public endpoints**.
- Unauthenticated → **401**. Authenticated but not superadmin (admin / staff) →
  **403**. Deny by default. On a hard 401 the api client redirects to login.

## Response envelope

Every JSON response is wrapped. **Map the envelope to your UI shape at the API
layer** so components never see the raw wrapper.

```jsonc
// success
{ "success": true, "message": "...", "data": { /* the resource */ }, "meta": {} }
// error
{ "success": false, "error": { "code": "...", "message": "...", "details": {} }, "meta": {} }
```

- `data` is the resource (or paginated list payload). Unwrap to `data`.
- `error.code` is the machine-readable key — **switch UI behavior on `code`, not
  on `message`** (message is human copy, may change).
- `error.details` carries per-field serializer errors when present (shape not
  fully enumerated → see `gaps.md`).
- **Exception — the download endpoint.** A `200` from
  `.../<backup_id>/download/` is **raw `application/octet-stream` archive bytes**
  (`Content-Disposition: attachment`), **not** the JSON wrapper. All of its
  **error** paths still use the JSON error envelope above.

## Pagination

The list endpoint is paginated. `meta` carries `{ count, page, page_size, next,
previous }`.

- Request: `?page`, `?page_size` (**max 100**; default page size 20).
- `next` / `previous` are full absolute URLs (or `null`). Newest backup first
  (element 0 is the latest).
- **Map `meta.count` → `total`** at the API layer.

## Ordering, search, filtering

None documented beyond pagination — the list has a fixed newest-first order and
no search / filter / ordering query params (see `gaps.md`).

## IDs, dates, money

- **IDs** are string UUIDs.
- **Timestamps** are ISO 8601 strings in UTC. `created_at` is system-internal and
  carries **no Bikram Sambat (`_bs`) sibling**.
- **Money:** none in this module.
- **Sizes:** `size_bytes` is a JSON **number** (byte count), nullable until the
  backup completes.
- **Empty vs null.** A field marked `Nullable=Yes` in an entity table can come
  back `null` (here: `size_bytes`). An **optional text** field marked
  `Nullable=No` (Django `blank=True`, not DB-null) comes back as an **empty
  string `""`** when unset — never `null` (here: `checksum_sha256`,
  `error_message`, `reason`). Test `value === ""`, not `value == null`, for those.

## Throttling

- **Backup create (POST)** and **download (GET)** carry the scoped `db_backup`
  rate: **`10/hour`** (heavy operations — a full dump / a large file stream).
- **List (GET)** uses the default per-user rate.
- A throttled request returns **429**; surface a "slow down / try again shortly"
  state and back off.

## Role model

One application surface, one role: **superadmin**. Access is enforced server-side.

| Surface                          | staff / admin | superadmin |
| -------------------------------- | ------------- | ---------- |
| Create / list / download backups | ❌ 403        | ✅         |

Only a single superadmin account is expected to reach these endpoints. There is
**no role projection** — the response field set does not vary by role.

## Optimistic concurrency

**N/A** — no entity in this module carries `record_version`. `DatabaseBackup`
rows are immutable audit records; there is no update or delete endpoint, so no
concurrency token is ever sent.

## Dependency order (start here →)

1. **Authentication** (external `authenticate` module) — a **superadmin** token
   must exist.
2. **Create a database backup** — `POST /api/v1/ops/database/backups/`. Runs
   synchronously and returns a `completed` record.
3. **Download** — `GET /api/v1/ops/database/backups/<id>/download/` needs a
   `completed` backup to exist; the download policy key also requires the list
   policy key.

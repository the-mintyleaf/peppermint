# Overview — Core infrastructure & platform conventions (`core`)

**Pack version:** 1.0.0 · **Backend source version:** 1.1.0 · **Synced:** 2026-07-19

> Frontend `/sync-api` pins to this version. When the backend Change History
> below moves past it, re-sync and bump.
>
> **This is the platform's convention file.** The response envelope, pagination
> `meta` shape, and ID / date / money rules documented here are assumed by
> **every other app's integration pack** — they are documented **once, here**,
> and referenced (not repeated) elsewhere.

## Change history

| Version | Date       | Summary                                                                                                      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2026-07-19 | Initial pack — folder conversion of legacy `INTEGRATION.md`. Platform conventions + `health`/`ready` probes. |

## Purpose

`core` is the platform's **global infrastructure**, not a business app. It owns:

- The **standard success/error response envelope** every `/api/v1/` endpoint
  returns (`core/responses.py`).
- The **pagination `meta` shape** every list endpoint uses.
- The abstract **`BaseModel`** (UUID PK + audit timestamps) every domain model
  inherits — so the `id` / `created_at` / `updated_at` conventions below hold on
  **every** entity across the platform.
- The two public **health / readiness probe** endpoints (§23).

It owns **no business resources of its own** — no authentication, no domain data.
Those live in their respective apps.

## Base paths

| Prefix      | Holds                                                                        |
| ----------- | ---------------------------------------------------------------------------- |
| `/health/`  | Liveness probe — **not** under `/api/v1/` (registered directly in root URLs) |
| `/ready/`   | Readiness probe (DB connectivity) — **not** under `/api/v1/`                 |
| `/api/v1/…` | Every business app mounts here; **all** use the envelope + pagination below  |

> The health/readiness probes are the **only** `core` endpoints, and they are the
> documented exception to the envelope (raw `{"status": …}` bodies — see
> `entities/health.md`). Everything else here describes the shared contract that
> the **other apps'** `/api/v1/` endpoints obey.

## Auth

- JWT bearer / session: `Authorization: Bearer <access>` on all `/api/v1/`
  endpoints. Production uses an HttpOnly cookie; development accepts the token in
  the body/header.
- Unauthenticated → **401** (`AUTHENTICATION_REQUIRED` / `AUTHENTICATION_FAILED`);
  authenticated-but-forbidden → **403** (`PERMISSION_DENIED`). The api client
  handles token refresh; on a hard 401 redirect to login.
- **The health/readiness probes are public** — no auth, no throttle (§23).

## Response envelope

Every `/api/v1/` JSON response is wrapped. **Map the envelope to your UI shape at
the API layer** so components never see the raw wrapper.

```jsonc
// success
{ "success": true, "message": "...", "data": { /* the resource */ }, "meta": {} }
// error
{ "success": false, "error": { "code": "...", "message": "...", "details": {} }, "meta": {} }
```

- `data` is the resource (or the list payload). Unwrap to `data`.
- `error.code` is the machine-readable key — **switch UI behavior on `code`, not
  on `message`** (message is human copy and may change).
- `error.details` carries per-field serializer errors when present (its exact
  shape is not enumerated platform-wide → see `gaps.md`).

**Global error codes** (returned by the shared exception handler, in addition to
each app's own `APP_RESOURCE_REASON` codes):

| Code                      | HTTP | Meaning                          | Suggested UI handling                    |
| ------------------------- | ---- | -------------------------------- | ---------------------------------------- |
| `VALIDATION_ERROR`        | 400  | Request body validation failed   | Map `error.details` to form fields       |
| `AUTHENTICATION_REQUIRED` | 401  | No credentials provided          | Redirect to login                        |
| `AUTHENTICATION_FAILED`   | 401  | Invalid or expired credentials   | Refresh once, else redirect to login     |
| `PERMISSION_DENIED`       | 403  | Authenticated but not authorized | "Not allowed" state; hide the action     |
| `NOT_FOUND`               | 404  | Resource not found               | Not-found state (may also mean "hidden") |
| `METHOD_NOT_ALLOWED`      | 405  | HTTP method not supported        | Bug — don't call that method             |
| `RATE_LIMIT_EXCEEDED`     | 429  | Throttle limit hit               | Back off + "slow down / try shortly"     |
| `INTERNAL_SERVER_ERROR`   | 500  | Unhandled exception              | Generic error toast; retry later         |

## Pagination

Lists are paginated. `meta` carries `{ count, page, page_size, next, previous }`.

```jsonc
"meta": {
  "count": 100,
  "page": 1,
  "page_size": 20,
  "next": "https://api.example.com/api/v1/resource/?page=2",
  "previous": null
}
```

- Request: `?page`, `?page_size`. **Default page size `20`, max `100`.**
- `next` / `previous` are **full absolute URLs** (scheme + domain) as emitted by
  DRF's paginator, or `null` at the ends.
- **Map `meta.count` → `total`** at the API layer.
- Offset pagination is the platform default; an individual list may switch to
  cursor pagination for very large datasets — the owning app's entity file states
  it if so.

## Ordering, search, filtering

Passed as query params on list endpoints; the exact set is per-entity (each app's
entity files list them). `ordering` is a comma list of field names, prefix `-`
for descending. `core` itself exposes no list endpoints.

## IDs, dates, money

These conventions hold on the concrete entities of **every** app (they come from
`core`'s `BaseModel` and the platform data standards):

- **IDs** are string **UUIDs** everywhere (`BaseModel.id`). Internal
  auto-increment keys are never exposed.
- **Timestamps** (`created_at`, `updated_at`, and other datetime fields) are ISO
  8601 strings, timezone-aware (server stores UTC).
- **Bikram Sambat siblings:** user-facing (not system-internal) date fields carry
  a read-only `<field>_bs` object `{ year, month, day, month_name_en,
month_name_np, display_en, display_np }`. Render `display_en` / `display_np`;
  the plain AD field stays the source of truth. **Never send `_bs`** — it is
  response-only. System timestamps (`created_at`, `updated_at`, expiries) do
  **not** carry a `_bs` sibling.
- **Money** fields are **decimal strings**, not numbers — keep them as strings to
  avoid float drift.
- **Empty vs null.** A field marked `Nullable=Yes` in an entity table can come
  back `null` (type it `| null`). An **optional text/enum** field marked
  `Nullable=No` (Django `blank=True`, not DB-null) comes back as an **empty
  string `""`** when unset — never `null`; type it `string` (or the enum), and
  test `value === ""`, not `value == null`, for a fallback.

## Throttling

Project defaults apply to `/api/v1/` endpoints: `anon` 100/h, `user` 1000/h (no
custom scopes unless an app states otherwise). A throttled request returns **429**
(`RATE_LIMIT_EXCEEDED`); surface a "slow down / try again shortly" state and back
off. **The health/readiness probes are excluded from throttling** (§23).

## Role model

Access is **role-based and enforced server-side** — never rely on the frontend to
hide protected data. `core` itself is public infrastructure (its two endpoints
require no role); the platform's application roles (`staff`, `admin`,
`superadmin`) and any **role-projected responses** or **non-disclosing 404**
behavior are documented in the owning app's pack, not here.

## Optimistic concurrency

**Some** entities across the platform carry a `record_version` (starts at 1,
increments per write); for those, every `PATCH` / `DELETE` / transition must echo
the last-read `record_version`, and a mismatch returns a `409 *_VERSION_CONFLICT`
— reload and retry with the fresh version. Which entities use it is stated in each
app's entity file. `core`'s own endpoints are stateless reads with no
concurrency.

## Dependency order (start here →)

`core` has no build order of its own — it is the shared substrate. For the
platform as a whole:

1. **`core` conventions** (this file) — the envelope, pagination, and ID/date
   rules every other pack assumes. Read once.
2. **Health / readiness probes** (`entities/health.md`) — need nothing; wire them
   into infra monitoring first.
3. **Authentication** (the `authenticate` app) — a token must exist before any
   `/api/v1/` business call.
4. **Business apps** — each app's own pack states its internal order.

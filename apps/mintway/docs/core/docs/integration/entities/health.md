# `Health` — public liveness & readiness probes

**Endpoint base:** `/health/` and `/ready/` — **root-mounted, NOT under
`/api/v1/`** (registered directly in `core/urls.py`).
**Access:** **Public** — no auth, excluded from throttling (CLAUDE.md §23). No
role, no token.
**Owns:** no persisted resource — two **stateless** status probes for infra
monitoring / load-balancer health checks. Both are raw-body GETs and are the
documented **exception** to the standard response envelope (see `overview.md`).

## 1. Fields (rows)

There is no resource and no request body — the only field is the response
`status` string. Its closed value set differs by endpoint (see `enums.md`).

| Field    | TS type                       | In req | In res | Req | Nullable | Server-set | Enum                           | Validation | Notes                                                          |
| -------- | ----------------------------- | ------ | ------ | --- | -------- | ---------- | ------------------------------ | ---------- | -------------------------------------------------------------- |
| `status` | `HealthStatus \| ReadyStatus` | ✗      | ✓      | —   | No       | ✓          | `health_status`/`ready_status` | —          | `"ok"` from `/health/`; `"ready"`/`"not ready"` from `/ready/` |

> **Not enveloped.** Unlike every `/api/v1/` endpoint, these bodies are the raw
> object `{ "status": … }` — there is **no** `success` / `data` / `meta` wrapper.
> Do not run them through the api layer's envelope unwrapper.

## 2. Types

```ts
type HealthStatus = "ok"; // see enums.md (health_status)
type ReadyStatus = "ready" | "not ready"; // see enums.md (ready_status)

// Raw response bodies — NOT wrapped in the standard { success, data, meta } envelope.
interface HealthResponse {
  status: HealthStatus;
}
interface ReadyResponse {
  status: ReadyStatus;
}

// No Create/Update payloads: both endpoints are body-less public GET reads.
```

## 3. Endpoints

### `GET /health/`

- **Purpose:** liveness — confirm the process is running (deploy checks, LB probe).
- **Request:** none (no body, no query params, no auth header).
- **Returns:** `HealthResponse` (`200`, raw body `{ "status": "ok" }`).
- **Query params (list):** None.
- **Side effects:** None — no DB access.
- **Policy key:** None — public infrastructure endpoint, not registered in the
  Core Policy Engine (it is outside `/api/v1/`).

### `GET /ready/`

- **Purpose:** readiness — confirm the service can serve traffic (DB connected).
- **Request:** none.
- **Returns:** `ReadyResponse` — `200` `{ "status": "ready" }` when DB is
  reachable; `503` `{ "status": "not ready" }` when the DB connection cannot be
  established.
- **Query params (list):** None.
- **Side effects:** None persisted — opens a DB connection to test connectivity.
- **Policy key:** None — public infrastructure endpoint, not registered in the
  Core Policy Engine (it is outside `/api/v1/`).

## 4. Validations & business rules

- `/health/` **always** returns `200` while the process is alive — it performs
  **no** DB check, so it stays green even when the database is down.
- `/ready/` returns `200` only when a DB connection can be established; otherwise
  `503`. Use `/ready/` (not `/health/`) to gate traffic on database availability.
- Both endpoints are **public and unthrottled** — safe to poll frequently.

## 5. Errors

Neither endpoint uses the standard `error` envelope or a machine `code`. The only
non-200 outcome is `/ready/`'s `503`, which is a normal **status response**
(`{ "status": "not ready" }`), not an error object.

| Code | HTTP | Trigger                                  | Suggested UI handling                                         |
| ---- | ---- | ---------------------------------------- | ------------------------------------------------------------- |
| `—`  | 503  | `/ready/` — DB connection cannot be made | Treat as "not ready" (degraded); it is a body, not an `error` |

## 6. Examples

```jsonc
// GET /health/ — no request body
// 200 — RAW body (not enveloped)
{ "status": "ok" }

// GET /ready/ — no request body
// 200 — RAW body (DB reachable)
{ "status": "ready" }

// 503 — RAW body (DB unreachable)
{ "status": "not ready" }
```

## 7. UI / integration notes

- **Concurrency:** N/A — stateless reads, no `record_version`.
- **Role projection:** uniform — public, no roles.
- **Dates:** none — no date fields, no `*_bs` siblings.
- **Server-computed (never send):** `status` (and there is no request body at all).
- **Media / streaming:** none.
- **Envelope exception:** these two bodies are **raw** (`{ "status": … }`) — the
  single documented exception to the standard `{ success, data, meta }` envelope.
  Bypass the envelope unwrapper for these calls.
- **State mapping:** decide on the **HTTP status** (`200` vs `503`), not on the
  body string — the string mirrors the status and is for humans/logs. `/health/`
  200 = process alive; `/ready/` 200 = ready to serve, `503` = not ready.

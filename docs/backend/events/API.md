# API Documentation — Events

**App:** `events`
**Version:** 1.0.0
**Base prefix:** `/api/v1/events/`
**Auth:** JWT bearer required for every endpoint; no public endpoints in this app.
**Throttle:** Default DRF throttle classes only (`anon`/`user` rates in `REST_FRAMEWORK.DEFAULT_THROTTLE_RATES`) — no custom scope.
**Access level:** Staff/permission-gated only. Every endpoint calls `permissions.services.check_permission()` — see AI debugging notes below.

---

## Change History

| Version | Date       | Author      | Summary                                                |
| ------- | ---------- | ----------- | ------------------------------------------------------ |
| 1.0.0   | 2026-07-07 | AI (Claude) | Initial API documentation — read-only ledger browsing. |

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

**AI debugging notes (app-wide):** There is no create/update/delete endpoint in this app — the event ledger can only be written to from Python, via `events.services.emit_event()`, called from another app's own `services.py`. This is deliberate: a public write endpoint would let any authenticated caller forge audit history. If a future requirement needs event creation over HTTP (e.g. an external system posting audit events), that is a new, separately-approved endpoint — not an extension of these two.

This app is also the first to gate its own endpoints with `permissions.services.check_permission()` directly, rather than the interim `_require_staff` helper duplicated by `organization`/`authenticate`/`permissions`. `check_permission()` already handles the superuser bypass and `is_active` checks internally; the view only adds the 401/403 split (`NotAuthenticated` if unauthenticated, `PermissionDenied` if `allowed=False`). See `.docs/work_implementation.md` §2 item C.

---

## 1. Event Ledger

### 1.1 List Events — `GET /api/v1/events/`

**Policy key(s):** `events.event.list` (risk: high)
**Request:** query params, all optional: `source_app`, `event_type`, `resource_type`, `resource_id`, `correlation_id`, `organization_id`, plus standard `page`/`page_size`.
**Response:** paginated list of `EventLedger` — see `DATA_CONTRACT.md §1` for the read shape.
**Validation rules:** none — all filters are optional and simply narrow the queryset; an unrecognized/malformed `resource_id` UUID falls through to zero results rather than a 400.
**Error codes:** none beyond the standard 401/403.
**Business rules:** high risk level — viewing the platform-wide audit trail is a sensitive action, gated like every other high/critical endpoint in the Core Policy Engine.
**Query access pattern:** `events.selectors.list_events()` — `select_related("actor", "organization")`, filtered incrementally per supplied param, ordered by `-recorded_at`. No N+1 risk: exactly one query regardless of result count (pagination applies at the DB level via `StandardPagination`).

### 1.2 Read Event — `GET /api/v1/events/<id>/`

**Policy key(s):** `events.event.read` (risk: high)
**Request:** path param `id` (UUID).
**Response:** single `EventLedger` — see `DATA_CONTRACT.md §1`.
**Error codes:** `EVENTS_EVENT_NOT_FOUND` (404) — no event with that id.
**Business rules:** same high-risk gating as list; reading one event's full `previous_state`/`new_state` diff can expose sensitive business data, so it is gated identically rather than treated as lower-risk than list.

---

## Error code reference

All codes are defined in `events/constants.py`.

| Code                     | HTTP | Notes                                   |
| ------------------------ | ---- | --------------------------------------- |
| `EVENTS_EVENT_NOT_FOUND` | 404  | No `EventLedger` row with the given id. |

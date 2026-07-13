## 1. Module

- **Name:** Events
- **Base path:** /api/v1/events/
- **Auth:** JWT bearer required for every endpoint; no public endpoints in this app.

## 2. Conventions

- **Response:** `{success, message, data, meta}` wrapper on every endpoint.
- **Error:** `{success: false, error: {code, message, details}, meta: {}}`.
- **Auth failures:** not documented with an explicit body example in the backend docs — standard 401/403 envelope assumed, see Gaps.
- **Pagination:** standard `page`/`page_size` query params on the list endpoint; paginated response shape not spelled out field-by-field in the backend docs beyond "paginated list of EventLedger," see Gaps.
- **IDs:** UUID. **Times:** ISO 8601 datetime strings (e.g. `2026-07-07T14:10:00+00:00`).
- **List/search/filter/order params:** `source_app`, `event_type`, `resource_type`, `resource_id`, `correlation_id`, `organization_id` — all optional, all on the list endpoint only. No documented sort/order param (ordering is fixed server-side, newest first).

## 3. Models

**EventLedger**
`{ id, event_type, source_app, actor?:uuid, actor_snapshot:json, organization?:uuid, resource_type?, resource_id?:uuid, summary?, detail?, reason?, authority_context:json, permission_key?, previous_state:json, new_state:json, request_id?, correlation_id?, causation_id?, occurred_at, recorded_at }`

- Every field is read-only from the client's perspective — there is no create/update endpoint for this resource.

## 4. Enums

- No enum/choice fields on `EventLedger`. `event_type` and `source_app` are free strings, not a fixed choice set — new values can appear at any time as other backend modules start emitting events.

## 5. Dependency order

- `EventLedger` rows need nothing from the client to exist — they are only ever produced server-side as a side effect of actions in other modules (external module).
- **Start here:** there is nothing to create in this module. Treat it as a read-only audit trail to query after other modules produce activity.

## 6. Endpoints

### Event Ledger — /api/v1/events/

**Use it when:** building an audit/activity trail view, or drilling into "what happened to this record" for a resource elsewhere in the system.

**Methods:**

- GET /api/v1/events/
- GET /api/v1/events/<id>/

**Send (create/update):** none

**Returns:** list[EventLedger] | EventLedger

**Notes:**

- List accepts `source_app`, `event_type`, `resource_type`, `resource_id`, `correlation_id`, `organization_id` as optional query filters, plus `page`/`page_size`.
- There is no write endpoint. Events only appear here as a result of actions taken through other modules' own endpoints.

**Errors:**

- `EVENTS_EVENT_NOT_FOUND` (404) — no event with that id, on the detail endpoint.

## 7. Flows

**Viewing a resource's history**

1. Perform some action in another module (e.g. close a case) → that module's own endpoint returns its own result.
2. `GET /api/v1/events/?resource_type=<type>&resource_id=<id>` → list of events for that resource, newest first.
   - `403` → the current user lacks the permission to view the audit trail; not resolvable client-side.

**Drilling into one event**

1. `GET /api/v1/events/` (optionally filtered) → note an event's `id`.
2. `GET /api/v1/events/<id>/` → full event detail including `previous_state`/`new_state`.
   - `EVENTS_EVENT_NOT_FOUND` → the id doesn't exist; stop.

## 8. Gaps

- Exact 401/403 response bodies for this module are not spelled out in the backend docs beyond the generic error envelope shape — confirm against the live API before building error-state UI.
- Exact paginated-list response shape (where `count`/`next`/`previous`/`page` live relative to `data`/`meta`) is not spelled out field-by-field in the backend docs for this module specifically.
- No documented way to discover which `event_type`/`source_app` values currently exist (no enum, no "distinct values" endpoint) — a filter-builder UI would need to hardcode known values or add a follow-up endpoint.
- No documented sort/order override on the list endpoint (always newest-first).

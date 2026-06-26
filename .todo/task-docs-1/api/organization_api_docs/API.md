# API Documentation — Organization

**App:** `organization`
**Version:** 1.0.0
**Base prefix:** `/api/v1/organization/`
**Auth:** All endpoints require an authenticated, staff (`is_staff` or `is_superuser`) actor — interim pattern until the `permissions` app exists (CLAUDE.md §9). No public endpoints.
**Throttle:** No app-specific throttle scopes — covered by the project default `DEFAULT_THROTTLE_RATES` (`user`: 1000/hour).
**Access level:** Staff-only throughout.

---

## Change History

| Version | Date       | Author      | Summary                                             |
| ------- | ---------- | ----------- | --------------------------------------------------- |
| 1.0.0   | 2026-06-23 | AI (Claude) | Initial contract for all 12 models and 42 endpoints |

---

## Generic envelopes (referenced throughout)

**Success:**

```json
{ "success": true, "message": "...", "data": { ... }, "meta": {} }
```

**Paginated success** (list endpoints using `core.pagination.StandardPagination`):

```json
{ "success": true, "message": "", "data": [ ... ], "meta": { "count": 1, "page": 1, "page_size": 20, "next": null, "previous": null } }
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "...",
    "details": {}
  },
  "meta": {}
}
```

**Auth failures (generic, all endpoints):** `401` `{"code": "AUTHENTICATION_REQUIRED", ...}` when unauthenticated; `403` `{"code": "PERMISSION_DENIED", "message": "Staff access required.", ...}` when authenticated but not staff/superuser.

**AI debugging notes (applies app-wide):** Every "not found" response uses the resource-specific `ORGANIZATION_*_NOT_FOUND` code, not DRF's generic 404 — views check via a selector returning `None` rather than `get_object_or_404`, specifically so the client gets a stable, documented code (see `organization/views.py`'s per-view existence checks). `validate_code` on `code` fields raises a 400 `ValidationError`, not a 500 — see `DEBUG_HISTORY.md` for the bug this fixes.

---

## 1. Organizations

### 1.1 List/Create — `GET`/`POST /organizations/`

**Policy keys:** `organization.organization.list` (medium) / `organization.organization.create` (critical).
**POST request:** `{ "name": "Ministry of Health", "code": "moh", "organization_type": "ministry", "parent_organization": null, "legal_name": "", "short_name": "", "description": "", "country_code": "", "timezone": "" }` — only `name`, `code`, `organization_type` required.
**POST response (201):** the Organization read shape (§1, model fields — see `DATA_CONTRACT.md` §1).
**Error codes:** `ORGANIZATION_CODE_EXISTS` (409, duplicate `code`), `400` validation (invalid `code` format — lowercase slug only).
**Business rules:** `code` is globally unique (no tenant strategy exists in this project). `parent_organization` is accepted but is non-authoritative — see `DATA_CONTRACT.md` "Deliberate deviations."
**GET query access pattern:** `selectors.get_active_organizations()` — simple filtered/ordered queryset, paginated.

### 1.2 Detail — `GET`/`PATCH /organizations/<id>/`

**Policy keys:** `organization.organization.read` / `organization.organization.update`.
**PATCH request:** any subset of `name`, `legal_name`, `short_name`, `description`, `country_code`, `timezone`. Never `code`, `status`, `organization_type` through this endpoint — status changes go through §1.3.
**Error codes:** `ORGANIZATION_NOT_FOUND` (404).

### 1.3 Change status — `POST /organizations/<id>/status/`

**Policy key:** `organization.organization.change_status` (critical).
**Request:** `{ "status": "active", "reason": "go live" }`.
**Business rules:** Sets `is_active = (status == "active")`. Logs `organization_status_changed` with `reason` threaded into `OrganizationEventLog.reason`.

### 1.4 Actor context — `GET /actor-context/?user_id=<uuid>&organization_id=<uuid>&at_time=<iso8601>`

**Policy key:** `organization.actor_context.read` (high).
**Response:** the stable actor-context shape documented in `DATA_CONTRACT.md` §13 — `organization`, `membership`, `unit_memberships`, `position_assignments`, `reporting_chain`, `active_delegations_received`.
**Validation rules:** `user_id` is required (400 if missing); `organization_id` and `at_time` are optional. `at_time` is parsed via `datetime.fromisoformat`.
**Business rules:** Returns a context with `membership: null` (not a 404) when the user has no active membership — this is a valid, expected resolution outcome, not an error.
**Query access pattern:** `selectors.resolve_actor_organization_context()` — bounded number of queries (membership, unit memberships, assignments, one chain-of-command walk and one delegation lookup per assignment); documented as the stable contract the future `permissions` app consumes.

### 1.5 Event log — `GET /organizations/<organization_id>/events/`

**Policy key:** `organization.event_log.list` (medium).
**Response:** paginated `OrganizationEventLog` rows, newest first.
**Business rules:** Read-only — there is no create/update/delete endpoint for this resource; rows are written exclusively by other services (`_log_event()`).

---

## 2. Organization Units

### 2.1 List/Create — `GET`/`POST /organizations/<organization_id>/units/`

**Policy keys:** `organization.organization_unit.list` (medium) / `.create` (high).
**POST request:** `{ "name": "Health Directorate", "code": "health-directorate", "unit_type": "department", "parent": null, "description": "", "sort_order": 0, "is_operational": true }`.
**Error codes:** `ORGANIZATION_UNIT_CODE_EXISTS` (409).
**Business rules:** `depth`/`path_cache` are server-computed, never client-writable (read-only in the serializer). `parent`, if given, must be in the same organization (`ORGANIZATION_CROSS_ORGANIZATION_REFERENCE`, 400).

### 2.2 Detail — `GET`/`PATCH /units/<id>/`

**Policy keys:** `.read` (low) / `.update` (high).
**PATCH request:** any subset of `name`, `unit_type`, `status`, `description`, `sort_order`, `is_operational`. Never `code`, `parent` through this endpoint — moving is a dedicated action (§2.3).
**Error codes:** `ORGANIZATION_UNIT_NOT_FOUND` (404).

### 2.3 Move — `POST /units/<id>/move/`

**Policy key:** `organization.organization_unit.move` (critical).
**Request:** `{ "new_parent": "<uuid-or-null>", "reason": "reorg" }`.
**Error codes:** `ORGANIZATION_UNIT_CYCLE_DETECTED` (409, self-parent or moving under own descendant).
**Business rules:** Rewrites `OrganizationUnitClosure` for the entire moved subtree in 4 fixed-size queries plus a display-field recompute, all inside one transaction with the `OrganizationUnitHistory` and `OrganizationEventLog` writes — see `DATA_CONTRACT.md` §3.

### 2.4 Deactivate — `POST /units/<id>/deactivate/`

**Policy key:** `organization.organization_unit.deactivate` (critical).
**Request:** `{ "reason": "..." }` (optional).
**Error codes:** `ORGANIZATION_UNIT_HAS_ACTIVE_CHILDREN` (409) — deactivation never cascades; active children must be deactivated first.

### 2.5 Ancestors/Descendants — `GET /units/<id>/ancestors/`, `GET /units/<id>/descendants/`

**Policy keys:** `.read_ancestors` / `.read_descendants` (low).
**Response:** array of unit objects. Ancestors are root-first ordered; descendants exclude self by default.
**Query access pattern:** both use the closure table (`OrganizationUnitClosure`) — O(1) lookup, no recursive traversal.

### 2.6 Unit tree — `GET /organizations/<organization_id>/unit-tree/`

**Policy key:** `organization.organization_unit.read_tree` (medium).
**Response:** `data` is a nested array of `{ id, parent_id, name, code, unit_type, status, sort_order, children: [...] }`.
**Query access pattern:** `selectors.get_unit_tree()` — exactly **one** query (`.values()` over all units in the organization), tree assembled in-memory; tested with `assertNumQueries(1)`.

---

## 3. Positions

### 3.1 List/Create — `GET`/`POST /units/<unit_id>/positions/`

**Policy keys:** `.list` (medium) / `.create` (high).
**POST request:** `{ "title": "Health Officer", "code": "officer-1", "position_type": "officer", "is_leadership": false, "is_supervisory": false, "is_single_occupant": true, "max_occupants": 1 }`.
**Error codes:** `ORGANIZATION_POSITION_CODE_EXISTS` (409), `ORGANIZATION_UNIT_NOT_FOUND` (404, bad `unit_id`).
**GET query params:** `?include_inactive=true` to include deactivated positions (default: active only).

### 3.2 Detail — `GET`/`PATCH /positions/<id>/`

**Policy keys:** `.read` (low) / `.update` (high). **Error codes:** `ORGANIZATION_POSITION_NOT_FOUND` (404).

### 3.3 Deactivate — `POST /positions/<id>/deactivate/`

**Policy key:** `organization.position.deactivate` (critical). **Business rules:** never deletes historical `PositionAssignment` rows.

### 3.4 Holders — `GET /positions/<id>/holders/`

**Policy key:** `organization.position.read_holders` (medium). **Response:** array of active `PositionAssignment` rows for this position.

### 3.5 Chain of command — `GET /positions/<id>/chain-of-command/?reporting_line_type=administrative`

**Policy key:** `organization.reporting_line.read_chain_of_command` (medium). **Response:** ordered array `[{ position_id, code, title, depth }]` walking `ReportingLine.target_position` upward for one `reporting_line_type` (default `administrative`).

### 3.6 Subordinates — `GET /positions/<id>/subordinates/`

**Policy key:** `organization.reporting_line.read_subordinates` (medium). **Response:** array of `Position` objects whose active reporting line targets this position.

---

## 4. Memberships

### 4.1 List/Create — `GET`/`POST /organizations/<organization_id>/memberships/`

**Policy keys:** `.list` (medium) / `.create` (high).
**POST request:** `{ "user_id": "<uuid>", "employee_code": "", "joined_at": null, "is_primary": false }`.
**Error codes:** `ORGANIZATION_MEMBERSHIP_EXISTS` (409) — at most one _active_ membership per `(organization, user)`; ended memberships don't block a new one.

### 4.2 Detail — `GET /memberships/<id>/`

**Policy key:** `organization.membership.read` (low). **Error codes:** `ORGANIZATION_MEMBERSHIP_NOT_FOUND` (404).

### 4.3 Change status — `PATCH /memberships/<id>/status/`

**Policy key:** `organization.membership.change_status` (high). **Request:** `{ "status": "active", "reason": "onboarded" }`. **Business rules:** setting `status="ended"` stamps `ended_at` if not already set.

### 4.4 User memberships — `GET /users/<user_id>/memberships/`

**Policy key:** `organization.membership.read_user_memberships` (medium). **Response:** paginated active memberships across _all_ organizations for one user.

---

## 5. Unit Memberships

### 5.1 List/Create — `GET`/`POST /memberships/<membership_id>/unit-memberships/`

**Policy keys:** `.list` (medium) / `.create` (high).
**POST request:** `{ "unit_id": "<uuid>", "membership_type": "", "is_primary": false, "valid_from": null, "valid_to": null, "reason": "" }` — `unit_id` is a required top-level field (not inside the create serializer, since it identifies the related resource, mirroring how `position_id` works for assignments).
**Error codes:** `ORGANIZATION_UNIT_NOT_FOUND` (400 if `unit_id` missing/invalid), `ORGANIZATION_CROSS_ORGANIZATION_REFERENCE` (400, unit not in the membership's organization).

### 5.2 End — `POST /unit-memberships/<id>/end/`

**Policy key:** `organization.unit_membership.end` (high). **Business rules:** ending a unit membership never ends the parent `OrganizationMembership`.

---

## 6. Position Assignments

### 6.1 List/Create — `GET`/`POST /memberships/<membership_id>/position-assignments/`

**Policy keys:** `.list` (medium) / `.create` (critical).
**POST request:** `{ "position_id": "<uuid>", "assignment_type": "primary", "status": "active", "starts_at": null, "ends_at": null, "is_primary": true, "reason": "" }`.
**Error codes:** `ORGANIZATION_POSITION_INACTIVE` (409), `ORGANIZATION_POSITION_CAPACITY_EXCEEDED` (409, at `max_occupants`).
**Business rules:** `Position` row is locked via `select_for_update()` before re-validating capacity inside the same transaction — concurrent assignment requests cannot both pass the capacity check (see `DATA_CONTRACT.md` §8 and `test_services_positions.py::AssignPositionCapacityTest`).

### 6.2 End — `POST /position-assignments/<id>/end/`

**Policy key:** `organization.position_assignment.end` (high). **Error codes:** `ORGANIZATION_ASSIGNMENT_NOT_FOUND` (404).

### 6.3 Transfer — `POST /position-assignments/<id>/transfer/`

**Policy key:** `organization.position_assignment.transfer` (critical). **Request:** `{ "new_position_id": "<uuid>", "reason": "promotion" }`. **Business rules:** atomically ends the source assignment and creates a new one on `new_position_id`, preserving `assignment_type`/`is_primary` from the source.

---

## 7. Reporting Lines

### 7.1 List/Create — `GET`/`POST /organizations/<organization_id>/reporting-lines/`

**Policy keys:** `.list` (medium) / `.create` (high).
**POST request:** `{ "source_position_id": "<uuid>", "target_position_id": "<uuid>", "reporting_line_type": "administrative", "status": "active", "is_primary": true, "reason": "" }`.
**Error codes:** `ORGANIZATION_REPORTING_LINE_CYCLE_DETECTED` (409).
**Business rules:** Cycle-freedom is checked **per `reporting_line_type` independently** — the same position pair can legitimately have an `administrative` line one direction and a `functional` line the other without tripping the cycle check (matrix-organization support; see `DATA_CONTRACT.md` §9 and `test_services_reporting.py::CreateReportingLineTest::test_allows_different_types_for_same_pair_in_reverse`).

### 7.2 End — `POST /reporting-lines/<id>/end/`

**Policy key:** `organization.reporting_line.end` (high). **Error codes:** `ORGANIZATION_REPORTING_LINE_NOT_FOUND` (404).

---

## 8. Authority Delegations

### 8.1 List/Create — `GET`/`POST /organizations/<organization_id>/delegations/`

**Policy keys:** `.list` (medium) / `.create` (critical).
**POST request:** `{ "from_assignment_id": "<uuid>", "to_assignment_id": "<uuid>", "delegation_type": "acting_authority", "status": "planned", "scope_unit": null, "starts_at": "2026-06-23T00:00:00Z", "ends_at": null, "reason": "on leave" }` — `reason` and `starts_at` are required.
**Error codes:** `ORGANIZATION_DELEGATION_INVALID` (400, self-delegation, or `ends_at <= starts_at`).
**Business rules:** Does not itself grant any permission — recorded for the future `permissions` app to interpret.

### 8.2 Revoke — `POST /delegations/<id>/revoke/`

**Policy key:** `organization.delegation.revoke` (critical). **Request:** `{ "reason": "..." }`. **Error codes:** `ORGANIZATION_DELEGATION_NOT_FOUND` (404).

---

## Sites

`OrganizationSite` has a `services.create_site()` function and full model/admin support, but **no public API endpoint in this version** — the original requirements draft never specified one (see `.docs/organization_prompt.md` and `DATA_CONTRACT.md`). Flagged as a known limitation, not silently expanded.

---

## Policy Engine

All 42 endpoints above are registered via `organization/registry.py`'s `POLICY_ENDPOINTS` and synced with `python manage.py sync_policy_registry`. Every high/critical-risk endpoint declares a real forward dependency — see `test_policy_registry.py` for the automated check. Categories: `organization_management`, `organization_structure`, `position_management`, `membership_management`, `reporting_structure`, `delegation_management`, `organization_context`, `organization_audit`.

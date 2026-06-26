# API Documentation — Permissions

**App:** `permissions`
**Version:** 1.0.0 (Phase 1 — Core permission foundation)
**Base prefix:** `/api/v1/permissions/`
**Auth:** All endpoints require an authenticated, staff (`is_staff` or `is_superuser`) actor — interim pattern (CLAUDE.md §9), same as `organization`/`authenticate`. The decision endpoints (`/check/`, `/explain/`) additionally allow any authenticated user to check/explain **their own** permissions; checking on behalf of another subject requires staff. No public endpoints.
**Throttle:** No app-specific throttle scopes — covered by the project default `DEFAULT_THROTTLE_RATES` (`user`: 1000/hour).
**Access level:** Staff-only, except self-service decision checks as noted above.

---

## Change History

| Version | Date       | Author      | Summary                                                                                                                                                                                                     |
| ------- | ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-06-23 | AI (Claude) | Initial Phase 1 contract for `PermissionRole`, `PermissionRolePermission`, `PermissionRoleBinding`, `PermissionGrant`, `PermissionDeny`, and the `check`/`explain` decision endpoints (19 endpoints total). |

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
    "code": "PERMISSIONS_ROLE_NOT_FOUND",
    "message": "...",
    "details": {}
  },
  "meta": {}
}
```

**Auth failures (generic, all endpoints):** `401` `{"code": "AUTHENTICATION_REQUIRED", ...}` when unauthenticated; `403` `{"code": "PERMISSION_DENIED", "message": "Staff access required.", ...}` when authenticated but not staff/superuser and the action requires staff.

**AI debugging notes (applies app-wide):** Every "not found" response uses a resource-specific `PERMISSIONS_*_NOT_FOUND` code, not DRF's generic 404 — views check via a selector returning `None` rather than `get_object_or_404`. `permission_key` validation (existence/active-state) always delegates to `core.policy_engine.selectors.get_endpoint_by_permission_key()` — never re-implemented here (see `DATA_CONTRACT.md` "Deliberate deviations"). Scope columns (`organization`/`organization_unit`) are validated against `scope_type` server-side; sending a mismatched combination returns `400 PERMISSIONS_SCOPE_INVALID`, not a 500.

---

## 1. Roles

### 1.1 List/Create — `GET`/`POST /roles/`

**Policy keys:** `permissions.role.list` (low) / `permissions.role.create` (high).
**POST request:** `{ "key": "department_head", "display_name": "Department Head", "description": "", "role_type": "", "is_system_role": false, "is_assignable": true }` — only `key`, `display_name` required.
**Error codes:** `PERMISSIONS_ROLE_KEY_EXISTS` (409, duplicate `key`); `400` validation (invalid slug format).
**Query access pattern:** `selectors.get_all_roles()` — simple ordered queryset, paginated.

### 1.2 Detail — `GET`/`PATCH /roles/<id>/`

**Policy keys:** `permissions.role.read` (low) / `permissions.role.update` (high).
**PATCH request:** any subset of `display_name`, `description`, `role_type`, `is_assignable`. Never `key`, `is_active`, `is_deprecated` through this endpoint — deprecation goes through §1.3.
**Error codes:** `PERMISSIONS_ROLE_NOT_FOUND` (404).

### 1.3 Deprecate — `POST /roles/<id>/deprecate/`

**Policy key:** `permissions.role.deprecate` (high).
**Business rules:** Sets `is_deprecated=True` and `is_assignable=False`. Does **not** retroactively revoke existing `PermissionRoleBinding` rows — revoke those explicitly via §3.2 if needed.

---

## 2. Role Permissions

### 2.1 List/Attach — `GET`/`POST /roles/<id>/permissions/`

**Policy keys:** `permissions.role_permission.list` (low) / `permissions.role_permission.create` (critical).
**POST request:** `{ "permission_key": "organization.organization_unit.read" }`.
**Error codes:** `PERMISSIONS_ROLE_NOT_FOUND` (404); `PERMISSIONS_PERMISSION_KEY_UNKNOWN` (400, key doesn't resolve in `core.policy_engine`); `PERMISSIONS_PERMISSION_KEY_INACTIVE` (400, key is deprecated/inactive); `PERMISSIONS_ROLE_PERMISSION_EXISTS` (409, already attached and active).
**Business rules:** `operation_type_snapshot`/`risk_level_snapshot` are copied from the resolved `PolicyEndpoint` at attach time — not live-updated if the endpoint's metadata changes later.
**Query access pattern:** `selectors.get_role_permissions_for_role()` — all rows (active and inactive) for audit visibility, not paginated (role permission counts are small).

### 2.2 Detach — `DELETE /roles/<id>/permissions/<permission_key>/`

**Policy key:** `permissions.role_permission.delete` (critical).
**Business rules:** Soft-deactivation (`is_active=False`), not a hard delete — re-attaching the same `permission_key` later creates a new row (history-preserving).
**Error codes:** `PERMISSIONS_ROLE_PERMISSION_NOT_FOUND` (404, not currently attached).

---

## 3. Role Bindings

### 3.1 List/Create — `GET`/`POST /role-bindings/`

**Policy keys:** `permissions.role_binding.list` (medium) / `permissions.role_binding.create` (critical).
**GET query params:** `?subject_user_id=<uuid>` (optional filter).
**POST request:** `{ "subject_user_id": "<uuid>", "role_id": "<uuid>", "scope_type": "organization_unit", "organization": "<uuid>", "organization_unit": "<uuid>", "valid_from": null, "valid_until": null, "assignment_reason": "" }`.
**`scope_type` choices (Phase 1):** `global`, `organization`, `organization_unit` — see `DATA_CONTRACT.md` §3 for which scope fields each requires.
**Error codes:** `PERMISSIONS_ROLE_NOT_FOUND` (404); `PERMISSIONS_ROLE_NOT_ASSIGNABLE` (409, role inactive or `is_assignable=False`); `PERMISSIONS_SCOPE_INVALID` (400, scope fields don't match `scope_type`); `PERMISSIONS_ROLE_BINDING_DUPLICATE` (409, an active binding already exists for this exact subject/role/scope).
**Query access pattern:** `selectors.get_role_bindings_for_subject()` when filtered, else a plain ordered queryset — both `select_related` on `role`/`organization`/`organization_unit`.

### 3.2 Revoke — `POST /role-bindings/<id>/revoke/`

**Policy key:** `permissions.role_binding.revoke` (high).
**Request:** `{ "reason": "" }` (optional).
**Error codes:** `PERMISSIONS_ROLE_BINDING_NOT_FOUND` (404).

---

## 4. Direct Grants

### 4.1 List/Create — `GET`/`POST /grants/`

**Policy keys:** `permissions.grant.list` (medium) / `permissions.grant.create` (critical).
**GET query params:** `?subject_user_id=<uuid>` (optional filter).
**POST request:** `{ "subject_user_id": "<uuid>", "permission_key": "...", "scope_type": "global", "organization": null, "organization_unit": null, "valid_from": null, "valid_until": null, "reason": "", "approved_by": null }`.
**Error codes:** same `permission_key`/scope error codes as §2.1/§3.1.
**Business rules:** Grants are additive — creating a duplicate active grant is redundant but not rejected (no uniqueness constraint).

### 4.2 Revoke — `POST /grants/<id>/revoke/`

**Policy key:** `permissions.grant.revoke` (high).
**Error codes:** `PERMISSIONS_GRANT_NOT_FOUND` (404).

---

## 5. Direct Denials

### 5.1 List/Create — `GET`/`POST /denials/`

**Policy keys:** `permissions.deny.list` (medium) / `permissions.deny.create` (critical).
**GET query params:** `?subject_user_id=<uuid>` (optional filter).
**POST request:** `{ "subject_user_id": "<uuid>", "permission_key": "...", "scope_type": "global", "organization": null, "organization_unit": null, "reason": "Conflict of interest.", "severity": "medium", "valid_from": null, "valid_until": null }`.
**`reason` is required** — `400` if missing/blank (the one field in this app stricter than the usual blank-default convention; see `DATA_CONTRACT.md` §5).
**Error codes:** same `permission_key`/scope error codes as above, plus `400` if `reason` is missing.

### 5.2 Revoke — `POST /denials/<id>/revoke/`

**Policy key:** `permissions.deny.revoke` (high).
**Error codes:** `PERMISSIONS_DENY_NOT_FOUND` (404).

---

## 6. Decision Engine

### 6.1 Check — `POST /check/`

**Policy key:** `permissions.decision.check` (medium).
**Request:** `{ "permission_key": "organization.organization_unit.read", "subject_user_id": null, "organization_id": null, "organization_unit_id": null }` — `subject_user_id` defaults to the requesting user; supplying a different subject requires staff (`403 PERMISSION_DENIED` otherwise).
**Response (200, always — a deny is not an error):** the `PermissionDecision` shape documented in `DATA_CONTRACT.md` §6, e.g. `{ "allowed": true, "decision": "allow", "permission_key": "...", "reason": "...", "matched_role_bindings": [...], "matched_grants": [...], "matched_denials": [...], "risk_level": "low", "requires_audit": false, "cache_status": "miss", ... }`.
**Business rules:** Implements the Phase 1 decision-precedence subset documented in `DATA_CONTRACT.md` §6 — superuser bypass first, then default-deny, then explicit-deny-wins, then grant/role-binding scope matching. `resource` is not yet accepted by this endpoint (Phase 2 — resource-instance scope).
**Query access pattern:** bounded — one policy-engine lookup, one denial query, one grant query, one role-binding query (`select_related` on role/organization/organization_unit) plus one role-permission lookup per matching binding.

### 6.2 Explain — `POST /explain/`

**Policy key:** `permissions.decision.explain` (low).
**Request/response:** identical shape to §6.1. Phase 1 returns the exact same evaluation — the `PermissionDecision` object already is the explanation (concept doc §5.2); later phases may enrich this with additional considered-but-not-matched sources for the cold path.

---

## Policy Engine Registration

All 19 endpoints above are registered in `core.policy_engine` via `permissions/registry.py` (`POLICY_ENDPOINTS`), synced with `python manage.py sync_policy_registry`. Every `high`/`critical`-risk endpoint declares a real forward dependency, verified by `python manage.py validate_policy_engine --strict` (CLAUDE.md §35).

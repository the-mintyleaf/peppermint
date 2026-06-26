# Data Contract — Permissions

**Owner app:** `permissions`
**Version:** 1.0.0 (Phase 1 — Core permission foundation)
**Status:** Active
**Created:** 2026-06-23
**Purpose:** Centralized authorization/permission-assignment for MintFlow — the fourth governance foundation after `core.policy_engine` (action universe), `authenticate` (actor identity), and `organization` (organization/unit/position/membership structure). Answers: _can this subject perform this action under this scope, right now?_ Does **not** own passwords, login, organization hierarchy, membership/position lifecycle, workflow execution, event ledger, or audit interpretation — see `.docs/permission_concept.txt` §3.3 for the full forbidden-ownership list.

**Scope of this version:** Phase 1 only, per `.docs/permission_concept.txt` §21. Covers `PermissionRole`, `PermissionRolePermission`, `PermissionRoleBinding`, `PermissionGrant`, `PermissionDeny`, and the `check_permission`/`explain_permission` decision services with **global / organization / organization_unit** scope matching (exact match, no unit-subtree expansion yet). Delegation, separation-of-duty, break-glass, access review, resource-instance/row-level grants, position/membership-bound subjects, unit-tree scope expansion, decision-log persistence, and snapshots/caching are explicitly deferred to Phases 2–5 of the concept doc and are **not** implemented here.

---

## Change History

| Version | Date       | Author      | Summary                                                                                                                                                                         |
| ------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-06-23 | AI (Claude) | Initial Phase 1 contract for `PermissionRole`, `PermissionRolePermission`, `PermissionRoleBinding`, `PermissionGrant`, `PermissionDeny`, and the decision-service output shape. |

---

## Deliberate deviations from `.docs/permission_concept.txt` (Phase 1 narrowing)

The concept doc describes the full, multi-phase shape of this app. Building all of it at once would violate the project's minimalism rule (CLAUDE.md §32) and the concept doc's own phased rollout (§21). This contract intentionally narrows several things for Phase 1 — each is a scoping decision for _this phase_, not a rejection of the concept:

- **`ScopeType` is `global` / `organization` / `organization_unit` only**, not the full 15-value enum in concept §6. The other 12 values (`organization_unit_tree`, `position`, `position_tree`, `membership`, `membership_tree`, `resource_type`, `resource_instance`, `self`, `created_by_me`, `assigned_to_me`, `supervised_by_me`, `custom`) all require infrastructure this phase doesn't build yet (the resource adapter contract, unit-subtree expansion via `organization.selectors.get_unit_descendants()`, or position/membership-bound subjects). Declaring them now with no model column or evaluation logic behind them would be a half-finished implementation (CLAUDE.md "No half-finished implementations"). They will be added to the enum in the same migration that adds their supporting columns/logic in Phase 2.
- **Subject reference is `subject_user` only** — `subject_membership` and `subject_position_assignment` (concept §8.3) are deferred to Phase 2/3 alongside position/membership scope. Because there is currently only one possible subject field, the `validate_exactly_one_subject_reference` rule from concept §15 has nothing to validate yet (one non-nullable FK trivially satisfies "exactly one"); it becomes load-bearing once the other two subject FKs are added.
- **`PermissionRolePermission.condition_group` (concept §8.2) is dropped for Phase 1.** There is no `PermissionCondition`/`PermissionRule` model yet (those are Phase 3+), so a `condition_group` column would have no consumer.
- **No `PermissionDecisionLog` persistence.** `check_permission`/`explain_permission` return an in-memory `PermissionDecision` (a typed object, not a DB row) per concept §5.2. Decision persistence is explicitly a later-phase concern (the model isn't in the Phase 1 list in concept §21).
- **No resource-instance / row-level grants.** `PermissionGrant`/`PermissionDeny` carry `organization`/`organization_unit` scope columns only — no `resource_type`/`resource_id` columns yet (concept §7, explicitly Phase 2: "resource_type/resource_id scope, resource adapter contract").
- **Duplicate-active-binding prevention is service-layer, not a DB `UniqueConstraint`.** A multi-nullable-FK uniqueness key (`subject_user`, `role`, `scope_type`, `organization`, `organization_unit`) cannot be enforced by a standard Postgres unique constraint because SQL `NULL <> NULL` — two `global`-scope rows (both `organization=NULL`, `organization_unit=NULL`) would never collide under a DB constraint. `validators.validate_no_duplicate_active_binding()` performs an explicit existence check inside the same `transaction.atomic()` block as the write, mirroring the project's existing precedent for this kind of check (`organization.validators.validate_position_capacity()` is a service-layer count check for the same reason — see `organization/docs/DATA_CONTRACT.md`).
- **`permission_key` is a plain validated string, not a real FK to `core.policy_engine.PolicyEndpoint`.** Cross-app FK references are reserved for relationships the project has already established that pattern for (e.g. `organization.OrganizationMembership.user` → `authenticate.User`); `policy_engine.PolicyEndpoint` is keyed by `permission_key`, deprecates rather than deletes, and is intentionally treated as a string contract everywhere outside its own app (this mirrors how `organization`'s own registry/tests treat `permission_key` as a string). Existence/active-state is validated at write time via `core.policy_engine.selectors.get_endpoint_by_permission_key()` — see §6 below — never re-implemented locally.
- **`role_type` is a free-text `CharField`, not an enum.** The concept doc lists the field but never specifies its value set; inventing one would violate CLAUDE.md's "do not invent business rules not provided." Mirrors the existing precedent of `organization.UnitMembership.membership_type`, which is the same kind of doc-listed-but-unspecified classification field, also left as free text there.

---

## 1. PermissionRole

**Purpose:** A named, reusable authority package — a set of permission keys that can be bound to subjects under a scope (concept §8.1).

**Table:** `permissions_permissionrole`

| Field                   | Type           | Required | Nullable | Generated | Description                                                                    |
| ----------------------- | -------------- | -------- | -------- | --------- | ------------------------------------------------------------------------------ |
| id                      | UUID           | —        | No       | Yes       | Primary key                                                                    |
| key                     | SlugField(100) | Yes      | No       | No        | Globally unique, e.g. `department_head`                                        |
| display_name            | CharField(255) | Yes      | No       | No        | —                                                                              |
| description             | TextField      | No       | No       | No        | Blank-default                                                                  |
| role_type               | CharField(30)  | No       | No       | No        | Free text — see "Deliberate deviations"                                        |
| is_system_role          | Boolean        | No       | No       | No        | Default `False`; system roles are not deletable via API (enforced in services) |
| is_assignable           | Boolean        | No       | No       | No        | Default `True`; `False` blocks new bindings without affecting existing ones    |
| is_active               | Boolean        | No       | No       | No        | Default `True`                                                                 |
| is_deprecated           | Boolean        | No       | No       | No        | Default `False`                                                                |
| version                 | CharField(50)  | No       | No       | No        | Default `"1.0.0"`                                                              |
| created_at / updated_at | DateTimeField  | —        | No       | Yes       | Auto                                                                           |

**Validation rules:** `key` unique globally, slug format (lowercase, digits, hyphen/underscore); cannot be hard-deleted via API — deprecate instead (`deprecate_role()`); deprecating a role does not retroactively revoke existing `PermissionRoleBinding` rows (explicit revoke is a separate action).

**Indexes:** `key` (unique), `is_active`, `is_deprecated`.

**Example:**

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "key": "department_head",
  "display_name": "Department Head",
  "description": "Heads a department; reads/manages within their unit.",
  "role_type": "organizational",
  "is_system_role": false,
  "is_assignable": true,
  "is_active": true,
  "is_deprecated": false,
  "version": "1.0.0"
}
```

---

## 2. PermissionRolePermission

**Purpose:** Attaches one `core.policy_engine` permission key to a role (concept §8.2).

**Table:** `permissions_permissionrolepermission`

| Field                    | Type                         | Required | Nullable | Generated | Description                                                    |
| ------------------------ | ---------------------------- | -------- | -------- | --------- | -------------------------------------------------------------- |
| id                       | UUID                         | —        | No       | Yes       | Primary key                                                    |
| role                     | FK → PermissionRole, CASCADE | Yes      | No       | No        | —                                                              |
| permission_key           | CharField(255)               | Yes      | No       | No        | Must exist and be active in `core.policy_engine` at write time |
| operation_type_snapshot  | CharField(50)                | No       | No       | No        | Copied from `PolicyEndpoint.operation_type` at attach time     |
| risk_level_snapshot      | CharField(50)                | No       | No       | No        | Copied from `PolicyEndpoint.risk_level` at attach time         |
| is_active                | Boolean                      | No       | No       | No        | Default `True`                                                 |
| valid_from / valid_until | DateTimeField                | No       | Yes      | No        | Optional effective window                                      |
| created_at / updated_at  | DateTimeField                | —        | No       | Yes       | Auto                                                           |

**Validation rules:** `permission_key` must resolve via `core.policy_engine.selectors.get_endpoint_by_permission_key()` and the endpoint must be `is_active=True`; re-attaching a previously detached (`is_active=False`) permission_key creates a new row rather than reactivating the old one (history-preserving, matches `organization.OrganizationMembership`'s rejoin pattern).

**Constraints:** Partial unique on (`role`, `permission_key`) where `is_active=True` (`uniq_active_role_permission`) — a role cannot have the same permission_key attached twice while both are active.

**Indexes:** (`role`, `permission_key`), (`permission_key`, `is_active`).

**Cross-app boundary note:** this is the one place Phase 1 reads from `core.policy_engine` — via its existing public `selectors.get_endpoint_by_permission_key()`, never by re-implementing permission_key format validation locally (see "Deliberate deviations").

---

## 3. PermissionRoleBinding

**Purpose:** Assigns a role to a subject (Phase 1: a `User` only) under a scope (concept §8.3, narrowed per "Deliberate deviations").

**Table:** `permissions_permissionrolebinding`

**`scope_type` choices (Phase 1):** `global`, `organization`, `organization_unit`
**`status` choices:** `active`, `revoked`, `expired`

| Field                    | Type                                         | Required | Nullable | Generated | Description                                                    |
| ------------------------ | -------------------------------------------- | -------- | -------- | --------- | -------------------------------------------------------------- |
| id                       | UUID                                         | —        | No       | Yes       | Primary key                                                    |
| subject_user             | FK → authenticate.User, CASCADE              | Yes      | No       | No        | —                                                              |
| role                     | FK → PermissionRole, CASCADE                 | Yes      | No       | No        | —                                                              |
| scope_type               | CharField(30), choices                       | Yes      | No       | No        | —                                                              |
| organization             | FK → organization.Organization, SET_NULL     | No       | Yes      | No        | Required iff `scope_type in {organization, organization_unit}` |
| organization_unit        | FK → organization.OrganizationUnit, SET_NULL | No       | Yes      | No        | Required iff `scope_type == organization_unit`                 |
| valid_from / valid_until | DateTimeField                                | No       | Yes      | No        | Optional effective window                                      |
| status                   | CharField(20), choices                       | No       | No       | No        | Default `active`                                               |
| assigned_by              | FK → authenticate.User, SET_NULL             | No       | Yes      | No        | —                                                              |
| assignment_reason        | TextField                                    | No       | No       | No        | Blank-default                                                  |
| revoked_at               | DateTimeField                                | No       | Yes      | No        | —                                                              |
| revoked_by               | FK → authenticate.User, SET_NULL             | No       | Yes      | No        | —                                                              |
| revocation_reason        | TextField                                    | No       | No       | No        | Blank-default                                                  |
| created_at / updated_at  | DateTimeField                                | —        | No       | Yes       | Auto                                                           |

**Validation rules:**

- `role.is_assignable` must be `True` and `role.is_active` must be `True`.
- `validate_scope_fields_match_scope_type`: `organization`/`organization_unit` must be populated/empty exactly as the table above requires for the given `scope_type`.
- `validate_no_duplicate_active_binding`: no second `active` row may exist for the same (`subject_user`, `role`, `scope_type`, `organization`, `organization_unit`) — enforced in `services.py` inside `transaction.atomic()`, not a DB constraint (see "Deliberate deviations").
- Expired (`valid_until` in the past) or `revoked`/`expired`-status bindings are ignored by `check_permission`/`explain_permission` even if `status` hasn't been mechanically flipped yet (time-window check happens at evaluation time, not just at write time — no background job updates `status` in Phase 1).

**Indexes:** (`subject_user`, `status`), (`role`, `scope_type`), (`organization`,), (`organization_unit`,).

**Example:**

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "subject_user": "44444444-4444-4444-8444-444444444444",
  "role": "22222222-2222-4222-8222-222222222222",
  "scope_type": "organization_unit",
  "organization": "11111111-1111-4111-8111-111111111111",
  "organization_unit": "55555555-5555-4555-8555-555555555555",
  "status": "active",
  "valid_from": null,
  "valid_until": null
}
```

---

## 4. PermissionGrant

**Purpose:** A direct allow, independent of any role (concept §8.4, narrowed per "Deliberate deviations" — no resource-instance scope yet).

**Table:** `permissions_permissiongrant`

**`scope_type` choices:** `global`, `organization`, `organization_unit`
**`status` choices:** `active`, `revoked`, `expired`

| Field                                       | Type                                         | Required | Nullable   | Generated | Description           |
| ------------------------------------------- | -------------------------------------------- | -------- | ---------- | --------- | --------------------- |
| id                                          | UUID                                         | —        | No         | Yes       | Primary key           |
| subject_user                                | FK → authenticate.User, CASCADE              | Yes      | No         | No        | —                     |
| permission_key                              | CharField(255)                               | Yes      | No         | No        | Same validation as §2 |
| scope_type                                  | CharField(30), choices                       | Yes      | No         | No        | —                     |
| organization                                | FK → organization.Organization, SET_NULL     | No       | Yes        | No        | Same rule as §3       |
| organization_unit                           | FK → organization.OrganizationUnit, SET_NULL | No       | Yes        | No        | Same rule as §3       |
| valid_from / valid_until                    | DateTimeField                                | No       | Yes        | No        | —                     |
| reason                                      | TextField                                    | No       | No         | No        | Blank-default         |
| approved_by                                 | FK → authenticate.User, SET_NULL             | No       | Yes        | No        | —                     |
| created_by                                  | FK → authenticate.User, SET_NULL             | No       | Yes        | No        | —                     |
| status                                      | CharField(20), choices                       | No       | No         | No        | Default `active`      |
| revoked_at / revoked_by / revocation_reason | DateTimeField / FK / TextField               | No       | Yes/Yes/No | No        | —                     |
| created_at / updated_at                     | DateTimeField                                | —        | No         | Yes       | Auto                  |

**Validation rules:** same `permission_key` existence/active check as §2; same scope-field validation as §3. Grants are additive — no duplicate-prevention constraint (creating the same grant twice is redundant but not unsafe; `check_permission` treats multiple matching active grants the same as one).

**Indexes:** (`subject_user`, `permission_key`, `status`), (`organization`,), (`organization_unit`,).

---

## 5. PermissionDeny

**Purpose:** A direct denial that overrides role permissions and grants (concept §8.5).

**Table:** `permissions_permissiondeny`

**`scope_type` choices:** `global`, `organization`, `organization_unit`
**`severity` choices:** `low`, `medium`, `high`, `critical`
**`status` choices:** `active`, `revoked`, `expired`

| Field                                       | Type                                         | Required | Nullable   | Generated | Description                                                 |
| ------------------------------------------- | -------------------------------------------- | -------- | ---------- | --------- | ----------------------------------------------------------- |
| id                                          | UUID                                         | —        | No         | Yes       | Primary key                                                 |
| subject_user                                | FK → authenticate.User, CASCADE              | Yes      | No         | No        | —                                                           |
| permission_key                              | CharField(255)                               | Yes      | No         | No        | Same validation as §2                                       |
| scope_type                                  | CharField(30), choices                       | Yes      | No         | No        | —                                                           |
| organization                                | FK → organization.Organization, SET_NULL     | No       | Yes        | No        | Same rule as §3                                             |
| organization_unit                           | FK → organization.OrganizationUnit, SET_NULL | No       | Yes        | No        | Same rule as §3                                             |
| reason                                      | TextField                                    | **Yes**  | No         | No        | **Required, not blank** — a denial must always be justified |
| severity                                    | CharField(20), choices                       | No       | No         | No        | Default `medium`                                            |
| valid_from / valid_until                    | DateTimeField                                | No       | Yes        | No        | —                                                           |
| created_by                                  | FK → authenticate.User, SET_NULL             | No       | Yes        | No        | —                                                           |
| status                                      | CharField(20), choices                       | No       | No         | No        | Default `active`                                            |
| revoked_at / revoked_by / revocation_reason | DateTimeField / FK / TextField               | No       | Yes/Yes/No | No        | —                                                           |
| created_at / updated_at                     | DateTimeField                                | —        | No         | Yes       | Auto                                                        |

**Validation rules:** same `permission_key`/scope validation as §2/§3; `reason` is required (`blank=False`) — this is the one field in the whole Phase 1 schema that deviates from the project's usual "blank-default" convention, because an unjustified denial is a worse failure mode than a slightly stricter API contract.

**Indexes:** (`subject_user`, `permission_key`, `status`), (`organization`,), (`organization_unit`,).

---

## 6. Decision service output — `PermissionDecision`

**Not a DB model.** `services.check_permission()` and `services.explain_permission()` both return this in-memory shape (concept §5.2, narrowed to what Phase 1 actually evaluates):

```json
{
  "allowed": true,
  "decision": "allow",
  "permission_key": "organization.organization_unit.read",
  "subject_id": "44444444-4444-4444-8444-444444444444",
  "scope_type": "organization_unit",
  "organization_id": "11111111-1111-4111-8111-111111111111",
  "organization_unit_id": "55555555-5555-4555-8555-555555555555",
  "reason": "Allowed by role 'department_head' bound at organization_unit scope.",
  "matched_role_bindings": ["33333333-3333-4333-8333-333333333333"],
  "matched_grants": [],
  "matched_denials": [],
  "risk_level": "low",
  "requires_audit": false,
  "cache_status": "miss"
}
```

**Fields intentionally always empty/false in Phase 1** (reserved for later phases, present so the shape is stable as those phases land): `matched_delegations`, `matched_rules`, `failed_conditions` (always `[]`), `requires_escalation` (always `False`). `cache_status` is always `"miss"` — there is no cache yet (Phase 5).

**Decision precedence implemented in Phase 1** (concept §5.3, steps not yet implementable are noted):

1. Superuser bypass (`subject.is_superuser`) — allow immediately, mirrors `authenticate/docs/SECURITY.md` §12.
2. Default deny.
3. Inactive/unauthenticated subject denies.
4. _(Organization-membership-inactive check — deferred; Phase 1 has no `subject_membership` reference, see "Deliberate deviations.")_
5. `permission_key` must exist and be active in `core.policy_engine` (`PermissionEngineErrorCode.PERMISSIONS_PERMISSION_KEY_UNKNOWN` / `_INACTIVE`).
6. Explicit `PermissionDeny` beats any allow.
7. _(Separation-of-duty — deferred to Phase 3.)_
8. Expired/revoked grants, bindings ignored (time-window + status check at evaluation time).
9. Scope must match (`global` always matches; `organization`/`organization_unit` require an exact `organization_id`/`organization_unit_id` match from the caller-supplied `context` dict — no unit-subtree expansion yet, see "Deliberate deviations").
10. _(Policy-dependency enforcement — deferred; existence/active-state is checked, but `PolicyDependency` graph traversal is not.)_
11. _(ABAC/context conditions, break-glass — deferred to Phase 3/4; no `PermissionCondition`/`BreakGlassSession` model yet.)_
12. `requires_audit=True` is set whenever the resolved endpoint's `risk_level` is `high` or `critical` — no persistence yet (no `PermissionDecisionLog`), but the flag is present so callers/future phases can act on it.

**Context source note (concept §4.3 fix):** `organization_id`/`organization_unit_id` must be passed explicitly by the caller in the `context` dict — never derived from a JWT claim or a `User` field, since neither exists.

---

## Cross-app dependencies

- **`core.policy_engine`** — read-only, via `selectors.get_endpoint_by_permission_key()`. No write access, no re-implementation of permission_key format validation.
- **`authenticate`** — `authenticate.User` is the FK target for every subject/actor field in this app (`subject_user`, `assigned_by`, `revoked_by`, `approved_by`, `created_by`). The `is_superuser` bypass-all contract documented in `authenticate/docs/SECURITY.md` §12 is honored as decision-precedence step 1.
- **`organization`** — `Organization`/`OrganizationUnit` are FK targets for scope columns only in Phase 1. `resolve_actor_organization_context()` and `get_unit_descendants()` are **not** called yet — they become load-bearing once `organization_unit_tree`/membership-based scope types are added in Phase 2.

No new third-party dependency was introduced by this app.

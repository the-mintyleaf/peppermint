# Data Contract — Organization

**Owner app:** `organization`
**Version:** 1.0.0
**Status:** Active
**Created:** 2026-06-23
**Purpose:** Organizational structure, internal unit hierarchy, positions, actor placement (membership/assignment), reporting chains, delegation, sites, and structural history for MintFlow. Does **not** own passwords, login, JWT, RBAC/ABAC/HBAC grants, work assignment logic, case ownership, or the final global event ledger — those belong to `authenticate`, the future `permissions` app, `work`, `cases`, and the future event-ledger app respectively.

---

## Change History

| Version           | Date       | Author      | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0             | 2026-06-23 | AI (Claude) | Initial contract for all 12 models and the actor-context/event-log payload shapes                                                                                                                                                                                                                                                                                                                                                                                  |
| 1.0.0 (finalized) | 2026-06-23 | AI (Claude) | Validated against the actual implementation: migration applied cleanly, all 122 tests pass (incl. a live closure-table corrupt/rebuild/revalidate round trip and a concurrent-assignment capacity race test), `sync_policy_registry`/`validate_policy_engine --strict` pass for all 42 endpoints, `validate_organization_integrity` passes. No field/shape changed from the initial contract — see `THIRD_PARTY_LIBRARIES.md` note below for one scope correction. |

**Note on `THIRD_PARTY_LIBRARIES.md`:** this app does not have its own `organization/docs/THIRD_PARTY_LIBRARIES.md` — the project's actual single source of truth for dependencies is the central `backend/core/docs/THIRD_PARTY_LIBRARIES.md` (confirmed by `requirements/README.md`'s dependency workflow and by `authenticate/docs/` itself not having a per-app copy). No new dependency was added by this app, so no entry was needed there either.

---

## Deliberate deviations from the original concept draft

The concept draft (an enterprise requirements document, since folded into `.docs/organization_prompt.md`) proposed two things this contract changes, found structurally unsound during review against the actual codebase and `.docs/mintflow_initial_architecture.md`:

- **`Organization.parent_organization` is non-authoritative, not a real hierarchy.** The draft let `Organization` nest "for complex ministry/agency structures," but `ReportingLine` is restricted to positions within the _same_ organization — nested organizations would have no way to express an Agency Director reporting to a Ministry position, which is exactly the authority chain this app exists to capture. Resolution: `Organization` is flat-ish (one row per independently-staffed institutional entity); all structural depth, including what reads as "ministry → agency → department," lives inside that Organization's `OrganizationUnit` tree. `parent_organization` is kept only as a non-authoritative grouping/label field — no selector, validator, or service in this app treats it as conferring shared staff, reporting eligibility, or visibility. "Same organization" always means exactly equal `organization_id`, never inherited through this field.
- **`OrganizationEventLog` gained two fields not in the draft: `reason` and `acting_assignment`.** `.docs/mintflow_initial_architecture.md` §4 requires every important action be traceable by actor/scope/action/time/**reason**/**authority**/source. The draft's event log covered five of those seven dimensions; roughly half the service functions in this app already accept a `reason: str` parameter with nowhere durable to persist it. Both fields are nullable/blank-default — population is judgment-based (see §12 below), not mandatory on every row.
- **`OrganizationMembership`'s uniqueness was contradictory in the draft** — a hard `unique(organization, user)` cannot coexist with `ended_at`-based rejoin support. Resolved with a partial unique constraint (`condition=Q(ended_at__isnull=True)`) instead of a hard unique-together. The same partial-constraint pattern (DB-enforced "one active row," not prose) is applied to `UnitMembership`, `PositionAssignment`, and `ReportingLine` wherever the draft said "only one active X should exist."
- **Two validators in the draft (`validate_unit_not_descendant_of_itself`, `validate_no_unit_cycle`) were the same check** — self-parent is just the depth-0 case of "is the new parent a descendant of this unit." Collapsed into one `validate_no_unit_cycle`.
- **`filters.py` was dropped from scope** — listed in the draft's file tree but never specified with any actual filtering requirement beyond plain selector keyword arguments.

`OrganizationEventLog`'s append-only enforcement mechanism (`AppendOnlyManager`/`AppendOnlyQuerySet`) is implemented **locally and independently** of `core.policy_engine`'s and `authenticate`'s own copies of the identical pattern — this mirrors the existing, deliberate precedent in this codebase (those two apps already maintain independent copies of the same logic rather than sharing one in `core/`); not a refactor opportunity taken here.

---

## 1. Organization

**Purpose:** A tenant-level institutional entity — one row per real, independently-staffed organization (a ministry, agency, enterprise, etc.). The top of the structural hierarchy; all internal depth lives in `OrganizationUnit`, not here (see "Deliberate deviations" above).

**Table:** `organization_organization`

**`organization_type` choices:** `ministry`, `agency`, `department`, `enterprise`, `division`, `office`, `committee`, `project_body`, `external_partner`, `system`, `other`
**`status` choices:** `draft`, `active`, `inactive`, `suspended`, `archived`

| Field               | Type                   | Required | Nullable | Generated          | Description                                                         |
| ------------------- | ---------------------- | -------- | -------- | ------------------ | ------------------------------------------------------------------- |
| id                  | UUID                   | —        | No       | Yes                | Primary key                                                         |
| name                | CharField(255)         | Yes      | No       | No                 | Display name                                                        |
| code                | CharField(50)          | Yes      | No       | No                 | **Globally unique** — no tenant strategy exists in this project yet |
| organization_type   | CharField(30), choices | Yes      | No       | No                 | —                                                                   |
| status              | CharField(20), choices | No       | No       | No                 | Default `draft`                                                     |
| parent_organization | FK → self              | No       | Yes      | No                 | **Non-authoritative label only** — see "Deliberate deviations"      |
| legal_name          | CharField(255)         | No       | No       | No                 | Blank-default                                                       |
| short_name          | CharField(100)         | No       | No       | No                 | Blank-default                                                       |
| description         | TextField              | No       | No       | No                 | Blank-default                                                       |
| country_code        | CharField(2)           | No       | No       | No                 | Blank-default, ISO 3166-1 alpha-2                                   |
| timezone            | CharField(64)          | No       | No       | No                 | Blank-default, IANA tz name                                         |
| metadata            | JSONField              | No       | No       | Yes (default `{}`) | Free-form extension data                                            |
| is_active           | Boolean                | No       | No       | No                 | Default `True`                                                      |
| created_at          | DateTimeField          | —        | No       | Yes                | Auto                                                                |
| updated_at          | DateTimeField          | —        | No       | Yes                | Auto                                                                |

**Validation rules:** `code` unique globally; cannot be hard-deleted through public APIs; inactive organizations remain queryable for history.

**Indexes:** `code` (unique), `status`, `organization_type`, `parent_organization`, `is_active`.

**Example:**

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "name": "Ministry of Health",
  "code": "moh",
  "organization_type": "ministry",
  "status": "active",
  "parent_organization": null,
  "is_active": true,
  "created_at": "2026-06-23T09:00:00Z",
  "updated_at": "2026-06-23T09:00:00Z"
}
```

**Cross-app boundary note:** future `work`/`cases` apps will reference `organization_id` directly (per `.docs/organization_prompt.md` §26); the future `permissions` app consumes `resolve_actor_organization_context()` (§12 below) rather than querying this model directly.

---

## 2. OrganizationUnit

**Purpose:** Internal structural hierarchy within one `Organization` — departments, divisions, branches, sections, field offices, and anything that would colloquially be called a sub-agency. Carries all the structural depth `Organization` deliberately does not (see "Deliberate deviations").

**Table:** `organization_organizationunit`

**`unit_type` choices:** `root`, `department`, `division`, `branch`, `section`, `subsection`, `cell`, `team`, `committee`, `project_unit`, `field_office`, `regional_office`, `district_office`, `temporary_unit`, `other`
**`status` choices:** `draft`, `active`, `inactive`, `merged`, `split`, `renamed`, `archived`

| Field          | Type                   | Required | Nullable | Generated          | Description                                                                                                                                                               |
| -------------- | ---------------------- | -------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id             | UUID                   | —        | No       | Yes                | Primary key                                                                                                                                                               |
| organization   | FK → Organization      | Yes      | No       | No                 | CASCADE                                                                                                                                                                   |
| parent         | FK → self              | No       | Yes      | No                 | `null` = root unit                                                                                                                                                        |
| name           | CharField(255)         | Yes      | No       | No                 | —                                                                                                                                                                         |
| code           | CharField(50)          | Yes      | No       | No                 | Unique within `organization`                                                                                                                                              |
| unit_type      | CharField(30), choices | Yes      | No       | No                 | Institutional meaning — depth alone is never the sole classification                                                                                                      |
| status         | CharField(20), choices | No       | No       | No                 | Default `draft`                                                                                                                                                           |
| description    | TextField              | No       | No       | No                 | Blank-default                                                                                                                                                             |
| sort_order     | PositiveIntegerField   | No       | No       | No                 | Default `0` — sibling display order                                                                                                                                       |
| depth          | PositiveIntegerField   | No       | No       | No                 | Default `0` — denormalized from closure table depth-0-from-root for display; not the query mechanism                                                                      |
| path_cache     | CharField(1000)        | No       | No       | No                 | Blank-default. Materialized breadcrumb string of ancestor codes (e.g. `"moh/health-directorate/procurement-section"`), for display only — the closure table owns querying |
| is_operational | Boolean                | No       | No       | No                 | Default `True` — distinguishes a real operating unit from a placeholder/temporary one                                                                                     |
| is_active      | Boolean                | No       | No       | No                 | Default `True`                                                                                                                                                            |
| effective_from | DateTimeField          | No       | Yes      | No                 | —                                                                                                                                                                         |
| effective_to   | DateTimeField          | No       | Yes      | No                 | —                                                                                                                                                                         |
| metadata       | JSONField              | No       | No       | Yes (default `{}`) | —                                                                                                                                                                         |
| created_at     | DateTimeField          | —        | No       | Yes                | Auto                                                                                                                                                                      |
| updated_at     | DateTimeField          | —        | No       | Yes                | Auto                                                                                                                                                                      |

**Validation rules:** a unit cannot be its own parent or moved under its own descendant (`validate_no_unit_cycle`, a single closure-table existence check — see §3 below). `code` unique inside `organization`. Moving a unit (`move_unit()`) rebuilds closure rows and writes `OrganizationUnitHistory` + `OrganizationEventLog` in one `transaction.atomic()` block. Deactivating a unit never cascades — the service decides whether active children block deactivation (`ORGANIZATION_UNIT_HAS_ACTIVE_CHILDREN`).

**Indexes:** `organization`, `parent`, `(organization, code)` unique, `(organization, status)`, `(organization, unit_type)`, `(organization, parent, sort_order)`, `path_cache`.

**Example:**

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "organization": "11111111-1111-4111-8111-111111111111",
  "parent": null,
  "name": "Health Directorate",
  "code": "health-directorate",
  "unit_type": "department",
  "status": "active",
  "depth": 0,
  "path_cache": "moh/health-directorate",
  "is_operational": true,
  "is_active": true
}
```

---

## 3. OrganizationUnitClosure

**Purpose:** Closure table for O(1) ancestor/descendant/subtree/depth queries — avoids recursive Python traversal at scale. First use of this pattern in the codebase (existing hierarchies, e.g. `core.policy_engine.PermissionCategory`, use a plain adjacency list, insufficient at this app's stated scale of thousands of units per organization).

**Table:** `organization_organizationunitclosure`

| Field        | Type                                                      | Required | Nullable | Generated | Description                                                                                                             |
| ------------ | --------------------------------------------------------- | -------- | -------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| id           | UUID                                                      | —        | No       | Yes       | Primary key                                                                                                             |
| organization | FK → Organization                                         | Yes      | No       | No        | CASCADE. Denormalized from `ancestor.organization`/`descendant.organization` for fast org-scoped queries without a join |
| ancestor     | FK → OrganizationUnit (`related_name="descendant_links"`) | Yes      | No       | No        | CASCADE                                                                                                                 |
| descendant   | FK → OrganizationUnit (`related_name="ancestor_links"`)   | Yes      | No       | No        | CASCADE                                                                                                                 |
| depth        | PositiveIntegerField                                      | Yes      | No       | No        | `0` = self-link; `1` = direct parent-child; `N` = N hops                                                                |
| created_at   | DateTimeField                                             | —        | No       | Yes       | Auto                                                                                                                    |
| updated_at   | DateTimeField                                             | —        | No       | Yes       | Auto                                                                                                                    |

**Invariants:**

- Every unit has exactly one self-link row (`ancestor_id == descendant_id`, `depth=0`), created in `create_unit()`.
- If A is parent of B: closure contains `A→B` at `depth=1`. Transitively to depth N for any ancestor N hops up.
- Closure rows are written only by `services.py` — never directly in views or serializers.

**Rebuild algorithm for `move_unit(unit_id, new_parent_id)`** (plain ORM, 4 fixed-size queries, no raw SQL — the bar in CLAUDE.md §20 for a documented raw-SQL exception is not met here):

1. `descendant_ids = OrganizationUnitClosure.objects.filter(ancestor_id=unit_id).values_list("descendant_id", "depth")` — the moved subtree, including itself, with each member's depth _relative to the moved unit_ already known.
2. `OrganizationUnitClosure.objects.filter(descendant_id__in=[d for d, _ in descendant_ids]).exclude(ancestor_id__in=[d for d, _ in descendant_ids]).delete()` — removes every row representing an old ancestor-chain path _into_ the subtree; rows where both ancestor and descendant are inside the subtree are untouched (their relative relationship doesn't change on a re-parent).
3. `new_parent_ancestors = OrganizationUnitClosure.objects.filter(descendant_id=new_parent_id).values_list("ancestor_id", "depth")` — the new parent's own ancestor chain including itself (`depth=0` row); empty if `new_parent_id is None` (moving to root).
4. `bulk_create` the cross product: for each `(new_ancestor_id, new_ancestor_depth)` in step 3 and each `(subtree_member_id, relative_depth)` in step 1, insert a row with `depth = new_ancestor_depth + 1 + relative_depth`. (When moving to root, skip step 4 entirely — there are no ancestors above a root unit other than itself, which is already an unaffected internal subtree row.)

All 4 steps run inside one `transaction.atomic()` together with the `OrganizationUnit.parent` FK update, the `OrganizationUnitHistory` row, and the `OrganizationEventLog` row (§13 atomicity rule) — if the closure rewrite fails after the parent FK is updated, the read-tree (closure) and write-tree (adjacency list) would permanently diverge, which is the one failure mode this table exists to prevent.

A full rebuild from `OrganizationUnit.parent` (disaster recovery / data-import correction) is available via `rebuild_unit_closure()` / the `rebuild_organization_closure` management command.

**Constraints:** `UniqueConstraint(fields=["organization", "ancestor", "descendant"])`; `CheckConstraint(condition=Q(depth__gte=0))`.

**Indexes:** `(organization, ancestor)`, `(organization, descendant)`, `(organization, ancestor, depth)`, `(organization, descendant, depth)`.

---

## 4. OrganizationUnitHistory

**Purpose:** Typed before/after attribute diff for unit-structural changes — distinct from `OrganizationEventLog`'s generic cross-model feed (§12). Every unit-structural service writes **both** in the same transaction.

**Table:** `organization_organizationunithistory`

| Field              | Type                            | Required | Nullable | Generated          | Description                                                     |
| ------------------ | ------------------------------- | -------- | -------- | ------------------ | --------------------------------------------------------------- |
| id                 | UUID                            | —        | No       | Yes                | Primary key                                                     |
| organization       | FK → Organization               | Yes      | No       | No                 | CASCADE                                                         |
| unit               | FK → OrganizationUnit           | Yes      | No       | No                 | CASCADE                                                         |
| change_type        | CharField(30)                   | Yes      | No       | No                 | e.g. `moved`, `renamed`, `status_changed`, `recoded`, `retyped` |
| previous_parent    | FK → OrganizationUnit           | No       | Yes      | No                 | `SET_NULL`                                                      |
| new_parent         | FK → OrganizationUnit           | No       | Yes      | No                 | `SET_NULL`                                                      |
| previous_name      | CharField(255)                  | No       | No       | No                 | Blank-default                                                   |
| new_name           | CharField(255)                  | No       | No       | No                 | Blank-default                                                   |
| previous_code      | CharField(50)                   | No       | No       | No                 | Blank-default                                                   |
| new_code           | CharField(50)                   | No       | No       | No                 | Blank-default                                                   |
| previous_unit_type | CharField(30)                   | No       | No       | No                 | Blank-default                                                   |
| new_unit_type      | CharField(30)                   | No       | No       | No                 | Blank-default                                                   |
| previous_status    | CharField(20)                   | No       | No       | No                 | Blank-default                                                   |
| new_status         | CharField(20)                   | No       | No       | No                 | Blank-default                                                   |
| effective_at       | DateTimeField                   | Yes      | No       | No                 | —                                                               |
| reason             | TextField                       | No       | No       | No                 | Blank-default                                                   |
| changed_by         | FK → `settings.AUTH_USER_MODEL` | No       | Yes      | No                 | `SET_NULL`                                                      |
| metadata           | JSONField                       | No       | No       | Yes (default `{}`) | —                                                               |
| created_at         | DateTimeField                   | —        | No       | Yes                | Auto                                                            |
| updated_at         | DateTimeField                   | —        | No       | Yes                | Auto                                                            |

**Integrity rules:** append-friendly, not hard-immutable like `OrganizationEventLog` — corrective edits are an explicit admin-only maintenance path, never a normal service operation. Every row here must have a matching `OrganizationEventLog` row with the same `object_id` in the same transaction window (checked by `validate_organization_integrity`).

**Indexes:** `(organization, unit)`, `(organization, change_type)`, `(organization, effective_at)`, `changed_by`.

---

## 5. Position

**Purpose:** An institutional seat/office/role inside a unit — not an RBAC role and not a permission grant.

**Table:** `organization_position`

**`position_type` choices:** `executive`, `head`, `deputy_head`, `manager`, `supervisor`, `officer`, `assistant`, `specialist`, `analyst`, `auditor`, `reviewer`, `field_staff`, `system_actor`, `external_reviewer`, `temporary`, `other`
**`status` choices:** `draft`, `active`, `inactive`, `abolished`, `archived`

| Field              | Type                   | Required | Nullable | Generated          | Description                                                                                                                                       |
| ------------------ | ---------------------- | -------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                 | UUID                   | —        | No       | Yes                | Primary key                                                                                                                                       |
| organization       | FK → Organization      | Yes      | No       | No                 | CASCADE. Denormalized from `unit.organization` for direct org-scoped queries                                                                      |
| unit               | FK → OrganizationUnit  | Yes      | No       | No                 | CASCADE                                                                                                                                           |
| title              | CharField(255)         | Yes      | No       | No                 | —                                                                                                                                                 |
| code               | CharField(50)          | Yes      | No       | No                 | Unique within `organization`                                                                                                                      |
| position_type      | CharField(30), choices | Yes      | No       | No                 | —                                                                                                                                                 |
| status             | CharField(20), choices | No       | No       | No                 | Default `draft`                                                                                                                                   |
| description        | TextField              | No       | No       | No                 | Blank-default                                                                                                                                     |
| is_leadership      | Boolean                | No       | No       | No                 | Default `False`. **Structural classification flag** — "this kind of seat is, by institutional design, a leadership position," not a computed fact |
| is_supervisory     | Boolean                | No       | No       | No                 | Default `False`. Same: classification, not "currently has direct reports" — that's `get_reporting_subordinate_positions(position_id).exists()`    |
| is_single_occupant | Boolean                | No       | No       | No                 | Default `True`                                                                                                                                    |
| max_occupants      | PositiveIntegerField   | No       | No       | No                 | Default `1`                                                                                                                                       |
| effective_from     | DateTimeField          | No       | Yes      | No                 | —                                                                                                                                                 |
| effective_to       | DateTimeField          | No       | Yes      | No                 | —                                                                                                                                                 |
| metadata           | JSONField              | No       | No       | Yes (default `{}`) | —                                                                                                                                                 |
| is_active          | Boolean                | No       | No       | No                 | Default `True`                                                                                                                                    |
| created_at         | DateTimeField          | —        | No       | Yes                | Auto                                                                                                                                              |
| updated_at         | DateTimeField          | —        | No       | Yes                | Auto                                                                                                                                              |

**Validation rules:** a position can exist without a current occupant; can be abolished without deleting historical assignments. Capacity (`max_occupants`) is enforced under `select_for_update()` inside `assign_position()`'s atomic block — a pure-read check followed by a later write is a check-then-act race under concurrent admin actions.

**Indexes:** `(organization, code)` unique, `(organization, unit)`, `(organization, status)`, `(organization, position_type)`, `(unit, is_leadership)`.

---

## 6. OrganizationMembership

**Purpose:** Links an authenticated actor to an `Organization` — "this user works for this institution," independent of any specific unit/position placement.

**Table:** `organization_organizationmembership`

**`membership_status` choices:** `invited`, `active`, `inactive`, `suspended`, `transferred`, `ended`, `archived`

| Field             | Type                            | Required | Nullable | Generated          | Description                                                                                |
| ----------------- | ------------------------------- | -------- | -------- | ------------------ | ------------------------------------------------------------------------------------------ |
| id                | UUID                            | —        | No       | Yes                | Primary key                                                                                |
| organization      | FK → Organization               | Yes      | No       | No                 | CASCADE                                                                                    |
| user              | FK → `settings.AUTH_USER_MODEL` | Yes      | No       | No                 | CASCADE. Never imports `authenticate`'s `User` class directly — see Cross-App Dependencies |
| employee_code     | CharField(50)                   | No       | No       | No                 | Blank-default                                                                              |
| membership_status | CharField(20), choices          | No       | No       | No                 | Default `invited`                                                                          |
| joined_at         | DateTimeField                   | No       | Yes      | No                 | —                                                                                          |
| ended_at          | DateTimeField                   | No       | Yes      | No                 | —                                                                                          |
| is_primary        | Boolean                         | No       | No       | No                 | Default `False`                                                                            |
| metadata          | JSONField                       | No       | No       | Yes (default `{}`) | —                                                                                          |
| created_at        | DateTimeField                   | —        | No       | Yes                | Auto                                                                                       |
| updated_at        | DateTimeField                   | —        | No       | Yes                | Auto                                                                                       |

**Constraint (revised from the draft — see "Deliberate deviations"):**

```python
models.UniqueConstraint(
    fields=["organization", "user"],
    condition=models.Q(ended_at__isnull=True),
    name="uniq_active_org_membership_per_user",
)
```

Allows unlimited historical (ended) rows per `(organization, user)` while guaranteeing at most one active row — confirmed supported on Django 5.1.9 + PostgreSQL (checked `requirements/base.txt` directly), zero new dependency.

**Indexes:** `(organization, user)`, `(user, membership_status)`, `(organization, membership_status)`, `employee_code`.

**Cross-app boundary note:** `user` references `settings.AUTH_USER_MODEL` (`authenticate.User`) by string only — this app never imports `authenticate.models.User` directly. This dependency must also be reflected in `authenticate/docs/DATA_CONTRACT.md`'s cross-app section per CLAUDE.md §4 (already anticipated there: _"authenticate.User is the FK target every future app (organization, permissions, events, audit) will reference for actor identity"_).

---

## 7. UnitMembership

**Purpose:** An actor's membership inside a specific `OrganizationUnit` — separate from `PositionAssignment` because a person may belong to a unit without holding a formal position (e.g. a new hire awaiting placement).

**Table:** `organization_unitmembership`

| Field           | Type                        | Required | Nullable | Generated          | Description                                            |
| --------------- | --------------------------- | -------- | -------- | ------------------ | ------------------------------------------------------ |
| id              | UUID                        | —        | No       | Yes                | Primary key                                            |
| organization    | FK → Organization           | Yes      | No       | No                 | CASCADE. Denormalized for org-scoped queries           |
| membership      | FK → OrganizationMembership | Yes      | No       | No                 | CASCADE                                                |
| unit            | FK → OrganizationUnit       | Yes      | No       | No                 | CASCADE                                                |
| membership_type | CharField(30)               | No       | No       | No                 | Blank-default; free-form (e.g. "secondment", "matrix") |
| status          | CharField(20), choices      | No       | No       | No                 | Default `active`. Reuses `MembershipStatus`            |
| is_primary      | Boolean                     | No       | No       | No                 | Default `False`                                        |
| valid_from      | DateTimeField               | No       | Yes      | No                 | —                                                      |
| valid_to        | DateTimeField               | No       | Yes      | No                 | —                                                      |
| reason          | TextField                   | No       | No       | No                 | Blank-default                                          |
| metadata        | JSONField                   | No       | No       | Yes (default `{}`) | —                                                      |
| created_at      | DateTimeField               | —        | No       | Yes                | Auto                                                   |
| updated_at      | DateTimeField               | —        | No       | Yes                | Auto                                                   |

**Constraint:** `UniqueConstraint(fields=["membership"], condition=Q(is_primary=True, status="active"), name="uniq_active_primary_unit_membership")` — at most one active primary unit membership per `OrganizationMembership`; secondary/matrix memberships are unrestricted.

**Indexes:** `(organization, membership)`, `(organization, unit)`, `(membership, status)`, `(unit, status)`, `valid_from`, `valid_to`.

---

## 8. PositionAssignment

**Purpose:** The bridge between identity and institutional authority — an actor occupying a position for a time period.

**Table:** `organization_positionassignment`

**`assignment_type` choices:** `primary`, `secondary`, `acting`, `temporary`, `delegated`, `observer`, `external`, `system`
**`status` choices:** `planned`, `active`, `paused`, `ended`, `revoked`, `archived`

| Field           | Type                            | Required | Nullable | Generated          | Description           |
| --------------- | ------------------------------- | -------- | -------- | ------------------ | --------------------- |
| id              | UUID                            | —        | No       | Yes                | Primary key           |
| organization    | FK → Organization               | Yes      | No       | No                 | CASCADE. Denormalized |
| membership      | FK → OrganizationMembership     | Yes      | No       | No                 | CASCADE               |
| position        | FK → Position                   | Yes      | No       | No                 | CASCADE               |
| assignment_type | CharField(20), choices          | Yes      | No       | No                 | —                     |
| status          | CharField(20), choices          | No       | No       | No                 | Default `planned`     |
| starts_at       | DateTimeField                   | No       | Yes      | No                 | —                     |
| ends_at         | DateTimeField                   | No       | Yes      | No                 | —                     |
| assigned_by     | FK → `settings.AUTH_USER_MODEL` | No       | Yes      | No                 | `SET_NULL`            |
| ended_by        | FK → `settings.AUTH_USER_MODEL` | No       | Yes      | No                 | `SET_NULL`            |
| reason          | TextField                       | No       | No       | No                 | Blank-default         |
| end_reason      | TextField                       | No       | No       | No                 | Blank-default         |
| is_primary      | Boolean                         | No       | No       | No                 | Default `False`       |
| metadata        | JSONField                       | No       | No       | Yes (default `{}`) | —                     |
| created_at      | DateTimeField                   | —        | No       | Yes                | Auto                  |
| updated_at      | DateTimeField                   | —        | No       | Yes                | Auto                  |

**Constraint:** `UniqueConstraint(fields=["membership"], condition=Q(is_primary=True, status="active"), name="uniq_active_primary_assignment")`.

**Validation/concurrency rule:** `assign_position()` must `select_for_update()` the `Position` row inside its `transaction.atomic()` block before re-validating `max_occupants` and the primary-assignment uniqueness above — see Position §5 and the closure-rebuild atomicity note in §3. The partial-unique constraint is the hard DB-level backstop; the lock prevents two concurrent requests from both passing the pre-write check.

**Indexes:** `(organization, membership)`, `(organization, position)`, `(membership, status)`, `(position, status)`, `starts_at`, `ends_at`, `assignment_type`.

---

## 9. ReportingLine

**Purpose:** Position-to-position authority/reporting structure — never user-to-user.

**Table:** `organization_reportingline`

**`reporting_line_type` choices:** `administrative`, `functional`, `disciplinary`, `technical`, `project`, `case_specific`, `temporary`, `matrix`, `other`
**`status` choices:** reuses `AssignmentStatus` (`planned`, `active`, `paused`, `ended`, `revoked`, `archived`)

| Field               | Type                                                      | Required | Nullable | Generated          | Description                               |
| ------------------- | --------------------------------------------------------- | -------- | -------- | ------------------ | ----------------------------------------- |
| id                  | UUID                                                      | —        | No       | Yes                | Primary key                               |
| organization        | FK → Organization                                         | Yes      | No       | No                 | CASCADE. Denormalized                     |
| source_position     | FK → Position (`related_name="outgoing_reporting_lines"`) | Yes      | No       | No                 | CASCADE. **Reports to** `target_position` |
| target_position     | FK → Position (`related_name="incoming_reporting_lines"`) | Yes      | No       | No                 | CASCADE                                   |
| reporting_line_type | CharField(20), choices                                    | Yes      | No       | No                 | —                                         |
| status              | CharField(20), choices                                    | No       | No       | No                 | Default `planned`                         |
| valid_from          | DateTimeField                                             | No       | Yes      | No                 | —                                         |
| valid_to            | DateTimeField                                             | No       | Yes      | No                 | —                                         |
| is_primary          | Boolean                                                   | No       | No       | No                 | Default `True`                            |
| reason              | TextField                                                 | No       | No       | No                 | Blank-default                             |
| metadata            | JSONField                                                 | No       | No       | Yes (default `{}`) | —                                         |
| created_at          | DateTimeField                                             | —        | No       | Yes                | Auto                                      |
| updated_at          | DateTimeField                                             | —        | No       | Yes                | Auto                                      |

**Validation rules:** both positions must belong to the same organization (`validate_same_organization`); a position cannot report to itself. **Cycle-freedom is checked per `reporting_line_type`, independently** — an `administrative` cycle and a `functional` cycle are evaluated separately, by design (matrix organizations can legitimately have what looks like a cycle when two types are overlaid). No closure table exists for this graph — the matrix/multi-type design means it is not a single tree, so a closure table would force a false single-parent assumption; cycle detection uses a bounded BFS scoped to one `reporting_line_type` at a time (`validate_reporting_line_no_cycle`), bounded by the size of that type's active subgraph.

**Constraint:** `UniqueConstraint(fields=["source_position"], condition=Q(is_primary=True, status="active", reporting_line_type="administrative"), name="uniq_active_primary_admin_reporting_line")`.

**Indexes:** `(organization, source_position)`, `(organization, target_position)`, `(organization, reporting_line_type)`, `(source_position, status)`, `valid_from`, `valid_to`.

---

## 10. AuthorityDelegation

**Purpose:** Records temporary organizational delegation. Does not itself grant permissions — it records organizational reality the future `permissions` app interprets.

**Table:** `organization_authoritydelegation`

**`delegation_type` choices:** `acting_authority`, `temporary_supervision`, `case_supervision`, `approval_substitution`, `workload_transfer`, `emergency`, `other`
**`status` choices:** `planned`, `active`, `expired`, `revoked`, `cancelled`, `archived`

| Field             | Type                                                            | Required | Nullable | Generated          | Description                                        |
| ----------------- | --------------------------------------------------------------- | -------- | -------- | ------------------ | -------------------------------------------------- |
| id                | UUID                                                            | —        | No       | Yes                | Primary key                                        |
| organization      | FK → Organization                                               | Yes      | No       | No                 | CASCADE. Denormalized                              |
| from_assignment   | FK → PositionAssignment (`related_name="delegations_given"`)    | Yes      | No       | No                 | CASCADE                                            |
| to_assignment     | FK → PositionAssignment (`related_name="delegations_received"`) | Yes      | No       | No                 | CASCADE                                            |
| delegation_type   | CharField(30), choices                                          | Yes      | No       | No                 | —                                                  |
| status            | CharField(20), choices                                          | No       | No       | No                 | Default `planned`                                  |
| scope_unit        | FK → OrganizationUnit                                           | No       | Yes      | No                 | `SET_NULL`. Narrows delegation to one unit's scope |
| starts_at         | DateTimeField                                                   | Yes      | No       | No                 | —                                                  |
| ends_at           | DateTimeField                                                   | No       | Yes      | No                 | —                                                  |
| reason            | TextField                                                       | Yes      | No       | No                 | —                                                  |
| approved_by       | FK → `settings.AUTH_USER_MODEL`                                 | No       | Yes      | No                 | `SET_NULL`                                         |
| revoked_by        | FK → `settings.AUTH_USER_MODEL`                                 | No       | Yes      | No                 | `SET_NULL`                                         |
| revoked_at        | DateTimeField                                                   | No       | Yes      | No                 | —                                                  |
| revocation_reason | TextField                                                       | No       | No       | No                 | Blank-default                                      |
| metadata          | JSONField                                                       | No       | No       | Yes (default `{}`) | —                                                  |
| created_at        | DateTimeField                                                   | —        | No       | Yes                | Auto                                               |
| updated_at        | DateTimeField                                                   | —        | No       | Yes                | Auto                                               |

**Validation rules:** time-bounded unless explicitly emergency/indefinite by service rule (`validate_delegation_time_window`); cannot be from and to the same assignment; does not assign RBAC roles or create policy grants.

**Indexes:** `(organization, from_assignment)`, `(organization, to_assignment)`, `(organization, status)`, `starts_at`, `ends_at`, `scope_unit`.

---

## 11. OrganizationSite

**Purpose:** A physical or logical office/branch/site — independent of `OrganizationUnit` (a building can host multiple units; a unit's staff can span multiple sites).

**Table:** `organization_organizationsite`

| Field          | Type              | Required | Nullable | Generated          | Description                                                    |
| -------------- | ----------------- | -------- | -------- | ------------------ | -------------------------------------------------------------- |
| id             | UUID              | —        | No       | Yes                | Primary key                                                    |
| organization   | FK → Organization | Yes      | No       | No                 | CASCADE                                                        |
| name           | CharField(255)    | Yes      | No       | No                 | —                                                              |
| code           | CharField(50)     | Yes      | No       | No                 | Unique within `organization`                                   |
| site_type      | CharField(30)     | No       | No       | No                 | Blank-default; free-form (e.g. "headquarters", "field_office") |
| address_line_1 | CharField(255)    | No       | No       | No                 | Blank-default                                                  |
| address_line_2 | CharField(255)    | No       | No       | No                 | Blank-default                                                  |
| city           | CharField(100)    | No       | No       | No                 | Blank-default                                                  |
| province_state | CharField(100)    | No       | No       | No                 | Blank-default                                                  |
| district       | CharField(100)    | No       | No       | No                 | Blank-default                                                  |
| country_code   | CharField(2)      | No       | No       | No                 | Blank-default                                                  |
| postal_code    | CharField(20)     | No       | No       | No                 | Blank-default                                                  |
| latitude       | DecimalField(9,6) | No       | Yes      | No                 | Plain decimal — no PostGIS configured in this project          |
| longitude      | DecimalField(9,6) | No       | Yes      | No                 | Plain decimal — no PostGIS configured in this project          |
| is_active      | Boolean           | No       | No       | No                 | Default `True`                                                 |
| metadata       | JSONField         | No       | No       | Yes (default `{}`) | —                                                              |
| created_at     | DateTimeField     | —        | No       | Yes                | Auto                                                           |
| updated_at     | DateTimeField     | —        | No       | Yes                | Auto                                                           |

**Indexes:** `(organization, code)` unique, `(organization, is_active)`, `country_code`, `province_state`, `district`.

---

## 12. OrganizationEventLog

**Purpose:** Append-only domain event feed for organization-app changes — generic and cross-model, complementing `OrganizationUnitHistory`'s typed unit-specific diff (§4). Interim stand-in for the future global event-ledger app (per `.docs/mintflow_initial_architecture.md` §17: _"Final audit should be built on top of events... the event ledger is the raw history"_) — when that app exists, this model should mirror or emit into it rather than be replaced outright.

**Table:** `organization_organizationeventlog`

**`event_type` choices:** `organization_created`, `organization_updated`, `organization_status_changed`, `unit_created`, `unit_updated`, `unit_moved`, `unit_renamed`, `unit_deactivated`, `unit_reactivated`, `position_created`, `position_updated`, `position_deactivated`, `membership_created`, `membership_status_changed`, `unit_membership_created`, `unit_membership_ended`, `position_assigned`, `position_assignment_ended`, `reporting_line_created`, `reporting_line_ended`, `delegation_created`, `delegation_revoked`, `site_created`, `site_assigned`, `integrity_rebuilt`, `metadata_updated`

| Field             | Type                            | Required | Nullable | Generated          | Description                                                                                                                                                                                                                                                                                         |
| ----------------- | ------------------------------- | -------- | -------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                | UUID                            | —        | No       | Yes                | Primary key                                                                                                                                                                                                                                                                                         |
| organization      | FK → Organization               | No       | Yes      | No                 | `SET_NULL`                                                                                                                                                                                                                                                                                          |
| actor             | FK → `settings.AUTH_USER_MODEL` | No       | Yes      | No                 | `SET_NULL`                                                                                                                                                                                                                                                                                          |
| event_type        | CharField(40), choices          | Yes      | No       | No                 | —                                                                                                                                                                                                                                                                                                   |
| object_type       | CharField(50)                   | Yes      | No       | No                 | e.g. `"organization_unit"`, `"position_assignment"`                                                                                                                                                                                                                                                 |
| object_id         | UUIDField                       | No       | Yes      | No                 | The affected row's id                                                                                                                                                                                                                                                                               |
| object_key        | CharField(255)                  | No       | No       | No                 | Blank-default; human-readable identifier (e.g. a unit code)                                                                                                                                                                                                                                         |
| summary           | CharField(500)                  | Yes      | No       | No                 | —                                                                                                                                                                                                                                                                                                   |
| detail            | TextField                       | No       | No       | No                 | Blank-default                                                                                                                                                                                                                                                                                       |
| reason            | TextField                       | No       | No       | No                 | **New field** (see "Deliberate deviations"). Threaded through from the originating service call's `reason` parameter                                                                                                                                                                                |
| acting_assignment | FK → PositionAssignment         | No       | Yes      | No                 | **New field** (see "Deliberate deviations"). `SET_NULL`, `related_name="+"`. Populated when the actor's authority for this action is meaningfully tied to a specific position/assignment; `null` when acting purely under platform staff access (e.g. initial org setup before any position exists) |
| previous_state    | JSONField                       | No       | No       | Yes (default `{}`) | —                                                                                                                                                                                                                                                                                                   |
| new_state         | JSONField                       | No       | No       | Yes (default `{}`) | —                                                                                                                                                                                                                                                                                                   |
| request_id        | CharField(64)                   | No       | No       | No                 | Blank-default; correlates to `core.middleware.RequestIDMiddleware`                                                                                                                                                                                                                                  |
| source            | CharField(50)                   | No       | No       | No                 | Blank-default; e.g. `"api"`, `"management_command"`, `"admin"`                                                                                                                                                                                                                                      |
| created_at        | DateTimeField                   | —        | No       | Yes                | Auto. **No `updated_at` — append-only**                                                                                                                                                                                                                                                             |

**Integrity rules:** append-only via a local `AppendOnlyManager`/`AppendOnlyQuerySet` (blocks `.update()`/`.delete()` at the queryset level, plus an instance-level `save()` raising on `not self._state.adding` and a `delete()` that always raises) — implemented independently of `core.policy_engine.PolicyChangeLog`'s and `authenticate.AuthEvent`'s own copies of the identical mechanism (see "Deliberate deviations" at the top of this document). Never stores passwords, tokens, secrets, OTPs, or private keys. Every `OrganizationUnitHistory` row must have a matching event-log row with the same `object_id` in the same transaction window (checked by `validate_organization_integrity`).

**Indexes:** `(organization, event_type)`, `(organization, object_type, object_id)`, `actor`, `created_at`, `request_id`.

**Example:**

```json
{
  "id": "99999999-9999-4999-8999-999999999999",
  "organization": "11111111-1111-4111-8111-111111111111",
  "actor": "9c4e3b7a-1f2d-4a6e-8b3c-7d5f1a2b3c4d",
  "event_type": "unit_moved",
  "object_type": "organization_unit",
  "object_id": "22222222-2222-4222-8222-222222222222",
  "object_key": "health-directorate",
  "summary": "Unit 'Health Directorate' moved to a new parent.",
  "detail": "",
  "reason": "Reorganization following the 2026 ministerial restructuring directive.",
  "acting_assignment": "33333333-3333-4333-8333-333333333333",
  "previous_state": { "parent": null },
  "new_state": { "parent": "44444444-4444-4444-8444-444444444444" },
  "request_id": "8f14e45f-ceea-4a3a-9e7b-1f2a3b4c5d6e",
  "source": "api",
  "created_at": "2026-06-23T10:00:00Z"
}
```

---

## 13. Actor context resolution payload (`resolve_actor_organization_context`)

**Resolution chain:** `User → OrganizationMembership → UnitMembership → PositionAssignment → Position → OrganizationUnit → ReportingLine → AuthorityDelegation`. This is the stable contract the future `permissions` app consumes (per `.docs/organization_prompt.md` §26) — selectors feeding it must not change shape without a version bump and a migration note here.

**Response shape (`GET /api/v1/organization/actor-context/`):**

```json
{
  "user_id": "9c4e3b7a-1f2d-4a6e-8b3c-7d5f1a2b3c4d",
  "organization": {
    "id": "11111111-...",
    "code": "moh",
    "name": "Ministry of Health"
  },
  "membership": { "id": "...", "status": "active", "is_primary": true },
  "unit_memberships": [
    {
      "id": "...",
      "unit": {
        "id": "...",
        "code": "health-directorate",
        "path_cache": "moh/health-directorate"
      },
      "is_primary": true,
      "status": "active"
    }
  ],
  "position_assignments": [
    {
      "id": "...",
      "position": {
        "id": "...",
        "code": "hd-officer-1",
        "title": "Health Officer"
      },
      "assignment_type": "primary",
      "status": "active",
      "is_primary": true
    }
  ],
  "reporting_chain": [
    {
      "position": { "id": "...", "code": "hd-officer-1" },
      "reports_to": { "id": "...", "code": "hd-head" },
      "reporting_line_type": "administrative"
    }
  ],
  "active_delegations_received": [],
  "resolved_at": "2026-06-23T10:00:00Z"
}
```

**Atomicity/atomicity rule (service-layer, applies across §2–§12):** any service writing a structural/domain row _and_ its `OrganizationEventLog`/`OrganizationUnitHistory` row wraps both in one `transaction.atomic()` — an unaudited structural change is exactly the traceability gap `.docs/mintflow_initial_architecture.md` §4 exists to prevent. Mirrors `authenticate.services`'s existing pattern of wrapping a write and its `AuthEvent` row together (e.g. `_issue_login()`).

---

## Cross-App Dependencies

`organization` references `settings.AUTH_USER_MODEL` (`authenticate.User`) by string only on `OrganizationMembership.user`, `OrganizationUnitHistory.changed_by`, `PositionAssignment.assigned_by`/`ended_by`, `AuthorityDelegation.approved_by`/`revoked_by`, and `OrganizationEventLog.actor` — never importing `authenticate.models.User` directly. It registers all endpoints with `core.policy_engine` through that app's existing public mechanism (`registry.py` + `sync_policy_registry`); `core.policy_engine`'s own source code and models are never modified by this app. The future `permissions`, `work`, `cases`, and event-ledger apps will depend on `organization` per `.docs/organization_prompt.md` §26 — those apps' own `DATA_CONTRACT.md` files must declare the dependency explicitly per CLAUDE.md §4 when they are built.

---

## Soft Delete

Not used. All 12 models use status-transition fields (`status`/`membership_status`/`is_active`/`ended_at`/`revoked_at`) for lifecycle states instead of a deletion flag. Hard delete exists only as an explicit, human-approved, non-silent admin-only management-command path per `.docs/organization_prompt.md` §25 — no service or view in this app performs a hard delete. `OrganizationEventLog` rows are never deleted (append-only); retention policy is not yet decided (flagged here as a future item, same posture as `authenticate.AuthEvent`).

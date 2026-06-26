# MintFlow Organization App — Requirements

**Document status:** Implementation requirement (supersedes the Downloads draft this was derived from)
**Owner app:** `organization`
**Project:** MintFlow
**Version:** 1.0.0
**Target stack:** Django + Django REST Framework + PostgreSQL + JWT + Core Policy Engine
**Implementation scope:** Major schema change — new Django app, new models, migrations, services, selectors, serializers, APIs, admin, management commands, tests, docs, policy metadata.

This document was produced by reviewing a 2,062-line draft against the actual `authenticate` and `core.policy_engine` implementations and against `.docs/mintflow_initial_architecture.md`, then revising two structural points before any code was written. See §3 and §10.12 for what changed and why.

---

## 1. Purpose

The `organization` app is the source of truth for organizational structure: institutions, internal unit hierarchy, positions, actor placement, reporting chains, delegation records, and structural history. It must let the platform answer:

```text
Which organization does this actor belong to?
Which unit does this actor work under?
Which position does this actor currently occupy?
Which position did this actor occupy at a previous date?
Who does this actor report to? Who reports to this actor?
Which unit owns this position? Which positions exist inside this unit?
What was the structure of the organization at a specific point in time?
Which organizational scope should permissions, cases, work, audit, and evaluation use?
```

Per `.docs/mintflow_initial_architecture.md` §18, organization answers _"Where does the user belong? What position do they hold? What authority chain applies?"_ — it is the second of four governance-foundation modules (policy engine → authenticate → **organization** → permissions, §10.1), and is module #3 in the recommended build order (§9).

---

## 2. Architectural Position

```text
1. core.policy_engine  → action universe and permission metadata.
2. authenticate        → identity, login, credentials, JWT, actor activation.
3. organization        → organization structure, positions, membership, reporting context.
4. permissions         → later resolves final authority using identity + policy + organization + context.
```

The `organization` app is never a permissions app. It provides structural and contextual truth only.

---

## 3. Core Design Decision (revised from the original draft)

**Position-centric authority**, not user-to-user:

```text
Bad:     User A is parent of User B.
Correct: User A occupies Position X. User B occupies Position Y. Position Y reports to Position X.
```

**Organization is flat; OrganizationUnit carries all structural depth.** The original draft let `Organization` nest via `parent_organization` "for complex ministry/agency structures." That conflicts with the rule that `ReportingLine` only connects positions _within the same organization_ (§10.9) — nested organizations would have no way to express an Agency Director reporting to a Ministry position, which is exactly the authority chain this app exists to capture. It also duplicated meaning between `OrganizationType` and `UnitType`.

Resolution: `Organization` is one row per real, independently-staffed institutional entity. _All_ internal depth — including what colloquially reads as "ministry → agency → department → division" — lives inside that Organization's `OrganizationUnit` tree (unlimited depth via a closure table), with `unit_type` carrying institutional meaning, per §10.2's own existing rule: _"unit_type gives institutional meaning; hierarchy level alone must not be the only classification."_ This matches `.docs/mintflow_initial_architecture.md` §22's scaling language ("many organizations... many departments") better than deep `Organization` nesting, and makes the same-organization reporting-line rule actually sufficient.

`parent_organization` is kept as a field but is **non-authoritative**: a grouping/label only, for a possible future cross-entity dashboard rollup. No selector, validator, or service may treat shared `parent_organization` as conferring shared staff, shared reporting eligibility, or shared visibility. "Same organization" always means exactly equal `organization_id`, never inherited through the parent link.

---

## 4. Non-Negotiable Principles

1. Position-centric authority — reporting hierarchy is between positions, never directly between users.
2. Temporal truth — every membership, assignment, reporting line, and delegation has effective dates.
3. Historical preservation — no hard deletes for domain data; status transitions only.
4. No permission decisions — this app stores structure only.
5. No password or login logic — that remains in `authenticate`.
6. No Django default permission dependency — policy metadata goes through `core.policy_engine`.
7. Strict source ownership — organization owns structure; permissions owns grants; policy engine owns action metadata; authenticate owns identity.
8. Scale-ready hierarchy — unit trees and reporting chains support fast subtree/ancestor/descendant/chain-of-command queries.
9. Audit-friendly by design — important changes are recorded through append-only event/history records, **including reason and acting authority** (§10.12).
10. Data contract first — `organization/docs/DATA_CONTRACT.md` exists before model code.

---

## 5. App Boundary

### 5.1 Owns

```text
Organization records; OrganizationUnit hierarchy; unit type/classification metadata; Position
definitions; actor-to-organization membership; actor-to-unit membership; actor-to-position
assignment; position-to-position reporting lines; temporary acting assignments; delegation
records; organization sites/offices; structure history and append-only event records; structure
validation/integrity commands; organization context selectors for the future permissions app.
```

### 5.2 Does not own

```text
Passwords; login; JWT issuance/refresh/revocation; user credential lifecycle; RBAC/ABAC/HBAC
roles; permission grants/decisions; work assignment logic; case ownership logic; final audit
interpretation; the final global event ledger.
```

---

## 6. Dependency Boundary

**Allowed dependency on `authenticate`**: reference the user model only via `settings.AUTH_USER_MODEL`. Never import `authenticate`'s internal services, selectors, serializers, or model classes directly without documenting the dependency in both apps' `DATA_CONTRACT.md`.

**Required dependency on `core.policy_engine`**: every organization endpoint and permission-sensitive action is registered through the Core Policy Engine lifecycle via `organization/registry.py`'s `POLICY_ENDPOINTS`, synced with `python manage.py sync_policy_registry` and checked with `python manage.py validate_policy_engine --strict`.

---

## 7. Primary Model Set (12 models — unchanged count, two revised)

```text
Organization                 (parent_organization narrowed to non-authoritative, §3)
OrganizationUnit
OrganizationUnitClosure
OrganizationUnitHistory
Position
OrganizationMembership       (partial-unique "one active row" constraint, §10.6)
UnitMembership                (partial-unique "one active primary" constraint)
PositionAssignment           (partial-unique "one active primary" constraint + locking)
ReportingLine                 (partial-unique constraint + per-type cycle check)
AuthorityDelegation
OrganizationSite
OrganizationEventLog          (+ reason, + acting_assignment, §10.12)
```

Deferred (do not build without explicit approval): `OrganizationStructureSnapshot`, `OrganizationImportBatch`, `OrganizationExternalIdentifier`, `PositionTemplate`, `UnitTemplate`.

---

## 8. Model Requirements

All models inherit `core.BaseModel` (UUID pk, `created_at`, `updated_at`) except where an append-only manager is required (§10.12). Every model defines `__str__`. Enums live in `organization/constants.py` as `TextChoices` — no raw status strings.

---

## 9. Core Enums (`organization/constants.py`)

```text
OrganizationType: ministry, agency, department, enterprise, division, office, committee,
                   project_body, external_partner, system, other
OrganizationStatus: draft, active, inactive, suspended, archived
UnitType: root, department, division, branch, section, subsection, cell, team, committee,
          project_unit, field_office, regional_office, district_office, temporary_unit, other
UnitStatus: draft, active, inactive, merged, split, renamed, archived
PositionType: executive, head, deputy_head, manager, supervisor, officer, assistant,
               specialist, analyst, auditor, reviewer, field_staff, system_actor,
               external_reviewer, temporary, other
PositionStatus: draft, active, inactive, abolished, archived
MembershipStatus: invited, active, inactive, suspended, transferred, ended, archived
AssignmentType: primary, secondary, acting, temporary, delegated, observer, external, system
AssignmentStatus: planned, active, paused, ended, revoked, archived
ReportingLineType: administrative, functional, disciplinary, technical, project,
                     case_specific, temporary, matrix, other
DelegationType: acting_authority, temporary_supervision, case_supervision,
                  approval_substitution, workload_transfer, emergency, other
DelegationStatus: planned, active, expired, revoked, cancelled, archived
OrganizationEventType: organization_created, organization_updated, organization_status_changed,
  unit_created, unit_updated, unit_moved, unit_renamed, unit_deactivated, unit_reactivated,
  position_created, position_updated, position_deactivated, membership_created,
  membership_status_changed, unit_membership_created, unit_membership_ended, position_assigned,
  position_assignment_ended, reporting_line_created, reporting_line_ended, delegation_created,
  delegation_revoked, site_created, site_assigned, integrity_rebuilt, metadata_updated
```

---

## 10. Model Details

### 10.1 Organization

```text
id, name, code, organization_type, status, parent_organization (nullable, FK self,
non-authoritative label only — see §3), legal_name (blank), short_name (blank),
description (blank), country_code (blank), timezone (blank), metadata (JSON, default dict),
is_active, created_at, updated_at
```

Rules: `code` globally unique (no tenant strategy exists yet — confirmed by inspecting the codebase). Cannot be hard-deleted through public APIs. Inactive organizations remain queryable.

Indexes: `code`, `status`, `organization_type`, `parent_organization`, `is_active`.

### 10.2 OrganizationUnit

```text
id, organization (FK), parent (FK self, nullable), name, code, unit_type, status,
description (blank), sort_order (int, default 0), depth (int, default 0),
path_cache (CharField, blank — a materialized breadcrumb string of ancestor names/codes for
display only, e.g. "ministry-of-health/health-directorate/procurement-section"; the closure
table owns querying, this field exists purely so list/detail views can render a breadcrumb
without an extra join), is_operational (bool, default True), is_active (bool, default True),
effective_from (nullable), effective_to (nullable), metadata (JSON, default dict),
created_at, updated_at
```

Rules: root unit has `parent=null`. `unit_type` gives institutional meaning — hierarchy depth alone is never the sole classification (this is how "agency-equivalent" sub-bodies are modeled per §3, e.g. `unit_type=agency` is not in the enum deliberately — use `department`/`division`/`regional_office` etc. as the closest institutional fit, or `other` with a descriptive `name`). Unit code unique inside the organization. A unit cannot be its own parent or moved under its own descendant (single validator, §13). Moving a unit rebuilds closure rows and writes `OrganizationUnitHistory` + `OrganizationEventLog` atomically. Deactivating a unit never cascades to children/positions/memberships/assignments — the service decides whether active children block deactivation.

Indexes: `organization`, `parent`, `organization+code` (unique), `organization+status`, `organization+unit_type`, `organization+parent+sort_order`, `path_cache`.

### 10.3 OrganizationUnitClosure

```text
id, organization (FK), ancestor (FK OrganizationUnit, related_name="descendant_links"),
descendant (FK OrganizationUnit, related_name="ancestor_links"), depth (int), created_at, updated_at
```

Purpose: O(1) ancestor/descendant/subtree/depth queries without recursive Python traversal.

Rules: every unit has a self-link (`ancestor=descendant`, `depth=0`), created at `create_unit()` time. If A is parent of B, closure contains A→B at depth 1; transitively to depth N. Closure rows are maintained only by services. Rebuild algorithm for `move_unit()` (plain ORM, no raw SQL — see §13 atomicity/4 queries): capture the moved subtree via `OrganizationUnitClosure.objects.filter(ancestor_id=unit_id)`, delete cross-boundary rows (`descendant in subtree, ancestor not in subtree`), `bulk_create` the cross-product against the new parent's ancestor chain reusing the already-fetched relative depths. A management command rebuilds the whole table from `OrganizationUnit.parent` for disaster recovery.

Constraints: unique `(organization, ancestor, descendant)`; `CheckConstraint(depth__gte=0)`.

Indexes: `organization+ancestor`, `organization+descendant`, `organization+ancestor+depth`, `organization+descendant+depth`.

### 10.4 OrganizationUnitHistory

```text
id, organization (FK), unit (FK), change_type, previous_parent (nullable),
new_parent (nullable), previous_name (blank), new_name (blank), previous_code (blank),
new_code (blank), previous_unit_type (blank), new_unit_type (blank), previous_status (blank),
new_status (blank), effective_at, reason (blank), changed_by (FK AUTH_USER_MODEL, nullable),
metadata (JSON, default dict), created_at, updated_at
```

Rules: append-friendly (not hard-immutable like §10.12 — corrective edits are an explicit admin-only maintenance path, not a normal service operation). Every unit-structural change writes **both** this (typed before/after attribute diff) **and** an `OrganizationEventLog` row (generic cross-model feed) — see §13's atomicity rule.

Indexes: `organization+unit`, `organization+change_type`, `organization+effective_at`, `changed_by`.

### 10.5 Position

```text
id, organization (FK), unit (FK), title, code, position_type, status, description (blank),
is_leadership (bool, default False — a structural classification flag: "this kind of position
is, by institutional design, a leadership seat," not a computed fact), is_supervisory
(bool, default False — same: classification, not "currently has direct reports"; that fact is
the selector get_reporting_subordinate_positions(position_id).exists()), is_single_occupant
(bool, default True), max_occupants (positive int, default 1), effective_from (nullable),
effective_to (nullable), metadata (JSON, default dict), is_active (bool, default True),
created_at, updated_at
```

Rules: position belongs to a unit; code unique inside the organization; can exist without a current occupant; can be abolished without deleting historical assignments. Leadership/supervisory flags are structural metadata only — they grant no permissions.

Indexes: `organization+code` (unique), `organization+unit`, `organization+status`, `organization+position_type`, `unit+is_leadership`.

### 10.6 OrganizationMembership

```text
id, organization (FK), user (FK AUTH_USER_MODEL), employee_code (blank), membership_status,
joined_at (nullable), ended_at (nullable), is_primary (bool, default False),
metadata (JSON, default dict), created_at, updated_at
```

Rules: a user may have memberships in multiple organizations; membership without a current position assignment is valid; ended memberships remain for history.

**Constraint (revised from the draft):** the draft asked for both a hard `unique(organization, user)` _and_ the ability to leave and rejoin via `ended_at` — contradictory. Use a **partial unique constraint** instead:

```python
models.UniqueConstraint(
    fields=["organization", "user"],
    condition=models.Q(ended_at__isnull=True),
    name="uniq_active_org_membership_per_user",
)
```

This allows unlimited historical (ended) rows per organization+user while guaranteeing at most one _active_ row — confirmed supported on Django 5.1.9 + PostgreSQL, zero new dependency. The same pattern (one active row, not a hard unique-together) applies wherever §10.7-10.9 say "only one active X should exist."

Indexes: `organization+user`, `user+membership_status`, `organization+membership_status`, `employee_code`.

### 10.7 UnitMembership

```text
id, organization (FK), membership (FK OrganizationMembership), unit (FK), membership_type
(blank or enum), status, is_primary (bool, default False), valid_from (nullable),
valid_to (nullable), reason (blank), metadata (JSON, default dict), created_at, updated_at
```

Rules: a membership can belong to multiple units over time (matrix/project secondment). **Partial unique constraint**: at most one active primary unit membership per organization membership (`UniqueConstraint(fields=["membership"], condition=Q(is_primary=True, status="active"), name=...)`). Ending a unit membership does not end the organization membership.

Indexes: `organization+membership`, `organization+unit`, `membership+status`, `unit+status`, `valid_from`, `valid_to`.

### 10.8 PositionAssignment

```text
id, organization (FK), membership (FK OrganizationMembership), position (FK), assignment_type,
status, starts_at (nullable), ends_at (nullable), assigned_by (FK AUTH_USER_MODEL, nullable),
ended_by (FK AUTH_USER_MODEL, nullable), reason (blank), end_reason (blank), is_primary
(bool, default False), metadata (JSON, default dict), created_at, updated_at
```

Rules: the bridge between identity and institutional authority. Capacity (`Position.max_occupants`) and "one active primary per membership" are both **race-condition-prone check-then-act rules** — `assign_position()` must `select_for_update()` the `Position` row inside its `transaction.atomic()` block before re-validating capacity (a pure-read validator followed by a later write is not safe under concurrent admin actions); the partial-unique constraint on `is_primary` is the hard backstop. Assignment must stay inside the membership's organization (`validate_assignment_belongs_to_membership_organization`).

Indexes: `organization+membership`, `organization+position`, `membership+status`, `position+status`, `starts_at`, `ends_at`, `assignment_type`.

### 10.9 ReportingLine

```text
id, organization (FK), source_position (FK Position, related_name="outgoing_reporting_lines"),
target_position (FK Position, related_name="incoming_reporting_lines"), reporting_line_type,
status, valid_from (nullable), valid_to (nullable), is_primary (bool, default True),
reason (blank), metadata (JSON, default dict), created_at, updated_at
```

Interpretation: `source_position` reports to `target_position`.

Rules: both positions must be in the same organization (no closure table here — see §13's cycle-detection note: the matrix/multi-type design means this graph is not a single tree). Cycle-freedom is checked **per `reporting_line_type`** — an `administrative` cycle and a `functional` cycle are independently evaluated; this is deliberate, not an oversight, since matrix organizations can legitimately have what looks like a cycle when two types are overlaid. Partial unique constraint: at most one active primary administrative line per `source_position`.

Indexes: `organization+source_position`, `organization+target_position`, `organization+reporting_line_type`, `source_position+status`, `valid_from`, `valid_to`.

### 10.10 AuthorityDelegation

```text
id, organization (FK), from_assignment (FK PositionAssignment, related_name="delegations_given"),
to_assignment (FK PositionAssignment, related_name="delegations_received"), delegation_type,
status, scope_unit (FK OrganizationUnit, nullable), starts_at, ends_at (nullable), reason,
approved_by (FK AUTH_USER_MODEL, nullable), revoked_by (FK AUTH_USER_MODEL, nullable),
revoked_at (nullable), revocation_reason (blank), metadata (JSON, default dict),
created_at, updated_at
```

Rules: time-bounded unless explicitly emergency/indefinite by service rule. Cannot be from and to the same assignment. Does not assign RBAC roles or create policy grants — it records organizational reality the future `permissions` app interprets.

Indexes: `organization+from_assignment`, `organization+to_assignment`, `organization+status`, `starts_at`, `ends_at`, `scope_unit`.

### 10.11 OrganizationSite

```text
id, organization (FK), name, code, site_type (blank or enum), address_line_1 (blank),
address_line_2 (blank), city (blank), province_state (blank), district (blank),
country_code (blank), postal_code (blank), latitude (nullable decimal),
longitude (nullable decimal), is_active (bool, default True), metadata (JSON, default dict),
created_at, updated_at
```

Rules: no PostGIS requirement — not configured in this project (confirmed: no `django.contrib.gis` anywhere in `INSTALLED_APPS`). Sites are independent of `OrganizationUnit` — a building can host multiple units, and a unit's staff can span multiple sites; do not conflate `unit_type=field_office/regional_office/district_office` with `OrganizationSite` — the unit type is an institutional/functional classification, the site is a physical location.

Indexes: `organization+code` (unique), `organization+is_active`, `country_code`, `province_state`, `district`.

### 10.12 OrganizationEventLog (revised — two fields added)

```text
id, organization (FK, nullable), actor (FK AUTH_USER_MODEL, nullable), event_type, object_type,
object_id (UUID, nullable), object_key (blank), summary, detail (blank),
reason (TextField, blank — NEW), acting_assignment (FK PositionAssignment, nullable,
on_delete=SET_NULL, related_name="+" — NEW), previous_state (JSON, default dict),
new_state (JSON, default dict), request_id (blank), source (blank), created_at, updated_at
```

**Why the two new fields:** `.docs/mintflow_initial_architecture.md` §4 requires every important action be traceable by _actor, scope, action, time, reason, authority, source_. The draft's event log covered actor/scope/action/time/source but had no durable field for reason or authority, even though roughly half the §13 service functions already accept a `reason: str` parameter with nowhere to land it. `reason` closes the "why" gap directly; `acting_assignment` closes "under what authority" — nullable, since some actions (initial org setup by platform staff with no position yet) aren't taken "as" a specific position. Every service function that accepts `reason`/`actor` threads them into its `log_organization_event()` call.

Rules: append-only via a local `AppendOnlyManager`/`AppendOnlyQuerySet` (blocks `.update()`/`.delete()`, plus instance-level `save()`/`delete()` overrides) — implemented independently in this app, **not** shared with `core.policy_engine`'s or `authenticate`'s own copies of the same pattern (both already independently define it; this is the established, deliberate precedent in this codebase, documented as a "Deliberate deviation" rather than refactored away). Never stores passwords, tokens, secrets, OTPs, or private keys.

Indexes: `organization+event_type`, `organization+object_type+object_id`, `actor`, `created_at`, `request_id`.

---

## 11. Hierarchy Strategy

Unit hierarchy: `OrganizationUnit.parent` (adjacency list, simple writes) + `OrganizationUnitClosure` (closure table, fast reads). Reporting hierarchy: `ReportingLine.source_position → target_position` only — never a `user.parent_user` field. Actor context resolution chain: `User → OrganizationMembership → UnitMembership → PositionAssignment → Position → OrganizationUnit → ReportingLine → AuthorityDelegation`, exposed as a single stable selector for the future permissions app (§12, `resolve_actor_organization_context`).

---

## 12. Required Selectors (`organization/selectors.py`, read-only, type-hinted)

```python
def get_organization_by_id(organization_id: UUID) -> Organization | None: ...
def get_organization_by_code(code: str) -> Organization | None: ...
def get_active_organizations() -> QuerySet[Organization]: ...
def get_unit_by_id(unit_id: UUID) -> OrganizationUnit | None: ...
def get_unit_by_code(organization_id: UUID, code: str) -> OrganizationUnit | None: ...
def get_root_units(organization_id: UUID) -> QuerySet[OrganizationUnit]: ...
def get_child_units(unit_id: UUID) -> QuerySet[OrganizationUnit]: ...
def get_unit_ancestors(unit_id: UUID) -> QuerySet[OrganizationUnit]: ...
def get_unit_descendants(unit_id: UUID, include_self: bool = False) -> QuerySet[OrganizationUnit]: ...
def get_unit_tree(organization_id: UUID) -> list[dict]: ...
def get_position_by_id(position_id: UUID) -> Position | None: ...
def get_positions_for_unit(unit_id: UUID, include_inactive: bool = False) -> QuerySet[Position]: ...
def get_leadership_positions_for_unit(unit_id: UUID) -> QuerySet[Position]: ...
def get_membership(user_id: UUID, organization_id: UUID) -> OrganizationMembership | None: ...
def get_active_memberships_for_user(user_id: UUID) -> QuerySet[OrganizationMembership]: ...
def get_memberships_for_organization(organization_id: UUID) -> QuerySet[OrganizationMembership]: ...
def get_active_unit_memberships(membership_id: UUID) -> QuerySet[UnitMembership]: ...
def get_active_position_assignments(membership_id: UUID) -> QuerySet[PositionAssignment]: ...
def get_current_position_holders(position_id: UUID) -> QuerySet[PositionAssignment]: ...
def get_reporting_manager_positions(position_id: UUID) -> QuerySet[Position]: ...
def get_reporting_subordinate_positions(position_id: UUID) -> QuerySet[Position]: ...
def get_chain_of_command(position_id: UUID, reporting_type: str = "administrative") -> list[dict]: ...
def get_active_delegations_for_assignment(assignment_id: UUID) -> QuerySet[AuthorityDelegation]: ...
def resolve_actor_organization_context(
    user_id: UUID, organization_id: UUID | None = None, at_time: datetime | None = None
) -> dict: ...
```

Selectors never mutate state, always `select_related`/`prefetch_related` for FK traversals, and never recurse in Python for tree queries (the closure table replaces that).

---

## 13. Required Services (`organization/services.py`, write/business logic, type-hinted)

```python
def create_organization(validated_data: dict, actor: User | None = None) -> Organization: ...
def update_organization(organization_id: UUID, validated_data: dict, actor: User | None = None) -> Organization: ...
def change_organization_status(organization_id: UUID, status: str, actor: User | None = None, reason: str = "") -> Organization: ...
def create_unit(organization_id: UUID, validated_data: dict, actor: User | None = None) -> OrganizationUnit: ...
def update_unit(unit_id: UUID, validated_data: dict, actor: User | None = None) -> OrganizationUnit: ...
def move_unit(unit_id: UUID, new_parent_id: UUID | None, actor: User | None = None, reason: str = "") -> OrganizationUnit: ...
def deactivate_unit(unit_id: UUID, actor: User | None = None, reason: str = "") -> OrganizationUnit: ...
def rebuild_unit_closure(organization_id: UUID) -> dict: ...
def create_position(unit_id: UUID, validated_data: dict, actor: User | None = None) -> Position: ...
def update_position(position_id: UUID, validated_data: dict, actor: User | None = None) -> Position: ...
def deactivate_position(position_id: UUID, actor: User | None = None, reason: str = "") -> Position: ...
def create_organization_membership(organization_id: UUID, user_id: UUID, validated_data: dict, actor: User | None = None) -> OrganizationMembership: ...
def change_membership_status(membership_id: UUID, status: str, actor: User | None = None, reason: str = "") -> OrganizationMembership: ...
def create_unit_membership(membership_id: UUID, unit_id: UUID, validated_data: dict, actor: User | None = None) -> UnitMembership: ...
def end_unit_membership(unit_membership_id: UUID, actor: User | None = None, reason: str = "") -> UnitMembership: ...
def assign_position(membership_id: UUID, position_id: UUID, validated_data: dict, actor: User | None = None) -> PositionAssignment: ...
def end_position_assignment(assignment_id: UUID, actor: User | None = None, reason: str = "") -> PositionAssignment: ...
def transfer_position_assignment(assignment_id: UUID, new_position_id: UUID, actor: User | None = None, reason: str = "") -> PositionAssignment: ...
def create_reporting_line(source_position_id: UUID, target_position_id: UUID, validated_data: dict, actor: User | None = None) -> ReportingLine: ...
def end_reporting_line(reporting_line_id: UUID, actor: User | None = None, reason: str = "") -> ReportingLine: ...
def create_delegation(from_assignment_id: UUID, to_assignment_id: UUID, validated_data: dict, actor: User | None = None) -> AuthorityDelegation: ...
def revoke_delegation(delegation_id: UUID, actor: User | None = None, reason: str = "") -> AuthorityDelegation: ...
def create_site(organization_id: UUID, validated_data: dict, actor: User | None = None) -> OrganizationSite: ...
def log_organization_event(validated_data: dict) -> OrganizationEventLog: ...
```

**Atomicity rule:** any service writing a structural/domain row _and_ its `OrganizationEventLog`/`OrganizationUnitHistory` row wraps both in one `transaction.atomic()` — an unaudited structural change is exactly the gap §4's traceability model exists to prevent (mirrors `authenticate.services`'s existing pattern of wrapping a write and its `AuthEvent` row together).

**Cycle detection:**

- Units: single indexed existence check against the closure table — `new_parent_id == unit_id or OrganizationUnitClosure.objects.filter(ancestor_id=unit_id, descendant_id=new_parent_id).exists()`. O(1), no recursion.
- Reporting lines: bounded BFS scoped to one `reporting_line_type` at a time (no closure table — see §10.9).

**Closure maintenance on `move_unit()`:** see §10.3 — 4 fixed ORM queries, no raw SQL.

**Locking:** `assign_position()` and membership/unit-membership-creation services `select_for_update()` the relevant parent row before re-checking capacity/uniqueness inside their atomic block.

---

## 14. Validators (`organization/validators.py`)

```python
def validate_code_format(code: str) -> None: ...
def validate_date_range(starts_at: datetime | None, ends_at: datetime | None) -> None: ...
def validate_no_unit_cycle(unit_id: UUID, new_parent_id: UUID | None) -> None: ...
def validate_same_organization(*objects: object) -> None: ...
def validate_position_capacity(position_id: UUID, starts_at: datetime | None, ends_at: datetime | None) -> None: ...
def validate_reporting_line_no_cycle(source_position_id: UUID, target_position_id: UUID, reporting_type: str) -> None: ...
def validate_assignment_belongs_to_membership_organization(membership_id: UUID, position_id: UUID) -> None: ...
def validate_delegation_time_window(starts_at: datetime, ends_at: datetime | None) -> None: ...
```

(8 functions, not 9 — the draft's `validate_unit_not_descendant_of_itself` and `validate_no_unit_cycle` were the same check; self-parent is just the depth-0 case. Collapsed into one.)

---

## 15. API Requirements

Base path: `/api/v1/organization/`. Standard response envelope throughout. Interim access pattern until `permissions` exists: authenticated + staff-only (superuser bypass), via an inline `_require_staff()` helper local to this app's `views.py` — matching `authenticate`'s own pattern verbatim, deliberately duplicated per app rather than shared (the project's documented interim pattern, not a code smell). No public organization mutation endpoints.

Endpoint groups (URIs, methods, permission keys): organizations, units (incl. move/deactivate/ancestors/descendants/tree), positions (incl. deactivate/holders), memberships (incl. status change, user-memberships), unit-memberships (incl. end), position-assignments (incl. end/transfer), reporting-lines (incl. end/chain-of-command/subordinates), delegations (incl. revoke), actor-context (read), event-log (list). Full URI/method/permission-key table lives in `organization/docs/API.md` once views are finalized.

---

## 16. Serializer Requirements

Separate Read/Create/Update/action serializers per resource (no `fields = "__all__"`). Write serializers never expose generated/read-only fields as writable. Read serializers nest shallow related labels only — no expensive deep nesting by default.

---

## 17. Policy Engine Registration

`organization/registry.py` declares `POLICY_ENDPOINTS` in dependency order, mirroring `authenticate/registry.py`'s `_BASE`/`_requires()` pattern. Every entry includes `app_key`, `model_key`, `endpoint_key`, `permission_key` (`organization.<model>.<action>`, validated against `^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$`), `http_method`, `route_pattern`, `view_import_path`, `operation_type`, `display_name`, `description`, `risk_level`, `version`, `category_key`/`category_display_name`, `dependencies`. **High/critical-risk endpoints must declare real forward/backward dependencies at authoring time — `validate_policy_engine --strict` hard-fails on empty `dependencies: []` for those risk tiers; never defer this.**

Categories: `organization_management`, `organization_structure`, `position_management`, `membership_management`, `reporting_structure`, `delegation_management`, `organization_context`, `organization_audit`.

Risk levels: read/list = low/medium; create/update structure = high; move/deactivate-unit and create/revoke-delegation = critical; actor-context read = high; event-log list = medium/high.

After implementation: `python manage.py sync_policy_registry --by ai --identifier claude-sonnet` then `python manage.py validate_policy_engine --strict`.

---

## 18. Access Control Before the Permission App

No app-level `permissions.py`, no isolated custom permission system. Inline pattern only (verbatim from `authenticate/views.py`):

```python
from rest_framework.exceptions import NotAuthenticated, PermissionDenied

def _require_staff(request: Request) -> None:
    if not request.user.is_authenticated:
        raise NotAuthenticated("Authentication required.")
    if request.user.is_superuser:
        return
    if not request.user.is_staff:
        raise PermissionDenied("Staff access required.")
```

---

## 19. Admin Requirements

Register every primary model. `list_display`/`search_fields`/`list_filter`/`readonly_fields` for sensitive/computed/audit fields. `OrganizationEventLog` is read-only in admin (mirror `AuthEventAdmin`'s `has_add/change/delete_permission` overrides). `OrganizationUnitClosure` is read-only except for controlled maintenance.

---

## 20. Management Commands

```text
organization/management/commands/validate_organization_integrity.py
organization/management/commands/rebuild_organization_closure.py
```

**`validate_organization_integrity`** checks: no unit parent cycles; every unit has a closure self-link at depth 0; closure depths valid; every closure row matches its organization; no position/membership/reporting-line crosses organization boundary; no reporting-line self-cycle; no duplicate active primary administrative reporting line per source position unless allowed; no active assignment exceeds `Position.max_occupants`; no active delegation outside its assignment's validity window; **every `OrganizationUnitHistory` row has a matching `OrganizationEventLog` row with the same `object_id` in the same transaction window** (the draft's original "no missing event log for major structure changes where expected" was unimplementable as worded — this is the mechanically-checkable replacement).

**`rebuild_organization_closure`** rebuilds `OrganizationUnitClosure` from `OrganizationUnit.parent`. Flags: `--organization-code`, `--organization-id`, `--dry-run`, `--force`.

Both commands get a row in `requirements/README.md`'s "Management commands" table in the same commit they're created (CLAUDE.md §12) — neither joins the fresh-DB bootstrap sequence, since both operate on already-existing org data.

---

## 21. Documentation Requirements

```text
organization/docs/DATA_CONTRACT.md   — every model, enum, constraint, index+query it supports,
                                        service/selector input/output contract, actor-context
                                        response shape, event-log payload shape, "Deliberate
                                        deviations" section documenting §3/§10.12's changes
organization/docs/API.md             — every endpoint: URI, method, auth, throttle, request/
                                        response payload, error codes, business rules, query
                                        access pattern, policy permission key, change history
organization/docs/DEBUG_HISTORY.md   — created empty, populated on first bug fix
organization/docs/THIRD_PARTY_LIBRARIES.md — states no new dependency was added
```

---

## 22. Error Codes (`organization/constants.py`, `APP_RESOURCE_REASON`)

```text
ORGANIZATION_NOT_FOUND, ORGANIZATION_CODE_EXISTS, ORGANIZATION_INVALID_STATUS,
ORGANIZATION_UNIT_NOT_FOUND, ORGANIZATION_UNIT_CODE_EXISTS, ORGANIZATION_UNIT_INVALID_PARENT,
ORGANIZATION_UNIT_CYCLE_DETECTED, ORGANIZATION_UNIT_MOVE_INVALID,
ORGANIZATION_UNIT_HAS_ACTIVE_CHILDREN, ORGANIZATION_POSITION_NOT_FOUND,
ORGANIZATION_POSITION_CODE_EXISTS, ORGANIZATION_POSITION_INACTIVE,
ORGANIZATION_POSITION_CAPACITY_EXCEEDED, ORGANIZATION_MEMBERSHIP_NOT_FOUND,
ORGANIZATION_MEMBERSHIP_EXISTS, ORGANIZATION_MEMBERSHIP_INACTIVE,
ORGANIZATION_UNIT_MEMBERSHIP_NOT_FOUND, ORGANIZATION_ASSIGNMENT_NOT_FOUND,
ORGANIZATION_ASSIGNMENT_OVERLAP, ORGANIZATION_ASSIGNMENT_INVALID_DATES,
ORGANIZATION_REPORTING_LINE_NOT_FOUND, ORGANIZATION_REPORTING_LINE_CYCLE_DETECTED,
ORGANIZATION_REPORTING_LINE_INVALID, ORGANIZATION_DELEGATION_NOT_FOUND,
ORGANIZATION_DELEGATION_INVALID, ORGANIZATION_DELEGATION_EXPIRED,
ORGANIZATION_CROSS_ORGANIZATION_REFERENCE, ORGANIZATION_CONTEXT_NOT_FOUND,
ORGANIZATION_INTEGRITY_CHECK_FAILED, ORGANIZATION_ACCESS_DENIED
```

---

## 23. Testing Requirements

```text
organization/tests/test_models.py, test_validators.py, test_services_organization.py,
test_services_units.py, test_services_positions.py, test_services_memberships.py,
test_services_reporting.py, test_services_delegation.py, test_selectors.py,
test_api_organizations.py, test_api_units.py, test_api_positions.py, test_api_memberships.py,
test_api_reporting.py, test_api_delegation.py, test_management_commands.py,
test_policy_registry.py
```

Minimum coverage: organization create/update/status; unit create/update/move/deactivate + cycle prevention; closure creation and rebuild; position create/update/deactivate + capacity enforcement (incl. concurrent-assignment race); membership create/status change; unit membership create/end; position assignment create/end/transfer; reporting line create/end + cycle prevention (incl. legitimate cross-type non-cycle); delegation create/revoke; cross-organization reference rejection; actor context resolution; API auth/staff/validation/not-found failures; standard success/error envelopes; policy registry sync metadata; `validate_organization_integrity` success/failure; N+1 prevention for tree/context selectors.

Run: `pytest organization/tests/ -v`, `ruff check organization/`, `ruff format organization/`, `python manage.py validate_organization_integrity --dry-run`, `python manage.py validate_policy_engine --strict`.

---

## 24. Performance and Scaling

Closure table for unit hierarchy; indexes on every high-volume selector path; no recursive Python loops for trees; pagination on all list endpoints; bounded, explicit actor-context responses (never the whole org tree unless the endpoint is specifically the tree endpoint). No Redis/Valkey dependency in this implementation (not approved/needed); selectors are designed so a future permissions-app decision cache can consume actor context without redesign.

---

## 25. Data Retention and Delete Rules

No hard deletes through public APIs — status transitions only (`active → inactive/archived/ended/revoked`). Hard delete exists only as admin-only maintenance via an explicit, human-approved management command that documents data impact and never runs silently.

---

## 26. Future Integration Contracts

**Permissions app** will consume `resolve_actor_organization_context()`, `get_active_position_assignments()`, `get_chain_of_command()`, `get_active_delegations_for_assignment()`, `get_unit_ancestors()`, `get_unit_descendants()` — these selectors must stay stable and documented.

**Work app** will reference `organization_id`, `unit_id`, `position_id`, `assigned_user_id`, `assigned_position_assignment_id`.

**Case app** will reference `owning_organization_id`, `owning_unit_id`, `responsible_position_id`, `responsible_assignment_id`.

**Event ledger app**, when introduced, should have organization services emit global events in addition to (eventually instead of) the local `OrganizationEventLog`.

---

## 27. Files to Create

```text
organization/{__init__.py, apps.py, models.py, constants.py, validators.py, exceptions.py,
  selectors.py, services.py, serializers.py, views.py, urls.py, registry.py, admin.py}
organization/migrations/__init__.py
organization/management/__init__.py
organization/management/commands/{__init__.py, validate_organization_integrity.py,
  rebuild_organization_closure.py}
organization/tests/{__init__.py, <16 test modules per §23>}
organization/docs/{API.md, DATA_CONTRACT.md, DEBUG_HISTORY.md, THIRD_PARTY_LIBRARIES.md}
```

No `filters.py` — the draft listed it in the file tree but never specified any filtering need beyond plain selector kwargs; adding it would risk an undocumented `django-filter` dependency.

Modify: `backend/core/settings/base.py` (INSTALLED_APPS), `backend/core/api_urls.py` (include under `/api/v1/organization/`), `requirements/README.md` (management commands table).

---

## 28. Implementation Order

```text
1. Create branch from the actual latest work tip (this repo has no remote; main is stale —
   branch from the tip of the previous session's branch, per established project practice).
2. .docs/organization_prompt.md (this document) + .docs/organization_implementation_plan.txt.
3. organization/docs/DATA_CONTRACT.md.
4. constants.py, exceptions.py, apps.py.
5. models.py + initial migration (incl. partial-unique constraints).
6. validators.py, selectors.py, services.py.
7. serializers.py, views.py, urls.py.
8. admin.py.
9. registry.py + wire core/api_urls.py + run sync_policy_registry.
10. management commands + requirements/README.md row.
11. tests (16 modules).
12. API.md, THIRD_PARTY_LIBRARIES.md, finalize DATA_CONTRACT.md.
13. Run migrate, pytest, ruff check/format, sync_policy_registry, validate_policy_engine --strict,
    validate_organization_integrity --dry-run.
14. Completion report.
```

Branch name: `add_organization_app_YYYYMMDD_HHMM`.

---

## 29. Completion Criteria

All models exist with migrations; `DATA_CONTRACT.md` documents every model/enum/index/constraint/service/selector/payload including the §3/§10.12 deviations; all APIs use the standard envelope; all errors use documented codes; views are thin; write logic lives in `services.py`; read logic in `selectors.py`; all service/selector/serializer overrides are type-hinted; high-volume selectors use `select_related`/`prefetch_related`; closure table works and rebuilds correctly; cycle prevention works for units and reporting lines; position-assignment capacity is enforced under concurrency; cross-organization references are blocked; actor-context resolution works; `OrganizationEventLog` records major changes with reason + acting authority; admin registration exists; management commands exist and are in `requirements/README.md`; `POLICY_ENDPOINTS` exists, syncs, and every high/critical endpoint has real dependencies; `validate_policy_engine --strict` passes; `validate_organization_integrity` passes; tests pass; ruff passes; no unrelated files modified; no third-party dependency added.

---

## 30. Final Architecture Statement

The `organization` app is the structural truth layer of MintFlow. It models organizations, units, positions, memberships, assignments, reporting lines, delegations, history, and actor context — making future authority resolution possible without mixing authentication, organization, permissions, audit, and work concerns. The correct final flow: `authenticate` identifies the actor → `organization` resolves actor context → `policy_engine` identifies action metadata → `permissions` decides authority → `work`/`cases` consume the authorized context → events/audit preserve what happened. This is an enterprise foundation, not a CRUD module.

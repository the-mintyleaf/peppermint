# Hierarchy Resolution — Work

**Owner app:** `work`
**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-07-17

The dynamic authority-resolution contract for the `work` module. The work lifecycle is stable, but _who_ responds, reviews, sees, receives, and escalates is resolved at runtime from the effective organization structure — never hard-coded (INV-009, REQ §35 rules 2/3). Every hierarchy-driven action stores an immutable snapshot (`WorkHierarchyResolution`, `DATA_CONTRACT.md` §9) that later structure changes never rewrite (INV-010). Derived from REQ §6.

---

## Change History

| Version | Date       | Author              | Summary                                                                                                                                                             |
| ------- | ---------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-17 | AI (Claude Fable 5) | Initial resolver contract: precedence algorithm, unit-head convention, effective-time rule, snapshot schema, loop detection, exact organization selectors consumed. |

---

## 1. Resolver location and boundary

The resolver is a work-owned service module `work/hierarchy.py`. It **reads** the `organization` app through documented public selectors only (listed in §5) and **maintains no second organization tree** (REQ §24.2). It never imports organization models except for FK typing, never calls organization services (all reads), and never re-implements closure-table traversal in Python (REQ §30 — reuse `get_unit_ancestors`).

Public entrypoints (final names fixed in Phase 1):

- `resolve_target(action_type, *, organization_id, source_actor_id, source_unit_id, source_position_id=None, explicit_target_actor_id=None, effective_at, source_reference=None) -> WorkHierarchyResolution` — resolves and **persists** the snapshot inside the caller's transaction.
- `preview_resolution(...) -> HierarchyPreview` — same logic, **no persistence** (backs `GET /items/{id}/hierarchy-preview/`, `DATA_CONTRACT.md` Request/Response Contracts).

## 2. Precedence algorithm (REQ §6.2)

For any hierarchy-dependent target (reviewer, escalation recipient, response recipient, supervisor), resolve in this exact order and stop at the first eligible, active, authorized target:

1. **Explicit eligible target** — when the action allows explicit selection and the supplied actor is active + authorized in scope → `strategy=explicit_target`.
2. **Active reporting-line supervisor** — of the source actor's active `PositionAssignment.position`, via `get_chain_of_command(position_id, "administrative")` / `get_reporting_manager_positions(position_id)` → resolve the holder with `get_current_position_holders` → `strategy=reporting_line_supervisor`.
3. **Active head of the source actor's responsible unit** — see §3 unit-head convention → `strategy=unit_head`.
4. **Active head of the nearest ancestor unit** — walk `get_unit_ancestors(unit_id)` (root-first list, iterate nearest-first) applying §3 at each level → `strategy=ancestor_unit_head`.
5. **Continue upward** through ancestor units (same walk).
6. **Root-unit / organization head** → `strategy=root_head`.
7. **Delegation overlay** — if the resolved authority has an active eligible delegation for the action/scope, resolve the delegate instead → `strategy=delegated` (see §4).
8. **No eligible target** → do **not** guess; block the action with `WORK_HIERARCHY_TARGET_UNRESOLVED` and persist a snapshot with `strategy=unresolved` and null targets (REQ §6.2 step 8).

## 3. Unit-head convention

The `organization` app has **no unit→head FK and no dispatcher concept** (verified 2026-07-17). Work defines this deterministic convention to resolve "the head of unit U at time T":

1. Candidate positions = `get_leadership_positions_for_unit(U)` (filters `is_leadership=True, is_active=True`).
2. Prefer `position_type == "head"`; then `position_type == "deputy_head"`; then any remaining leadership position (`PositionType.HEAD`/`DEPUTY_HEAD` exist as `organization` choices).
3. For the chosen position, holder = first of `get_current_position_holders(position_id)` (already ordered `-is_primary`; among ties, earliest active assignment for determinism).
4. Holder must be an active, eligible actor (`authenticate.User.is_active`, acceptable `account_status`); if not, treat the position as unfilled and continue to the next candidate / ancestor level.
5. Zero eligible candidates at this unit → ascend (precedence step 4/5).

**Unit-targeted routing (REQ §6.7):** since no dispatcher position exists, a unit routing target resolves directly to the unit head, then nearest ancestor head — the "active dispatcher position" branch of REQ §6.7 is documented as _not applicable_ until `organization` introduces such a concept.

## 4. Delegation overlay (REQ §6.5)

After a base authority is resolved (steps 2–6), check `get_active_delegations_for_assignment(resolved_holder_assignment_id)`. The selector is bidirectional and active-only; the resolver filters to delegations where the resolved authority is the **delegator** (`from_assignment`), the `delegation_type` covers the action, and `scope_unit` (when set) matches the action's unit scope. An eligible delegation redirects the target to the delegate's actor and records `delegation_id` in the snapshot (`strategy=delegated`). Delegation begin/end affects only future actions — existing snapshots are never altered (REQ §6.5).

## 5. Exact organization selectors consumed

Read-only, verified present 2026-07-17 (do not invent others — REQ §35 rule 1):

| Selector                                                                                      | Use in resolver                                   |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `get_unit_ancestors(unit_id)`                                                                 | ancestor-head walk (root-first closure list)      |
| `get_unit_descendants(unit_id, include_self=False)`                                           | hierarchy-overview / unit-queue scope (Phase 5)   |
| `get_leadership_positions_for_unit(unit_id)`                                                  | unit-head candidate positions                     |
| `get_current_position_holders(position_id)`                                                   | resolve position → active holder                  |
| `get_chain_of_command(position_id, "administrative")`                                         | reporting-line supervisor chain                   |
| `get_reporting_manager_positions(position_id)`                                                | immediate reporting managers                      |
| `get_active_delegations_for_assignment(assignment_id)`                                        | delegation overlay                                |
| `resolve_actor_organization_context(user_id, organization_id, at_time)`                       | source actor's unit/position/membership context   |
| `get_unit_by_id` / `get_position_by_id`                                                       | snapshot enrichment                               |
| `get_membership(user_id, organization_id)` / `get_active_position_assignments(membership_id)` | eligibility + assignment id for delegation lookup |

**Known caveat (documented, not worked around):** `resolve_actor_organization_context`'s embedded reporting-chain and delegation lists are _not_ `at_time`-filtered, and the standalone chain/head/delegation selectors are currently-active-only. This is acceptable under REQ §6.3: **new actions resolve at the current transaction time**, and history is read back from the immutable snapshot, never re-resolved. If a future requirement needs true point-in-time re-resolution, new effective-at selectors belong in `organization` (which owns that data), added under its own session — not reimplemented in `work`.

## 6. Effective-time rule (REQ §6.3)

Every lookup takes an explicit `effective_at`. For a new action it is the current transaction time; for reconstructing history it is the timestamp stored in the snapshot. The resolver never uses today's hierarchy to explain a past action. `WorkHierarchyResolution.effective_at` is mandatory and immutable.

## 7. Snapshot schema

Every resolution persists `WorkHierarchyResolution` (`DATA_CONTRACT.md` §9) with: organization, action_type, source actor/unit/position, resolved target actor/unit/position, ordered `unit_ancestry_path`, ordered `authority_path`, `strategy`, `delegation_id` (when used), `effective_at`, `reason`, `source_reference`, `structure_version_snapshot`, `payload_schema_version`. The row is append-only — no service ever updates or deletes it (INV-010).

## 8. Hierarchy-change behavior (REQ §6.5)

| Situation                          | Behavior                                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit moves under new parent        | Past snapshots unchanged; future visibility/escalation uses new ancestry                                                                      |
| Unit head changes                  | Existing owner unchanged; future unit-head resolution uses new head                                                                           |
| Actor's supervisor changes         | Past review/routing records unchanged; future supervisor resolution uses new line                                                             |
| Owner changes unit, still eligible | Ownership unchanged (INV-012); visibility recomputed from current responsible unit + explicit participation                                   |
| Owner becomes ineligible           | Work flags `is_reassignment_required`; authorized hierarchy resolves replacement via `recover_ineligible_owner`; history retained (REQ §10.6) |
| Delegation begins/ends             | Future actions may/again-not resolve to delegate; historical targets unchanged                                                                |
| Head cannot be resolved            | Action blocked + surfaced to authorized admins (`WORK_HIERARCHY_TARGET_UNRESOLVED`); no silent fallback to arbitrary staff                    |

## 9. Routing loop detection (REQ §6.8)

Encoded in `route_work` / `respond_to_routing_request` (Phase 2) using `WorkRoutingRecord.loop_metadata` + `hop_number` (`DATA_CONTRACT.md` §8):

- store every routing hop;
- reject an identical immediate reverse route (A→B→A) unless an override reason + permission exist (`WORK_ROUTING_LOOP_DETECTED`);
- detect repeated units in the active route chain;
- after `WORK_MAX_ROUTING_HOPS` (config default 10, `work/constants.py`, overridable via `settings.WORK_MAX_ROUTING_HOPS`) escalate to the nearest common ancestor head (`WORK_ROUTING_HOP_LIMIT_EXCEEDED`);
- the hop limit is never hard-coded in views (REQ §6.8).

## 10. Authorization interaction

Hierarchy resolution establishes _relevance/target_, not permission. Stage-1 permission (`permissions.services.check_permission`) and Stage-2 resource visibility both still apply (INV-016/017, `SECURITY.md` §1). A resolved reviewer/recipient must still hold the required permission key at the relevant scope; if not, resolution continues up the chain or blocks — it never grants access by relationship alone.

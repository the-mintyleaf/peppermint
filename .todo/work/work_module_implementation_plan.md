# Work Module — Master Implementation Plan

**Document status:** Phased execution plan (architect's roadmap)
**Module owner:** `work`
**Derived from:** `.docs/work_module_ideation.txt` (requirement, contract v1.0.0)
**Snapshot date:** 2026-07-17
**Author:** AI (Claude Fable 5)
**Governing rulebook:** `.claude/CLAUDE.md` (Backend Engineering Rules v4)

---

## 0. How to read this document

This is the sibling of `.docs/policy_engine_implementation_plan.txt` for the `work` module: it
translates the 2,818-line requirement (`.docs/work_module_ideation.txt`, hereafter **REQ**) into a
sequence of independently shippable sessions. It does **not** restate the domain rules — REQ is the
authority for _what_ the module must do; this plan is the authority for _in what order_ it gets
built and _which artifacts each session produces_.

Every phase is a full session on its own branch, ending with: passing PostgreSQL tests, `ruff`
clean, migrations applied, policy registry synced + `validate_policy_engine --strict` green, docs
updated, and a `/iterations/` log. **The module is not "complete" until Phase 5 (REQ §34).**

Cross-references: `§N` = a section of _this_ file; `REQ §N` = `.docs/work_module_ideation.txt`;
`` `FILE.md` §N `` = another doc; `CLAUDE.md §N` = the rulebook.

---

## 1. Locked architecture decisions (from Phase 0 planning)

These were resolved with the user before any code and are binding for every phase:

1. **Events app deferred.** `WorkOutboxEvent` is the durable domain-event envelope in this build
   (REQ §16.3, §19.15 make it mandatory now). A future standalone `events` ledger is a _projection_
   fed from the outbox — not a prerequisite. (The earlier `events` slice was rolled back 2026-07-12;
   rebuilding it needs its own requirement doc and session.)
2. **`work` is the first consumer of `permissions.services.check_permission()`** — user-approved
   under CLAUDE.md §28 item 5, scoped to the `work` app. Work _services_ perform Stage-1 permission
   checks; the generic view-level enforcement bridge (`.docs/policy_enforcement_bridge_design.md`)
   stays unbuilt. This is **not** blanket approval to wire other apps.
3. **Two-stage authorization** (REQ §14): Stage 1 = `check_permission(actor, key, context={org, unit})`
   in the service; Stage 2 = work-side visibility (ownership / assignment / participation / hierarchy /
   sensitivity / lifecycle) via visibility-aware selectors. Both must pass.
4. **No security-sensitive Redis cache in the initial build.** The revision markers the cache-safety
   rule (CLAUDE.md §15) requires (`organization_structure_version`, `permission_revision`) do not exist
   in code yet. `CACHE.md` documents the deliberate no-cache posture and the preconditions for enabling
   it later. Always recompute authorization from PostgreSQL.
5. **Nepal localization (CLAUDE.md §39) overrides REQ's plain `title`/`name` fields** — every
   human-facing name/title gets `_np`/`_en`/`_romanized`; `normalize_unicode()` on all user text;
   user-facing dates emit `*_bs`; `reference_number` and all `code`/`key` fields stay ASCII.

---

## 2. Verified cross-app interface (repository inspection, 2026-07-17)

Recorded here so no phase re-derives it or invents names (REQ §35 rule 1). The authoritative copy
lives in `work/docs/DATA_CONTRACT.md` "Cross-App Dependencies" and `work/docs/HIERARCHY_RESOLUTION.md`.

**`organization` (selectors — reads only):**

- `get_unit_ancestors(unit_id)` → root-first `QuerySet[OrganizationUnit]` (closure table). Ancestor-head walk primitive.
- `get_unit_descendants(unit_id, include_self=False)` — hierarchy-overview / unit-queue scope.
- `get_leadership_positions_for_unit(unit_id)` — filters `is_leadership=True` (no `position_type` filter, no holder).
- `get_current_position_holders(position_id)` → `QuerySet[PositionAssignment]` (`status=ACTIVE`, `-is_primary`).
- `get_chain_of_command(position_id, reporting_type="administrative")` → list of per-hop dicts (iterative, 100-hop cap).
- `get_reporting_manager_positions(position_id)` — active incoming reporting lines.
- `get_active_delegations_for_assignment(assignment_id)` — bidirectional, active-only; caller filters `delegation_type`/`scope_unit`.
- `resolve_actor_organization_context(user_id, organization_id=None, at_time=None)` → dict (memberships, unit memberships, position assignments, reporting chain, delegations). **Caveat:** embedded reporting-chain + delegations are _not_ `at_time`-filtered.
- `get_unit_by_id`, `get_position_by_id`, `get_membership(user_id, organization_id)`, `get_active_position_assignments(membership_id)`.
- **No unit-head FK, no dispatcher concept, no org-structure-version field exist.** Head convention is a work decision (see `HIERARCHY_RESOLUTION.md`).

**`permissions` (services):**

- `check_permission(subject, permission_key, resource=None, context=None) -> PermissionDecision`
  (`permissions/services.py:608`). Scope via `context={"organization_id": …, "organization_unit_id": …}` —
  exact-ID match, no subtree expansion; `resource` unused in Phase 1; superuser+active bypass; inactive
  subject auto-denied. `PermissionDecision` TypedDict carries `allowed`, `decision`, `reason`,
  `scope_type`, `risk_level`, `requires_audit`, …
- `explain_permission(...)` — same output, for hierarchy-preview / debug endpoints.

**`authenticate`:** `User` (UUID pk), flags `is_active` / `account_status` / `actor_type`
(`human|system|ai|external`); `ServiceAccountCredential` for system actors; `get_user_by_id(user_id)`.

**`core`:** `BaseModel` (UUID pk + `created_at`/`updated_at`); `core.responses.success_response`/
`error_response`; `core.pagination.StandardPagination`; `core.exceptions.global_exception_handler`;
`core.middleware.RequestIDMiddleware`; `core/celery.py` (broker `redis/0`, cache `/2`, result backend
**off**, beat = DatabaseScheduler, eager in test/ci). Nepal helpers: `core.nepal.text.normalize_unicode`
/ `romanize_devanagari`; `core.nepal.calendar.to_bs` / `nepal_today` / `bs_string_to_gregorian` /
`fiscal_year_gregorian_range`; `core.nepal.language.detect_language`. **No `tasks.py`, no outbox model
anywhere yet — work introduces the first.**

**`core.policy_engine`:** declare `POLICY_ENDPOINTS` in `work/registry.py` (pattern:
`backend/permissions/registry.py`); then `sync_policy_registry`, `validate_policy_engine --strict`,
`export_policy_registry`. Hooks auto-run validation on `views.py`/`urls.py`/`registry.py` edits;
**run `sync_policy_registry` immediately after every `registry.py` edit** (CLAUDE.md §35 rule 14).

---

## 3. Model inventory and phase allocation

REQ §19 lists 17 logical models; repository-driven design adds two the list implies but omits
(`WorkTaskDependency` for REQ §9.5, `WorkBlockerRecord` for REQ §17.2) plus a reference-number
sequence table. Full field-level schema is in `work/docs/DATA_CONTRACT.md` (written this session,
before any model code — REQ §19, CLAUDE.md §5).

| #   | Model                                        | Phase                             | REQ §                 |
| --- | -------------------------------------------- | --------------------------------- | --------------------- |
| 1   | `WorkItem`                                   | 1                                 | §19.1                 |
| 2   | `WorkTask`                                   | 1                                 | §19.2                 |
| 3   | `WorkAssignment`                             | 1 (schema) / 2 (response flows)   | §19.3                 |
| 4   | `WorkHierarchyResolution`                    | 1                                 | §19.7                 |
| 5   | `WorkStatusTransition`                       | 1                                 | §19.10                |
| 6   | `WorkReferenceSequence` (per-org/FY counter) | 1                                 | §19.1 ref-number rule |
| 7   | `WorkTaskDependency`                         | 2                                 | §9.5                  |
| 8   | `WorkParticipant`                            | 2 (added) / 3 (reviewer/observer) | §19.4                 |
| 9   | `WorkOwnershipTransfer`                      | 2                                 | §19.5, §10.5          |
| 10  | `WorkRoutingRecord`                          | 2                                 | §19.6                 |
| 11  | `WorkActivityEntry`                          | 2                                 | §19.8                 |
| 12  | `WorkBlockerRecord`                          | 2                                 | §17.2                 |
| 13  | `WorkAttachment`                             | 2                                 | §19.16                |
| 14  | `WorkOutboxEvent`                            | 2                                 | §19.15                |
| 15  | `WorkReviewRound`                            | 3                                 | §19.11                |
| 16  | `WorkReviewComment`                          | 3                                 | §19.12                |
| 17  | `WorkClosure`                                | 3                                 | §19.13                |
| 18  | `WorkStakeholder`                            | 3                                 | §19.14                |
| 19  | `WorkEvidence`                               | 4                                 | §19.9                 |
| 20  | `WorkEvidenceLink`                           | 4                                 | §19.17                |

Every model: UUID pk (`core.models.BaseModel`), `__str__`, TZ-aware timestamps, enums in
`work/constants.py`, `atomic()` on multi-table writes, no hard delete (archive semantics).

---

## 4. Service-command and selector allocation

The full REQ §20 command catalogue (~40 commands) and REQ §21 selector catalogue are allocated here so
nothing silently drops between sessions. Every mutation service follows the 12-step mandatory pattern
(REQ §20.7): typed input → actor context → Stage-1 `check_permission` → row lock → version/idempotency
check → lifecycle validation → hierarchy resolution → `atomic()` → current-state write → append
history/hierarchy-snapshot → outbox row → typed return.

| Phase | Services (REQ §20)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Selectors (REQ §21)                                                                                                                                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `create_work`, `update_work_details`, `start_work`, `create_task`, `update_task_details`, `reorder_task`                                                                                                                                                                                                                                                                                                                                                                                                                  | visible-work list, work detail (visibility-enforced), task tree, hierarchy-resolution preview                                                                                                                                                                      |
| 2     | `assign_work`, `respond_to_work_assignment`, `request_ownership_transfer`, `respond_to_ownership_transfer`, `route_work`, `respond_to_routing_request`, `recover_ineligible_owner`, `assign_task`, `respond_to_task_assignment`, `start_task`, `report_work_blocker`/`resolve_work_blocker`, `report_task_blocker`/`resolve_task_blocker`, `extend_work_deadline`, `complete_task`, `return_task_uncompleted`, `cancel_task`, `archive_task`, `record_activity`, `correct_activity`, `attach_document`, `detach_document` | my active work, pending assignments, responsible-unit queue, ownership/assignment/routing history, activity timeline (visibility-filtered), attachment timeline, active route-loop detection, ineligible-owner detection, task ancestry/dependency cycle detection |
| 3     | `submit_work_for_review`, `request_review`, `add_review_comment`, `decide_review`, `invalidate_review_after_material_change`, `submit_work_for_closure`, `close_work`, `reopen_work`, `archive_work`, `restore_work`, `add_participant`, `end_participation`, `add_external_stakeholder`, `update_external_stakeholder`, `request_external_notification`                                                                                                                                                                  | pending reviews, closure history                                                                                                                                                                                                                                   |
| 4     | `submit_evidence`, `verify_evidence`, `reject_evidence`, `supersede_evidence`                                                                                                                                                                                                                                                                                                                                                                                                                                             | evidence filtered by visibility                                                                                                                                                                                                                                    |
| 5     | (integrity only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | my work, unit queue, hierarchy overview (no per-work query), overdue work, metrics source facts, work-with-ineligible-owner                                                                                                                                        |

---

## 5. Phase 0 — Compatibility & contract gate (THIS SESSION)

**Branch:** `add_work_contracts_20260717_2135` (from chain tip `setup_async_infra_deps_20260717_1931`;
`main` is stale — deviation noted per CLAUDE.md §34 exception).

**Deliverables (docs only — no Python, no app registration, no migrations):**

- This master plan.
- `work/docs/`: `DATA_CONTRACT.md`, `LIFECYCLE.md`, `HIERARCHY_RESOLUTION.md`, `EVENTS.md`,
  `ASYNC_PROCESSING.md`, `CACHE.md`, `DOCUMENT_INTEGRATION.md`, `SECURITY.md`, `API.md`, `INTEGRATION.md`.
- Cross-app dependency rows added to `organization/docs/DATA_CONTRACT.md` and
  `permissions/docs/DATA_CONTRACT.md` (CLAUDE.md §4).
- `/iterations/` log; commit `docs(work): …`; push.

**Gate:** nothing registered in the policy engine yet → `validate_policy_engine` must still pass
(proves no accidental drift). Stop for approval only if a _new_ authorization change, dependency, or
destructive change surfaces beyond decisions §1 (none expected — infra already approved).

## 6. Phase 1 — Core aggregate & hierarchy foundation

> **Status: COMPLETE (2026-07-17, branch `add_work_core_aggregate_20260717_2208`).** Delivered the 7 core models + 2 migrations, the `work/hierarchy.py` resolver, 6 services + visibility-aware selectors, 11 thin endpoints, `registry.py` (11 endpoints synced + `validate_policy_engine --strict` green + artifacts exported), and 54 passing PostgreSQL tests. Plan adjustments 1–4 (below, in the plan header) were all applied: `WorkOutboxEvent` + synchronous outbox writes pulled into P1, `tasks/reorder/` endpoint added, P1 visibility narrowing, `WorkItem.idempotency_key`. Zero regressions (full suite: 672 passed / 20 pre-existing failures, proven pre-existing by `git stash`). One extra deviation surfaced during implementation: `WorkTask` needs **two** partial unique constraints (subtask vs. root) because Postgres treats null `parent_task` as distinct.

- `new-app` skill compatibility review; scaffold `backend/work/` (apps.py, models.py, serializers.py,
  views.py, urls.py, services.py, selectors.py, validators.py, constants.py, exceptions.py, filters.py,
  admin.py, registry.py, tests/, docs/ already present). Register in `INSTALLED_APPS`, include urls under
  `/api/v1/work/`.
- `constants.py`: all enums (statuses, priorities, visibility, sensitivity, assignment categories/statuses,
  activity types, review decisions, closure outcomes, blocker types, stakeholder types, outbox states,
  event types) + the full REQ §28 error-code catalogue + config defaults (`WORK_MAX_ROUTING_HOPS=10`,
  `WORK_MAX_TASK_DEPTH=5`, overridable via settings).
- Models 1–6; migrations (reference-sequence table + composite indexes from REQ §19.1/§30).
- `work/hierarchy.py` resolver (composes organization selectors; precedence per `HIERARCHY_RESOLUTION.md`;
  writes `WorkHierarchyResolution` snapshots).
- Services: `create_work`, `update_work_details`, `start_work`, `create_task`, `update_task_details`,
  `reorder_task`. Selectors: visible-work list/detail, task tree, hierarchy preview.
- Thin views + serializers + urls; `registry.py` with the phase's endpoints; `sync_policy_registry` +
  `validate_policy_engine --strict`; export artifacts.
- Tests: model/constraint (INV-001…005, immutable creator, cycle-free tasks), service (success +
  permission-deny + visibility-deny + invalid-lifecycle + stale-version + hierarchy-resolve/miss), API
  (envelope + anti-enumeration + N+1), hierarchy (explicit → supervisor → unit head → ancestor → root →
  delegation → unresolved). Docs: fill API.md/DATA_CONTRACT.md deltas + regenerate INTEGRATION.md.

## 7. Phase 2 — Execution & accountability

> **Status: COMPLETE (2026-07-17, branch `add_work_execution_20260717_2255`).** Delivered the 7 execution models (migration `0003`), the assignment/transfer/routing/recovery + task-execution + blocker/deadline + activity/attachment services, 26 endpoints (37 total registered, `validate_policy_engine --strict` green), and the project's first `tasks.py` (outbox consumer + sweeper + overdue detector) with `transaction.on_commit()` dispatch + the idempotent `bootstrap_work_beat_schedules` command. 96 work tests pass; full suite 714 passed / 20 pre-existing failures (zero regressions). Narrowings applied per plan: `WorkParticipant` schema-only, review-required tasks blocked from self-completion, attachment creation gated, 3 route additions beyond spec §22. `WorkAttachment`'s evidence/review/closure FKs deferred to P3–P4 (documented).

Models 7–14. Assignment issue/respond; cross-unit routing with loop detection + hop-limit escalation
(REQ §6.7, §6.8); ownership transfer (atomic acceptance, REQ §10.5); ineligible-owner recovery
(REQ §10.6, `is_reassignment_required`); blockers + deadline extension; task execution
(`start`/`complete`/`return_uncompleted`/`cancel`/`archive`); `WorkActivityEntry` + corrections;
`WorkAttachment` ledger (opaque `document_id`, uploads still gated); **`WorkOutboxEvent` + the project's
first `tasks.py`** (idempotent outbox consumer + `django-celery-beat` sweeper) + append the `work` row to
`DATASTORES.md` "Store consumers" + write `ASYNC_PROCESSING.md` task table. Concurrency tests (REQ §33.5:
double-accept, transfer race, reorder conflict).

## 8. Phase 3 — Review & closure

> **Status: COMPLETE (2026-07-18, branch `add_work_review_closure_20260717_2333`).** Delivered the 4 review/closure/stakeholder models (migrations `0004`+`0005`) plus the deferred `WorkAttachment` review/closure FKs, the review machinery (submit/decide/comment, snapshot staleness, self-review guard, task-level review), closure/reopen/archive/restore, participant services (now feeding Stage-2 visibility), and external stakeholders with curated-notification gating + field-level contact protection. 14 endpoints (51 total registered, `validate_policy_engine --strict` green). Lifted the P2 review-required-task narrowing. 128 work tests pass; full suite 746 passed / 20 pre-existing failures (zero regressions). Deviations: participant endpoints added beyond spec §22; `restricted`/`confidential` visibility creation stays gated (revisit P5).

`WorkReviewRound`/`WorkReviewComment` (immutable per-round snapshots, self-review forbidden by default,
re-review invalidation), review decisions; closure outcomes + `WorkClosure` (per REQ §8.4 per-outcome
required fields); `reopen`/`archive`/`restore`; `WorkParticipant` reviewer/observer roles;
`WorkStakeholder` + external-notification outbox events (curated templates only, REQ §15.3). Tests per
REQ §33.2/§33.4 for every new command + review-required-cannot-self-complete (INV-014).

## 9. Phase 4 — Evidence integration

> **Status: COMPLETE (2026-07-18, branch `add_work_evidence_20260718_0234`).** Delivered the final 2 models — `WorkEvidence` (verification lifecycle, `supersedes` chain) and `WorkEvidenceLink` (schema-only, gated) — plus the last deferred `WorkAttachment.evidence` FK (migration `0006`); **all 20 contract models now implemented.** 4 endpoints (55 total registered, `validate_policy_engine --strict` green). Text/structured/external evidence live; file-backed gated. Review + closure snapshots now include evidence ids/versions. 145 work tests pass; full suite 763 passed / 20 pre-existing failures (zero regressions). Deviations: supersede folded into `submit`; separation-of-duties self-verify bar (holds for superusers); no evidence outbox event (REQ §16.2 has none).

`WorkEvidence` (text/structured only) + `WorkEvidenceLink`; verification lifecycle
(`submit`/`verify`/`reject`/`supersede`, REQ §12.3). File-backed evidence endpoints stay disabled
(`WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`) until a documents foundation exists — see `DOCUMENT_INTEGRATION.md`.
Data-level visibility: nested evidence/activity filtered at the query layer, never in Python (REQ §14.4).

## 10. Phase 5 — Operational selectors & integrity

> **Status: COMPLETE (2026-07-18, branch `add_work_ops_integrity_20260718_0254`).** Delivered the 5 dashboard endpoints (60 total registered, `validate_policy_engine --strict` green), the `?overdue` list filter, the `get_work_metrics_facts` neutral-facts selector (INV-018), the `work_dashboard` scoped throttle, and the `validate_work_integrity` management command (15 REQ §32 checks, report-only). 162 work tests pass; full suite 780 passed / 20 pre-existing failures (zero regressions). **This is the final phase — the work module is complete (see §11 acceptance walkthrough).**

Dashboard selectors + endpoints (my active work, pending assignments, pending reviews, unit queue,
hierarchy overview — REQ §22.5) tuned for zero N+1 and reusing the org closure table (REQ §30);
neutral metrics-source selectors (REQ §18 — facts only, never a performance score, INV-018);
`validate_work_integrity` management command covering every REQ §32 check (report-only; add its row to
`requirements/README.md`); optional `rebuild_work_metrics` only if evidence justifies. Query-performance
tests. **Final gate: walk all 24 acceptance criteria (REQ §36) with pasted command evidence.**

---

## 11. Standing constraints every phase re-checks

- No hard delete of work/tasks/evidence/reviews/activities/transitions (INV-006, REQ §35 rule 9).
- No generic `PATCH status=`/`current_owner=` (INV-004, INV-008) — named commands only.
- No hard-coded actor/unit/position/depth; hierarchy always resolved (INV-009, REQ §35 rule 2/3).
- Historical hierarchy snapshots never rewritten (INV-010, REQ §35 rule 11).
- Every meaningful mutation is atomic: state + history + hierarchy snapshot + outbox (REQ §16.3, §27.4).
- No external network / email / AI call inside the work transaction (REQ §27.4, CLAUDE.md §15).
- Policy metadata updated in the same task as any endpoint change (CLAUDE.md §35); no endpoint without it.
- Type hints on every service/selector/serializer-method signature; `ruff check`/`ruff format` clean.
- Completion claims backed by pasted command output (CLAUDE.md §33 evidence rule).

---

## 12. Acceptance criteria walkthrough (REQ §36) — MODULE COMPLETE (2026-07-18)

All 24 acceptance criteria are demonstrable. Evidence is a test module/class, a doc section, or a command whose output is in the phase completion reports.

| #   | Criterion (REQ §36)                                                | Status    | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Every active work has one accountable actor + responsible unit     | ✅        | `WorkItem` CheckConstraint `work_item_active_has_owner_and_unit`; `test_models.WorkModelConstraintTest`; integrity `_check_active_work_has_owner`                                                                                                                                                                                                                                                                                     |
| 2   | Creator + historical ownership preserved                           | ✅        | `created_by` PROTECT + immutable (INV-003); `WorkOwnershipTransfer` rows retained; `test_services_execution.OwnershipTransferTest`                                                                                                                                                                                                                                                                                                    |
| 3   | Work cannot be hard deleted                                        | ✅        | archive semantics only (`archive_work`/`restore_work`); no delete path; `DATA_CONTRACT.md` Soft Delete; `test_services_review.ClosureTest.test_archive_and_restore_round_trip`                                                                                                                                                                                                                                                        |
| 4   | Status/ownership cannot be arbitrarily patched                     | ✅        | named commands only, mass-assignment protection (`SECURITY.md` §5); `update_work_details` allowed-fields set; INV-004/008                                                                                                                                                                                                                                                                                                             |
| 5   | Tasks/subtasks — safe hierarchy, no cycles                         | ✅        | `validators.validate_no_task_cycle`/`validate_task_depth`; two partial unique constraints; `test_services_tasks`                                                                                                                                                                                                                                                                                                                      |
| 6   | Dynamic hierarchy resolves responses/reviews/visibility/escalation | ✅        | `work/hierarchy.py`; `test_hierarchy` (9 cases); reviewer resolution `test_services_review.ReviewSubmitTest`                                                                                                                                                                                                                                                                                                                          |
| 7   | Every hierarchy-driven decision stores an immutable snapshot       | ✅        | `WorkHierarchyResolution` (append-only); `test_hierarchy.test_resolve_target_persists_snapshot`; integrity `_check_unit_assignment_has_snapshot`                                                                                                                                                                                                                                                                                      |
| 8   | Org changes affect future only, never rewrite history              | ✅        | `HIERARCHY_RESOLUTION.md` §6/§8; snapshots never updated; `test_hierarchy.test_unit_head_...` fallback cases                                                                                                                                                                                                                                                                                                                          |
| 9   | Ownership doesn't silently change after restructuring              | ✅        | ownership only via transfer/recovery (INV-012); `recover_ineligible_owner` explicit; `test_services_execution.RecoveryTest`                                                                                                                                                                                                                                                                                                           |
| 10  | Cross-unit routing preserves accountability + detects loops        | ✅        | `route_work` loop + hop-limit escalation; `test_services_execution.RoutingTest` (reverse rejection, override, escalation)                                                                                                                                                                                                                                                                                                             |
| 11  | Activity entries — correction-based audit history                  | ✅        | `WorkActivityEntry` immutable + `correct_activity`; `test_services_activity` (immutability, correction chain)                                                                                                                                                                                                                                                                                                                         |
| 12  | Review-required work cannot close without approval                 | ✅        | `submit_work_for_closure` guards `review_required` → `WORK_REVIEW_REQUIRED`; `test_services_review.ClosureTest.test_review_required_work_cannot_submit_closure`                                                                                                                                                                                                                                                                       |
| 13  | Review rounds preserve stable submission snapshots                 | ✅        | `WorkReviewRound.snapshot_payload` + staleness check; `test_services_review.ReviewDecideTest.test_stale_snapshot_rejected`                                                                                                                                                                                                                                                                                                            |
| 14  | Closure stores explicit outcome + supporting explanation           | ✅        | `WorkClosure` per-outcome validation; `test_services_review.ClosureTest` (8-outcome matrix, duplicate/partial)                                                                                                                                                                                                                                                                                                                        |
| 15  | External stakeholders receive only approved communications         | ✅        | `request_external_notification` gate; curated-template outbox; `test_services_participants.StakeholderTest`                                                                                                                                                                                                                                                                                                                           |
| 16  | Permission + resource visibility both pass before access           | ✅        | two-stage authorization (`SECURITY.md` §1); `test_api_*` permission-deny + anti-enum-404; participant `403` vs `404` test                                                                                                                                                                                                                                                                                                             |
| 17  | Sensitive nested data filtered at query level                      | ✅        | `get_activity_timeline`/`get_evidence_timeline`/`get_attachment_timeline` exclude at query layer; `test_services_activity`/`test_services_evidence` visibility tests                                                                                                                                                                                                                                                                  |
| 18  | State + history + snapshots + outbox atomic                        | ✅        | every mutation in `transaction.atomic()`; `test_services_work.test_create_writes_transition_and_outbox_atomically`                                                                                                                                                                                                                                                                                                                    |
| 19  | Concurrent conflicting actions detected                            | ✅        | `aggregate_version` (`WORK_VERSION_CONFLICT`) + `select_for_update` + already-resolved guards; `test_services_execution` double-response/double-decide                                                                                                                                                                                                                                                                                |
| 20  | Policy engine registry + strict validation pass                    | ✅        | 60 endpoints; `validate_policy_engine --strict` = "Policy Engine Validation Passed"; `test_policy_registry` (count 60)                                                                                                                                                                                                                                                                                                                |
| 21  | Integrity command detects corrupted scenarios                      | ✅        | `validate_work_integrity` (15 checks); `test_management_integrity` (drift/missing-closure/cross-work-parent/missing-snapshot detected; never mutates)                                                                                                                                                                                                                                                                                 |
| 22  | API/data-contract/integration/lifecycle/events/debug docs exist    | ✅        | `work/docs/` — API, DATA_CONTRACT, INTEGRATION, LIFECYCLE, EVENTS, HIERARCHY_RESOLUTION, ASYNC_PROCESSING, CACHE, DOCUMENT_INTEGRATION, SECURITY (DEBUG_HISTORY created on first bug fix per CLAUDE.md §19.1)                                                                                                                                                                                                                         |
| 23  | Required test suites pass against PostgreSQL                       | ✅        | `pytest --ds=core.settings.ci backend/work/tests/` = **162 passed**                                                                                                                                                                                                                                                                                                                                                                   |
| 24  | ruff, format, migrations, policy validation, CI gate pass          | ⚠️ mostly | `ruff check`/`format` clean; `makemigrations --check` clean; `validate_policy_engine --strict` + `export_policy_registry --check` green. **Full suite: 780 passed / 20 failed — all 20 are pre-existing non-work failures** (stale `create_organization({"name":…})` calls in `permissions`/`core` tests, proven pre-existing by `git stash` in the P1 session); **zero work-app failures, zero regressions across all five phases.** |

**Standing narrowings (documented, outside this module's scope):** (a) `restricted`/`confidential`/`explicit` visibility _creation_ stays gated — unlocking needs non-endpoint permission keys, a `core.policy_engine` feature; (b) file-backed evidence + attachment creation + `WorkEvidenceLink` stay gated on a future document foundation; (c) the outbox consumer is log-only until a `notifications`/`events` consumer attaches; (d) the 20 pre-existing `permissions`/`core` test failures are a separate cleanup (unrelated to `work`). None affect the work module's own correctness.

**The MintFlow `work` module is complete: 20 models, 60 endpoints, the dynamic hierarchy resolver, the transactional outbox + worker layer, and the full lifecycle (create → assignment/routing → execution → review → closure → archive) with immutable history, two-stage authorization, and Nepal localization — built across Phases 0–5 with 162 passing PostgreSQL tests and zero regressions.**

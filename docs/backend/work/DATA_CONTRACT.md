# Data Contract — Work

**Owner app:** `work`
**Version:** 1.4.1 (Phase 5 — metrics-facts payload contract; module complete)
**Status:** Active
**Created:** 2026-07-17
**Purpose:** The operational work-execution aggregate for MintFlow — objectives assigned to one accountable actor, executed through tasks/subtasks, governed by dynamically-resolved organizational hierarchy, supported by immutable activity/evidence history, and resolved through a controlled closure process. Owns work/task state and history, assignment/routing/ownership records, hierarchy-resolution snapshots, activity/evidence metadata, review rounds, closure outcomes, external-stakeholder relationships, and the transactional outbox. Does **not** own identity/auth (`authenticate`), organization/hierarchy structure (`organization`), permission decisions (`permissions`), the action registry (`core.policy_engine`), physical file truth (future `documents`), the universal event ledger (future `events`), notification delivery (future `notifications`), audit findings (future `audit`), or performance scoring (future `evaluation`). See `.docs/work_module_ideation.txt` §4 for the full ownership boundary.

**Scope of this version:** Phase 0 defines the full logical schema for all phases **before any model code** (`.docs/work_module_ideation.txt` §19, §34; CLAUDE.md §5). Model classes, migrations, and per-field DB validation land per phase per `.docs/work_module_implementation_plan.md` §3. Field types below are the intended final shapes; a phase may make a documented minimal adaptation if repository inspection proves a simpler design preserves every invariant (REQ §35).

---

## Change History

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-17 | AI (Claude Fable 5) | Initial pre-code contract: 20 models (19 domain + reference-sequence), full enum catalogue, invariants INV-001…018, cross-app dependency inventory. No model code in this session. |
| 1.1.0 | 2026-07-17 | AI (Claude Fable 5) | Phase 1 implementation of the 7 core-aggregate models (WorkItem, WorkTask, WorkAssignment, WorkHierarchyResolution, WorkStatusTransition, WorkReferenceSequence, WorkOutboxEvent). Adds `WorkItem.idempotency_key` (create-work idempotency, REQ §27.3); documents `WorkTask`'s two partial unique constraints for nullable-parent sequence uniqueness; records the P1 visibility narrowing + new `WORK_VISIBILITY_MODE_UNSUPPORTED` code; notes outbox rows are written synchronously from Phase 1 (Celery consumer Phase 2); substantive INV-018 reference added. The other 13 models remain Draft (Phases 2–5). |
| 1.2.0 | 2026-07-17 | AI (Claude Opus 4.8) | Phase 2 implementation of the 7 execution models: WorkTaskDependency, WorkParticipant, WorkOwnershipTransfer, WorkRoutingRecord, WorkBlockerRecord, WorkActivityEntry, WorkAttachment (migration `0003`). **Deviations:** `WorkParticipant` is schema-only in P2 (services/endpoints land in P3); `WorkAttachment`'s `evidence`/`review_round`/`closure` FKs are deferred to the phase that creates those models (P3–P4) — P2 links work/task/activity only; `WorkParticipant` uses two partial unique constraints (nullable-task, same Postgres lesson); `WorkTaskDependency` has a `source ≠ target` `CheckConstraint`. Attachment creation is gated (`WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`). The 6 review/closure/stakeholder/evidence models remain Draft (P3–P4). |
| 1.3.0 | 2026-07-17 | AI (Claude Opus 4.8) | Phase 3 implementation of the 4 review/closure/stakeholder models: WorkReviewRound (two partial round-uniqueness constraints), WorkReviewComment (immutable), WorkClosure (per-version, self-FK `superseded_closure`), WorkStakeholder (bilingual auto-romanized names, trigram indexes, migration `0005`). `WorkAttachment`'s deferred `review_round`/`closure` FKs are now added (evidence FK still P4). `WorkParticipant` is now fully wired (services + Stage-2 visibility feed). **Behavior change:** `complete_task` on a `review_required` task now enters `review_pending` with a task-level review round instead of raising `WORK_REVIEW_REQUIRED` (that code now only guards `submit_work_for_closure` on review-required work). Only `WorkEvidence`/`WorkEvidenceLink` remain Draft (P4). |
| 1.4.0 | 2026-07-18 | AI (Claude Opus 4.8) | Phase 4 implementation of the final 2 models: WorkEvidence (verification lifecycle, `supersedes` chain, visibility/sensitivity classes) and WorkEvidenceLink (schema-only — creation inherently gated on the document foundation, migration `0006`); the last deferred `WorkAttachment.evidence` FK is added. **All 20 contract models are now implemented.** **Deviations:** `supersede_evidence` has no endpoint — folded into `submit_evidence(supersedes=…)` which flips the prior row to `superseded` atomically; separation-of-duties bars a submitter from verifying their own evidence (`WORK_EVIDENCE_INVALID`, holds even for superusers); file-backed evidence (`document_reference`/`image_reference` type or any `document_id`) stays gated (`WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`); no outbox event (REQ §16.2 has no evidence event). Review + closure snapshots now include evidence ids/versions (REQ §13.4). |
| 1.4.1 | 2026-07-18 | AI (Claude Opus 4.8) | Phase 5 (doc-only, no model change): adds the `WorkMetricsFacts` payload contract (Request/Response Payload Contracts) — the neutral factual metrics `get_work_metrics_facts()` returns for the future `evaluation` app; facts only, never a score/label (INV-018). No migration. |

---

## Deliberate Deviations

From `.docs/work_module_ideation.txt` (REQ). REQ §19 is explicit that its logical models are "mandatory unless repository inspection proves a simpler design preserves every invariant," and that Nepal-localization / repository realities override its illustrative field names. Each deviation below is a design decision for the whole module, not a rejection of REQ:

- **Two models added beyond REQ §19's list of 17.** REQ describes task dependencies (§9.5) and blockers (§17.2) as first-class concepts with structured fields but never lists a model for either. `WorkTaskDependency` (§7) and `WorkBlockerRecord` (§10) make them queryable rows rather than free-form activity text — required for the dependency-cycle check (`WORK_TASK_DEPENDENCY_CYCLE`) and separately-measurable blocked duration (REQ §17.3, §18). Folding them into `WorkActivityEntry` would lose the structured waiting-on/duration/cycle data.
- **`WorkReferenceSequence` added** to back the immutable, human-readable `WorkItem.reference_number` (REQ §19.1) with a gap-free per-organization, per-fiscal-year counter under `select_for_update` — rather than a random suffix, which REQ calls "human-readable."
- **Bilingual identity replaces REQ's plain `title`/`name` fields (CLAUDE.md §39.1).** `WorkItem`/`WorkTask` carry `title_np` (required), `title_en` (optional, indexed), `title_romanized` (auto, service-layer); `WorkStakeholder` carries `display_name_np`/`_en`/`_romanized`. This is a schema concern, not UI — REQ §39-equivalent localization is mandatory project-wide.
- **User-facing dates expose Bikram Sambat at the API boundary (CLAUDE.md §39.4), not in the DB.** Every user-facing timestamp (`due_at`, `accepted_at`, `started_at`, `closed_at`, deadlines, etc.) stores Gregorian UTC and emits a paired `*_bs` object in responses via `core.nepal.calendar.to_bs`. System-internal timestamps (`created_at`/`updated_at`/idempotency/outbox lock times) get no BS pairing.
- **`is_reassignment_required` is a real boolean field, not an undocumented status** (REQ §10.6 explicitly forbids a hidden status). Ineligible-owner recovery flips this derived integrity flag; the work stays in its lifecycle status.
- **`WorkAttachment` and `WorkEvidenceLink` are kept as two models, not unified** (REQ §19.17 permits unifying "only if no semantics are lost"). The attachment ledger is a provenance history (append-only, one row per attach/detach occurrence); the evidence link is a current-state work↔document relationship with verification status. They answer different questions, so they stay separate.
- **`permission_key` values are plain string contracts, never FKs** to `core.policy_engine.PolicyEndpoint` — mirroring the established project convention (`permissions/docs/DATA_CONTRACT.md` Deliberate Deviations). Work references keys as strings and registers them via `registry.py`.
- **Cross-app FKs point only at `authenticate.User`, `organization.Organization`, and `organization.OrganizationUnit`** (and `organization.Position` where a resolution snapshot records a position id). Work never FKs into `permissions` or `core.policy_engine` models, and never into another app's history tables — it stores opaque id references + immutable snapshots instead (REQ §6.4, §24.2).

---

## 0. Enum catalogue

All enums live in `work/constants.py` as `TextChoices` (lowercase values, CLAUDE.md §8). Listed once here; each model below carries the mandatory bold choice-callout line referencing the relevant enum.

- **`WorkStatus`** (REQ §8.1): `assignment_pending`, `accepted`, `in_progress`, `blocked`, `review_pending`, `changes_requested`, `closure_pending`, `closed`, `archived`
- **`TaskStatus`** (REQ §9.3): `not_started`, `assignment_pending`, `accepted`, `in_progress`, `blocked`, `review_pending`, `changes_requested`, `completed`, `returned_uncompleted`, `cancelled`, `archived`
- **`WorkPriority`** (REQ §19.1): `low`, `normal`, `high`, `urgent`, `critical`
- **`VisibilityMode`** (REQ §14.3): `organizational`, `participants_only`, `restricted`, `confidential`, `explicit`
- **`SensitivityLevel`**: `normal`, `restricted`, `confidential` (compatible with a future classification contract; `explicit` visibility is gated until a resource-access contract exists)
- **`AssignmentCategory`** (REQ §10.1): `accountable_owner`, `executor`, `reviewer`, `contributor`, `observer`
- **`AssignmentStatus`** (REQ §10.3): `pending`, `accepted`, `rejected_out_of_scope`, `clarification_requested`, `cancelled`, `expired`, `revoked`, `ended`
- **`AssignmentTargetType`**: `actor`, `unit`, `position`
- **`OwnershipTransferStatus`** (REQ §10.5): `requested`, `accepted`, `rejected`, `cancelled`, `expired`
- **`RoutingStatus`** (REQ §19.6): `pending`, `accepted`, `rejected`, `clarification_requested`, `escalated`, `cancelled`
- **`ActivityType`** (REQ §11.2): `progress_update`, `work_performed`, `decision`, `communication`, `meeting`, `research`, `field_activity`, `document_prepared`, `information_requested`, `information_received`, `blocker_reported`, `dependency_resolved`, `submission`, `review_response`, `correction`, `system_activity`
- **`ActivitySourceType`** (REQ §11.3): `human`, `system`, `ai_draft`
- **`TaskDependencyType`** (REQ §9.5): `finish_to_start`, `start_to_start`, `informational`, `external_blocker`
- **`BlockerType`** (REQ §17.2): `internal_dependency`, `external_party`, `missing_information`, `missing_authority`, `resource_unavailable`, `technical_issue`, `review_wait`, `cross_unit_wait`, `legal_or_policy_hold`, `other`
- **`EvidenceType`** (REQ §12.2): `text_statement`, `document_reference`, `image_reference`, `external_reference`, `structured_payload`, `generated_output`, `approval_record`, `communication_record`
- **`EvidenceStatus`** (REQ §12.3): `submitted`, `pending_verification`, `verified`, `rejected`, `superseded`, `invalid`
- **`ReviewDecision`** (REQ §13.3): `approved`, `approved_with_remarks`, `changes_requested`, `rejected`, `returned_without_review`
- **`ReviewCommentType`**: `general`, `required_change`, `question`, `clarification`, `correction`
- **`ClosureOutcome`** (REQ §8.4): `completed`, `partially_completed`, `not_completed`, `cancelled`, `duplicate`, `superseded`, `out_of_scope`, `withdrawn`
- **`StakeholderType`** (REQ §15.1): `complainant`, `applicant`, `citizen`, `vendor`, `partner_institution`, `witness`, `beneficiary`, `reporting_party`, `other`
- **`AttachmentRole`**: `primary_supporting`, `supplementary`, `reference`, `submission`, `review_artifact`, `closure_artifact`
- **`OutboxStatus`** (REQ §19.15): `pending`, `processing`, `processed`, `failed`, `dead_lettered`
- **`WorkEventType`** (REQ §16.2): the 24 event types — `work_created`, `work_assignment_requested`, `work_assignment_accepted`, `work_assignment_rejected`, `work_clarification_requested`, `work_routing_requested`, `work_routing_escalated`, `work_ownership_transfer_requested`, `work_ownership_transfer_accepted`, `work_ownership_transfer_rejected`, `work_started`, `work_blocked`, `work_unblocked`, `work_deadline_approaching`, `work_deadline_missed`, `work_review_requested`, `work_changes_requested`, `work_review_approved`, `work_closure_submitted`, `work_closed`, `work_reopened`, `work_archived`, `work_restored`, `external_notification_required` (task-equivalents emitted where applicable)
- **`HierarchyResolutionStrategy`** (REQ §6.2): `explicit_target`, `reporting_line_supervisor`, `unit_head`, `ancestor_unit_head`, `root_head`, `delegated`, `unresolved`
- **`TransitionActionType`**: named lifecycle commands (`create`, `accept_assignment`, `start`, `block`, `unblock`, `submit_review`, `request_changes`, `resume_changes`, `approve_review`, `submit_closure`, `close`, `reopen`, `archive`, `restore`, `transfer_ownership`, `route`, `recover_owner`, `complete_task`, `return_task`, `cancel_task`, …) — the authoritative set is enumerated in `LIFECYCLE.md` §4

---

## 1. WorkItem

**Purpose:** Current aggregate state of a work objective, optimized for operational reads (REQ §19.1).
**Table:** `work_workitem`
**`priority` choices:** `low`, `normal`, `high`, `urgent`, `critical`
**`visibility_mode` choices:** `organizational`, `participants_only`, `restricted`, `confidential`, `explicit`
**`sensitivity_level` choices:** `normal`, `restricted`, `confidential`
**`status` choices:** `assignment_pending`, `accepted`, `in_progress`, `blocked`, `review_pending`, `changes_requested`, `closure_pending`, `closed`, `archived`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| reference_number | CharField(40) | — | No | Yes | ASCII, immutable, org-scoped human-readable (see `WorkReferenceSequence` §6); unique per organization |
| organization | FK `organization.Organization` | Yes | No | No | Responsible organization (PROTECT) |
| responsible_unit | FK `organization.OrganizationUnit` | Yes | No | No | Institutionally accountable unit (PROTECT) |
| created_by | FK `authenticate.User` | Yes | No | No | Immutable creator (INV-003; PROTECT) |
| current_owner | FK `authenticate.User` | Yes | No | No | Single accountable owner (INV-001); changed only via transfer service (INV-004) |
| title_np | CharField(255) | Yes | No | No | Devanagari title, `normalize_unicode` on write |
| title_en | CharField(255) | No | No | No | English title, indexed for search |
| title_romanized | CharField(255) | No | No | Yes | Auto (service layer), ASCII trigram search field |
| objective | TextField | Yes | No | No | What must be achieved |
| description | TextField | No | No | No | Optional detail |
| priority | CharField(20) | No | No | No | `WorkPriority`, default `normal` |
| visibility_mode | CharField(20) | No | No | No | `VisibilityMode`, default `organizational` |
| sensitivity_level | CharField(20) | No | No | No | `SensitivityLevel`, default `normal` |
| status | CharField(30) | No | No | No | `WorkStatus`, default per REQ §8.2 (`accepted` or `assignment_pending`) |
| review_required | Boolean | No | No | No | Default `False` |
| is_reassignment_required | Boolean | No | No | No | Derived integrity flag (REQ §10.6), default `False` |
| due_at | DateTimeField | No | Yes | No | Optional deadline (UTC; `*_bs` in responses) |
| accepted_at | DateTimeField | No | Yes | No | Set on acceptance |
| started_at | DateTimeField | No | Yes | No | Set on `start_work` |
| closed_at | DateTimeField | No | Yes | No | Set on closure |
| archived_at | DateTimeField | No | Yes | No | Set on archive |
| aggregate_version | PositiveInteger | No | No | No | Optimistic-concurrency counter, default 1 |
| idempotency_key | CharField(255) | No | Yes | No | Create-work idempotency (REQ §27.3); unique when set. Same key + same core payload → replay; different payload → `WORK_IDEMPOTENCY_CONFLICT` |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** title_np + objective required; non-archived work must have `current_owner` and `responsible_unit` (INV-001/002, DB `CheckConstraint`); `current_owner` must be eligible at creation/transfer service time (checked in service, not DB); `reference_number` immutable after creation; `current_owner`/`created_by`/`responsible_unit`/`status`/`sensitivity_level` are `write_once` or service-only in serializers (mass-assignment protection, REQ §29). **P1 narrowing:** create accepts `visibility_mode` of `organizational`/`participants_only` only; `restricted`/`confidential`/`explicit` raise `WORK_VISIBILITY_MODE_UNSUPPORTED` until the review/participant machinery lands (Phase 3).

**Indexes:** `(organization, status, updated_at)`; `(responsible_unit, status, due_at)`; `(current_owner, status, due_at)`; `(organization, reference_number)` unique; GIN trigram on `title_np`/`title_en`/`title_romanized` (CLAUDE.md §39.6).

**Soft Delete:** N/A as a deletion flag — archive is the deletion analogue (INV-006). `status=archived` + `archived_at`; archived rows remain queryable by authorized users and are excluded from ordinary list selectors. No hard delete via API.

**Example:**
```json
{
  "id": "3f2b…", "reference_number": "MOHA-2082_83-000042",
  "organization": "…", "responsible_unit": "…",
  "created_by": "…", "current_owner": "…",
  "title_np": "नागरिकता प्रमाणपत्र अनुरोध", "title_en": "Citizenship certificate request",
  "objective": "…", "priority": "high", "visibility_mode": "organizational",
  "sensitivity_level": "normal", "status": "accepted", "review_required": true,
  "is_reassignment_required": false,
  "due_at": "2025-04-14T05:45:00+05:45",
  "due_at_bs": {"year": 2082, "month": 1, "day": 1, "month_name_en": "Baisakh", "display_np": "२०८२ बैशाख १"},
  "aggregate_version": 3, "created_at": "…", "updated_at": "…"
}
```

**Cross-App Dependencies:** FK → `organization.Organization`, `organization.OrganizationUnit`, `authenticate.User`.

---

## 2. WorkTask

**Purpose:** Hierarchical executable unit; one model with nullable self-FK for task/subtask (REQ §9.1 — no separate SubTask table).
**Table:** `work_worktask`
**`status` choices:** `not_started`, `assignment_pending`, `accepted`, `in_progress`, `blocked`, `review_pending`, `changes_requested`, `completed`, `returned_uncompleted`, `cancelled`, `archived`
**`priority` choices:** `low`, `normal`, `high`, `urgent`, `critical`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | Owning work (CASCADE-archive, never hard-delete) |
| parent_task | FK `self` | No | Yes | No | NULL = top-level; non-NULL = subtask; SET_NULL forbidden — parent archive cascades logically |
| sequence | PositiveInteger | Yes | No | No | Stable order within `(work, parent_task)` |
| title_np | CharField(255) | Yes | No | No | Devanagari, `normalize_unicode` |
| title_en | CharField(255) | No | No | No | Indexed for search |
| title_romanized | CharField(255) | No | No | Yes | Auto (service) |
| description | TextField | No | No | No | — |
| task_type | CharField(30) | No | No | No | Optional controlled enum (free until a set is specified) |
| responsible_unit | FK `organization.OrganizationUnit` | Yes | No | No | May differ from work unit (REQ §7) |
| current_assignee | FK `authenticate.User` | No | Yes | No | Nullable only before assignment |
| status | CharField(30) | No | No | No | `TaskStatus`, default `not_started` |
| priority | CharField(20) | No | No | No | `WorkPriority`, default `normal` |
| is_mandatory | Boolean | No | No | No | Parent completion may require mandatory children (REQ §9.4) |
| review_required | Boolean | No | No | No | Default `False` |
| due_at | DateTimeField | No | Yes | No | Optional |
| accepted_at / started_at / completed_at / archived_at | DateTimeField | No | Yes | No | Lifecycle timestamps |
| aggregate_version | PositiveInteger | No | No | No | Default 1 |
| created_by | FK `authenticate.User` | Yes | No | No | — |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** parent and child share the same `work` (DB `CheckConstraint` cannot cross tables → validated in service + integrity command); no cycles (INV via service, `WORK_TASK_CYCLE_DETECTED`); depth ≤ `WORK_MAX_TASK_DEPTH` (default 5, `WORK_TASK_DEPTH_EXCEEDED`); no hard delete after any activity/assignment exists (archive instead).

**Indexes:** unique `(work, parent_task, sequence)` **where `parent_task` is not null** plus a partial unique `(work, sequence)` **where `parent_task` is null** — two constraints are required because Postgres treats null `parent_task` values as distinct, so a single 3-column constraint would not prevent duplicate sequences among top-level tasks (same nullable-uniqueness pattern as `organization`/`permissions`); `(current_assignee, status, due_at)`; `(responsible_unit, status, due_at)`; GIN trigram on title fields.

**Soft Delete:** N/A as a flag — `status` uses `cancelled`/`archived`; no hard delete (INV-006).

**Cross-App Dependencies:** FK → `organization.OrganizationUnit`, `authenticate.User`.

---

## 3. WorkTaskDependency

**Purpose:** Directed dependency between two tasks in the same work item (REQ §9.5). *Added beyond REQ §19 — see Deliberate Deviations.*
**Table:** `work_worktaskdependency`
**`dependency_type` choices:** `finish_to_start`, `start_to_start`, `informational`, `external_blocker`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | Both tasks must belong to it |
| source_task | FK `WorkTask` | Yes | No | No | The dependent task |
| target_task | FK `WorkTask` | Yes | No | No | The task depended upon |
| dependency_type | CharField(20) | Yes | No | No | `TaskDependencyType` |
| reason | TextField | No | No | No | — |
| is_active | Boolean | No | No | No | Soft-removed, default `True` |
| created_by | FK `authenticate.User` | Yes | No | No | — |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** source ≠ target; both tasks in same `work`; no circular blocking dependency (`WORK_TASK_DEPENDENCY_CYCLE`, service + integrity command); a `finish_to_start`/`start_to_start`/`external_blocker` dependency in an unmet state contributes to blocked-duration metrics (REQ §9.5, §18).

**Indexes:** `(work, source_task)`; `(work, target_task)`; unique `(source_task, target_task, dependency_type)` where `is_active`.

**Soft Delete:** `is_active=False` (never hard-deleted — remains audit trail).

**Cross-App Dependencies:** FK → `authenticate.User`.

---

## 4. WorkAssignment

**Purpose:** Append-friendly history of who/what was assigned under which role (REQ §19.3).
**Table:** `work_workassignment`
**`category` choices:** `accountable_owner`, `executor`, `reviewer`, `contributor`, `observer`
**`target_type` choices:** `actor`, `unit`, `position`
**`status` choices:** `pending`, `accepted`, `rejected_out_of_scope`, `clarification_requested`, `cancelled`, `expired`, `revoked`, `ended`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | Null → work-level assignment |
| category | CharField(20) | Yes | No | No | `AssignmentCategory` |
| target_type | CharField(10) | Yes | No | No | `AssignmentTargetType` |
| target_actor | FK `authenticate.User` | No | Yes | No | Set when target_type=`actor` |
| target_unit | FK `organization.OrganizationUnit` | No | Yes | No | Set when target_type=`unit` |
| target_position | FK `organization.Position` | No | Yes | No | Set when target_type=`position` |
| resolved_actor | FK `authenticate.User` | No | Yes | No | Dynamically resolved recipient (null until resolution) |
| issued_by | FK `authenticate.User` | Yes | No | No | Assignment issuer |
| status | CharField(25) | No | No | No | `AssignmentStatus`, default `pending` |
| reason | TextField | No | No | No | Instructions / rejection reason |
| response_remarks | TextField | No | No | No | — |
| recommended_unit | FK `organization.OrganizationUnit` | No | Yes | No | On reject-out-of-scope routing suggestion |
| recommended_actor | FK `authenticate.User` | No | Yes | No | On rejection |
| hierarchy_resolution | FK `WorkHierarchyResolution` | No | Yes | No | Snapshot that resolved the recipient |
| previous_assignment | FK `self` | No | Yes | No | Chain link |
| issued_at | DateTimeField | — | No | Yes | Auto |
| responded_at / effective_at / ended_at | DateTimeField | No | Yes | No | Lifecycle |
| idempotency_key | CharField(255) | No | Yes | No | Unique when set |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** exactly one of `target_actor`/`target_unit`/`target_position` per `target_type` (`WORK_ASSIGNMENT_TARGET_INVALID`); task belongs to work; at most one active `accountable_owner` assignment per work; at most one active primary `executor` per task (until multi-assignee is introduced); rejection requires reason (REQ §10.4).

**Indexes:** `(work, status)`; `(task, status)`; `(resolved_actor, status)`; `(target_unit, status)`; unique `idempotency_key` where set.

**Soft Delete:** N/A — status transitions (`cancelled`/`revoked`/`ended`/`expired`) only; append-only history.

**Cross-App Dependencies:** FK → `authenticate.User`, `organization.OrganizationUnit`, `organization.Position`.

---

## 5. WorkParticipant

**Purpose:** Direct contributor/reviewer/observer relationships not represented by an active assignment (REQ §19.4). Membership does **not** grant permission (INV-016, REQ §35 rule 5).
**Table:** `work_workparticipant`
**`role` choices:** `contributor`, `reviewer`, `observer`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | Optional scope |
| actor | FK `authenticate.User` | Yes | No | No | — |
| role | CharField(20) | Yes | No | No | Participant role |
| added_by | FK `authenticate.User` | Yes | No | No | — |
| active_from | DateTimeField | — | No | Yes | Auto |
| active_to | DateTimeField | No | Yes | No | Null = active |
| reason | TextField | No | No | No | — |
| visibility_limit | CharField(20) | No | No | No | Optional narrower visibility class |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** no duplicate active `(work, task, actor, role)`; ending participation sets `active_to`, never deletes.

**Indexes:** `(work, role)`; `(actor, role)`.

**Soft Delete:** `active_to` timestamp (end, not delete).

**Cross-App Dependencies:** FK → `authenticate.User`.

---

## 6. WorkReferenceSequence

**Purpose:** Gap-free per-organization, per-fiscal-year counter backing `WorkItem.reference_number` (REQ §19.1 "human-readable"). *Added — see Deliberate Deviations.*
**Table:** `work_workreferencesequence`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| organization | FK `organization.Organization` | Yes | No | No | — |
| fiscal_year_label | CharField(10) | Yes | No | No | BS fiscal year, e.g. `2082_83` (ASCII) |
| last_value | PositiveInteger | No | No | No | Last issued sequence, default 0 |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** unique `(organization, fiscal_year_label)`; incremented under `select_for_update` inside the `create_work` transaction — the row is the concurrency guard. Reference format: `<org_code>-<fiscal_year_label>-<zero-padded last_value>` (org_code is ASCII per CLAUDE.md §39.7).

**Indexes:** unique `(organization, fiscal_year_label)`.

**Soft Delete:** N/A — infrastructure counter, never deleted.

**Cross-App Dependencies:** FK → `organization.Organization`.

---

## 7. WorkOwnershipTransfer

**Purpose:** Controlled accountable-owner handover (REQ §19.5, §10.5). Ownership changes only through this, never a direct field update (INV-004/005).
**Table:** `work_workownershiptransfer`
**`status` choices:** `requested`, `accepted`, `rejected`, `cancelled`, `expired`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| current_owner | FK `authenticate.User` | Yes | No | No | Owner at request time |
| proposed_owner | FK `authenticate.User` | Yes | No | No | — |
| current_unit | FK `organization.OrganizationUnit` | Yes | No | No | Responsible unit at request |
| proposed_unit | FK `organization.OrganizationUnit` | No | Yes | No | Set only when changing unit |
| initiated_by | FK `authenticate.User` | Yes | No | No | — |
| status | CharField(20) | No | No | No | `OwnershipTransferStatus`, default `requested` |
| reason | TextField | Yes | No | No | — |
| decision_remarks | TextField | No | No | No | — |
| decided_by | FK `authenticate.User` | No | Yes | No | Accept/reject actor |
| hierarchy_resolution | FK `WorkHierarchyResolution` | No | Yes | No | — |
| requested_at | DateTimeField | — | No | Yes | Auto |
| expires_at | DateTimeField | No | Yes | No | — |
| decided_at / effective_at | DateTimeField | No | Yes | No | — |
| idempotency_key | CharField(255) | No | Yes | No | Unique when set (acceptance idempotency) |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** proposed_owner ≠ current_owner; atomic acceptance re-verifies current ownership unchanged + recipient eligibility + permission/scope, closes previous owner assignment, sets new owner, updates unit only when approved, writes transition/history/outbox, increments `aggregate_version` (REQ §10.5); `WORK_OWNERSHIP_TRANSFER_ALREADY_RESOLVED` on double-decide.

**Indexes:** `(work, status)`; `(proposed_owner, status)`; unique `idempotency_key` where set.

**Soft Delete:** N/A — status transitions only.

**Cross-App Dependencies:** FK → `authenticate.User`, `organization.OrganizationUnit`.

---

## 8. WorkRoutingRecord

**Purpose:** Immutable cross-unit/actor route hop with loop-detection metadata (REQ §19.6, §6.7/§6.8).
**Table:** `work_workroutingrecord`
**`status` choices:** `pending`, `accepted`, `rejected`, `clarification_requested`, `escalated`, `cancelled`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | — |
| from_actor | FK `authenticate.User` | No | Yes | No | — |
| from_unit | FK `organization.OrganizationUnit` | No | Yes | No | — |
| proposed_target_actor | FK `authenticate.User` | No | Yes | No | — |
| proposed_target_unit | FK `organization.OrganizationUnit` | No | Yes | No | — |
| resolved_recipient | FK `authenticate.User` | No | Yes | No | Dynamically resolved |
| route_reason | TextField | Yes | No | No | — |
| status | CharField(25) | No | No | No | `RoutingStatus`, default `pending` |
| hop_number | PositiveInteger | Yes | No | No | Position in active route chain |
| previous_route | FK `self` | No | Yes | No | — |
| loop_metadata | JSONField | No | No | No | Visited-unit set + reverse-route markers (schema-versioned) |
| hierarchy_resolution | FK `WorkHierarchyResolution` | No | Yes | No | — |
| created_at | DateTimeField | — | No | Yes | Auto |
| decided_at | DateTimeField | No | Yes | No | — |

**Validation Rules:** reject identical immediate reverse route without override reason + permission (`WORK_ROUTING_LOOP_DETECTED`); after `WORK_MAX_ROUTING_HOPS` (default 10) escalate to nearest common ancestor head (`WORK_ROUTING_HOP_LIMIT_EXCEEDED`); every hop stored; work stays owned by previous owner until acceptance (REQ §6.7).

**Indexes:** `(work, status)`; `(resolved_recipient, status)`; `(work, hop_number)`.

**Soft Delete:** N/A — immutable append-only history.

**Cross-App Dependencies:** FK → `authenticate.User`, `organization.OrganizationUnit`.

---

## 9. WorkHierarchyResolution

**Purpose:** Immutable explanation of one dynamic hierarchy decision (REQ §19.7, §6.4). Never rewritten by later structure changes (INV-010).
**Table:** `work_workhierarchyresolution`
**`strategy` choices:** `explicit_target`, `reporting_line_supervisor`, `unit_head`, `ancestor_unit_head`, `root_head`, `delegated`, `unresolved`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| organization | FK `organization.Organization` | Yes | No | No | — |
| action_type | CharField(40) | Yes | No | No | e.g. `resolve_reviewer`, `resolve_route_recipient`, `resolve_escalation` |
| source_actor | FK `authenticate.User` | No | Yes | No | — |
| source_unit | FK `organization.OrganizationUnit` | No | Yes | No | — |
| source_position | FK `organization.Position` | No | Yes | No | — |
| resolved_target_actor | FK `authenticate.User` | No | Yes | No | Null when `unresolved` |
| resolved_target_unit | FK `organization.OrganizationUnit` | No | Yes | No | — |
| resolved_target_position | FK `organization.Position` | No | Yes | No | — |
| unit_ancestry_path | JSONField | No | No | No | Ordered unit-id list (schema-versioned) |
| authority_path | JSONField | No | No | No | Ordered reporting/authority path when available |
| strategy | CharField(30) | Yes | No | No | `HierarchyResolutionStrategy` |
| delegation_id | UUIDField | No | Yes | No | `organization.AuthorityDelegation` id when used (opaque) |
| effective_at | DateTimeField | Yes | No | No | The resolution timestamp (REQ §6.3) |
| reason | TextField | No | No | No | — |
| source_reference | UUIDField | No | Yes | No | Source work/task/assignment/review id |
| structure_version_snapshot | JSONField | No | No | No | Org structure/history identifiers exposed at resolution time |
| payload_schema_version | CharField(10) | No | No | No | Default `1.0` |
| created_at | DateTimeField | — | No | Yes | Auto (immutable — no `updated_at`) |

**Validation Rules:** append-only (no update/delete via any service); `resolved_target_*` all null iff `strategy=unresolved` (then the calling action blocks with `WORK_HIERARCHY_TARGET_UNRESOLVED`); `effective_at` is the transaction time for new actions, never "now" when reconstructing history.

**Indexes:** `(organization, action_type)`; `(source_actor, action_type)`; `(source_reference)`.

**Soft Delete:** N/A — immutable, never deleted.

**Cross-App Dependencies:** FK → `organization.Organization`, `organization.OrganizationUnit`, `organization.Position`, `authenticate.User`; opaque `delegation_id` reference to `organization.AuthorityDelegation`.

---

## 10. WorkBlockerRecord

**Purpose:** Structured blocker backing the `blocked` status and blocked-duration metrics (REQ §17.2, §18). *Added beyond REQ §19 — see Deliberate Deviations.*
**Table:** `work_workblockerrecord`
**`blocker_type` choices:** `internal_dependency`, `external_party`, `missing_information`, `missing_authority`, `resource_unavailable`, `technical_issue`, `review_wait`, `cross_unit_wait`, `legal_or_policy_hold`, `other`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | Null = work-level blocker |
| blocker_type | CharField(30) | Yes | No | No | `BlockerType` |
| description | TextField | Yes | No | No | — |
| waiting_on_actor | FK `authenticate.User` | No | Yes | No | — |
| waiting_on_unit | FK `organization.OrganizationUnit` | No | Yes | No | — |
| expected_resolution_date | DateTimeField | No | Yes | No | — |
| reported_by | FK `authenticate.User` | Yes | No | No | — |
| reported_at | DateTimeField | — | No | Yes | Auto |
| resolved_by | FK `authenticate.User` | No | Yes | No | — |
| resolved_at | DateTimeField | No | Yes | No | Null = still blocked |
| resolution_note | TextField | No | No | No | Required on resolve (REQ §8.3) |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** reporting a blocker also writes a `WorkStatusTransition` (→ `blocked`) + `blocker_reported` activity; resolving requires `resolution_note` and writes the reverse transition; blocked duration = `resolved_at − reported_at`, aggregated per `blocker_type`.

**Indexes:** `(work, resolved_at)`; `(task, resolved_at)`; `(waiting_on_unit, resolved_at)`.

**Soft Delete:** N/A — resolved via `resolved_at`, never deleted.

**Cross-App Dependencies:** FK → `authenticate.User`, `organization.OrganizationUnit`.

---

## 11. WorkActivityEntry

**Purpose:** Immutable accountability action record and explicit work-session evidence (REQ §19.8, §11). Corrections create new entries (INV-013).
**Table:** `work_workactivityentry`
**`activity_type` choices:** `progress_update`, `work_performed`, `decision`, `communication`, `meeting`, `research`, `field_activity`, `document_prepared`, `information_requested`, `information_received`, `blocker_reported`, `dependency_resolved`, `submission`, `review_response`, `correction`, `system_activity`
**`source_type` choices:** `human`, `system`, `ai_draft`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | — |
| actor | FK `authenticate.User` | Yes | No | No | — |
| actor_context_snapshot | JSONField | No | No | No | Org/unit/position ids at action time (schema-versioned) |
| activity_type | CharField(30) | Yes | No | No | `ActivityType` |
| description | TextField | Yes | No | No | — |
| occurred_at | DateTimeField | Yes | No | No | Started/occurred time |
| ended_at | DateTimeField | No | Yes | No | — |
| duration_seconds | PositiveInteger | No | Yes | No | Explicit session duration when known precisely (REQ §11.6) |
| recorded_at | DateTimeField | — | No | Yes | Auto |
| source_type | CharField(10) | No | No | No | `ActivitySourceType`, default `human` |
| visibility_classification | CharField(20) | No | No | No | `VisibilityMode`-compatible, default `organizational` |
| correction_of | FK `self` | No | Yes | No | Set on correction entries |
| correction_reason | TextField | No | No | No | Required when `correction_of` set (REQ §11.4) |
| is_submitted | Boolean | No | No | No | Default `True`; once submitted, immutable |
| created_at | DateTimeField | — | No | Yes | Auto (no `updated_at` — immutable) |

**Validation Rules:** after submission no ordinary update (`WORK_ACTIVITY_IMMUTABLE`); a correction must set `correction_of` + `correction_reason` and reference a prior entry; passive views are never activities (REQ §11.6); AI-drafted entries carry `source_type=ai_draft` and provenance (CLAUDE.md §38).

**Indexes:** `(work, occurred_at)`; `(task, occurred_at)`; `(actor, occurred_at)`; `(work, visibility_classification)`.

**Soft Delete:** N/A — immutable; corrections supersede, redaction is a separate future legal process (REQ §11.4).

**Cross-App Dependencies:** FK → `authenticate.User`.

---

## 12. WorkStatusTransition

**Purpose:** Immutable status history for work and tasks (REQ §19.10). The authoritative domain history (REQ §16.5).
**Table:** `work_workstatustransition`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | Null = work-level transition |
| from_status | CharField(30) | No | No | No | Blank on creation |
| to_status | CharField(30) | Yes | No | No | — |
| action_type | CharField(40) | Yes | No | No | `TransitionActionType` (named command) |
| actor | FK `authenticate.User` | Yes | No | No | — |
| reason | TextField | No | No | No | — |
| hierarchy_resolution | FK `WorkHierarchyResolution` | No | Yes | No | — |
| aggregate_version_before | PositiveInteger | No | Yes | No | — |
| aggregate_version_after | PositiveInteger | No | Yes | No | — |
| request_id | CharField(255) | No | Yes | No | Request id / idempotency key |
| metadata_schema_version | CharField(10) | No | No | No | Default `1.0` |
| occurred_at | DateTimeField | — | No | Yes | Auto (immutable) |

**Validation Rules:** append-only; every named lifecycle command writes exactly one row; transition legality validated against `LIFECYCLE.md` §2/§3 before the row is written (`WORK_INVALID_STATUS_TRANSITION`). These rows (and the durations/counts derived from them, REQ §18) are **facts about what happened and under what authority** — the work module never labels an actor or unit good/poor/efficient/underperforming; interpretation belongs to the future `evaluation` app (INV-018).

**Indexes:** `(work, occurred_at)`; `(task, occurred_at)`; `(action_type)`.

**Soft Delete:** N/A — immutable, never deleted (INV-006).

**Cross-App Dependencies:** FK → `authenticate.User`.

---

## 13. WorkReviewRound

**Purpose:** Immutable review submission + decision per round with a stable snapshot (REQ §19.11, §13).
**Table:** `work_workreviewround`
**`decision` choices:** `approved`, `approved_with_remarks`, `changes_requested`, `rejected`, `returned_without_review` (nullable until decided)

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | Null = work-level review |
| round_number | PositiveInteger | Yes | No | No | Increments per re-submission |
| requested_by | FK `authenticate.User` | Yes | No | No | — |
| reviewer | FK `authenticate.User` | Yes | No | No | Resolved via hierarchy or explicit |
| decision | CharField(30) | No | Yes | No | `ReviewDecision`; null until decided |
| submission_summary | TextField | No | No | No | — |
| snapshot_payload | JSONField | Yes | No | No | Frozen refs: work/task version, activity ids, evidence versions, attachment/doc-version refs, child-task states (REQ §13.4); schema-versioned |
| snapshot_schema_version | CharField(10) | No | No | No | Default `1.0` |
| requested_at | DateTimeField | — | No | Yes | Auto |
| decided_at | DateTimeField | No | Yes | No | — |
| decision_remarks | TextField | No | No | No | — |
| hierarchy_resolution | FK `WorkHierarchyResolution` | No | Yes | No | — |
| is_superseded | Boolean | No | No | No | Set when a later material change invalidates approval (REQ §13.5) |
| idempotency_key | CharField(255) | No | Yes | No | Unique when set (decision idempotency) |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** unique `(work, task, round_number)` with nullable-task handled via two partial constraints (explicitly tested, REQ §19.11); reviewer ≠ submission author unless an explicit self-review permission exists (`WORK_SELF_REVIEW_FORBIDDEN`, default forbidden); approval applies only to the snapshot version (`WORK_REVIEW_SNAPSHOT_STALE`); old rounds/comments never mutated (REQ §13.5).

**Indexes:** `(work, round_number)`; `(reviewer, decision)`; partial-unique pair for null/non-null task.

**Soft Delete:** N/A — immutable; `is_superseded` marks invalidation, row retained.

**Cross-App Dependencies:** FK → `authenticate.User`.

---

## 14. WorkReviewComment

**Purpose:** Immutable comment thread inside a review round (REQ §19.12).
**Table:** `work_workreviewcomment`
**`comment_type` choices:** `general`, `required_change`, `question`, `clarification`, `correction`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| review_round | FK `WorkReviewRound` | Yes | No | No | — |
| actor | FK `authenticate.User` | Yes | No | No | — |
| comment_type | CharField(20) | Yes | No | No | `ReviewCommentType` |
| body | TextField | Yes | No | No | `normalize_unicode` on write |
| parent_comment | FK `self` | No | Yes | No | Thread nesting |
| correction_reference | FK `self` | No | Yes | No | Correction pointer |
| visibility_classification | CharField(20) | No | No | No | Default `participants_only` |
| created_at | DateTimeField | — | No | Yes | Auto (immutable) |

**Validation Rules:** immutable after creation; corrections reference the superseded comment, never edit it.

**Indexes:** `(review_round, created_at)`.

**Soft Delete:** N/A — immutable.

**Cross-App Dependencies:** FK → `authenticate.User`.

---

## 15. WorkClosure

**Purpose:** One authoritative closure record per closure version (REQ §19.13, §8.4). Reopened work keeps old closure records.
**Table:** `work_workclosure`
**`outcome` choices:** `completed`, `partially_completed`, `not_completed`, `cancelled`, `duplicate`, `superseded`, `out_of_scope`, `withdrawn`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| closure_version | PositiveInteger | Yes | No | No | Increments per reclose |
| outcome | CharField(20) | Yes | No | No | `ClosureOutcome` |
| closure_summary | TextField | Yes | No | No | — |
| reason | TextField | No | No | No | — |
| completed_scope | TextField | No | No | No | Required for `partially_completed` |
| unresolved_scope | TextField | No | No | No | Required for `partially_completed`/`not_completed` |
| unresolved_task_snapshot | JSONField | No | No | No | — |
| supporting_evidence_snapshot | JSONField | No | No | No | — |
| canonical_reference | FK `WorkItem` | No | Yes | No | Required for `duplicate` |
| replacement_reference | FK `WorkItem` | No | Yes | No | Required for `superseded` |
| proposed_by | FK `authenticate.User` | No | Yes | No | — |
| closed_by | FK `authenticate.User` | No | Yes | No | — |
| proposed_at / closed_at | DateTimeField | No | Yes | No | — |
| hierarchy_resolution | FK `WorkHierarchyResolution` | No | Yes | No | — |
| external_notification_required | Boolean | No | No | No | Default `False` (REQ §15.4) |
| reopened_at | DateTimeField | No | Yes | No | — |
| reopened_by | FK `authenticate.User` | No | Yes | No | — |
| reopen_reason | TextField | No | No | No | — |
| superseded_closure | FK `self` | No | Yes | No | Set when reopened/reclosed |
| idempotency_key | CharField(255) | No | Yes | No | Unique when set (closure idempotency) |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** per-outcome required fields enforced in service (REQ §8.4): `completed`→summary+evidence; `partially_completed`→completed+unresolved scope+reason; `not_completed`→reason+accountability report+unresolved task summary; `cancelled`/`withdrawn`→authority+reason; `duplicate`→`canonical_reference`; `superseded`→`replacement_reference`; `out_of_scope`→routing history+scope explanation (`WORK_CLOSURE_REQUIREMENTS_UNMET`, `WORK_CLOSURE_OUTCOME_INVALID`). Direct `in_progress`→`closed` forbidden (must pass `closure_pending`).

**Indexes:** `(work, closure_version)` unique; `(outcome)`.

**Soft Delete:** N/A — reopen retains all closure rows (append-only versions).

**Cross-App Dependencies:** FK → `authenticate.User`.

---

## 16. WorkStakeholder

**Purpose:** External concerned party relationship (REQ §19.14, §15). Receives only approved communications (REQ §15.3).
**Table:** `work_workstakeholder`
**`stakeholder_type` choices:** `complainant`, `applicant`, `citizen`, `vendor`, `partner_institution`, `witness`, `beneficiary`, `reporting_party`, `other`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| stakeholder_type | CharField(30) | Yes | No | No | `StakeholderType` |
| display_name_np | CharField(255) | Yes | No | No | `normalize_unicode` |
| display_name_en | CharField(255) | No | No | No | — |
| display_name_romanized | CharField(255) | No | No | Yes | Auto (service) |
| internal_reference_number | CharField(60) | No | No | No | ASCII |
| relationship_to_work | TextField | No | No | No | — |
| approved_contact_channels | JSONField | No | No | No | Field-level access-controlled (REQ §29) |
| preferred_language | CharField(5) | No | No | No | ISO 639-1 (`ne`/`en`) |
| notification_preference | CharField(30) | No | No | No | — |
| consent_metadata | JSONField | No | No | No | Legal-basis metadata where required |
| is_notification_eligible | Boolean | No | No | No | Default `False` |
| sensitivity_classification | CharField(20) | No | No | No | Default `restricted` |
| created_by | FK `authenticate.User` | Yes | No | No | — |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** contact details are field-level access-controlled and never logged (REQ §29); no automatic exposure of internal logs/hierarchy/review comments (REQ §15.3); notifications only via approved template + approver (REQ §15.4).

**Indexes:** `(work, stakeholder_type)`; GIN trigram on display-name fields.

**Soft Delete:** N/A — retained with the work; sensitive-contact retention follows future policy.

**Cross-App Dependencies:** FK → `authenticate.User`.

---

## 17. WorkOutboxEvent

**Purpose:** Durable local integration event — the authoritative domain-event envelope until an `events` ledger exists (REQ §19.15, §16.3). Required in this build.
**Table:** `work_workoutboxevent`
**`status` choices:** `pending`, `processing`, `processed`, `failed`, `dead_lettered`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id (event_id) | UUID | — | No | Yes | Primary key = event id |
| event_type | CharField(50) | Yes | No | No | `WorkEventType` |
| schema_version | CharField(10) | No | No | No | Default `1.0` |
| aggregate_type | CharField(30) | Yes | No | No | e.g. `work_item`, `work_task` |
| aggregate_id | UUIDField | Yes | No | No | — |
| aggregate_version | PositiveInteger | No | Yes | No | — |
| organization | FK `organization.Organization` | No | Yes | No | Scope |
| organization_unit | FK `organization.OrganizationUnit` | No | Yes | No | Scope |
| actor | FK `authenticate.User` | No | Yes | No | — |
| payload | JSONField | Yes | No | No | Documented, schema-versioned envelope |
| idempotency_key | CharField(255) | Yes | No | No | Unique |
| status | CharField(20) | No | No | No | `OutboxStatus`, default `pending` |
| attempts | PositiveInteger | No | No | No | Default 0 |
| available_at | DateTimeField | — | No | Yes | Auto (retry backoff schedule) |
| locked_at | DateTimeField | No | Yes | No | Worker lock |
| processed_at | DateTimeField | No | Yes | No | — |
| last_error_code | CharField(60) | No | Yes | No | No sensitive data (REQ §29) |
| last_error_message | TextField | No | Yes | No | No sensitive data |
| created_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** created in the same transaction as the state change (REQ §16.3, §27.4); `idempotency_key` unique (duplicate insert = no-op); a Celery worker consumes committed rows idempotently and never mutates authoritative work state (REQ §16.4, §19.15); a beat sweeper requeues stalled `processing`/`pending` rows past a stale lock. Full envelope + retry rules in `EVENTS.md`. **Phase 1 status:** rows are written synchronously by every Phase 1 mutation (`work_created`, `work_started`); the Celery consumer + beat sweeper (`tasks.py`) arrive in Phase 2 — until then rows accumulate durably as `pending` in PostgreSQL, which is correct (the outbox is the durable contract, not the dispatch).

**Indexes:** `(status, available_at)`; unique `idempotency_key`; `(aggregate_type, aggregate_id)`.

**Soft Delete:** N/A — `dead_lettered` rows remain queryable (REQ §16.6.6).

**Cross-App Dependencies:** FK → `organization.Organization`, `organization.OrganizationUnit`, `authenticate.User`.

---

## 18. WorkAttachment

**Purpose:** History-preserving provenance record for any document/file reference associated with work/tasks/activities/evidence/reviews/closure (REQ §19.16, §12.6). Provenance, not file storage.
**Table:** `work_workattachment`
**`attachment_role` choices:** `primary_supporting`, `supplementary`, `reference`, `submission`, `review_artifact`, `closure_artifact`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | — |
| activity | FK `WorkActivityEntry` | No | Yes | No | — |
| evidence | FK `WorkEvidence` | No | Yes | No | — |
| review_round | FK `WorkReviewRound` | No | Yes | No | — |
| closure | FK `WorkClosure` | No | Yes | No | — |
| document_id | UUIDField | Yes | No | No | Opaque id from document service (never a path) |
| document_version_id | UUIDField | No | Yes | No | Opaque version id |
| attachment_role | CharField(25) | Yes | No | No | `AttachmentRole` |
| is_primary | Boolean | No | No | No | Default `False` |
| attached_by | FK `authenticate.User` | Yes | No | No | — |
| attached_at | DateTimeField | — | No | Yes | Auto |
| detached_by | FK `authenticate.User` | No | Yes | No | — |
| detached_at | DateTimeField | No | Yes | No | Null = attached |
| attachment_reason | TextField | No | No | No | — |
| visibility_classification | CharField(20) | No | No | No | May be narrower than parent work (REQ §14.4) |
| sensitivity_classification | CharField(20) | No | No | No | — |
| source_document_service | CharField(60) | No | No | No | Snapshot of owning service |
| checksum_snapshot | CharField(128) | No | No | No | SHA-256 observed at association |
| mime_type_snapshot | CharField(120) | No | No | No | — |
| size_snapshot | PositiveBigInteger | No | Yes | No | Bytes |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** one row per attach occurrence; `document_id`/`document_version_id` are opaque ids, never file paths (REQ §19.16); detaching sets `detached_at`, never deletes; reattaching the same document creates a new row; work never stores raw paths or blobs.

**Indexes:** `(work, detached_at)`; `(document_id)`; `(work, visibility_classification)`.

**Soft Delete:** N/A — detach via `detached_at`; historical link preserved even if document later revoked (REQ §12.7).

**Cross-App Dependencies:** FK → `authenticate.User`; opaque `document_id` to a future `documents` service.

---

## 19. WorkEvidence

**Purpose:** Work-specific evidence metadata and reference (REQ §19.9, §12.4). File metadata stays owned by the document service.
**Table:** `work_workevidence`
**`evidence_type` choices:** `text_statement`, `document_reference`, `image_reference`, `external_reference`, `structured_payload`, `generated_output`, `approval_record`, `communication_record`
**`verification_status` choices:** `submitted`, `pending_verification`, `verified`, `rejected`, `superseded`, `invalid`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | — |
| activity | FK `WorkActivityEntry` | No | Yes | No | — |
| submitted_by | FK `authenticate.User` | Yes | No | No | — |
| submitted_at | DateTimeField | — | No | Yes | Auto |
| evidence_type | CharField(25) | Yes | No | No | `EvidenceType` |
| title | CharField(255) | Yes | No | No | `normalize_unicode` |
| description | TextField | No | No | No | — |
| purpose | TextField | No | No | No | — |
| text_payload | TextField | No | No | No | For `text_statement` |
| structured_payload | JSONField | No | No | No | For `structured_payload` (schema-versioned) |
| external_reference | CharField(500) | No | No | No | For `external_reference` |
| document_id | UUIDField | No | Yes | No | Opaque id (file-backed evidence gated until documents exist) |
| version_number | PositiveInteger | No | No | No | Default 1 |
| verification_status | CharField(25) | No | No | No | `EvidenceStatus`, default `submitted` |
| verified_by / rejected_by | FK `authenticate.User` | No | Yes | No | — |
| verified_at / rejected_at | DateTimeField | No | Yes | No | — |
| verification_remarks | TextField | No | No | No | — |
| sensitivity_classification | CharField(20) | No | No | No | Default `normal` |
| visibility_classification | CharField(20) | No | No | No | May be narrower than parent (REQ §14.4) |
| supersedes | FK `self` | No | Yes | No | — |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** text/structured evidence allowed directly; file-backed (`document_id`) evidence blocked until the document foundation exists (`WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`, REQ §12.5); checksum/MIME owned by the document service, never duplicated here; verification accepts a submission but does not approve the work (REQ §12.3); already-resolved evidence cannot be re-verified (`WORK_EVIDENCE_ALREADY_RESOLVED`).

**Indexes:** `(work, verification_status)`; `(task, verification_status)`; `(work, visibility_classification)`.

**Soft Delete:** N/A — `superseded`/`invalid` status; never hard-deleted.

**Cross-App Dependencies:** FK → `authenticate.User`; opaque `document_id`.

---

## 20. WorkEvidenceLink

**Purpose:** Explicit work-side relationship between a work item and a document-backed evidence item (REQ §19.17). Kept distinct from `WorkAttachment` — see Deliberate Deviations.
**Table:** `work_workevidencelink`
**`evidence_type` choices:** same as `WorkEvidence.evidence_type`
**`verification_status` choices:** same as `WorkEvidence.verification_status`

| Field | Type | Required | Nullable | Generated | Description |
|-------|------|----------|----------|-----------|--------------|
| id | UUID | — | No | Yes | Primary key |
| work | FK `WorkItem` | Yes | No | No | — |
| task | FK `WorkTask` | No | Yes | No | — |
| activity | FK `WorkActivityEntry` | No | Yes | No | — |
| document_id | UUIDField | Yes | No | No | Opaque id from the document foundation |
| evidence_type | CharField(25) | Yes | No | No | `EvidenceType` |
| submitted_by | FK `authenticate.User` | Yes | No | No | — |
| verification_status | CharField(25) | No | No | No | `EvidenceStatus`, default `submitted` |
| linked_at | DateTimeField | — | No | Yes | Auto |
| visibility_classification | CharField(20) | No | No | No | — |
| created_at / updated_at | DateTimeField | — | No | Yes | Auto |

**Validation Rules:** `document_id` opaque (document foundation owns file truth, upload, scan, retention); work owns the relationship + evidence semantics only; enabled only once the document foundation exists (`WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`).

**Indexes:** `(work, verification_status)`; `(document_id)`.

**Soft Delete:** N/A — status-driven, never hard-deleted.

**Cross-App Dependencies:** FK → `authenticate.User`; opaque `document_id`.

---

## Request/Response Payload Contracts

### BikramSambatDate (response-only)

**Purpose:** Paired BS representation emitted for every user-facing date field (CLAUDE.md §39.4).
**Shape:**
```json
{ "year": 2082, "month": 1, "day": 1, "month_name_en": "Baisakh", "month_name_np": "बैशाख", "display_en": "2082 Baisakh 1", "display_np": "२०८२ बैशाख १" }
```
**Produced by:** `core.nepal.calendar.to_bs` via work serializers.
**Consumed by:** every `work` GET endpoint returning a temporal field.

### HierarchyPreview (response-only)

**Purpose:** Dry-run of the resolver for a proposed action, without mutation (REQ §22.2 `hierarchy-preview`).
**Shape:**
```json
{ "strategy": "unit_head", "resolved_target_actor": "…", "resolved_target_unit": "…", "unit_ancestry_path": ["…"], "authority_path": ["…"], "delegation_id": null, "effective_at": "…", "reason": "…" }
```
**Produced by:** `work.hierarchy.preview_resolution` (see `HIERARCHY_RESOLUTION.md`).
**Consumed by:** `GET /items/{id}/hierarchy-preview/`.

### WorkMetricsFacts (internal, feeds the future `evaluation` app)

**Purpose:** Neutral factual metrics derived from a work item's immutable history (REQ §18). **Facts only — the work module never labels an actor or unit good/poor/efficient/underperforming (INV-018).** Durations are integer seconds (nullable when the timestamps do not exist); interpretation, normalization, and scoring belong to the future `evaluation` app.
**Shape:**
```json
{
  "assignment_count": 3, "assignment_acceptance_latency_seconds": 120,
  "time_to_first_action_seconds": 300, "elapsed_execution_seconds": 86400,
  "blocked_seconds_by_category": {"external_party": 3600},
  "review_round_count": 2, "routing_hop_count": 1, "ownership_transfer_count": 0,
  "reassignment_count": 0, "deadline_variance_seconds": -600, "reopen_count": 0,
  "closure_outcome": "completed", "unresolved_dependency_count": 0,
  "mandatory_task_completion_ratio": 1.0, "evidence_verification_count": 2
}
```
**Produced by:** `work.selectors.get_work_metrics_facts(work)` (pure reads over immutable history).
**Consumed by:** the future `evaluation` app — **no HTTP endpoint** (REQ §22 defines no metrics route).

---

## Cross-App Dependencies

Per CLAUDE.md §4 — declared here and mirrored in the referenced apps' contracts:

- **`authenticate`** — `authenticate.User` (UUID pk) is the FK target for every actor field (`created_by`, `current_owner`, assignees, issuers, reviewers, `attached_by`, `submitted_by`, etc.). Work reads actor eligibility via `authenticate.selectors.get_user_by_id()` and the `is_active`/`account_status`/`actor_type` fields; it never touches passwords, sessions, or MFA. System/service actors (`actor_type` in `system`/`ai`) attribute automated outbox-driven activities.
- **`organization`** — FK targets `Organization`, `OrganizationUnit`, and `Position` (in resolution snapshots). Hierarchy resolution consumes **read-only selectors only**: `get_unit_ancestors`, `get_unit_descendants`, `get_leadership_positions_for_unit`, `get_current_position_holders`, `get_chain_of_command`, `get_reporting_manager_positions`, `get_active_delegations_for_assignment`, `resolve_actor_organization_context`, `get_unit_by_id`, `get_position_by_id`, `get_membership`, `get_active_position_assignments`. Work maintains **no second organization tree** — it stores immutable resolution snapshots (§9) for audit (REQ §24.2). `AuthorityDelegation` is referenced only by opaque `delegation_id`.
- **`permissions`** — Stage-1 authorization via `permissions.services.check_permission(subject, permission_key, context={"organization_id", "organization_unit_id"})` from work **services** (user-approved §28 consumption — see `permissions/docs/DATA_CONTRACT.md` Cross-App Dependencies). Work writes no roles/grants/denials and re-implements no decision logic.
- **`core.policy_engine`** — every work endpoint/permission-sensitive action is registered via `work/registry.py` + `sync_policy_registry`; `permission_key` treated as a string contract, never an FK.
- **`core`** — response envelope, pagination, exception handler, request-id middleware, Celery/Redis infra, Nepal utilities (§0 references).
- **Future `documents`** — opaque `document_id`/`document_version_id` references only; file-backed evidence/upload endpoints gated (`DOCUMENT_INTEGRATION.md`).
- **Future `events` / `notifications`** — consume `WorkOutboxEvent`; work owns event meaning, they own durable stream / delivery (`EVENTS.md`).

No new third-party dependency is introduced by the `work` app (Celery/Redis are already-approved stack, CLAUDE.md §21).

---

## Soft Delete

Not used anywhere in `work` as a deletion flag — this is a deliberate, invariant-level decision (INV-006, REQ §35 rule 9). Current-state models (`WorkItem`, `WorkTask`) use archive semantics (`status=archived` + `archived_at`, excluded from ordinary list selectors, still queryable by authorized users, restorable). History models (`WorkStatusTransition`, `WorkHierarchyResolution`, `WorkActivityEntry`, `WorkRoutingRecord`, `WorkReviewRound`, `WorkReviewComment`, `WorkClosure` versions, `WorkOutboxEvent`) are strictly append-only and immutable. Relationship/state models (`WorkAssignment`, `WorkParticipant`, `WorkOwnershipTransfer`, `WorkTaskDependency`, `WorkBlockerRecord`, `WorkEvidence`, `WorkEvidenceLink`, `WorkAttachment`) end via status transitions or `*_to`/`*_at` timestamps (`ended`/`revoked`/`superseded`/`detached_at`/`resolved_at`/`is_active=False`), never hard delete. Hard deletion, if ever legally required (e.g. redaction), is a separate future explicitly-approved process (REQ §11.4), never generic update/delete.

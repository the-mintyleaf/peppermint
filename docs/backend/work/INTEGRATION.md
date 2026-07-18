## 1. Module
- **Name:** Work (`work`) — auditable work-execution aggregate with dynamic hierarchy-driven assignment, review, and closure
- **Base path:** `/api/v1/work/`
- **Auth:** JWT (SimpleJWT) or service-account; every endpoint is protected and denies by default (two-stage authorization). No public endpoint.

## 2. Conventions  (extracted from the doc — not assumed)
- **Response:** `{ success, message, data, meta }` success wrapper; single resources in `data`, lists paginated in `data` with `meta`.
- **Error:** `{ success: false, error: { code, message, details }, meta }`.
- **Auth failures:** protected endpoints require authentication; unauthenticated → `401`, permission denied → `403 WORK_PERMISSION_DENIED`. Invisible resources return `404 WORK_ITEM_NOT_FOUND` (anti-enumeration), not a distinct "denied" body.
- **Pagination:** page-number; `page` + `page_size` params (default 20, max 100); `meta: { count, page, page_size, next, previous }` with absolute URLs. Large timeline lists switch to cursor pagination past a documented threshold.
- **IDs:** UUID for every public id. **Times:** ISO-8601 timezone-aware (UTC+05:45 rendering); every user-facing date field is paired with a `*_bs` Bikram Sambat object.
- **List/search/filter/order params:** `?status`, `?priority`, `?responsible_unit`, `?fiscal_year=YYYY/YY`; stable ordering `-updated_at` for work lists, `sequence` for task trees.

## 3. Models
**WorkItem**
`{ id, reference_number, organization, responsible_unit, created_by, current_owner, title_np, title_en?, title_romanized, objective, description?, priority:[enum], visibility_mode:[enum], sensitivity_level:[enum], status:[enum], review_required, is_reassignment_required, due_at?, due_at_bs?:json, accepted_at?, accepted_at_bs?:json, started_at?, started_at_bs?:json, closed_at?, closed_at_bs?:json, archived_at?, aggregate_version, created_at, updated_at }`
- creator and reference_number are immutable; current_owner changes only via ownership-transfer, never a direct field write.
- create accepts optional `idempotency_key` (same key + same payload → replay; different payload → `WORK_IDEMPOTENCY_CONFLICT`); every user-facing date has a paired `*_bs` object on read.

**WorkTask**
`{ id, work, parent_task?, sequence, title_np, title_en?, title_romanized, description?, task_type?, responsible_unit, current_assignee?, status:[enum], priority:[enum], is_mandatory, review_required, due_at?, accepted_at?, started_at?, completed_at?, archived_at?, aggregate_version, created_by, created_at, updated_at }`
- parent_task null = top-level; parent and child share the same work; no cycles; max depth 5.

**WorkTaskDependency**
`{ id, work, source_task, target_task, dependency_type:[enum], reason?, is_active, created_by, created_at, updated_at }`

**WorkAssignment**
`{ id, work, task?, category:[enum], target_type:[enum], target_actor?, target_unit?, target_position?, resolved_actor?, issued_by, status:[enum], reason?, response_remarks?, recommended_unit?, recommended_actor?, hierarchy_resolution?, previous_assignment?, issued_at, responded_at?, effective_at?, ended_at?, idempotency_key?, created_at, updated_at }`
- exactly one of target_actor/target_unit/target_position per target_type.

**WorkParticipant**
`{ id, work, task?, actor, role:[enum], added_by, active_from, active_to?, reason?, visibility_limit?, created_at, updated_at }`
- membership does not grant permission by itself.

**WorkOwnershipTransfer**
`{ id, work, current_owner, proposed_owner, current_unit, proposed_unit?, initiated_by, status:[enum], reason, decision_remarks?, decided_by?, hierarchy_resolution?, requested_at, expires_at?, decided_at?, effective_at?, idempotency_key?, created_at, updated_at }`

**WorkRoutingRecord**
`{ id, work, task?, from_actor?, from_unit?, proposed_target_actor?, proposed_target_unit?, resolved_recipient?, route_reason, status:[enum], hop_number, previous_route?, loop_metadata:json, hierarchy_resolution?, created_at, decided_at? }`

**WorkHierarchyResolution**
`{ id, organization, action_type, source_actor?, source_unit?, source_position?, resolved_target_actor?, resolved_target_unit?, resolved_target_position?, unit_ancestry_path:json, authority_path:json, strategy:[enum], delegation_id?, effective_at, reason?, source_reference?, structure_version_snapshot:json, payload_schema_version, created_at }`
- immutable; never rewritten by later structure changes.

**WorkBlockerRecord**
`{ id, work, task?, blocker_type:[enum], description, waiting_on_actor?, waiting_on_unit?, expected_resolution_date?, reported_by, reported_at, resolved_by?, resolved_at?, resolution_note?, created_at, updated_at }`

**WorkActivityEntry**
`{ id, work, task?, actor, actor_context_snapshot:json, activity_type:[enum], description, occurred_at, ended_at?, duration_seconds?, recorded_at, source_type:[enum], visibility_classification:[enum], correction_of?, correction_reason?, is_submitted, created_at }`
- immutable after submission; corrections create a new entry referencing the original.

**WorkStatusTransition**
`{ id, work, task?, from_status, to_status, action_type, actor, reason?, hierarchy_resolution?, aggregate_version_before?, aggregate_version_after?, request_id?, metadata_schema_version, occurred_at }`
- append-only authoritative work history.

**WorkReviewRound**
`{ id, work, task?, round_number, requested_by, reviewer, decision?:[enum], submission_summary?, snapshot_payload:json, snapshot_schema_version, requested_at, decided_at?, decision_remarks?, hierarchy_resolution?, is_superseded, idempotency_key?, created_at, updated_at }`
- unique (work, task, round_number); reviewer cannot be the submission author by default.

**WorkReviewComment**
`{ id, review_round, actor, comment_type:[enum], body, parent_comment?, correction_reference?, visibility_classification:[enum], created_at }`
- immutable after creation.

**WorkClosure**
`{ id, work, closure_version, outcome:[enum], closure_summary, reason?, completed_scope?, unresolved_scope?, unresolved_task_snapshot:json, supporting_evidence_snapshot:json, canonical_reference?, replacement_reference?, proposed_by?, closed_by?, proposed_at?, closed_at?, hierarchy_resolution?, external_notification_required, reopened_at?, reopened_by?, reopen_reason?, superseded_closure?, idempotency_key?, created_at, updated_at }`
- reopened work keeps all prior closure rows.

**WorkStakeholder**
`{ id, work, stakeholder_type:[enum], display_name_np, display_name_en?, display_name_romanized, internal_reference_number?, relationship_to_work?, approved_contact_channels:json, preferred_language?, notification_preference?, consent_metadata:json, is_notification_eligible, sensitivity_classification, created_by, created_at, updated_at }`
- external stakeholders receive only approved templates; contact details are field-level access-controlled.

**WorkOutboxEvent**
`{ id, event_type:[enum], schema_version, aggregate_type, aggregate_id, aggregate_version?, organization?, organization_unit?, actor?, payload:json, idempotency_key, status:[enum], attempts, available_at, locked_at?, processed_at?, last_error_code?, last_error_message?, created_at }`
- internal integration envelope; not a client-facing resource.

**WorkAttachment**
`{ id, work, task?, activity?, evidence?, review_round?, closure?, document_id, document_version_id?, attachment_role:[enum], is_primary, attached_by, attached_at, detached_by?, detached_at?, attachment_reason?, visibility_classification:[enum], sensitivity_classification, source_document_service, checksum_snapshot, mime_type_snapshot, size_snapshot?, created_at, updated_at }`
- provenance only; document_id is opaque, never a file path.

**WorkEvidence**
`{ id, work, task?, activity?, submitted_by, submitted_at, evidence_type:[enum], title, description?, purpose?, text_payload?, structured_payload:json, external_reference?, document_id?, version_number, verification_status:[enum], verified_by?, rejected_by?, verified_at?, rejected_at?, verification_remarks?, sensitivity_classification, visibility_classification:[enum], supersedes?, created_at, updated_at }`

**WorkEvidenceLink**
`{ id, work, task?, activity?, document_id, evidence_type:[enum], submitted_by, verification_status:[enum], linked_at, visibility_classification:[enum], created_at, updated_at }`

## 4. Enums
- `WorkItem.status: assignment_pending | accepted | in_progress | blocked | review_pending | changes_requested | closure_pending | closed | archived`
- `WorkItem.priority: low | normal | high | urgent | critical`
- `WorkItem.visibility_mode: organizational | participants_only | restricted | confidential | explicit`
- `WorkItem.sensitivity_level: normal | restricted | confidential`
- `WorkTask.status: not_started | assignment_pending | accepted | in_progress | blocked | review_pending | changes_requested | completed | returned_uncompleted | cancelled | archived`
- `WorkTaskDependency.dependency_type: finish_to_start | start_to_start | informational | external_blocker`
- `WorkAssignment.category: accountable_owner | executor | reviewer | contributor | observer`
- `WorkAssignment.target_type: actor | unit | position`
- `WorkAssignment.status: pending | accepted | rejected_out_of_scope | clarification_requested | cancelled | expired | revoked | ended`
- `WorkParticipant.role: contributor | reviewer | observer`
- `WorkOwnershipTransfer.status: requested | accepted | rejected | cancelled | expired`
- `WorkRoutingRecord.status: pending | accepted | rejected | clarification_requested | escalated | cancelled`
- `WorkHierarchyResolution.strategy: explicit_target | reporting_line_supervisor | unit_head | ancestor_unit_head | root_head | delegated | unresolved`
- `WorkBlockerRecord.blocker_type: internal_dependency | external_party | missing_information | missing_authority | resource_unavailable | technical_issue | review_wait | cross_unit_wait | legal_or_policy_hold | other`
- `WorkActivityEntry.activity_type: progress_update | work_performed | decision | communication | meeting | research | field_activity | document_prepared | information_requested | information_received | blocker_reported | dependency_resolved | submission | review_response | correction | system_activity`
- `WorkActivityEntry.source_type: human | system | ai_draft`
- `WorkReviewRound.decision: approved | approved_with_remarks | changes_requested | rejected | returned_without_review`
- `WorkReviewComment.comment_type: general | required_change | question | clarification | correction`
- `WorkClosure.outcome: completed | partially_completed | not_completed | cancelled | duplicate | superseded | out_of_scope | withdrawn`
- `WorkStakeholder.stakeholder_type: complainant | applicant | citizen | vendor | partner_institution | witness | beneficiary | reporting_party | other`
- `WorkEvidence.evidence_type: text_statement | document_reference | image_reference | external_reference | structured_payload | generated_output | approval_record | communication_record`
- `WorkEvidence.verification_status: submitted | pending_verification | verified | rejected | superseded | invalid`
- `WorkAttachment.attachment_role: primary_supporting | supplementary | reference | submission | review_artifact | closure_artifact`
- `WorkOutboxEvent.status: pending | processing | processed | failed | dead_lettered`
- `WorkOutboxEvent.event_type: work_created | work_assignment_requested | work_assignment_accepted | work_assignment_rejected | work_clarification_requested | work_routing_requested | work_routing_escalated | work_ownership_transfer_requested | work_ownership_transfer_accepted | work_ownership_transfer_rejected | work_started | work_blocked | work_unblocked | work_deadline_approaching | work_deadline_missed | work_review_requested | work_changes_requested | work_review_approved | work_closure_submitted | work_closed | work_reopened | work_archived | work_restored | external_notification_required`

## 5. Dependency order
- `WorkItem` needs an `organization.Organization`, an `organization.OrganizationUnit`, and two `authenticate.User` (creator, owner) (external module).
- `WorkTask` needs a `WorkItem` and an `organization.OrganizationUnit`.
- `WorkTaskDependency` needs two `WorkTask` in the same `WorkItem`.
- `WorkAssignment` / `WorkParticipant` / `WorkOwnershipTransfer` / `WorkRoutingRecord` / `WorkBlockerRecord` / `WorkActivityEntry` need a `WorkItem` (and optionally a `WorkTask`).
- `WorkReviewRound` needs a `WorkItem`; `WorkReviewComment` needs a `WorkReviewRound`.
- `WorkClosure` needs a `WorkItem` in `closure_pending`.
- `WorkEvidence` / `WorkEvidenceLink` / `WorkAttachment` need a `WorkItem`; document-backed variants need a future document foundation (external module).
- **Start here:** create a `WorkItem` via `POST /items/`.

## 6. Endpoints

### Work items — `/api/v1/work/items/`
**Use it when:** creating an objective, listing/reading visible work, editing descriptive details, or driving the work lifecycle.

**Methods:**
- POST `/items/`
- GET `/items/`
- GET `/items/{id}/`
- PATCH `/items/{id}/details/`

**Send (create):**
- create: `{ organization (required), responsible_unit (required), title_np (required), objective (required), title_en?, description?, priority?, visibility_mode?, sensitivity_level?, review_required?, due_at?, proposed_owner?, target_unit?, idempotency_key }`
- update details: `{ title_np?, title_en?, objective?, description?, priority?, due_at? }` (descriptive fields only)

**Returns:** WorkItem | list[WorkItem]

**Notes:**
- creator becomes owner (status `accepted`) unless `proposed_owner`/`target_unit` given (status `assignment_pending`).
- `reference_number` and `title_romanized` are auto-generated; `current_owner`/`status`/`responsible_unit` are never client-writable.
- list is filtered by the visibility selector; supports `?status`, `?priority`, `?responsible_unit`, `?fiscal_year`.

**Errors:**
- `WORK_PERMISSION_DENIED` (403) — Stage-1 permission denied
- `WORK_ITEM_NOT_FOUND` (404) — unknown or invisible
- `WORK_OWNER_INELIGIBLE` (422) — proposed/current owner not eligible
- `WORK_IDEMPOTENCY_CONFLICT` (409) — same key, different payload

### Work lifecycle actions — `/api/v1/work/items/{id}/…`
**Use it when:** transitioning a work item through its state machine.

**Methods:**
- POST `/items/{id}/start/`
- POST `/items/{id}/block/`
- POST `/items/{id}/unblock/`
- POST `/items/{id}/deadline/extend/`
- POST `/items/{id}/review/submit/`
- POST `/items/{id}/closure/submit/`
- POST `/items/{id}/close/`
- POST `/items/{id}/reopen/`
- POST `/items/{id}/archive/`
- POST `/items/{id}/restore/`

**Send (create/update):**
- block: `{ blocker_type (required), description (required), waiting_on_actor?, waiting_on_unit?, expected_resolution_date? }`
- unblock: `{ resolution_note (required) }`
- deadline extend: `{ new_due_at (required), reason (required) }`
- close: `{ outcome (required), closure_summary (required), + outcome-specific fields }`
- reopen: `{ reason (required) }`
- others: `{ reason?, aggregate_version? }`

**Returns:** WorkItem

**Notes:**
- each action is a named command with transition validation; direct `in_progress`→`closed` is forbidden (must pass `closure_pending`).
- close requires outcome-specific fields; review-required work cannot skip review.

**Errors:**
- `WORK_INVALID_STATUS_TRANSITION` (409) — illegal transition
- `WORK_VERSION_CONFLICT` (409) — stale `aggregate_version`
- `WORK_CLOSURE_REQUIREMENTS_UNMET` (422) — outcome fields missing
- `WORK_REVIEW_REQUIRED` (409) — cannot self-complete review-required work
- `WORK_ARCHIVED` (409) — action on archived work
- `WORK_DEADLINE_EXTENSION_REASON_REQUIRED` (422) — missing reason

### Assignment & routing — `/api/v1/work/…`
**Use it when:** assigning work, transferring ownership, or routing across units.

**Methods:**
- POST `/items/{id}/assignments/`
- POST `/assignments/{id}/respond/`
- POST `/items/{id}/ownership-transfers/`
- POST `/ownership-transfers/{id}/respond/`
- POST `/items/{id}/routes/`
- POST `/routes/{id}/respond/`
- POST `/items/{id}/recover-owner/`
- GET `/items/{id}/hierarchy-preview/`

**Send (create/update):**
- assign: `{ category (required), target_type (required), target_actor? | target_unit? | target_position?, reason? }`
- respond assignment: `{ decision (required: accept | reject_out_of_scope | request_clarification), reason?, recommended_unit?, recommended_actor? }`
- ownership transfer: `{ proposed_owner (required), proposed_unit?, reason (required), expires_at?, idempotency_key }`
- respond transfer: `{ decision (required: accept | reject | cancel), decision_remarks?, idempotency_key }`
- route: `{ proposed_target_unit? | proposed_target_actor?, route_reason (required), override_reason? }`
- respond route: `{ decision (required: accept | reject | request_clarification), reason? }`

**Returns:** WorkAssignment | WorkOwnershipTransfer | WorkRoutingRecord (hierarchy-preview returns HierarchyPreview)

**Notes:**
- exactly one target field per `target_type`.
- ownership-transfer acceptance is atomic and idempotent; recipient eligibility and current ownership are re-verified.
- routing detects immediate-reverse loops and a configurable hop limit, escalating to the nearest common ancestor head.
- hierarchy-preview is a read-only dry run of the resolver — no mutation.

**Errors:**
- `WORK_ASSIGNMENT_TARGET_INVALID` (422) — bad target combination
- `WORK_ASSIGNMENT_ALREADY_RESOLVED` (409) — double response
- `WORK_OWNERSHIP_TRANSFER_ALREADY_RESOLVED` (409) — double decide
- `WORK_ROUTING_LOOP_DETECTED` (409) — reverse/repeated route
- `WORK_ROUTING_HOP_LIMIT_EXCEEDED` (409) — past hop limit
- `WORK_HIERARCHY_TARGET_UNRESOLVED` (409) — no eligible target

### Tasks — `/api/v1/work/…`
**Use it when:** decomposing work into tasks/subtasks and executing them.

**Methods:**
- POST `/items/{id}/tasks/`
- GET `/items/{id}/tasks/`
- POST `/items/{id}/tasks/reorder/`
- GET `/tasks/{id}/`
- PATCH `/tasks/{id}/details/`
- POST `/tasks/{id}/assignments/`
- POST `/task-assignments/{id}/respond/`
- POST `/tasks/{id}/start/`
- POST `/tasks/{id}/block/`
- POST `/tasks/{id}/unblock/`
- POST `/tasks/{id}/complete/`
- POST `/tasks/{id}/return-uncompleted/`
- POST `/tasks/{id}/archive/`
- POST `/tasks/{id}/dependencies/`
- POST `/task-dependencies/{id}/end/`

**Send (create/update):**
- create: `{ title_np (required), responsible_unit (required), title_en?, description?, parent_task?, sequence?, task_type?, is_mandatory?, review_required?, due_at? }`
- reorder: `{ task (required), new_sequence (required), expected_version? }`
- return-uncompleted: `{ reason (required), report (required), evidence? }`

**Returns:** WorkTask | list[WorkTask] (tree)

**Notes:**
- parent and child share the same work; no cycles; max depth 5; stable ordering by `sequence`.
- `returned_uncompleted` tasks are never silently reassigned — the owner/hierarchy decides next.
- task tree list is a single prefetch, no N+1.

**Errors:**
- `WORK_TASK_PARENT_INVALID` (422) — parent outside work
- `WORK_TASK_CYCLE_DETECTED` (409) — ancestry cycle
- `WORK_TASK_DEPTH_EXCEEDED` (422) — past max depth
- `WORK_TASK_DEPENDENCY_CYCLE` (409) — circular dependency
- `WORK_TASK_NOT_FOUND` (404) — unknown/invisible

### Activity, attachments, evidence, review, stakeholders — `/api/v1/work/…`
**Use it when:** recording accountability activity/evidence, running review rounds, or linking external stakeholders.

**Methods:**
- POST `/items/{id}/activities/`
- GET `/items/{id}/activities/`
- POST `/activities/{id}/corrections/`
- POST `/items/{id}/attachments/`
- GET `/items/{id}/attachments/`
- POST `/attachments/{id}/detach/`
- POST `/items/{id}/evidence/`
- GET `/items/{id}/evidence/`
- POST `/evidence/{id}/verify/`
- POST `/evidence/{id}/reject/`
- GET `/items/{id}/reviews/`
- POST `/reviews/{id}/comments/`
- POST `/reviews/{id}/decide/`
- POST `/items/{id}/stakeholders/`
- PATCH `/stakeholders/{id}/`
- POST `/stakeholders/{id}/notify/`
- POST `/items/{id}/participants/`
- POST `/participants/{id}/end/`

**Send (create/update):**
- activity: `{ activity_type (required), description (required), occurred_at (required), ended_at?, duration_seconds?, visibility_classification? }`
- correction: `{ correction_reason (required), + corrected fields }`
- evidence: `{ evidence_type (required), title (required), text_payload? | structured_payload? | external_reference?, purpose? }`
- review decide: `{ decision (required), decision_remarks?, idempotency_key }`
- stakeholder notify: `{ template_reference (required), approved_by (required) }`

**Returns:** WorkActivityEntry | WorkEvidence | WorkReviewRound | WorkReviewComment | WorkStakeholder | WorkAttachment (lists filtered by visibility)

**Notes:**
- activities are immutable after submission — corrections create a new entry.
- file-backed attachments/evidence are gated until a document foundation exists.
- review decisions apply only to the frozen snapshot; self-review is forbidden by default.
- nested lists are filtered by `visibility_classification` at the query layer.
- stakeholders receive approved templates only.

**Errors:**
- `WORK_ACTIVITY_IMMUTABLE` (409) — edit a submitted activity
- `WORK_EVIDENCE_ALREADY_RESOLVED` (409) — re-verify resolved evidence
- `WORK_SELF_REVIEW_FORBIDDEN` (403) — reviewer authored the submission
- `WORK_REVIEW_SNAPSHOT_STALE` (409) — material change after snapshot
- `WORK_EXTERNAL_NOTIFICATION_NOT_APPROVED` (403) — notify without approved template
- `WORK_DOCUMENT_INTEGRATION_UNAVAILABLE` (503) — file-backed evidence/attachment gated

### Dashboards — `/api/v1/work/…`
**Use it when:** building actor and unit-leadership work queues.

**Methods:**
- GET `/my/active/`
- GET `/my/pending-assignments/`
- GET `/my/pending-reviews/`
- GET `/units/{unit_id}/queue/`
- GET `/units/{unit_id}/hierarchy-overview/`

**Send (create/update):** none

**Returns:** list[WorkItem] | list[WorkAssignment] | list[WorkReviewRound]

**Notes:**
- hierarchy overview reuses the organization closure table (no per-work hierarchy query).
- unit queue exposes pending routed work to authorized unit leadership.

**Errors:**
- `WORK_PERMISSION_DENIED` (403) — permission denied
- `WORK_HIERARCHY_CONTEXT_INVALID` (422) — bad org/unit context

## 7. Flows

**Create → execute → review → close**
1. `POST /items/` → work id (status `accepted` if creator is owner)
2. `POST /items/{id}/tasks/` → task ids
3. `POST /items/{id}/start/` → status `in_progress`
4. `POST /items/{id}/activities/` (record work) and `POST /items/{id}/evidence/`
5. `POST /items/{id}/review/submit/` → status `review_pending`, reviewer resolved from hierarchy
   - `WORK_REVIEWER_INELIGIBLE` → resolver walks up the chain or blocks
6. `POST /reviews/{id}/decide/` (approved) → status `closure_pending`
   - `WORK_SELF_REVIEW_FORBIDDEN` → a different reviewer must decide
7. `POST /items/{id}/close/` → status `closed` with outcome + snapshot
   - `WORK_CLOSURE_REQUIREMENTS_UNMET` → supply outcome-specific fields

**Assign to another owner**
1. `POST /items/` with `proposed_owner` → status `assignment_pending`
2. `POST /assignments/{id}/respond/` (accept) → ownership becomes effective
   - reject_out_of_scope → accountability stays with the creator; optional route recommendation

**Ownership transfer**
1. `POST /items/{id}/ownership-transfers/` → transfer id (`requested`)
2. `POST /ownership-transfers/{id}/respond/` (accept, idempotent) → new owner set atomically
   - `WORK_OWNERSHIP_TRANSFER_ALREADY_RESOLVED` → transfer already decided

**Cross-unit routing**
1. `POST /items/{id}/routes/` with `proposed_target_unit` → routing id, recipient resolved dynamically
   - `WORK_ROUTING_LOOP_DETECTED` / `WORK_ROUTING_HOP_LIMIT_EXCEEDED` → escalates to common ancestor head
2. `POST /routes/{id}/respond/` (accept) → task/ownership transfers; accountability preserved until acceptance

## 8. Gaps
- **The module is complete: all 60 endpoints are implemented and registered** — P1 core aggregate, P2 execution, P3 review/closure, P4 evidence, and P5 dashboards (my active / my pending-assignments / my pending-reviews / unit queue / unit hierarchy-overview). `GET /items/` also accepts `?overdue=true`.
- Metrics-source facts are a selector (`get_work_metrics_facts`), not an endpoint — they feed the future `evaluation` app.
- Unit-scope dashboard endpoints require leadership visibility (non-leader → generic 404) and carry a `work_dashboard` throttle (60/min).
- `WORK_VISIBILITY_MODE_UNSUPPORTED` (422): creating work with `restricted`/`confidential`/`explicit` visibility is still rejected (elevated-permission visibility revisited in P5).
- Attachment creation and file-backed evidence (`document_reference`/`image_reference` type or any `document_id`) return `503 WORK_DOCUMENT_INTEGRATION_UNAVAILABLE` until a document foundation exists; text/structured/external evidence and the attachment/evidence lists work.
- Evidence supersession has no dedicated endpoint — submit with a `supersedes` id; a submitter cannot verify/reject their own evidence (`WORK_EVIDENCE_INVALID`).
- Completing a `review_required` task submits it for review (`review_pending`, 200); a reviewer's approval completes it.
- Routing past the hop limit escalates to the nearest common ancestor head (status `escalated`) rather than failing.
- Participation grants visibility relevance but never permission (INV-016) — a participant still needs the Stage-1 permission to read via the API.
- Stakeholder contact/consent fields are omitted from reads for non-owner/creator/superuser callers.
- File-backed evidence/attachment payloads depend on a future document foundation (external module) and are gated (`WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`); their concrete `document_id` contract is not yet pinned.
- Cursor-pagination cutover threshold for large timeline lists is documented as a policy but the exact row count is not yet fixed.
- `explicit` visibility mode requires a future resource-access contract and remains gated (`restricted`/`confidential` too — an elevated-permission unlock deferred beyond this module).
- The unit-queue and hierarchy-overview endpoints carry the `work_dashboard` scoped throttle (60/min); the activity/attachment/evidence timeline cursor-pagination cutover row-count is still a documented policy, not yet a fixed number.

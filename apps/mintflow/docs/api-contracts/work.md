# API Contract — Work

> Synced from: `docs/backend/work/` · backend version **1.5.0** (API.md; DATA_CONTRACT 1.4.1, SECURITY 1.2.0) · synced 2026-07-18
> Re-sync with `/sync-api mintflow work` when the backend Change History moves past this version.
> **Module is complete:** all 60 endpoints implemented, routed under `/api/v1/work/`, registered in the policy engine.

Base path: `/api/v1/work/` · Auth: JWT (SimpleJWT) or service-account — **every endpoint is protected, denies by default** (two-stage authorization). No public endpoint.

## Envelopes

- Success: `{ success: true, message, data, meta }` — single resource in `data`; paginated list in `data` with `meta`.
- Error: `{ success: false, error: { code, message, details }, meta: {} }`.
- **The app Axios instance (`@/lib/api`) already unwraps the envelope:** non-list → `response.data` is the payload; paginated list → `response.data` is `{ data, meta }`. The typed `.api.ts` layer maps `meta.count → total`.

## Authorization model (two-stage — see SECURITY.md)

1. **Stage 1 — permission** (`check_permission`, in the backend service). Denied → `403 WORK_PERMISSION_DENIED`.
2. **Stage 2 — visibility** (ownership / assignment / participation / hierarchy / sensitivity / lifecycle). An invisible resource returns the **same `404 WORK_ITEM_NOT_FOUND`** as an unknown id (anti-enumeration) — the frontend must **never** show a "denied" state for a 404. A related-but-unpermitted actor gets `403` (permission), a wholly-unrelated actor gets `404` (visibility).

## Pagination & filtering

- Page-number pagination: `?page` + `?page_size` (default **20**, max **100**).
- `meta: { count, page, page_size, next, previous }` (absolute URLs). `count` → UI `total`.
- Large timeline lists (activity/attachment/evidence) may switch to cursor pagination past a threshold (row count not yet fixed — see Gaps).
- `GET /items/` filters: `?status`, `?priority`, `?responsible_unit`, `?fiscal_year=YYYY/YY` (BS), `?overdue=true`. Stable order `-updated_at`.
- Task tree: ordered by `sequence` (single prefetch, no N+1).

## Endpoints (60)

### Work items & lifecycle

| Endpoint                       | Method | Policy key                       | Body / params                                                                                   | Returns                  |
| ------------------------------ | ------ | -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------ |
| `/items/`                      | POST   | `work.work_item.create`          | create body ↓                                                                                   | WorkItem                 |
| `/items/`                      | GET    | `work.work_item.list`            | `?status,priority,responsible_unit,fiscal_year,overdue,page,page_size`                          | list[WorkItem]           |
| `/items/{id}/`                 | GET    | `work.work_item.read`            | —                                                                                               | WorkItem (invisible→404) |
| `/items/{id}/details/`         | PATCH  | `work.work_item.update_details`  | `{ title_np?, title_en?, objective?, description?, priority?, due_at? }`                        | WorkItem                 |
| `/items/{id}/start/`           | POST   | `work.work_item.start`           | `{ reason?, aggregate_version? }`                                                               | WorkItem                 |
| `/items/{id}/block/`           | POST   | `work.work_item.block`           | `{ blocker_type, description, waiting_on_actor?, waiting_on_unit?, expected_resolution_date? }` | WorkItem                 |
| `/items/{id}/unblock/`         | POST   | `work.work_item.unblock`         | `{ resolution_note }`                                                                           | WorkItem                 |
| `/items/{id}/deadline/extend/` | POST   | `work.work_item.extend_deadline` | `{ new_due_at, reason }`                                                                        | WorkItem                 |
| `/items/{id}/review/submit/`   | POST   | `work.work_item.request_review`  | `{ reason?, aggregate_version? }`                                                               | WorkItem                 |
| `/items/{id}/closure/submit/`  | POST   | `work.work_item.submit_closure`  | `{ reason?, aggregate_version? }`                                                               | WorkItem                 |
| `/items/{id}/close/`           | POST   | `work.work_item.close`           | `{ outcome, closure_summary, +outcome-specific }`                                               | WorkItem                 |
| `/items/{id}/reopen/`          | POST   | `work.work_item.reopen`          | `{ reason }`                                                                                    | WorkItem                 |
| `/items/{id}/archive/`         | POST   | `work.work_item.archive`         | `{ reason?, aggregate_version? }`                                                               | WorkItem                 |
| `/items/{id}/restore/`         | POST   | `work.work_item.restore`         | `{ reason?, aggregate_version? }`                                                               | WorkItem                 |

**Create body:** `{ organization*, responsible_unit*, title_np*, objective*, title_en?, description?, priority?, visibility_mode?, sensitivity_level?, review_required?, due_at?, proposed_owner?, target_unit?, idempotency_key? }`. Creator becomes owner (status `accepted`) unless `proposed_owner`/`target_unit` given (`assignment_pending`). `reference_number`/`title_romanized` auto; `current_owner`/`status`/`responsible_unit` never client-writable. Create with `restricted`/`confidential`/`explicit` visibility → `422 WORK_VISIBILITY_MODE_UNSUPPORTED` (gated).

### Assignment & routing

| Endpoint                             | Method | Policy key                                  | Body                                                                        | Returns                                                   |
| ------------------------------------ | ------ | ------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------- |
| `/items/{id}/assignments/`           | POST   | `work.work_item.assign`                     | `{ category, target_type, target_actor?                                     | target_unit?                                              | target_position?, reason? }`                                             | WorkAssignment        |
| `/assignments/{id}/respond/`         | POST   | `work.work_item.respond_assignment`         | `{ decision: accept                                                         | reject_out_of_scope                                       | request_clarification, reason?, recommended_unit?, recommended_actor? }` | WorkAssignment        |
| `/items/{id}/ownership-transfers/`   | POST   | `work.work_item.transfer_ownership`         | `{ proposed_owner, proposed_unit?, reason, expires_at?, idempotency_key? }` | WorkOwnershipTransfer                                     |
| `/ownership-transfers/{id}/respond/` | POST   | `work.work_item.respond_ownership_transfer` | `{ decision: accept                                                         | reject                                                    | cancel, decision_remarks?, idempotency_key? }`                           | WorkOwnershipTransfer |
| `/items/{id}/routes/`                | POST   | `work.work_item.route`                      | `{ proposed_target_unit?                                                    | proposed_target_actor?, route_reason, override_reason? }` | WorkRoutingRecord                                                        |
| `/routes/{id}/respond/`              | POST   | `work.work_item.respond_route`              | `{ decision: accept                                                         | reject                                                    | request_clarification, reason? }`                                        | WorkRoutingRecord     |
| `/items/{id}/recover-owner/`         | POST   | `work.work_item.recover_owner`              | `{ reason? }`                                                               | WorkItem                                                  |
| `/items/{id}/hierarchy-preview/`     | GET    | `work.work_item.preview_hierarchy`          | —                                                                           | HierarchyPreview (no mutation)                            |

Exactly one target field per `target_type`. Transfer acceptance atomic+idempotent. Routing detects immediate-reverse loops + hop limit → escalates to nearest common ancestor head (`escalated`).

### Tasks

| Endpoint                          | Method | Policy key                     | Body                                                                                                                                     | Returns                                            |
| --------------------------------- | ------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `/items/{id}/tasks/`              | POST   | `work.task.create`             | `{ title_np, responsible_unit, title_en?, description?, parent_task?, sequence?, task_type?, is_mandatory?, review_required?, due_at? }` | WorkTask                                           |
| `/items/{id}/tasks/`              | GET    | `work.task.list`               | —                                                                                                                                        | list[WorkTask] (tree)                              |
| `/items/{id}/tasks/reorder/`      | POST   | `work.task.reorder`            | `{ task, new_sequence, expected_version? }`                                                                                              | WorkTask                                           |
| `/tasks/{id}/`                    | GET    | `work.task.read`               | —                                                                                                                                        | WorkTask                                           |
| `/tasks/{id}/details/`            | PATCH  | `work.task.update_details`     | descriptive fields                                                                                                                       | WorkTask                                           |
| `/tasks/{id}/assignments/`        | POST   | `work.task.assign`             | assign body                                                                                                                              | WorkAssignment                                     |
| `/task-assignments/{id}/respond/` | POST   | `work.task.respond_assignment` | respond body                                                                                                                             | WorkAssignment                                     |
| `/tasks/{id}/start/`              | POST   | `work.task.start`              | `{ reason?, aggregate_version? }`                                                                                                        | WorkTask                                           |
| `/tasks/{id}/block/`              | POST   | `work.task.block`              | block body                                                                                                                               | WorkTask                                           |
| `/tasks/{id}/unblock/`            | POST   | `work.task.unblock`            | `{ resolution_note }`                                                                                                                    | WorkTask                                           |
| `/tasks/{id}/complete/`           | POST   | `work.task.complete`           | `{ reason?, aggregate_version? }`                                                                                                        | WorkTask (review_required → `review_pending`, 200) |
| `/tasks/{id}/return-uncompleted/` | POST   | `work.task.return_uncompleted` | `{ reason, report, evidence? }`                                                                                                          | WorkTask                                           |
| `/tasks/{id}/archive/`            | POST   | `work.task.archive`            | `{ reason?, aggregate_version? }`                                                                                                        | WorkTask                                           |
| `/tasks/{id}/dependencies/`       | POST   | `work.task.add_dependency`     | `{ source_task, target_task, dependency_type, reason? }`                                                                                 | WorkTaskDependency                                 |
| `/task-dependencies/{id}/end/`    | POST   | `work.task.end_dependency`     | —                                                                                                                                        | WorkTaskDependency (is_active=false)               |

### Activity · attachments · evidence · review · stakeholders · participants

| Endpoint                        | Method | Policy key                | Body                                                                                                    | Returns                                       |
| ------------------------------- | ------ | ------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------- | ------------------------------- |
| `/items/{id}/activities/`       | POST   | `work.activity.create`    | `{ activity_type, description, occurred_at, ended_at?, duration_seconds?, visibility_classification? }` | WorkActivityEntry                             |
| `/items/{id}/activities/`       | GET    | `work.activity.list`      | —                                                                                                       | list[WorkActivityEntry] (visibility-filtered) |
| `/activities/{id}/corrections/` | POST   | `work.activity.correct`   | `{ correction_reason, +corrected fields }`                                                              | WorkActivityEntry (new entry)                 |
| `/items/{id}/attachments/`      | POST   | `work.attachment.create`  | —                                                                                                       | **503 gated** (document foundation)           |
| `/items/{id}/attachments/`      | GET    | `work.attachment.list`    | —                                                                                                       | list[WorkAttachment]                          |
| `/attachments/{id}/detach/`     | POST   | `work.attachment.detach`  | `{ reason? }`                                                                                           | WorkAttachment                                |
| `/items/{id}/evidence/`         | POST   | `work.evidence.create`    | `{ evidence_type, title, text_payload?                                                                  | structured_payload?                           | external_reference?, purpose?, supersedes? }` | WorkEvidence (file types → 503) |
| `/items/{id}/evidence/`         | GET    | `work.evidence.list`      | —                                                                                                       | list[WorkEvidence]                            |
| `/evidence/{id}/verify/`        | POST   | `work.evidence.verify`    | `{ verification_remarks? }`                                                                             | WorkEvidence (not own; not resolved)          |
| `/evidence/{id}/reject/`        | POST   | `work.evidence.reject`    | `{ verification_remarks? }`                                                                             | WorkEvidence                                  |
| `/items/{id}/reviews/`          | GET    | `work.review.list`        | —                                                                                                       | list[WorkReviewRound]                         |
| `/reviews/{id}/comments/`       | POST   | `work.review.comment`     | `{ comment_type, body, parent_comment?, correction_reference?, visibility_classification? }`            | WorkReviewComment                             |
| `/reviews/{id}/decide/`         | POST   | `work.review.decide`      | `{ decision, decision_remarks?, idempotency_key? }`                                                     | WorkReviewRound (self-review→403; stale→409)  |
| `/items/{id}/stakeholders/`     | POST   | `work.stakeholder.create` | stakeholder fields                                                                                      | WorkStakeholder                               |
| `/stakeholders/{id}/`           | PATCH  | `work.stakeholder.update` | stakeholder fields                                                                                      | WorkStakeholder                               |
| `/stakeholders/{id}/notify/`    | POST   | `work.stakeholder.notify` | `{ template_reference, approved_by }`                                                                   | (approved templates only)                     |
| `/items/{id}/participants/`     | POST   | `work.participant.add`    | `{ actor, role, reason?, visibility_limit? }`                                                           | WorkParticipant                               |
| `/participants/{id}/end/`       | POST   | `work.participant.end`    | `{ reason? }`                                                                                           | WorkParticipant (active_to set)               |

Stakeholder contact/consent fields (`approved_contact_channels`, `consent_metadata`, `notification_preference`) are **omitted from reads** for non-owner/creator/superuser callers.

### Dashboards

| Endpoint                               | Method | Policy key                               | Returns                                                                     |
| -------------------------------------- | ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| `/my/active/`                          | GET    | `work.work_item.list_my`                 | list[WorkItem]                                                              |
| `/my/pending-assignments/`             | GET    | `work.assignment.list_my_pending`        | list[WorkAssignment]                                                        |
| `/my/pending-reviews/`                 | GET    | `work.review.list_my_pending`            | list[WorkReviewRound]                                                       |
| `/units/{unit_id}/queue/`              | GET    | `work.work_item.list_unit_queue`         | `{ pending_assignments, pending_routes }` — non-leader→404, throttle 60/min |
| `/units/{unit_id}/hierarchy-overview/` | GET    | `work.work_item.list_hierarchy_overview` | overview — non-leader→404, throttle 60/min                                  |

## DTO types

```ts
// Response-only shared shapes
export interface BikramSambatDate {
  year: number;
  month: number;
  day: number;
  month_name_en: string;
  month_name_np: string;
  display_en: string;
  display_np: string;
}
export interface HierarchyPreview {
  strategy: HierarchyStrategy;
  resolved_target_actor: string | null;
  resolved_target_unit: string | null;
  unit_ancestry_path: string[];
  authority_path: string[];
  delegation_id: string | null;
  effective_at: string;
  reason: string | null;
}

export interface WorkItem {
  id: string;
  reference_number: string; // ASCII, immutable, org-scoped
  organization: string;
  responsible_unit: string;
  created_by: string; // immutable creator
  current_owner: string; // changes only via ownership-transfer
  title_np: string;
  title_en?: string;
  title_romanized: string; // auto
  objective: string;
  description?: string;
  priority: WorkPriority;
  visibility_mode: VisibilityMode;
  sensitivity_level: SensitivityLevel;
  status: WorkStatus;
  review_required: boolean;
  is_reassignment_required: boolean;
  due_at: string | null;
  due_at_bs?: BikramSambatDate | null;
  accepted_at: string | null;
  accepted_at_bs?: BikramSambatDate | null;
  started_at: string | null;
  started_at_bs?: BikramSambatDate | null;
  closed_at: string | null;
  closed_at_bs?: BikramSambatDate | null;
  archived_at: string | null;
  aggregate_version: number; // optimistic concurrency
  created_at: string;
  updated_at: string;
}

export interface WorkTask {
  id: string;
  work: string;
  parent_task: string | null; // null = top-level
  sequence: number;
  title_np: string;
  title_en?: string;
  title_romanized: string;
  description?: string;
  task_type?: string | null;
  responsible_unit: string;
  current_assignee: string | null;
  status: TaskStatus;
  priority: WorkPriority;
  is_mandatory: boolean;
  review_required: boolean;
  due_at: string | null;
  due_at_bs?: BikramSambatDate | null;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  aggregate_version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkAssignment {
  id: string;
  work: string;
  task: string | null;
  category: AssignmentCategory;
  target_type: AssignmentTargetType;
  target_actor: string | null;
  target_unit: string | null;
  target_position: string | null;
  resolved_actor: string | null;
  issued_by: string;
  status: AssignmentStatus;
  reason?: string | null;
  response_remarks?: string | null;
  recommended_unit: string | null;
  recommended_actor: string | null;
  hierarchy_resolution: string | null;
  previous_assignment: string | null;
  issued_at: string;
  responded_at: string | null;
  effective_at: string | null;
  ended_at: string | null;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkParticipant {
  id: string;
  work: string;
  task: string | null;
  actor: string;
  role: ParticipantRole;
  added_by: string;
  active_from: string;
  active_to: string | null;
  reason?: string | null;
  visibility_limit?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOwnershipTransfer {
  id: string;
  work: string;
  current_owner: string;
  proposed_owner: string;
  current_unit: string;
  proposed_unit: string | null;
  initiated_by: string;
  status: OwnershipTransferStatus;
  reason: string;
  decision_remarks?: string | null;
  decided_by: string | null;
  hierarchy_resolution: string | null;
  requested_at: string;
  expires_at: string | null;
  decided_at: string | null;
  effective_at: string | null;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkRoutingRecord {
  id: string;
  work: string;
  task: string | null;
  from_actor: string | null;
  from_unit: string | null;
  proposed_target_actor: string | null;
  proposed_target_unit: string | null;
  resolved_recipient: string | null;
  route_reason: string;
  status: RoutingStatus;
  hop_number: number;
  previous_route: string | null;
  loop_metadata: Record<string, unknown>;
  hierarchy_resolution: string | null;
  created_at: string;
  decided_at: string | null;
}

export interface WorkBlockerRecord {
  id: string;
  work: string;
  task: string | null;
  blocker_type: BlockerType;
  description: string;
  waiting_on_actor: string | null;
  waiting_on_unit: string | null;
  expected_resolution_date: string | null;
  reported_by: string;
  reported_at: string;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkActivityEntry {
  id: string;
  work: string;
  task: string | null;
  actor: string;
  actor_context_snapshot: Record<string, unknown>;
  activity_type: ActivityType;
  description: string;
  occurred_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  recorded_at: string;
  source_type: ActivitySourceType;
  visibility_classification: VisibilityClassification;
  correction_of: string | null;
  correction_reason?: string | null;
  is_submitted: boolean;
  created_at: string;
}

export interface WorkReviewRound {
  id: string;
  work: string;
  task: string | null;
  round_number: number;
  requested_by: string;
  reviewer: string;
  decision: ReviewDecision | null;
  submission_summary?: string | null;
  snapshot_payload: Record<string, unknown>;
  snapshot_schema_version: number;
  requested_at: string;
  decided_at: string | null;
  decision_remarks?: string | null;
  hierarchy_resolution: string | null;
  is_superseded: boolean;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkReviewComment {
  id: string;
  review_round: string;
  actor: string;
  comment_type: ReviewCommentType;
  body: string;
  parent_comment: string | null;
  correction_reference: string | null;
  visibility_classification: VisibilityClassification;
  created_at: string;
}

export interface WorkClosure {
  id: string;
  work: string;
  closure_version: number;
  outcome: ClosureOutcome;
  closure_summary: string;
  reason?: string | null;
  completed_scope?: string | null;
  unresolved_scope?: string | null;
  unresolved_task_snapshot: Record<string, unknown>;
  supporting_evidence_snapshot: Record<string, unknown>;
  canonical_reference?: string | null;
  replacement_reference?: string | null;
  proposed_by: string | null;
  closed_by: string | null;
  proposed_at: string | null;
  closed_at: string | null;
  hierarchy_resolution: string | null;
  external_notification_required: boolean;
  reopened_at: string | null;
  reopened_by: string | null;
  reopen_reason?: string | null;
  superseded_closure: string | null;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}

// Privileged reads (owner/creator/superuser) also include: approved_contact_channels, consent_metadata, notification_preference
export interface WorkStakeholder {
  id: string;
  work: string;
  stakeholder_type: StakeholderType;
  display_name_np: string;
  display_name_en?: string;
  display_name_romanized: string;
  internal_reference_number?: string | null;
  relationship_to_work?: string | null;
  approved_contact_channels?: Record<string, unknown>; // privileged-only
  preferred_language?: string | null;
  notification_preference?: string | null; // privileged-only
  consent_metadata?: Record<string, unknown>; // privileged-only
  is_notification_eligible: boolean;
  sensitivity_classification: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkEvidence {
  id: string;
  work: string;
  task: string | null;
  activity: string | null;
  submitted_by: string;
  submitted_at: string;
  evidence_type: EvidenceType;
  title: string;
  description?: string | null;
  purpose?: string | null;
  text_payload?: string | null;
  structured_payload: Record<string, unknown>;
  external_reference?: string | null;
  document_id: string | null;
  version_number: number;
  verification_status: EvidenceStatus;
  verified_by: string | null;
  rejected_by: string | null;
  verified_at: string | null;
  rejected_at: string | null;
  verification_remarks?: string | null;
  sensitivity_classification: string;
  visibility_classification: VisibilityClassification;
  supersedes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkTaskDependency {
  id: string;
  work: string;
  source_task: string;
  target_task: string;
  dependency_type: TaskDependencyType;
  reason?: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkAttachment {
  id: string;
  work: string;
  task: string | null;
  activity: string | null;
  evidence: string | null;
  review_round: string | null;
  closure: string | null;
  document_id: string;
  document_version_id: string | null;
  attachment_role: AttachmentRole;
  is_primary: boolean;
  attached_by: string;
  attached_at: string;
  detached_by: string | null;
  detached_at: string | null;
  attachment_reason?: string | null;
  visibility_classification: VisibilityClassification;
  sensitivity_classification: string;
  source_document_service: string;
  checksum_snapshot: string;
  mime_type_snapshot: string;
  size_snapshot: number | null;
  created_at: string;
  updated_at: string;
}
// WorkMetricsFacts + WorkOutboxEvent + WorkEvidenceLink + WorkHierarchyResolution + WorkStatusTransition:
// see docs/backend/work/DATA_CONTRACT.md — not client-consumed by the current UI (no HTTP endpoint / internal).
```

## Enums

```ts
export type WorkStatus =
  | "assignment_pending"
  | "accepted"
  | "in_progress"
  | "blocked"
  | "review_pending"
  | "changes_requested"
  | "closure_pending"
  | "closed"
  | "archived";
export type TaskStatus =
  | "not_started"
  | "assignment_pending"
  | "accepted"
  | "in_progress"
  | "blocked"
  | "review_pending"
  | "changes_requested"
  | "completed"
  | "returned_uncompleted"
  | "cancelled"
  | "archived";
export type WorkPriority = "low" | "normal" | "high" | "urgent" | "critical";
export type VisibilityMode =
  | "organizational"
  | "participants_only"
  | "restricted"
  | "confidential"
  | "explicit";
export type SensitivityLevel = "normal" | "restricted" | "confidential";
export type VisibilityClassification = "normal" | "restricted" | "confidential"; // nested-record axis
export type AssignmentCategory =
  | "accountable_owner"
  | "executor"
  | "reviewer"
  | "contributor"
  | "observer";
export type AssignmentTargetType = "actor" | "unit" | "position";
export type AssignmentStatus =
  | "pending"
  | "accepted"
  | "rejected_out_of_scope"
  | "clarification_requested"
  | "cancelled"
  | "expired"
  | "revoked"
  | "ended";
export type ParticipantRole = "contributor" | "reviewer" | "observer";
export type OwnershipTransferStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "expired";
export type RoutingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "clarification_requested"
  | "escalated"
  | "cancelled";
export type HierarchyStrategy =
  | "explicit_target"
  | "reporting_line_supervisor"
  | "unit_head"
  | "ancestor_unit_head"
  | "root_head"
  | "delegated"
  | "unresolved";
export type BlockerType =
  | "internal_dependency"
  | "external_party"
  | "missing_information"
  | "missing_authority"
  | "resource_unavailable"
  | "technical_issue"
  | "review_wait"
  | "cross_unit_wait"
  | "legal_or_policy_hold"
  | "other";
export type ActivityType =
  | "progress_update"
  | "work_performed"
  | "decision"
  | "communication"
  | "meeting"
  | "research"
  | "field_activity"
  | "document_prepared"
  | "information_requested"
  | "information_received"
  | "blocker_reported"
  | "dependency_resolved"
  | "submission"
  | "review_response"
  | "correction"
  | "system_activity";
export type ActivitySourceType = "human" | "system" | "ai_draft";
export type TaskDependencyType =
  | "finish_to_start"
  | "start_to_start"
  | "informational"
  | "external_blocker";
export type EvidenceType =
  | "text_statement"
  | "document_reference"
  | "image_reference"
  | "external_reference"
  | "structured_payload"
  | "generated_output"
  | "approval_record"
  | "communication_record";
export type EvidenceStatus =
  | "submitted"
  | "pending_verification"
  | "verified"
  | "rejected"
  | "superseded"
  | "invalid";
export type ReviewDecision =
  | "approved"
  | "approved_with_remarks"
  | "changes_requested"
  | "rejected"
  | "returned_without_review";
export type ReviewCommentType =
  | "general"
  | "required_change"
  | "question"
  | "clarification"
  | "correction";
export type ClosureOutcome =
  | "completed"
  | "partially_completed"
  | "not_completed"
  | "cancelled"
  | "duplicate"
  | "superseded"
  | "out_of_scope"
  | "withdrawn";
export type StakeholderType =
  | "complainant"
  | "applicant"
  | "citizen"
  | "vendor"
  | "partner_institution"
  | "witness"
  | "beneficiary"
  | "reporting_party"
  | "other";
export type AttachmentRole =
  | "primary_supporting"
  | "supplementary"
  | "reference"
  | "submission"
  | "review_artifact"
  | "closure_artifact";
```

## Error codes → UI state

| Code                                                                                                               | HTTP | UI state                                                               |
| ------------------------------------------------------------------------------------------------------------------ | ---- | ---------------------------------------------------------------------- |
| (unauthenticated)                                                                                                  | 401  | api-client auto-refreshes once; on failure → sign-in                   |
| `WORK_PERMISSION_DENIED`                                                                                           | 403  | permission-denied state ("You don't have access")                      |
| `WORK_RESOURCE_NOT_VISIBLE` / `WORK_SENSITIVITY_ACCESS_DENIED`                                                     | 403  | permission-denied state                                                |
| `WORK_ITEM_NOT_FOUND` / `WORK_TASK_NOT_FOUND` / `WORK_*_NOT_FOUND`                                                 | 404  | not-found state — **never** "denied" (anti-enumeration)                |
| `WORK_VERSION_CONFLICT`                                                                                            | 409  | "changed elsewhere" — refetch + let user retry; never silent overwrite |
| `WORK_INVALID_STATUS_TRANSITION` / `WORK_ARCHIVED`                                                                 | 409  | disabled/blocked action + explain                                      |
| `WORK_IDEMPOTENCY_CONFLICT`                                                                                        | 409  | duplicate submit — surface, don't retry blindly                        |
| `WORK_ASSIGNMENT_ALREADY_RESOLVED` / `WORK_OWNERSHIP_TRANSFER_ALREADY_RESOLVED` / `WORK_EVIDENCE_ALREADY_RESOLVED` | 409  | already-decided — refetch                                              |
| `WORK_ROUTING_LOOP_DETECTED` / `WORK_ROUTING_HOP_LIMIT_EXCEEDED`                                                   | 409  | routing feedback (offer override_reason for reverse)                   |
| `WORK_TASK_CYCLE_DETECTED` / `WORK_TASK_DEPENDENCY_CYCLE`                                                          | 409  | inline validation error                                                |
| `WORK_HIERARCHY_TARGET_UNRESOLVED`                                                                                 | 409  | "no eligible target" feedback                                          |
| `WORK_SELF_REVIEW_FORBIDDEN`                                                                                       | 403  | reviewer-cannot-be-author message                                      |
| `WORK_REVIEW_SNAPSHOT_STALE`                                                                                       | 409  | "submission changed — re-request review"                               |
| `WORK_REVIEW_REQUIRED`                                                                                             | 409  | "requires review before this action"                                   |
| `WORK_OWNER_INELIGIBLE` / `WORK_OWNER_REQUIRED`                                                                    | 422  | inline field/validation error                                          |
| `WORK_ASSIGNMENT_TARGET_INVALID` / `WORK_TASK_PARENT_INVALID` / `WORK_TASK_DEPTH_EXCEEDED`                         | 422  | inline validation error                                                |
| `WORK_CLOSURE_REQUIREMENTS_UNMET` / `WORK_CLOSURE_OUTCOME_INVALID`                                                 | 422  | show outcome-specific required fields                                  |
| `WORK_DEADLINE_EXTENSION_REASON_REQUIRED` / `WORK_EVIDENCE_INVALID`                                                | 422  | inline validation error                                                |
| `WORK_VISIBILITY_MODE_UNSUPPORTED`                                                                                 | 422  | disable restricted/confidential/explicit visibility in create (gated)  |
| `WORK_EXTERNAL_NOTIFICATION_NOT_APPROVED`                                                                          | 403  | notify blocked until approved template                                 |
| `WORK_DOCUMENT_INTEGRATION_UNAVAILABLE` / `WORK_FILE_INTEGRATION_UNAVAILABLE`                                      | 503  | **gated feature** — render disabled control + explanatory tooltip      |

## Gaps & assumptions

Surfaced verbatim from the backend docs — these are questions for the user, not invented answers:

1. **Gated features (permanent until a future foundation):** attachment creation + file-backed evidence (`document_reference`/`image_reference` type or any `document_id`) → `503 WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`. Text/structured/external evidence and the attachment/evidence **lists** work. UI must render these as disabled-with-explanation, not broken. The concrete `document_id` contract is **not yet pinned**.
2. **Visibility creation gated:** creating work with `restricted`/`confidential`/`explicit` visibility → `422 WORK_VISIBILITY_MODE_UNSUPPORTED`. Only `organizational`/`participants_only` are creatable. `explicit` needs a future resource-access contract.
3. **Cursor-pagination cutover** for large activity/attachment/evidence timelines is a documented policy but the **exact row-count threshold is not fixed** — assume page-number pagination; handle a possible `next`-cursor shape defensively.
4. **Metrics facts have no endpoint** (`get_work_metrics_facts` selector feeds the future `evaluation` app). The dashboard cannot fetch per-work metrics via HTTP; only the 5 dashboard list endpoints exist.
5. **Unit-scope dashboards** (`/units/{id}/queue/`, `/hierarchy-overview/`) require leadership visibility → non-leader gets generic `404`; both carry a `work_dashboard` throttle (60/min). The frontend needs a way to know which units the actor leads (not provided by this contract — likely from `organization`/`/auth/me`; **confirm source**).
6. **Task `complete` on a review-required task** returns `200` with status `review_pending` (not an error) — the UI must treat this as "submitted for review", not "completed".
7. **Evidence supersession** has no endpoint — submit with `supersedes`; a submitter cannot verify/reject their own evidence (`WORK_EVIDENCE_INVALID`).
8. **Actor/unit fields are opaque UUIDs** (`current_owner`, `responsible_unit`, `resolved_actor`, …). This contract does **not** include user/unit display names — the UI needs a source to resolve UUID → name/avatar (`authenticate`/`organization` endpoints or an embedded expansion; **confirm** — the mock UI's officer names/avatars have no backend source here).

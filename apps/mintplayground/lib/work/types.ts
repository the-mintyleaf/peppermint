/**
 * Work-domain DTOs — field-for-field from docs/api-contracts/work.md (backend
 * v1.5.0), themselves traced to docs/backend/work/DATA_CONTRACT.md. UUID and
 * datetime are `string`; nullable → `| null`; response-optional → `?`. No field
 * the backend doesn't document. Internal-only models (WorkOutboxEvent,
 * WorkHierarchyResolution, WorkStatusTransition, WorkEvidenceLink, MetricsFacts)
 * are omitted — no client HTTP surface consumes them.
 */

import type {
  ActivitySourceType,
  ActivityType,
  AssignmentCategory,
  AssignmentStatus,
  AssignmentTargetType,
  AttachmentRole,
  BlockerType,
  ClosureOutcome,
  EvidenceStatus,
  EvidenceType,
  HierarchyStrategy,
  OwnershipTransferStatus,
  ParticipantRole,
  ReviewCommentType,
  ReviewDecision,
  RoutingStatus,
  SensitivityLevel,
  StakeholderType,
  TaskDependencyType,
  TaskStatus,
  VisibilityClassification,
  VisibilityMode,
  WorkPriority,
  WorkStatus,
} from "./enums";

/** Paired Bikram Sambat representation emitted for every user-facing date. */
export interface BikramSambatDate {
  year: number;
  month: number;
  day: number;
  month_name_en: string;
  month_name_np: string;
  display_en: string;
  display_np: string;
}

/** Read-only dry run of the hierarchy resolver (`GET /items/{id}/hierarchy-preview/`). */
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
  reference_number: string;
  organization: string;
  responsible_unit: string;
  created_by: string;
  current_owner: string;
  title_np: string;
  title_en?: string;
  title_romanized: string;
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
  aggregate_version: number;
  created_at: string;
  updated_at: string;
}

export interface WorkTask {
  id: string;
  work: string;
  parent_task: string | null;
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

/**
 * Base stakeholder shape (non-privileged read). Contact/consent fields are
 * present only on privileged reads (owner/creator/superuser) — modeled as
 * optional so a single interface covers both serializers.
 */
export interface WorkStakeholder {
  id: string;
  work: string;
  stakeholder_type: StakeholderType;
  display_name_np: string;
  display_name_en?: string;
  display_name_romanized: string;
  internal_reference_number?: string | null;
  relationship_to_work?: string | null;
  preferred_language?: string | null;
  is_notification_eligible: boolean;
  sensitivity_classification: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // privileged-only (omitted from non-owner/creator/superuser reads):
  approved_contact_channels?: Record<string, unknown>;
  notification_preference?: string | null;
  consent_metadata?: Record<string, unknown>;
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

/** Paginated list envelope after api-client unwrap: `response.data` for a list. */
export interface PaginatedMeta {
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
}
export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
}

/** UI-shaped page (the `.api.ts` layer maps `meta.count` → `total`). */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

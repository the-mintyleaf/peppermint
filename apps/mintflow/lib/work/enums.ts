/**
 * Frozen work-domain enums — the single source of truth for every value the
 * backend `work` app emits or accepts. Mirrors docs/api-contracts/work.md
 * (backend v1.5.0). Value arrays exist for iteration (tabs, columns, selects);
 * label maps give human copy. Visual token mapping (badge colors) stays in each
 * module's presentational layer — this file is pure domain, no design tokens.
 */

export const WORK_STATUS = [
  "assignment_pending",
  "accepted",
  "in_progress",
  "blocked",
  "review_pending",
  "changes_requested",
  "closure_pending",
  "closed",
  "archived",
] as const;
export type WorkStatus = (typeof WORK_STATUS)[number];

export const WORK_STATUS_LABEL: Record<WorkStatus, string> = {
  assignment_pending: "Assignment pending",
  accepted: "Accepted",
  in_progress: "In progress",
  blocked: "Blocked",
  review_pending: "Review pending",
  changes_requested: "Changes requested",
  closure_pending: "Closure pending",
  closed: "Closed",
  archived: "Archived",
};

export const TASK_STATUS = [
  "not_started",
  "assignment_pending",
  "accepted",
  "in_progress",
  "blocked",
  "review_pending",
  "changes_requested",
  "completed",
  "returned_uncompleted",
  "cancelled",
  "archived",
] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: "Not started",
  assignment_pending: "Assignment pending",
  accepted: "Accepted",
  in_progress: "In progress",
  blocked: "Blocked",
  review_pending: "Review pending",
  changes_requested: "Changes requested",
  completed: "Completed",
  returned_uncompleted: "Returned uncompleted",
  cancelled: "Cancelled",
  archived: "Archived",
};

export const WORK_PRIORITY = [
  "low",
  "normal",
  "high",
  "urgent",
  "critical",
] as const;
export type WorkPriority = (typeof WORK_PRIORITY)[number];

export const WORK_PRIORITY_LABEL: Record<WorkPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
  critical: "Critical",
};

export const VISIBILITY_MODE = [
  "organizational",
  "participants_only",
  "restricted",
  "confidential",
  "explicit",
] as const;
export type VisibilityMode = (typeof VISIBILITY_MODE)[number];

/** Visibility modes a caller may set at create time; the rest are backend-gated. */
export const CREATABLE_VISIBILITY_MODES: readonly VisibilityMode[] = [
  "organizational",
  "participants_only",
];

export const VISIBILITY_MODE_LABEL: Record<VisibilityMode, string> = {
  organizational: "Organizational",
  participants_only: "Participants only",
  restricted: "Restricted",
  confidential: "Confidential",
  explicit: "Explicit",
};

export const SENSITIVITY_LEVEL = [
  "normal",
  "restricted",
  "confidential",
] as const;
export type SensitivityLevel = (typeof SENSITIVITY_LEVEL)[number];

/** Independent per-record visibility axis on activity/evidence/attachment/comment. */
export type VisibilityClassification = SensitivityLevel;

export const ASSIGNMENT_CATEGORY = [
  "accountable_owner",
  "executor",
  "reviewer",
  "contributor",
  "observer",
] as const;
export type AssignmentCategory = (typeof ASSIGNMENT_CATEGORY)[number];

export const ASSIGNMENT_TARGET_TYPE = ["actor", "unit", "position"] as const;
export type AssignmentTargetType = (typeof ASSIGNMENT_TARGET_TYPE)[number];

export const ASSIGNMENT_STATUS = [
  "pending",
  "accepted",
  "rejected_out_of_scope",
  "clarification_requested",
  "cancelled",
  "expired",
  "revoked",
  "ended",
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUS)[number];

export const PARTICIPANT_ROLE = [
  "contributor",
  "reviewer",
  "observer",
] as const;
export type ParticipantRole = (typeof PARTICIPANT_ROLE)[number];

export const OWNERSHIP_TRANSFER_STATUS = [
  "requested",
  "accepted",
  "rejected",
  "cancelled",
  "expired",
] as const;
export type OwnershipTransferStatus =
  (typeof OWNERSHIP_TRANSFER_STATUS)[number];

export const ROUTING_STATUS = [
  "pending",
  "accepted",
  "rejected",
  "clarification_requested",
  "escalated",
  "cancelled",
] as const;
export type RoutingStatus = (typeof ROUTING_STATUS)[number];

export const HIERARCHY_STRATEGY = [
  "explicit_target",
  "reporting_line_supervisor",
  "unit_head",
  "ancestor_unit_head",
  "root_head",
  "delegated",
  "unresolved",
] as const;
export type HierarchyStrategy = (typeof HIERARCHY_STRATEGY)[number];

export const BLOCKER_TYPE = [
  "internal_dependency",
  "external_party",
  "missing_information",
  "missing_authority",
  "resource_unavailable",
  "technical_issue",
  "review_wait",
  "cross_unit_wait",
  "legal_or_policy_hold",
  "other",
] as const;
export type BlockerType = (typeof BLOCKER_TYPE)[number];

export const ACTIVITY_TYPE = [
  "progress_update",
  "work_performed",
  "decision",
  "communication",
  "meeting",
  "research",
  "field_activity",
  "document_prepared",
  "information_requested",
  "information_received",
  "blocker_reported",
  "dependency_resolved",
  "submission",
  "review_response",
  "correction",
  "system_activity",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPE)[number];

export const ACTIVITY_SOURCE_TYPE = ["human", "system", "ai_draft"] as const;
export type ActivitySourceType = (typeof ACTIVITY_SOURCE_TYPE)[number];

export const TASK_DEPENDENCY_TYPE = [
  "finish_to_start",
  "start_to_start",
  "informational",
  "external_blocker",
] as const;
export type TaskDependencyType = (typeof TASK_DEPENDENCY_TYPE)[number];

export const EVIDENCE_TYPE = [
  "text_statement",
  "document_reference",
  "image_reference",
  "external_reference",
  "structured_payload",
  "generated_output",
  "approval_record",
  "communication_record",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPE)[number];

/** Evidence types the backend accepts directly; the rest are document-foundation gated. */
export const NON_GATED_EVIDENCE_TYPES: readonly EvidenceType[] = [
  "text_statement",
  "external_reference",
  "structured_payload",
  "generated_output",
  "approval_record",
  "communication_record",
];

export const EVIDENCE_STATUS = [
  "submitted",
  "pending_verification",
  "verified",
  "rejected",
  "superseded",
  "invalid",
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUS)[number];

export const REVIEW_DECISION = [
  "approved",
  "approved_with_remarks",
  "changes_requested",
  "rejected",
  "returned_without_review",
] as const;
export type ReviewDecision = (typeof REVIEW_DECISION)[number];

export const REVIEW_COMMENT_TYPE = [
  "general",
  "required_change",
  "question",
  "clarification",
  "correction",
] as const;
export type ReviewCommentType = (typeof REVIEW_COMMENT_TYPE)[number];

export const CLOSURE_OUTCOME = [
  "completed",
  "partially_completed",
  "not_completed",
  "cancelled",
  "duplicate",
  "superseded",
  "out_of_scope",
  "withdrawn",
] as const;
export type ClosureOutcome = (typeof CLOSURE_OUTCOME)[number];

export const STAKEHOLDER_TYPE = [
  "complainant",
  "applicant",
  "citizen",
  "vendor",
  "partner_institution",
  "witness",
  "beneficiary",
  "reporting_party",
  "other",
] as const;
export type StakeholderType = (typeof STAKEHOLDER_TYPE)[number];

export const ATTACHMENT_ROLE = [
  "primary_supporting",
  "supplementary",
  "reference",
  "submission",
  "review_artifact",
  "closure_artifact",
] as const;
export type AttachmentRole = (typeof ATTACHMENT_ROLE)[number];

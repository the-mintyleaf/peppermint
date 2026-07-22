/**
 * Named-command fetchers for the `work` backend — task-level commands first
 * (work-item lifecycle commands are added in the lifecycle slice). Every mutation
 * is a named endpoint (no generic PATCH status=); optimistic concurrency rides on
 * `aggregate_version` / `expected_version`. Types come from the frozen `@/lib/work`
 * contract. Wrapped for the UI by `cases.mutations.ts`.
 */

import api from "@/lib/api";
import type {
  ActivityType,
  AssignmentCategory,
  AssignmentTargetType,
  BlockerType,
  ClosureOutcome,
  EvidenceType,
  ReviewCommentType,
  ReviewDecision,
  SensitivityLevel,
  VisibilityClassification,
  VisibilityMode,
  WorkActivityEntry,
  WorkAssignment,
  WorkEvidence,
  WorkItem,
  WorkPriority,
  WorkReviewComment,
  WorkReviewRound,
  WorkTask,
} from "@/lib/work";

/** Body accepted by the simple "reason + version" commands. */
export interface VersionedCommand {
  reason?: string;
  aggregate_version?: number;
}

/* ── Work-item creation ───────────────────────────────────────────────────── */

/**
 * Create body for `POST /items/` (contract §1.1). Creator becomes owner
 * (status `accepted`) unless `proposed_owner`/`target_unit` is given, which
 * routes the new work to `assignment_pending`. `visibility_mode` is limited to
 * the creatable modes (`organizational`/`participants_only`) — the rest are
 * backend-gated (`WORK_VISIBILITY_MODE_UNSUPPORTED`). `reference_number`,
 * `title_romanized`, `current_owner`, and `status` are server-assigned.
 */
export interface CreateWorkPayload {
  organization: string;
  responsible_unit: string;
  title_np: string;
  objective: string;
  title_en?: string;
  description?: string;
  priority?: WorkPriority;
  visibility_mode?: VisibilityMode;
  sensitivity_level?: SensitivityLevel;
  review_required?: boolean;
  due_at?: string;
  proposed_owner?: string;
  target_unit?: string;
  idempotency_key?: string;
}

export async function createWork(
  payload: CreateWorkPayload,
): Promise<WorkItem> {
  const { data } = await api.post<WorkItem>("/api/v1/work/items/", payload);
  return data;
}

/* ── Work-item lifecycle commands (form-free) ─────────────────────────────── */

export async function startWork(
  workId: string,
  payload: VersionedCommand = {},
): Promise<WorkItem> {
  const { data } = await api.post<WorkItem>(
    `/api/v1/work/items/${workId}/start/`,
    payload,
  );
  return data;
}

export async function archiveWork(
  workId: string,
  payload: VersionedCommand = {},
): Promise<WorkItem> {
  const { data } = await api.post<WorkItem>(
    `/api/v1/work/items/${workId}/archive/`,
    payload,
  );
  return data;
}

export async function restoreWork(
  workId: string,
  payload: VersionedCommand = {},
): Promise<WorkItem> {
  const { data } = await api.post<WorkItem>(
    `/api/v1/work/items/${workId}/restore/`,
    payload,
  );
  return data;
}

export async function submitWorkForReview(
  workId: string,
  payload: VersionedCommand = {},
): Promise<WorkItem> {
  const { data } = await api.post<WorkItem>(
    `/api/v1/work/items/${workId}/review/submit/`,
    payload,
  );
  return data;
}

export async function submitWorkForClosure(
  workId: string,
  payload: VersionedCommand = {},
): Promise<WorkItem> {
  const { data } = await api.post<WorkItem>(
    `/api/v1/work/items/${workId}/closure/submit/`,
    payload,
  );
  return data;
}

export interface ReasonPayload {
  reason: string;
}

export async function reopenWork(
  workId: string,
  payload: ReasonPayload,
): Promise<WorkItem> {
  const { data } = await api.post<WorkItem>(
    `/api/v1/work/items/${workId}/reopen/`,
    payload,
  );
  return data;
}

export interface DeadlineExtendPayload {
  new_due_at: string;
  reason: string;
}

export async function extendWorkDeadline(
  workId: string,
  payload: DeadlineExtendPayload,
): Promise<WorkItem> {
  const { data } = await api.post<WorkItem>(
    `/api/v1/work/items/${workId}/deadline/extend/`,
    payload,
  );
  return data;
}

export interface ClosePayload {
  outcome: ClosureOutcome;
  closure_summary: string;
  reason?: string;
  completed_scope?: string;
  unresolved_scope?: string;
}

export async function closeWork(
  workId: string,
  payload: ClosePayload,
): Promise<WorkItem> {
  const { data } = await api.post<WorkItem>(
    `/api/v1/work/items/${workId}/close/`,
    payload,
  );
  return data;
}

export interface CreateTaskPayload {
  title_np: string;
  responsible_unit: string;
  title_en?: string;
  description?: string;
  parent_task?: string;
  sequence?: number;
  task_type?: string;
  is_mandatory?: boolean;
  review_required?: boolean;
  due_at?: string;
}

export async function createTask(
  workId: string,
  payload: CreateTaskPayload,
): Promise<WorkTask> {
  const { data } = await api.post<WorkTask>(
    `/api/v1/work/items/${workId}/tasks/`,
    payload,
  );
  return data;
}

export interface UpdateTaskDetailsPayload {
  title_np?: string;
  title_en?: string;
  description?: string;
  priority?: string;
  due_at?: string | null;
}

export async function updateTaskDetails(
  taskId: string,
  payload: UpdateTaskDetailsPayload,
): Promise<WorkTask> {
  const { data } = await api.patch<WorkTask>(
    `/api/v1/work/tasks/${taskId}/details/`,
    payload,
  );
  return data;
}

export interface ReorderTaskPayload {
  task: string;
  new_sequence: number;
  expected_version?: number;
}

export async function reorderTask(
  workId: string,
  payload: ReorderTaskPayload,
): Promise<WorkTask> {
  const { data } = await api.post<WorkTask>(
    `/api/v1/work/items/${workId}/tasks/reorder/`,
    payload,
  );
  return data;
}

export async function startTask(
  taskId: string,
  payload: VersionedCommand = {},
): Promise<WorkTask> {
  const { data } = await api.post<WorkTask>(
    `/api/v1/work/tasks/${taskId}/start/`,
    payload,
  );
  return data;
}

export async function completeTask(
  taskId: string,
  payload: VersionedCommand = {},
): Promise<WorkTask> {
  const { data } = await api.post<WorkTask>(
    `/api/v1/work/tasks/${taskId}/complete/`,
    payload,
  );
  return data;
}

export interface ReturnTaskPayload {
  reason: string;
  report: string;
  evidence?: string;
}

export async function returnTaskUncompleted(
  taskId: string,
  payload: ReturnTaskPayload,
): Promise<WorkTask> {
  const { data } = await api.post<WorkTask>(
    `/api/v1/work/tasks/${taskId}/return-uncompleted/`,
    payload,
  );
  return data;
}

export async function archiveTask(
  taskId: string,
  payload: VersionedCommand = {},
): Promise<WorkTask> {
  const { data } = await api.post<WorkTask>(
    `/api/v1/work/tasks/${taskId}/archive/`,
    payload,
  );
  return data;
}

export interface BlockPayload {
  blocker_type: BlockerType;
  description: string;
  waiting_on_actor?: string;
  waiting_on_unit?: string;
  expected_resolution_date?: string;
}

export async function blockTask(
  taskId: string,
  payload: BlockPayload,
): Promise<WorkTask> {
  const { data } = await api.post<WorkTask>(
    `/api/v1/work/tasks/${taskId}/block/`,
    payload,
  );
  return data;
}

export interface UnblockPayload {
  resolution_note: string;
}

export async function unblockTask(
  taskId: string,
  payload: UnblockPayload,
): Promise<WorkTask> {
  const { data } = await api.post<WorkTask>(
    `/api/v1/work/tasks/${taskId}/unblock/`,
    payload,
  );
  return data;
}

export interface AssignPayload {
  category: AssignmentCategory;
  target_type: AssignmentTargetType;
  target_actor?: string;
  target_unit?: string;
  target_position?: string;
  reason?: string;
}

export async function assignTask(
  taskId: string,
  payload: AssignPayload,
): Promise<WorkAssignment> {
  const { data } = await api.post<WorkAssignment>(
    `/api/v1/work/tasks/${taskId}/assignments/`,
    payload,
  );
  return data;
}

/* ── Activity ─────────────────────────────────────────────────────────────── */

export interface RecordActivityPayload {
  activity_type: ActivityType;
  description: string;
  occurred_at: string;
  ended_at?: string;
  duration_seconds?: number;
  visibility_classification?: VisibilityClassification;
}

export async function recordActivity(
  workId: string,
  payload: RecordActivityPayload,
): Promise<WorkActivityEntry> {
  const { data } = await api.post<WorkActivityEntry>(
    `/api/v1/work/items/${workId}/activities/`,
    payload,
  );
  return data;
}

/* ── Evidence ─────────────────────────────────────────────────────────────── */

export interface SubmitEvidencePayload {
  evidence_type: EvidenceType;
  title: string;
  text_payload?: string;
  external_reference?: string;
  structured_payload?: Record<string, unknown>;
  purpose?: string;
  supersedes?: string;
}

export async function submitEvidence(
  workId: string,
  payload: SubmitEvidencePayload,
): Promise<WorkEvidence> {
  const { data } = await api.post<WorkEvidence>(
    `/api/v1/work/items/${workId}/evidence/`,
    payload,
  );
  return data;
}

export async function verifyEvidence(
  evidenceId: string,
  payload: { verification_remarks?: string } = {},
): Promise<WorkEvidence> {
  const { data } = await api.post<WorkEvidence>(
    `/api/v1/work/evidence/${evidenceId}/verify/`,
    payload,
  );
  return data;
}

export async function rejectEvidence(
  evidenceId: string,
  payload: { verification_remarks?: string } = {},
): Promise<WorkEvidence> {
  const { data } = await api.post<WorkEvidence>(
    `/api/v1/work/evidence/${evidenceId}/reject/`,
    payload,
  );
  return data;
}

/* ── Review ───────────────────────────────────────────────────────────────── */

export interface DecideReviewPayload {
  decision: ReviewDecision;
  decision_remarks?: string;
}

export async function decideReview(
  reviewId: string,
  payload: DecideReviewPayload,
): Promise<WorkReviewRound> {
  const { data } = await api.post<WorkReviewRound>(
    `/api/v1/work/reviews/${reviewId}/decide/`,
    payload,
  );
  return data;
}

export interface AddReviewCommentPayload {
  comment_type: ReviewCommentType;
  body: string;
}

export async function addReviewComment(
  reviewId: string,
  payload: AddReviewCommentPayload,
): Promise<WorkReviewComment> {
  const { data } = await api.post<WorkReviewComment>(
    `/api/v1/work/reviews/${reviewId}/comments/`,
    payload,
  );
  return data;
}

export interface RespondAssignmentPayload {
  decision: "accept" | "reject_out_of_scope" | "request_clarification";
  reason?: string;
  recommended_unit?: string;
  recommended_actor?: string;
}

export async function respondTaskAssignment(
  assignmentId: string,
  payload: RespondAssignmentPayload,
): Promise<WorkAssignment> {
  const { data } = await api.post<WorkAssignment>(
    `/api/v1/work/task-assignments/${assignmentId}/respond/`,
    payload,
  );
  return data;
}

"use client";

import {
  notifications,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@peppermint/ui";

import { getWorkErrorMessage, workKeys } from "@/lib/work";
import {
  addReviewComment,
  archiveTask,
  archiveWork,
  blockTask,
  closeWork,
  completeTask,
  createTask,
  decideReview,
  extendWorkDeadline,
  recordActivity,
  rejectEvidence,
  reopenWork,
  reorderTask,
  restoreWork,
  returnTaskUncompleted,
  startTask,
  startWork,
  submitEvidence,
  submitWorkForClosure,
  submitWorkForReview,
  unblockTask,
  verifyEvidence,
  type AddReviewCommentPayload,
  type BlockPayload,
  type ClosePayload,
  type DecideReviewPayload,
  type CreateTaskPayload,
  type DeadlineExtendPayload,
  type ReasonPayload,
  type RecordActivityPayload,
  type ReorderTaskPayload,
  type ReturnTaskPayload,
  type SubmitEvidencePayload,
  type UnblockPayload,
  type VersionedCommand,
} from "./cases.commands";

/**
 * Standard work-command mutation: runs the named command, then invalidates the
 * affected queries and surfaces a success/error notification. Errors map through
 * the frozen `getWorkErrorMessage` (409 version-conflict, 403, gated 503, …), so
 * a stale write shows "changed elsewhere — try again", never a silent overwrite.
 */
function useWorkMutation<TData, TVars>(options: {
  mutationFn: (vars: TVars) => Promise<TData>;
  successMessage: string;
  invalidateKeys: QueryKey[];
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: () => {
      options.invalidateKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );
      notifications.show({ message: options.successMessage, color: "green" });
    },
    onError: (error: unknown) => {
      notifications.show({
        message: getWorkErrorMessage(error),
        color: "red",
      });
    },
  });
}

/** Keys touched by any task command on a given work item. */
function taskKeys(workId: string): QueryKey[] {
  return [workKeys.tasks(workId), workKeys.item(workId)];
}

export function useCreateTask(workId: string) {
  return useWorkMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(workId, payload),
    successMessage: "Task created",
    invalidateKeys: taskKeys(workId),
  });
}

export function useReorderTask(workId: string) {
  return useWorkMutation({
    mutationFn: (payload: ReorderTaskPayload) => reorderTask(workId, payload),
    successMessage: "Tasks reordered",
    invalidateKeys: taskKeys(workId),
  });
}

export function useStartTask(workId: string) {
  return useWorkMutation({
    mutationFn: (vars: { taskId: string; payload?: VersionedCommand }) =>
      startTask(vars.taskId, vars.payload),
    successMessage: "Task started",
    invalidateKeys: taskKeys(workId),
  });
}

export function useCompleteTask(workId: string) {
  return useWorkMutation({
    mutationFn: (vars: { taskId: string; payload?: VersionedCommand }) =>
      completeTask(vars.taskId, vars.payload),
    successMessage: "Task completed",
    invalidateKeys: taskKeys(workId),
  });
}

export function useReturnTask(workId: string) {
  return useWorkMutation({
    mutationFn: (vars: { taskId: string; payload: ReturnTaskPayload }) =>
      returnTaskUncompleted(vars.taskId, vars.payload),
    successMessage: "Task returned",
    invalidateKeys: taskKeys(workId),
  });
}

export function useBlockTask(workId: string) {
  return useWorkMutation({
    mutationFn: (vars: { taskId: string; payload: BlockPayload }) =>
      blockTask(vars.taskId, vars.payload),
    successMessage: "Task blocked",
    invalidateKeys: taskKeys(workId),
  });
}

export function useUnblockTask(workId: string) {
  return useWorkMutation({
    mutationFn: (vars: { taskId: string; payload: UnblockPayload }) =>
      unblockTask(vars.taskId, vars.payload),
    successMessage: "Task unblocked",
    invalidateKeys: taskKeys(workId),
  });
}

export function useArchiveTask(workId: string) {
  return useWorkMutation({
    mutationFn: (vars: { taskId: string; payload?: VersionedCommand }) =>
      archiveTask(vars.taskId, vars.payload),
    successMessage: "Task archived",
    invalidateKeys: taskKeys(workId),
  });
}

/* ── Work-item lifecycle command hooks ────────────────────────────────────── */

/** Keys touched by any work-item command. */
function workItemKeys(workId: string): QueryKey[] {
  return [workKeys.item(workId), workKeys.items()];
}

export function useStartWork(workId: string) {
  return useWorkMutation({
    mutationFn: (payload?: VersionedCommand) => startWork(workId, payload),
    successMessage: "Work started",
    invalidateKeys: workItemKeys(workId),
  });
}

export function useArchiveWork(workId: string) {
  return useWorkMutation({
    mutationFn: (payload?: VersionedCommand) => archiveWork(workId, payload),
    successMessage: "Work archived",
    invalidateKeys: workItemKeys(workId),
  });
}

export function useRestoreWork(workId: string) {
  return useWorkMutation({
    mutationFn: (payload?: VersionedCommand) => restoreWork(workId, payload),
    successMessage: "Work restored",
    invalidateKeys: workItemKeys(workId),
  });
}

export function useSubmitWorkForReview(workId: string) {
  return useWorkMutation({
    mutationFn: (payload?: VersionedCommand) =>
      submitWorkForReview(workId, payload),
    successMessage: "Submitted for review",
    invalidateKeys: workItemKeys(workId),
  });
}

export function useSubmitWorkForClosure(workId: string) {
  return useWorkMutation({
    mutationFn: (payload?: VersionedCommand) =>
      submitWorkForClosure(workId, payload),
    successMessage: "Submitted for closure",
    invalidateKeys: workItemKeys(workId),
  });
}

export function useReopenWork(workId: string) {
  return useWorkMutation({
    mutationFn: (payload: ReasonPayload) => reopenWork(workId, payload),
    successMessage: "Work reopened",
    invalidateKeys: workItemKeys(workId),
  });
}

export function useExtendDeadline(workId: string) {
  return useWorkMutation({
    mutationFn: (payload: DeadlineExtendPayload) =>
      extendWorkDeadline(workId, payload),
    successMessage: "Deadline extended",
    invalidateKeys: workItemKeys(workId),
  });
}

export function useCloseWork(workId: string) {
  return useWorkMutation({
    mutationFn: (payload: ClosePayload) => closeWork(workId, payload),
    successMessage: "Work closed",
    invalidateKeys: workItemKeys(workId),
  });
}

/* ── Activity ─────────────────────────────────────────────────────────────── */

export function useRecordActivity(workId: string) {
  return useWorkMutation({
    mutationFn: (payload: RecordActivityPayload) =>
      recordActivity(workId, payload),
    successMessage: "Activity recorded",
    invalidateKeys: [workKeys.activities(workId), workKeys.item(workId)],
  });
}

/* ── Evidence ─────────────────────────────────────────────────────────────── */

export function useSubmitEvidence(workId: string) {
  return useWorkMutation({
    mutationFn: (payload: SubmitEvidencePayload) =>
      submitEvidence(workId, payload),
    successMessage: "Evidence submitted",
    invalidateKeys: [workKeys.evidence(workId)],
  });
}

export function useVerifyEvidence(workId: string) {
  return useWorkMutation({
    mutationFn: (evidenceId: string) => verifyEvidence(evidenceId),
    successMessage: "Evidence verified",
    invalidateKeys: [workKeys.evidence(workId)],
  });
}

export function useRejectEvidence(workId: string) {
  return useWorkMutation({
    mutationFn: (evidenceId: string) => rejectEvidence(evidenceId),
    successMessage: "Evidence rejected",
    invalidateKeys: [workKeys.evidence(workId)],
  });
}

/* ── Review ───────────────────────────────────────────────────────────────── */

export function useDecideReview(workId: string) {
  return useWorkMutation({
    mutationFn: (vars: { reviewId: string; payload: DecideReviewPayload }) =>
      decideReview(vars.reviewId, vars.payload),
    successMessage: "Review decided",
    invalidateKeys: [workKeys.reviews(workId), workKeys.item(workId)],
  });
}

export function useAddReviewComment(workId: string) {
  return useWorkMutation({
    mutationFn: (vars: {
      reviewId: string;
      payload: AddReviewCommentPayload;
    }) => addReviewComment(vars.reviewId, vars.payload),
    successMessage: "Comment added",
    invalidateKeys: [workKeys.reviews(workId)],
  });
}

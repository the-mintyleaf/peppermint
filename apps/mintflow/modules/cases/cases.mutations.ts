"use client";

import {
  notifications,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@peppermint/ui";

import { getWorkErrorMessage, workKeys } from "@/lib/work";
import {
  archiveTask,
  completeTask,
  createTask,
  reorderTask,
  returnTaskUncompleted,
  startTask,
  type CreateTaskPayload,
  type ReorderTaskPayload,
  type ReturnTaskPayload,
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

export function useArchiveTask(workId: string) {
  return useWorkMutation({
    mutationFn: (vars: { taskId: string; payload?: VersionedCommand }) =>
      archiveTask(vars.taskId, vars.payload),
    successMessage: "Task archived",
    invalidateKeys: taskKeys(workId),
  });
}

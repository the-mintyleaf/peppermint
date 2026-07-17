"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@peppermint/ui";
import { arrayMove } from "@dnd-kit/sortable";
import {
  createTask,
  deleteTask,
  fetchTasks,
  patchTask,
  reorderTasks,
  setTaskStatus,
  updateTask,
} from "./module.api";
import type {
  Task,
  TaskBoardFilter,
  TaskInput,
  TaskStatus,
} from "./module.api";

const TASKS_KEY = ["tasks"] as const;

export function useTasks(filter: TaskBoardFilter) {
  return useQuery({
    queryKey: ["tasks", filter],
    queryFn: () => fetchTasks(filter),
  });
}

// Board reads straight from the React Query cache. Cross-column moves and the
// final drop persist through the mutations below, so they survive a refetch or
// a board-filter switch (no local-copy shadow state). Live drag reordering is a
// cache-only preview — no network per hovered card — committed once on drop.
export function useKanbanBoard(tasks: Task[] | undefined) {
  const tasksByStatus = useMemo(() => groupByStatus(tasks ?? []), [tasks]);

  const qc = useQueryClient();
  const { mutate: moveMutate } = useMoveTask();
  const { mutate: reorderMutate } = useReorderTasks();

  const moveTask = useCallback(
    (taskId: string, _from: string, toStatus: string) =>
      moveMutate({ id: taskId, status: toStatus as TaskStatus }),
    [moveMutate],
  );

  // Live drag feedback: reorder the cache synchronously, no mutation/refetch.
  const previewReorder = useCallback(
    (activeId: string, overId: string) => {
      qc.setQueriesData<Task[]>({ queryKey: TASKS_KEY }, (old) => {
        if (!old) return old;
        const from = old.findIndex((t) => t.id === activeId);
        const to = old.findIndex((t) => t.id === overId);
        if (from === -1 || to === -1) return old;
        return arrayMove(old, from, to);
      });
    },
    [qc],
  );

  // On drop: persist the final order to the store once, then invalidate.
  const commitReorder = useCallback(
    (activeId: string, overId: string) => reorderMutate({ activeId, overId }),
    [reorderMutate],
  );

  return { tasksByStatus, moveTask, previewReorder, commitReorder };
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => createTask(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskInput }) =>
      updateTask(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

// Optimistic single/partial-field update for inline row edits.
export function useUpdateTaskFields() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) =>
      patchTask(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const prev = qc.getQueriesData<Task[]>({ queryKey: TASKS_KEY });
      qc.setQueriesData<Task[]>({ queryKey: TASKS_KEY }, (old) =>
        old ? old.map((t) => (t.id === id ? { ...t, ...patch } : t)) : old,
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) =>
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useMoveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      setTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const prev = qc.getQueriesData<Task[]>({ queryKey: TASKS_KEY });
      qc.setQueriesData<Task[]>({ queryKey: TASKS_KEY }, (old) =>
        old ? old.map((t) => (t.id === id ? { ...t, status } : t)) : old,
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) =>
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

// Persist-only: the cache is already reordered by previewReorder during the
// drag, so this just writes the final order to the store and invalidates. No
// per-hover optimistic churn.
export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ activeId, overId }: { activeId: string; overId: string }) =>
      reorderTasks(activeId, overId),
    onSettled: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const result: Record<TaskStatus, Task[]> = {
    inbox: [],
    ongoing: [],
    hold: [],
    rejected: [],
  };
  for (const task of tasks) {
    result[task.status].push(task);
  }
  return result;
}

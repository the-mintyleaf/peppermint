"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@peppermint/ui";
import { arrayMove } from "@dnd-kit/sortable";
import {
  createTask,
  deleteTask,
  fetchTasks,
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

// Board reads straight from the React Query cache; drag operations go through
// the optimistic mutations below, so a move/reorder is instant and survives a
// refetch or a board-filter switch (no local-copy shadow state).
export function useKanbanBoard(tasks: Task[] | undefined) {
  const tasksByStatus = useMemo(() => groupByStatus(tasks ?? []), [tasks]);

  const move = useMoveTask();
  const reorder = useReorderTasks();

  const moveTask = useCallback(
    (taskId: string, _from: string, toStatus: string) =>
      move.mutate({ id: taskId, status: toStatus as TaskStatus }),
    [move],
  );

  const reorderTask = useCallback(
    (activeId: string, overId: string) => reorder.mutate({ activeId, overId }),
    [reorder],
  );

  return { tasksByStatus, moveTask, reorderTask };
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

export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ activeId, overId }: { activeId: string; overId: string }) =>
      reorderTasks(activeId, overId),
    onMutate: async ({ activeId, overId }) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const prev = qc.getQueriesData<Task[]>({ queryKey: TASKS_KEY });
      qc.setQueriesData<Task[]>({ queryKey: TASKS_KEY }, (old) => {
        if (!old) return old;
        const from = old.findIndex((t) => t.id === activeId);
        const to = old.findIndex((t) => t.id === overId);
        if (from === -1 || to === -1) return old;
        return arrayMove(old, from, to);
      });
      return { prev };
    },
    onError: (_e, _vars, ctx) =>
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data)),
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

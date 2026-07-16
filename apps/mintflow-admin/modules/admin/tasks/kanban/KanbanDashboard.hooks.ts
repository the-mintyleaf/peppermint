"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@peppermint/ui";
import { arrayMove } from "@dnd-kit/sortable";
import { fetchTasks } from "./module.api";
import type { Task, TaskBoardFilter, TaskStatus } from "./module.api";

export function useTasks(filter: TaskBoardFilter) {
  return useQuery({
    queryKey: ["tasks", filter],
    queryFn: () => fetchTasks(filter),
  });
}

export function useKanbanBoard(
  tasks: Task[] | undefined,
  activeTab: TaskBoardFilter,
) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks ?? []);

  useEffect(() => {
    setLocalTasks(tasks ?? []);
  }, [activeTab, tasks]);

  const tasksByStatus = useMemo(() => groupByStatus(localTasks), [localTasks]);

  const moveTask = useCallback(
    (taskId: string, _from: string, toStatus: string) => {
      setLocalTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: toStatus as TaskStatus } : t,
        ),
      );
    },
    [],
  );

  const reorderTask = useCallback((activeId: string, overId: string) => {
    setLocalTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      const overIndex = prev.findIndex((t) => t.id === overId);
      if (activeIndex === -1 || overIndex === -1) return prev;
      return arrayMove(prev, activeIndex, overIndex);
    });
  }, []);

  return { tasksByStatus, moveTask, reorderTask };
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

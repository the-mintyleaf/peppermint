"use client";

import { useCallback, useMemo, useState } from "react";
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

  // Reset the local (drag-reorderable) copy whenever the source tasks or the active
  // tab change. Done during render via a stored key — React's documented replacement
  // for a setState-in-effect sync, avoiding the extra commit + cascading render.
  const [syncKey, setSyncKey] = useState<{
    activeTab: TaskBoardFilter;
    tasks: Task[] | undefined;
  }>({ activeTab, tasks });
  if (syncKey.activeTab !== activeTab || syncKey.tasks !== tasks) {
    setSyncKey({ activeTab, tasks });
    setLocalTasks(tasks ?? []);
  }

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

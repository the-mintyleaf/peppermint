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

  // Reset the local (drag-reorderable) copy whenever the board filter or the
  // fetched task set changes. Done during render per React's "you might not
  // need an effect" guidance — avoids a setState-in-effect render cascade while
  // preserving the previous effect's behavior exactly.
  const [synced, setSynced] = useState<{
    tab: TaskBoardFilter;
    tasks: Task[] | undefined;
  }>({ tab: activeTab, tasks });
  if (synced.tab !== activeTab || synced.tasks !== tasks) {
    setSynced({ tab: activeTab, tasks });
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

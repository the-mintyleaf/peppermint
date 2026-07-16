"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { notifications } from "@peppermint/ui";

import { addDays, addMonths, dayKey, REFERENCE_TODAY } from "./Calendar.utils";
import { fetchTasks } from "./module.api";
import type { Task, TaskBoardFilter } from "./module.api";

export type CalendarView = "month" | "week";

/** Tasks for the calendar, scoped by the board filter (All / Mine / …). */
export function useCalendarTasks(filter: TaskBoardFilter) {
  return useQuery({
    queryKey: ["calendar", "tasks", filter],
    queryFn: () => fetchTasks(filter),
  });
}

export interface CalendarNav {
  anchor: Date;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  next: () => void;
  prev: () => void;
  today: () => void;
}

/**
 * Owns the visible date window. Seeds to REFERENCE_TODAY so the mock tasks are
 * in view; prev/next step by a month or a week depending on the active view.
 */
export function useCalendarNav(): CalendarNav {
  const [anchor, setAnchor] = useState<Date>(REFERENCE_TODAY);
  const [view, setView] = useState<CalendarView>("month");

  const step = useCallback(
    (dir: 1 | -1) =>
      setAnchor((prev) =>
        view === "month" ? addMonths(prev, dir) : addDays(prev, dir * 7),
      ),
    [view],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);
  const today = useCallback(() => setAnchor(REFERENCE_TODAY), []);

  return { anchor, view, setView, next, prev, today };
}

export interface TasksByDay {
  /** dayKey → tasks due that day. */
  byDay: Map<string, Task[]>;
  /** tasks with no due date, excluded from the grid. */
  unscheduled: Task[];
}

/** Bucket tasks onto their due day (`endDate`); collect the undated ones. */
export function useTasksByDay(tasks: Task[] | undefined): TasksByDay {
  return useMemo(() => {
    const byDay = new Map<string, Task[]>();
    const unscheduled: Task[] = [];
    for (const task of tasks ?? []) {
      if (!task.endDate) {
        unscheduled.push(task);
        continue;
      }
      // endDate is a "YYYY-MM-DD" string — use it directly as the bucket key.
      const key = task.endDate;
      const bucket = byDay.get(key);
      if (bucket) bucket.push(task);
      else byDay.set(key, [task]);
    }
    return { byDay, unscheduled };
  }, [tasks]);
}

export function tasksForDay(byDay: Map<string, Task[]>, date: Date): Task[] {
  return byDay.get(dayKey(date)) ?? [];
}

export function notConnected() {
  notifications.show({ message: "Not connected yet", color: "gray" });
}

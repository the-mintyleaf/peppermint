"use client";

import { useMemo } from "react";
import {
  TEAM_MEMBERS,
  createdRank,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "./kanban/module.api";
import {
  DISPLAY_STATUS_LABELS,
  DISPLAY_STATUS_ORDER,
  getDisplayStatus,
} from "./general-view/GeneralViewDashboard.hooks";
import { useTasksStore } from "./Tasks.store";
import type {
  DerivedTasks,
  DueWindow,
  GroupBy,
  SortBy,
  SortDir,
  TaskFilters,
  TaskGroup,
} from "./Tasks.types";

const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0,
  important: 1,
  normal: 2,
};

const PRIORITY_ORDER: TaskPriority[] = ["urgent", "important", "normal"];
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: "Urgent",
  important: "Important",
  normal: "Normal",
};

/**
 * Single filter → sort → group pipeline that both body layouts read from, so
 * the board (raw status columns) and the list (grouped by `groupBy`) always
 * agree on which tasks are visible and in what order.
 */
export function useDerivedTasks(tasks: Task[] | undefined): DerivedTasks {
  const search = useTasksStore((s) => s.search);
  const selectedMemberId = useTasksStore((s) => s.selectedMemberId);
  const filters = useTasksStore((s) => s.filters);
  const sortBy = useTasksStore((s) => s.sortBy);
  const sortDir = useTasksStore((s) => s.sortDir);
  const groupBy = useTasksStore((s) => s.groupBy);

  return useMemo(() => {
    const filtered = (tasks ?? []).filter((t) =>
      matchesFilters(t, search, selectedMemberId, filters),
    );
    const sorted = sortTasks(filtered, sortBy, sortDir);

    return {
      board: groupByStatus(sorted),
      list: groupForList(sorted, groupBy),
      total: sorted.length,
    };
  }, [tasks, search, selectedMemberId, filters, sortBy, sortDir, groupBy]);
}

// --- filtering ---------------------------------------------------------------

function matchesFilters(
  task: Task,
  search: string,
  selectedMemberId: string | null,
  filters: TaskFilters,
): boolean {
  const q = search.trim().toLowerCase();
  if (
    q &&
    !task.title.toLowerCase().includes(q) &&
    !task.taskNumber.toLowerCase().includes(q)
  ) {
    return false;
  }

  if (selectedMemberId) {
    const member = TEAM_MEMBERS.find((m) => m.id === selectedMemberId);
    if (member && !hasAssignee(task, member.name)) return false;
  }

  if (
    filters.assignees.length > 0 &&
    !filters.assignees.some((name) => hasAssignee(task, name))
  ) {
    return false;
  }

  if (
    filters.priorities.length > 0 &&
    !filters.priorities.includes(task.priority)
  ) {
    return false;
  }

  if (filters.due && !matchesDue(task, filters.due)) return false;

  return true;
}

function hasAssignee(task: Task, name: string): boolean {
  return (
    task.assignee === name ||
    (task.assignees?.some((a) => a.name === name) ?? false)
  );
}

// Due windows compare the "YYYY-MM-DD" endDate lexically (which equals
// chronological order). "Today" is the real clock — like the calendar module,
// this drifts against the fixed-2026 mock data; the mechanism is what matters.
function matchesDue(task: Task, window: DueWindow): boolean {
  if (!task.endDate) return false;
  const today = isoDate(0);
  if (window === "overdue") return task.endDate < today;
  const horizon = window === "week" ? isoDate(7) : isoDate(30);
  return task.endDate >= today && task.endDate <= horizon;
}

function isoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

// --- sorting -----------------------------------------------------------------

function sortTasks(tasks: Task[], sortBy: SortBy, dir: SortDir): Task[] {
  if (sortBy === "manual") return tasks;
  const factor = dir === "asc" ? 1 : -1;
  return tasks.slice().sort((a, b) => factor * compareBy(a, b, sortBy));
}

function compareBy(a: Task, b: Task, sortBy: SortBy): number {
  switch (sortBy) {
    case "name":
      return a.title.localeCompare(b.title);
    case "priority":
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case "created":
      return createdRank(a) - createdRank(b);
    case "due":
      return (a.endDate ?? "9999-99-99").localeCompare(
        b.endDate ?? "9999-99-99",
      );
    default:
      return 0;
  }
}

// --- grouping ----------------------------------------------------------------

function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const result: Record<TaskStatus, Task[]> = {
    inbox: [],
    ongoing: [],
    hold: [],
    rejected: [],
  };
  for (const task of tasks) result[task.status].push(task);
  return result;
}

function groupForList(tasks: Task[], groupBy: GroupBy): TaskGroup[] {
  switch (groupBy) {
    case "priority":
      return fixedGroups(
        tasks,
        PRIORITY_ORDER,
        PRIORITY_LABELS,
        (t) => t.priority,
      );
    case "assignee":
      return dynamicGroups(tasks, (t) => t.assignee, orderByRoster);
    case "list":
      return dynamicGroups(tasks, (t) => t.group);
    case "status":
    default:
      return fixedGroups(
        tasks,
        DISPLAY_STATUS_ORDER,
        DISPLAY_STATUS_LABELS,
        getDisplayStatus,
      );
  }
}

// Fixed vocabulary → keep every bucket (even empty), matching the list's
// always-visible status sections.
function fixedGroups<K extends string>(
  tasks: Task[],
  order: K[],
  labels: Record<K, string>,
  keyOf: (t: Task) => K,
): TaskGroup[] {
  const buckets = new Map<K, Task[]>(order.map((k) => [k, []]));
  for (const task of tasks) buckets.get(keyOf(task))?.push(task);
  return order.map((key) => ({
    key,
    label: labels[key],
    tasks: buckets.get(key) ?? [],
  }));
}

// Open-ended keys (assignee, list) → only surface buckets that have tasks.
function dynamicGroups(
  tasks: Task[],
  keyOf: (t: Task) => string,
  order?: (keys: string[]) => string[],
): TaskGroup[] {
  const buckets = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = keyOf(task) || "Unassigned";
    const list = buckets.get(key);
    if (list) list.push(task);
    else buckets.set(key, [task]);
  }
  const keys = [...buckets.keys()];
  const ordered = order ? order(keys) : keys.sort((a, b) => a.localeCompare(b));
  return ordered.map((key) => ({
    key,
    label: key,
    tasks: buckets.get(key) ?? [],
  }));
}

function orderByRoster(keys: string[]): string[] {
  const rosterOrder = TEAM_MEMBERS.map((m) => m.name);
  return keys.slice().sort((a, b) => {
    const ai = rosterOrder.indexOf(a);
    const bi = rosterOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

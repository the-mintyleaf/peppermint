/**
 * The calendar plots the app's Tasks. It owns no data of its own — it reuses the
 * tasks module's mock fetch and types, and adds the mapping from a task's *status*
 * to the card colors (kept out of the JSX). Cards are colored by status, per the
 * calendar's visual language; urgent priority adds an accent marker on top.
 */
import type { Task, TaskStatus } from "../tasks/kanban/module.api";

export {
  fetchTasks,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "../tasks/kanban/module.api";
export type {
  Task,
  TaskStatus,
  TaskCategory,
  TaskPriority,
  TaskBoardFilter,
} from "../tasks/kanban/module.api";

export interface StatusStyle {
  /** strong accent — left bar, dot, focus-ring */
  accent: string;
  /** soft tinted card background */
  tint: string;
  /** readable foreground over the tint */
  fg: string;
}

/**
 * Task status → card palette. Distinct hue per status so a wall of cards reads at
 * a glance: In Progress = blue, New = violet, On Hold = amber, Rejected = rose.
 */
export const STATUS_STYLE: Record<TaskStatus, StatusStyle> = {
  ongoing: {
    accent: "rgb(44,110,202)",
    tint: "rgba(44,110,202,0.10)",
    fg: "rgb(38,92,168)",
  },
  inbox: {
    accent: "rgb(120,90,200)",
    tint: "rgba(120,90,200,0.10)",
    fg: "rgb(92,66,168)",
  },
  hold: {
    accent: "rgb(216,142,20)",
    tint: "rgba(216,142,20,0.14)",
    fg: "rgb(158,100,10)",
  },
  rejected: {
    accent: "rgb(206,78,72)",
    tint: "rgba(206,78,72,0.10)",
    fg: "rgb(178,52,46)",
  },
};

export function statusStyle(task: Task): StatusStyle {
  return STATUS_STYLE[task.status];
}

/** Urgent tasks get an accent (orange) marker regardless of status. */
export function isUrgent(task: Task): boolean {
  return task.priority === "urgent";
}

/** People on a task — assignees if present, else the single named owner. */
export function assigneeList(task: Task) {
  if (task.assignees?.length) return task.assignees;
  return [
    { name: task.assignee, initials: initialsOf(task.assignee), color: "gray" },
  ];
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

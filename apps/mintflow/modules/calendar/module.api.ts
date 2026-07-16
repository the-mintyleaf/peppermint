/**
 * The calendar plots the app's Tasks by due date. It owns no data of its own —
 * it reuses the tasks module's mock fetch and types, and only adds the mapping
 * from a task's category/priority to the chip's colors (kept out of the JSX).
 */
import { tokens } from "@/config/design";

import type { Task, TaskCategory } from "../tasks/kanban/module.api";

export {
  fetchTasks,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "../tasks/kanban/module.api";
export type {
  Task,
  TaskCategory,
  TaskPriority,
  TaskBoardFilter,
} from "../tasks/kanban/module.api";

export interface ChipStyle {
  /** solid category dot / left accent */
  dot: string;
  /** soft tinted chip background */
  tint: string;
  /** readable foreground over the tint */
  fg: string;
}

/** Category → chip palette, drawn from the fixed brand tokens (no raw hex). */
const CATEGORY_CHIP: Record<TaskCategory, ChipStyle> = {
  document_review: {
    dot: tokens.blueInk,
    tint: tokens.blueSoft,
    fg: tokens.blueInk,
  },
  review: {
    dot: tokens.purpleInk,
    tint: tokens.purpleSoft,
    fg: tokens.purpleInk,
  },
  approval: { dot: tokens.green, tint: tokens.greenTint, fg: tokens.green },
  general: { dot: tokens.muted2, tint: "rgba(0,0,0,0.05)", fg: tokens.ink },
};

export function chipStyle(task: Task): ChipStyle {
  return CATEGORY_CHIP[task.category];
}

/** Urgent tasks get an accent (orange) treatment regardless of category. */
export function isUrgent(task: Task): boolean {
  return task.priority === "urgent";
}

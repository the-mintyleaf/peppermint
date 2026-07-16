import type {
  Task,
  TaskBoardFilter,
  TaskPriority,
  TaskStatus,
} from "./kanban/module.api";
import type { DisplayStatus } from "./general-view/GeneralViewDashboard.hooks";

export type TaskView = "list" | "board";

// "manual" = keep the stored (drag) order; the rest force a sort.
export type SortBy = "manual" | "due" | "priority" | "name" | "created";
export type SortDir = "asc" | "desc";

// List grouping. Board is always grouped by raw status.
export type GroupBy = "status" | "priority" | "assignee" | "list";

export type DueWindow = "overdue" | "week" | "month";

export interface TaskFilters {
  assignees: string[];
  priorities: TaskPriority[];
  due: DueWindow | null;
}

export interface VisibleColumns {
  priority: boolean;
  due: boolean;
  assignee: boolean;
}

export interface TaskGroup {
  key: string;
  label: string;
  tasks: Task[];
}

// The derived, filtered + sorted views both body layouts read from.
export interface DerivedTasks {
  board: Record<TaskStatus, Task[]>;
  list: TaskGroup[];
  total: number;
}

// Re-exported so consumers get the view vocabulary from one place.
export type { TaskBoardFilter, TaskPriority, TaskStatus, DisplayStatus };

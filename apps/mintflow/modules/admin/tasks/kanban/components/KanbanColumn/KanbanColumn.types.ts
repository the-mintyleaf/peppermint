import type { Task, TaskStatus } from "../../module.api";

export interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onCardClick: (task: Task) => void;
}

export interface ColumnConfig {
  label: string;
  bg: string;
  badgeColor: string;
}

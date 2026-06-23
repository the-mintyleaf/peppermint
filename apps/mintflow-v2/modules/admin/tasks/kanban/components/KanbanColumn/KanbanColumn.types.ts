import type { Task, TaskStatus } from "../../module.api";

export interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}

export interface ColumnConfig {
  label: string;
  dotColor: string;
}

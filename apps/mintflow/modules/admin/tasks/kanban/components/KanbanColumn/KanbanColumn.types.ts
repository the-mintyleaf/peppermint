import type { ReactNode } from "react";
import type { Task, TaskStatus } from "../../module.api";

export interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}

export interface ColumnConfig {
  label: string;
  sublabel: string;
  dotColor: string;
  headerBg: string;
  headerBorder: string;
  icon: ReactNode;
}

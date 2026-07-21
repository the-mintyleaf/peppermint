import type { Task } from "../../module.api";

export interface KanbanCardProps {
  task: Task;
  overlay?: boolean;
  onCardClick?: (task: Task) => void;
}

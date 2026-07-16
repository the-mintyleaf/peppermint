import type { Task } from "../../Tasks.types";

export interface TaskCardProps {
  task: Task;
  /** Row click handler (no-op placeholder until wired). */
  onClick?: () => void;
}

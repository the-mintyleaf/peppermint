import type { TaskActionKind, TaskChipView } from "../../caseView";

export interface TaskStripProps {
  tasks: TaskChipView[];
  /** Currently filtered task, or null for "all activity". */
  selectedId: string | null;
  onToggle: (taskId: string) => void;
  /** Run a form-free task command (start / complete / archive). */
  onAction?: (action: TaskActionKind, task: TaskChipView) => void;
  /** Task id whose command is in flight (disables its menu). */
  pendingTaskId?: string | null;
}

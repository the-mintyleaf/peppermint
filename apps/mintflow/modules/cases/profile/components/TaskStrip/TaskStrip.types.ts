import type { TaskChipView } from "../../caseView";

export interface TaskStripProps {
  tasks: TaskChipView[];
  /** Currently filtered task, or null for "all activity". */
  selectedId: string | null;
  onToggle: (taskId: string) => void;
}

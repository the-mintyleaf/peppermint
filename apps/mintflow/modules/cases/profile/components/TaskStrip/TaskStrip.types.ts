import type { CaseTask } from "../../profile.api";

export interface TaskStripProps {
  tasks: CaseTask[];
  /** Currently filtered task, or null for "all activity". */
  selectedId: string | null;
  onToggle: (taskId: string) => void;
}

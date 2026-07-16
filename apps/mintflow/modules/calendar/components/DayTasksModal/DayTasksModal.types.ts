import type { Task } from "../../module.api";

export interface DayTasksModalProps {
  /** The day whose tasks are shown; `null` closes the modal. */
  day: Date | null;
  tasks: Task[];
  onClose: () => void;
  onOpenTask: (task: Task) => void;
}

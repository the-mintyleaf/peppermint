import type { Task } from "../../../../module.api";

export interface DayCellProps {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  tasks: Task[];
  /** Open a single task's detail. */
  onOpenTask: (task: Task) => void;
  /** Open the "all tasks for this day" list (from the +N more affordance). */
  onOpenDay: (date: Date) => void;
}

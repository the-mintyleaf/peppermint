import type { Task } from "../../module.api";

export interface WeekGridProps {
  anchor: Date;
  /** dayKey → tasks due that day. */
  byDay: Map<string, Task[]>;
  onOpenTask: (task: Task) => void;
}

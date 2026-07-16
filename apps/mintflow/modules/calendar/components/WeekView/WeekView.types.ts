import type { Task } from "../../module.api";

export interface WeekViewProps {
  anchor: Date;
  /** dayKey → tasks due that day. */
  byDay: Map<string, Task[]>;
  onOpenTask: (task: Task) => void;
}

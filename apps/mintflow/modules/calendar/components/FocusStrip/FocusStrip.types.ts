import type { Task } from "../../module.api";

export interface FocusStripProps {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

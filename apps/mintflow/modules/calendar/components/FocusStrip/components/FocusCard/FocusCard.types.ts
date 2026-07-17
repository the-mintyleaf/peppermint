import type { Task } from "../../../../module.api";

export interface FocusCardProps {
  task: Task;
  /** Marks the lead card (first = ongoing / highest priority). */
  lead?: boolean;
  onOpen: (task: Task) => void;
}

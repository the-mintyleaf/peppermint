import type { Task } from "../../module.api";

export interface EventChipProps {
  task: Task;
  onOpen: (task: Task) => void;
  /** Compact single-line chip for dense month cells (default). */
  dense?: boolean;
}

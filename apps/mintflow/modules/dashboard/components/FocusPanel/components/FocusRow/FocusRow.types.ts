import type { FocusTask } from "../../../../module.api";

export interface FocusRowProps {
  task: FocusTask;
  onToggleDone: (id: string) => void;
  /** Start / Continue — opens the task or the "not connected" feedback. */
  onStart: (task: FocusTask) => void;
}

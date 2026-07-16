import type { FocusTask } from "../../module.api";

export interface FocusPanelProps {
  focus: FocusTask[];
  onToggleDone: (id: string) => void;
  onStart: (task: FocusTask) => void;
  /** Empty-state affordance — pick the day's focus tasks. */
  onChooseFocus: () => void;
}

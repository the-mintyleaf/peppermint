import type { FocusTask } from "../../../../module.api";

export interface FocusPillProps {
  task: FocusTask;
  /** The single "next up" pill gets the accent-bordered emphasis (spec §5). */
  highlighted: boolean;
  onToggleDone: (id: string) => void;
  onContinue: (task: FocusTask) => void;
}

import type { FocusState, FocusTask } from "../../../../module.api";

export interface FocusPillProps {
  task: FocusTask;
  onToggleDone: (id: string) => void;
  onContinue: (task: FocusTask) => void;
  onSetState: (id: string, state: FocusState) => void;
}

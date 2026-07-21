import type { FocusState, FocusTask } from "../../../../module.api";

export interface FocusSpotlightProps {
  task: FocusTask;
  onToggleDone: (id: string) => void;
  onContinue: (task: FocusTask) => void;
  onSetState: (id: string, state: FocusState) => void;
}

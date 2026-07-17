import type { FocusState } from "../../../../module.api";

export interface FocusActionsProps {
  state: FocusState;
  /** px size of the icon buttons (default 30). */
  size?: number;
  /** Start / continue the task. */
  onContinue: () => void;
  /** Quick-update the task's status from the dropdown. */
  onSetState: (state: FocusState) => void;
}

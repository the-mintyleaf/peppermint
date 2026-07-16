import type { FocusTask } from "../../Home.types";

export interface FocusCardProps {
  task: FocusTask;
  /** Fires when the "Open task" button is pressed. */
  onOpen?: () => void;
}

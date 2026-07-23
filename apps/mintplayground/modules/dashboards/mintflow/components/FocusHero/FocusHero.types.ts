import type { FocusState, FocusTask } from "../../module.api";

export interface FocusHeroProps {
  greetingName: string;
  today: string;
  focus: FocusTask[];
  doneThisWeek: number;
  onHoldNow: number;
  onToggleDone: (id: string) => void;
  onContinue: (task: FocusTask) => void;
  onSetState: (id: string, state: FocusState) => void;
  /** Empty / first-run CTA. */
  onChooseFocus: () => void;
}

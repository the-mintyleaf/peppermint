import type { ReactNode } from "react";

import type { FocusState, FocusTask, Person } from "../../module.api";

export interface FocusHeroProps {
  greetingName: string;
  today: string;
  focus: FocusTask[];
  /** Avatars of people involved in today's focus/flow. */
  team: Person[];
  doneThisWeek: number;
  onHoldNow: number;
  onToggleDone: (id: string) => void;
  onContinue: (task: FocusTask) => void;
  onSetState: (id: string, state: FocusState) => void;
  /** Empty / first-run CTA. */
  onChooseFocus: () => void;
  /** Slot for the populated / first-run preview control. */
  previewControl?: ReactNode;
}

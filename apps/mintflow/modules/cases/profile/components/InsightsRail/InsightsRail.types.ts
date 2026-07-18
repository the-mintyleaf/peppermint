import type { CaseView } from "../../caseView";

export interface InsightsRailProps {
  view: CaseView;
  /** Jumps the work tabs to the People panel. */
  onViewPeople: () => void;
}

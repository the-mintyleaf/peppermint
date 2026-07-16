import type { WorkCase } from "../../profile.api";

export interface InsightsRailProps {
  workCase: WorkCase;
  /** Jumps the work tabs to the People (officers) panel. */
  onViewPeople: () => void;
}

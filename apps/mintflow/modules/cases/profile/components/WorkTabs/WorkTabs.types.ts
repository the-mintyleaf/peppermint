import type { CaseActivityEvent, CaseFile, WorkCase } from "../../profile.api";
import type { WorkTab } from "../../CaseProfile.hooks";

export interface WorkTabsProps {
  workCase: WorkCase;
  files: CaseFile[];
  activity: CaseActivityEvent[];
  tab: WorkTab;
  onTabChange: (tab: WorkTab) => void;
  /** Task title the activity feed is filtered to, if any. */
  filterLabel?: string;
  onClearFilter?: () => void;
}

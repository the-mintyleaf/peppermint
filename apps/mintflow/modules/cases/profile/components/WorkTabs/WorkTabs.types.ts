import type { ActivityView, CaseView } from "../../caseView";
import type { WorkTab } from "../../CaseProfile.hooks";

export interface WorkTabsProps {
  view: CaseView;
  activity: ActivityView[];
  tab: WorkTab;
  onTabChange: (tab: WorkTab) => void;
  /** Task title the activity feed is filtered to, if any. */
  filterLabel?: string;
  onClearFilter?: () => void;
  /** Opens the record-activity form (Activity tab only). */
  onRecordActivity?: () => void;
}

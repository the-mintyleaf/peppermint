import type { ActivityView, CaseView } from "../../caseView";

export interface ActivityTimelineProps {
  view: CaseView;
  events: ActivityView[];
  /** Title of the task the feed is filtered to, if any. */
  filterLabel?: string;
  onClearFilter?: () => void;
}

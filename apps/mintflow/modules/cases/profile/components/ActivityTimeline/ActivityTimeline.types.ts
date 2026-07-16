import type { CaseActivityEvent, WorkCase } from "../../profile.api";

export interface ActivityTimelineProps {
  workCase: WorkCase;
  events: CaseActivityEvent[];
  /** Title of the task the feed is filtered to, if any. */
  filterLabel?: string;
  onClearFilter?: () => void;
}

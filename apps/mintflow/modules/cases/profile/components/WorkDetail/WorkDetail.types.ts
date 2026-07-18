import type { CaseView, WorkActionKind } from "../../caseView";

export interface WorkDetailProps {
  view: CaseView;
  /** Run a form-free work-item command (start / archive / restore). */
  onWorkAction?: (action: WorkActionKind) => void;
  /** A work command is in flight (disables the menu). */
  workActionPending?: boolean;
}

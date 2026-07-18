import type { WorkActionKind } from "../../caseView";

/** Work commands that open a form modal. */
export type WorkCommandKind = Extract<
  WorkActionKind,
  "deadline" | "close" | "reopen"
>;

export interface WorkCommandModalProps {
  workId: string;
  command: WorkCommandKind | null;
  onClose: () => void;
}

// Form-value types satisfy the FormWrapper Record<string, unknown> contract.
export interface ReopenValues extends Record<string, unknown> {
  reason: string;
}
export interface DeadlineValues extends Record<string, unknown> {
  new_due_at: string | null;
  reason: string;
}
export interface CloseValues extends Record<string, unknown> {
  outcome: string;
  closure_summary: string;
  completed_scope: string;
  unresolved_scope: string;
}

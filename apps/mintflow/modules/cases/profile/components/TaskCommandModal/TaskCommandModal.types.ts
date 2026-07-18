export type TaskCommandKind = "return" | "block" | "unblock";

export interface TaskCommandTarget {
  id: string;
  title: string;
}

export interface TaskCommandModalProps {
  workId: string;
  command: TaskCommandKind | null;
  task: TaskCommandTarget | null;
  onClose: () => void;
}

// Form-value types satisfy the FormWrapper Record<string, unknown> contract.
export interface ReturnValues extends Record<string, unknown> {
  reason: string;
  report: string;
}
export interface BlockValues extends Record<string, unknown> {
  blocker_type: string;
  description: string;
}
export interface UnblockValues extends Record<string, unknown> {
  resolution_note: string;
}

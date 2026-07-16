import type { FlowColumn, FlowTask } from "../../module.api";

export interface TaskDrawerProps {
  task: FlowTask | null;
  opened: boolean;
  onClose: () => void;
  /** Consequential actions — recovery path lives in the parent notice. */
  onComplete: (id: string) => void;
  onMove: (id: string, to: FlowColumn) => void;
  onArchive: (task: FlowTask) => void;
}

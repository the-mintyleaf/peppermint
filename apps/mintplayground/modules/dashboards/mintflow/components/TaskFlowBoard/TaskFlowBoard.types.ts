import type { FlowColumn as FlowColumnKey, FlowTask } from "../../module.api";

export interface TaskFlowBoardProps {
  flowByColumn: Record<FlowColumnKey, FlowTask[]>;
  wipCount: number;
  wipFull: boolean;
  /** Move a task to a column (WIP guard + auto-focus live in the hook). */
  onMove: (taskId: string, to: FlowColumnKey) => void;
  onOpen: (task: FlowTask) => void;
  onQuickComplete: (id: string) => void;
  /** Navigate to the full Tasks page. */
  onOpenTasks: () => void;
}

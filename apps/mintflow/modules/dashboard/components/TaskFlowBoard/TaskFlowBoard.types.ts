import type { FlowColumn as FlowColumnKey, FlowTask } from "../../module.api";

export interface TaskFlowBoardProps {
  flowByColumn: Record<FlowColumnKey, FlowTask[]>;
  wipCount: number;
  wipFull: boolean;
  /** Move a task to a column (WIP guard + auto-focus live in the hook). */
  onMove: (taskId: string, to: FlowColumnKey) => void;
  onOpen: (task: FlowTask) => void;
  onQuickComplete: (id: string) => void;
  /** Inert "quick create" affordance (spec §15 mobile) — persists. */
  onQuickCreate: () => void;
}

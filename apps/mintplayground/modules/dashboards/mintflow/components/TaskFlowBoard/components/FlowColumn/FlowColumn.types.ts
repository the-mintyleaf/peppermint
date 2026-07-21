import type {
  FlowColumn as FlowColumnKey,
  FlowTask,
} from "../../../../module.api";

export interface FlowColumnProps {
  column: FlowColumnKey;
  tasks: FlowTask[];
  /** In-progress only — current count and whether the WIP limit is reached. */
  wipCount?: number;
  wipFull?: boolean;
  onOpen: (task: FlowTask) => void;
  onQuickComplete: (id: string) => void;
}

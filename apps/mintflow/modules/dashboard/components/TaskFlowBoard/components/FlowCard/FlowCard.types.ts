import type { FlowTask } from "../../../../module.api";

export interface FlowCardProps {
  task: FlowTask;
  /** Rendered inside the drag overlay (no sortable wiring, lifted styling). */
  overlay?: boolean;
  onOpen: (task: FlowTask) => void;
  onQuickComplete: (id: string) => void;
}

import type { Task } from "../../../../module.api";

export interface EventCardProps {
  task: Task;
  /** Absolute geometry within the day column (px / %). */
  top: number;
  height: number;
  left: string;
  width: string;
  onOpen: (task: Task) => void;
}

import type { Task } from "../../../kanban/module.api";
import type { DisplayStatus } from "../../GeneralViewDashboard.hooks";

export interface TaskListRowProps {
  task: Task;
  displayStatus: DisplayStatus;
}

export interface ProgressBarProps {
  pct: number;
  color: string;
  striped?: boolean;
}

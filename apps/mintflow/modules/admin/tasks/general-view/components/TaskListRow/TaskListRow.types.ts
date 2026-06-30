import type { Task } from "../../../kanban/module.api";
import type { DisplayStatus } from "../../GeneralViewDashboard.hooks";

export interface TaskListRowProps {
  task: Task;
  displayStatus: DisplayStatus;
}

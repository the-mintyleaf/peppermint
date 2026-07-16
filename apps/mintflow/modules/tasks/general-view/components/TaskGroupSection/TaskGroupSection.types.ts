import type { Task } from "../../../kanban/module.api";
import type { DisplayStatus } from "../../GeneralViewDashboard.hooks";

export interface TaskGroupSectionProps {
  displayStatus: DisplayStatus;
  label: string;
  tasks: Task[];
}

import type { Task } from "../../../kanban/module.api";

export interface TaskGroupSectionProps {
  /**
   * The group's key. When it is one of the display statuses the section uses
   * that status's icon/colour; any other key (priority, assignee, list…) falls
   * back to a neutral header styled from the `label`.
   */
  groupKey: string;
  label: string;
  tasks: Task[];
}

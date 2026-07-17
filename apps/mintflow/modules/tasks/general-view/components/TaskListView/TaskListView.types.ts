import type { Task } from "../../../kanban/module.api";
import type { TaskGroup } from "../../../Tasks.types";

export interface TaskListViewProps {
  groups: TaskGroup[];
  isLoading: boolean;
  total: number;
  hasActiveFilters: boolean;
  onReset: () => void;
  onOpenTask: (task: Task) => void;
}

import type { Task, TaskStatus } from "../../module.api";

export interface KanbanBoardProps {
  tasksByStatus: Record<string, Task[]>;
  onMoveTask: (taskId: string, fromStatus: string, toStatus: string) => void;
  onReorderTask: (activeId: string, overId: string) => void;
  onCardClick: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}

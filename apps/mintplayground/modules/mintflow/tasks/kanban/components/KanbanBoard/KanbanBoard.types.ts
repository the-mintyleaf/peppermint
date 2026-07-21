import type { Task, TaskStatus } from "../../module.api";

export interface KanbanBoardProps {
  tasksByStatus: Record<string, Task[]>;
  onMoveTask: (taskId: string, fromStatus: string, toStatus: string) => void;
  /** Cache-only reorder for live drag feedback (fires per hovered card). */
  onPreviewReorder: (activeId: string, overId: string) => void;
  /** Persist the final order once, on drop. */
  onCommitReorder: (activeId: string, overId: string) => void;
  onCardClick: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}

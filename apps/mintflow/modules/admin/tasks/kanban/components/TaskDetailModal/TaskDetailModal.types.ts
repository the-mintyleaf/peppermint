import type { Task } from "../../module.api";

export interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

import type { Task, TaskStatus } from "../../module.api";

export interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit?: (values: CreateTaskFormValues) => void;
  editTask?: Task | null;
  initialStatus?: TaskStatus;
}

export interface CreateTaskFormValues {
  title: string;
  status: string;
  assignees: string[];
  startDate: Date | null;
  endDate: Date | null;
  tags: string[];
  description: string;
}

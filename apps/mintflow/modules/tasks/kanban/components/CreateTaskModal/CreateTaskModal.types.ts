import type { Task, TaskStatus } from "../../module.api";

export interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
  editTask?: Task | null;
  initialStatus?: TaskStatus;
}

// FormWrapper requires the value type to satisfy Record<string, unknown>; this
// is the framework's form-state contract, not a domain entity. Dates are the
// Mantine 9 "YYYY-MM-DD" strings; assignees/tags carry names/labels.
export interface CreateTaskFormValues extends Record<string, unknown> {
  title: string;
  status: string;
  assignees: string[];
  startDate: string | null;
  endDate: string | null;
  tags: string[];
  description: string;
}

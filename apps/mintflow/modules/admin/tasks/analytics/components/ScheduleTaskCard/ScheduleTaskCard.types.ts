import type { ScheduledTask } from "../../taskAnalytics.types";

export interface ScheduleTaskCardProps {
  task: ScheduledTask;
  onClick?: (task: ScheduledTask) => void;
}

export interface AddTaskPlaceholderProps {
  dayIndex: number;
  startHour: number;
  endHour: number;
}

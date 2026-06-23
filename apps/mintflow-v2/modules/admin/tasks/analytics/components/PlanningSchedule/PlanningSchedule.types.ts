import type { ScheduledTask, ScheduleDay, TeamMember } from "../../taskAnalytics.types";
import type { DashboardView } from "../../taskAnalytics.types";

export interface PlanningScheduleProps {
  days: ScheduleDay[];
  tasks: ScheduledTask[];
  view: DashboardView;
  onTaskClick: (task: ScheduledTask) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  onViewChange: (view: DashboardView) => void;
  search: string;
  onSearchChange: (value: string) => void;
  teamMembers: TeamMember[];
}

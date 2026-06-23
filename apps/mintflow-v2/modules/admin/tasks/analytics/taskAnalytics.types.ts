import type { TaskAssignee } from "../kanban/module.api";

export type DashboardView = "card" | "block" | "table";

export type TaskCategoryFilter =
  | "urgent"
  | "daily_task"
  | "task"
  | "reminders";

export interface ScheduledTask {
  id: string;
  title: string;
  category: string;
  categoryFilter: TaskCategoryFilter;
  color: string;
  dayIndex: number;
  startHour: number;
  endHour: number;
  assignees: TaskAssignee[];
  status?: string;
  actionLabel?: string;
  checklist?: string[];
  progress?: number;
  taskNumber: string;
}

export interface FeaturedTask {
  id: string;
  timeRange: string;
  duration: string;
  title: string;
}

export interface CategoryFilterItem {
  id: TaskCategoryFilter;
  label: string;
  count?: number;
  defaultChecked?: boolean;
}

export interface ProductivityDay {
  day: string;
  hours: number;
  assigned: number;
  completed: number;
}

export interface ArchiveProject {
  id: string;
  name: string;
  app: "framer" | "figma" | "webflow";
  appColor: string;
}

export interface TeamMember {
  name: string;
  initials: string;
  color: string;
}

export interface ScheduleDay {
  date: number;
  label: string;
  dayName: string;
}

export interface TaskAnalyticsDashboardData {
  scheduledTasks: ScheduledTask[];
  featuredTask: FeaturedTask;
  categories: CategoryFilterItem[];
  productivity: ProductivityDay[];
  archiveProjects: ArchiveProject[];
  teamMembers: TeamMember[];
  scheduleDays: ScheduleDay[];
  selectedPeriodTaskCount: number;
}

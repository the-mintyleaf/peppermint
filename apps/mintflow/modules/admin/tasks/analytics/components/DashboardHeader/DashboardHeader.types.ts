import type { TeamMember } from "../../taskAnalytics.types";
import type { DashboardView } from "../../taskAnalytics.types";

export interface DashboardHeaderProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  search: string;
  onSearchChange: (value: string) => void;
  teamMembers: TeamMember[];
}

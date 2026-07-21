import type { TeamMember } from "../../kanban/module.api";

export interface TasksToolbarProps {
  members: TeamMember[];
  taskCountByMember: Record<string, number>;
}

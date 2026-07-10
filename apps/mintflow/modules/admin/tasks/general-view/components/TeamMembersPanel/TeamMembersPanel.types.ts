import type { TeamMember } from "../../../kanban/module.api";

export interface TeamMembersPanelProps {
  members: TeamMember[];
  taskCountByMember: Record<string, number>;
  selectedMemberId: string | null;
  onSelect: (id: string | null) => void;
}

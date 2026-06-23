import type { PersonData, NodeHealthIssue } from "../../OrganizationTree.types";

export interface PersonDrawerProps {
  opened: boolean;
  onClose: () => void;
  nodeId: string;
  data: PersonData;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  healthIssues?: NodeHealthIssue[];
  directReports?: number;
  totalBelow?: number;
}

import type {
  DepartmentData,
  NodeHealthIssue,
} from "../../OrganizationTree.types";

export interface DepartmentDrawerProps {
  opened: boolean;
  onClose: () => void;
  nodeId: string;
  data: DepartmentData;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddPerson: () => void;
  onAddChild: () => void;
  onAddPosition: () => void;
  healthIssues?: NodeHealthIssue[];
  totalPeople?: number;
  totalDepts?: number;
  hiddenLevels?: number;
}

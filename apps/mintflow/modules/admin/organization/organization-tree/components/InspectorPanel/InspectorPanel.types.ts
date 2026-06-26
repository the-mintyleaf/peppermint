import type {
  OrgNodeData,
  OrgOfficeData,
  DepartmentData,
  PersonData,
  GroupData,
  NodeHealthIssue,
} from "../../OrganizationTree.types";
import type { OrgFlowNode } from "../../OrganizationTree.store";

export interface InspectorPanelProps {
  opened: boolean;
  onClose: () => void;
  selectedNode: { id: string; type: string; data: OrgNodeData } | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddDivision: () => void;
  onAddPerson: () => void;
  onAddChild: () => void;
  totalPeople?: number;
  totalDepts?: number;
  hiddenLevels?: number;
  headPersonName?: string;
  healthIssues: NodeHealthIssue[];
  directReports?: number;
  totalBelow?: number;
  memberNodes?: OrgFlowNode[];
}

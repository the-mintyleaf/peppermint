import type { OrgOfficeData } from "../../OrganizationTree.types";

export interface OrgDrawerProps {
  opened: boolean;
  onClose: () => void;
  nodeId: string;
  data: OrgOfficeData;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddDivision: () => void;
  onAddSite: () => void;
  onAddDelegation: () => void;
  totalPeople?: number;
  totalDepts?: number;
  hiddenLevels?: number;
  headPersonName?: string;
  healthIssues?: string[];
}

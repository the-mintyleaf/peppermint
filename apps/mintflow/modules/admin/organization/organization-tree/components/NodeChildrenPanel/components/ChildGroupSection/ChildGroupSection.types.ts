import type { OrgFlowNode } from "../../../../OrganizationTree.store";

export interface ChildGroupSectionProps {
  label: string;
  addLabel: string;
  children: OrgFlowNode[];
  onAdd: () => void;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
}

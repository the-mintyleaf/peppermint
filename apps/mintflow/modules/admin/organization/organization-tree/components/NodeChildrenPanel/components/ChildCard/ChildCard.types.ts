import type { OrgFlowNode } from "../../../../OrganizationTree.store";

export interface ChildCardProps {
  node: OrgFlowNode;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
}

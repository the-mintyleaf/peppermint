import type { OrgFlowNode, OrgFlowEdge } from "../../OrganizationTree.store";
import type { ExtendedNodeType } from "../../OrganizationTree.types";

export interface NodeChildrenPanelProps {
  selectedNodeId: string;
  selectedNodeType: string;
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
  onAddChild: (
    type: ExtendedNodeType,
    parentId: string,
    parentName: string,
    contextNodeId?: string,
  ) => void;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onFocusNode: (nodeId: string) => void;
}

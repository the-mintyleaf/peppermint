import type { OrgNodeData, ExtendedNodeType } from "../../OrganizationTree.types";
import type { OrgFlowNode, OrgFlowEdge } from "../../OrganizationTree.store";

export interface InspectorPanelProps {
  opened: boolean;
  onClose: () => void;
  selectedNode: { id: string; type: string; data: OrgNodeData } | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (
    type: ExtendedNodeType,
    parentId: string,
    parentName: string,
    contextNodeId?: string,
  ) => void;
  onSelectNode: (id: string) => void;
  onFocusNode: (id: string) => void;
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
}

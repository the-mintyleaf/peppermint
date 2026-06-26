import type {
  OrgFlowNode,
  OrgFlowEdge,
} from "../../../../OrganizationTree.store";
import type { ExtendedNodeType } from "../../../../OrganizationTree.types";

export interface ChildrenTreeProps {
  rootNodeId: string;
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onFocusNode: (nodeId: string) => void;
  onAddChild: (
    type: ExtendedNodeType,
    parentId: string,
    parentName: string,
  ) => void;
}

export interface ChildrenTreeNodeProps {
  node: OrgFlowNode;
  depth: number;
  nodes: OrgFlowNode[];
  edges: OrgFlowEdge[];
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onFocusNode: (nodeId: string) => void;
  onAddChild: (
    type: ExtendedNodeType,
    parentId: string,
    parentName: string,
  ) => void;
}

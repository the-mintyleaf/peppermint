import type { NodeProps } from "@xyflow/react";
import type { Node } from "@xyflow/react";
import type { GroupData } from "../../../OrganizationTree.types";

export type GroupFlowNodeType = Node<GroupData, "group">;
export type GroupNodeProps = NodeProps<GroupFlowNodeType>;

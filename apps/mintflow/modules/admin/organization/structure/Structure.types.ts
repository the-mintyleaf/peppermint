import type { Edge, Node } from "@xyflow/react";

import type {
  UnitPositionNode,
  UnitStatus,
  UnitType,
} from "../_shared/organization.types";

/**
 * Injected per-render by the canvas — never persisted. `_childrenLoading` reflects
 * the in-flight lazy fetch of a node's children/members after its expand caret is hit.
 */
interface EnrichedNodeFlags {
  _dimmed?: boolean;
  _pathHighlighted?: boolean;
  _searchMatch?: boolean;
  _childrenLoading?: boolean;
}

export interface OrgRootNodeData
  extends Record<string, unknown>, EnrichedNodeFlags {
  nodeType: "org";
  name_np: string;
  name_en: string;
  code: string;
  organizationType: string;
  status: string;
}

export interface UnitNodeData
  extends Record<string, unknown>, EnrichedNodeFlags {
  nodeType: "unit";
  name_np: string;
  name_en: string;
  code: string;
  unitType: UnitType;
  status: UnitStatus;
  hasChildren: boolean;
  /** Present once the unit's subtree has been lazily loaded (via `include_members`). */
  positions?: UnitPositionNode[];
}

export type StructureNodeData = OrgRootNodeData | UnitNodeData;
export type StructureFlowNode = Node<StructureNodeData, "org" | "unit">;
export type StructureFlowEdge = Edge;

export interface UnitModalConfig {
  open: boolean;
  mode: "add" | "edit";
  parentId?: string;
  parentName?: string;
  editingUnitId?: string;
}

export interface MoveModalConfig {
  open: boolean;
  unitId?: string;
  unitName?: string;
}

export interface DeactivateModalConfig {
  open: boolean;
  unitId?: string;
  unitName?: string;
}

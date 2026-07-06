import type { Edge, Node } from "@xyflow/react";

import type { UnitStatus, UnitType } from "../_shared/organization.types";

/** `_dimmed`/`_pathHighlighted`/`_searchMatch` are injected per-render by the canvas — never persisted. */
interface EnrichedNodeFlags {
  _dimmed?: boolean;
  _pathHighlighted?: boolean;
  _searchMatch?: boolean;
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

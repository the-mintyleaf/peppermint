import type { Edge, Node } from "@xyflow/react";

import type { UnitStatus, UnitType } from "../_shared/organization.types";

/**
 * Injected per-render by the canvas — never persisted. `_childrenLoading` reflects
 * the in-flight lazy fetch of a node's children/members after its expand caret is hit.
 */
interface EnrichedNodeFlags {
  _dimmed?: boolean;
  _pathHighlighted?: boolean;
  _searchMatch?: boolean;
  _childrenLoading?: boolean;
  _childrenError?: boolean;
}

export interface OrgRootNodeData
  extends Record<string, unknown>, EnrichedNodeFlags {
  nodeType: "org";
  name_np: string;
  name_en: string;
  code: string;
  organizationType: string;
  status: string;
  /** Total units in the organization — summed from top-level subtree sizes. */
  descendantCount?: number;
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
  childCount: number;
  memberCount: number;
  /** Loaded direct-member count (drives the members-expand affordance on a leaf unit). */
  directMemberCount: number;
}

/** A person placed directly in a unit — rendered as its own node off the unit. */
export interface MemberNodeData
  extends Record<string, unknown>, EnrichedNodeFlags {
  nodeType: "member";
  displayName: string;
  username: string;
  isPrimary: boolean;
  membershipType: string;
}

export type StructureNodeData = OrgRootNodeData | UnitNodeData | MemberNodeData;
export type StructureFlowNode = Node<
  StructureNodeData,
  "org" | "unit" | "member"
>;
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

export interface AddMemberModalConfig {
  open: boolean;
  unitId?: string;
  unitName?: string;
}

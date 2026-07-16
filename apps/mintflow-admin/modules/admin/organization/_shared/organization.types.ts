// Entity shapes mirror the backend data contract:
// .todo/org-data-contract.md (v1.5.0 — Nepal localization, bilingual fields)
//
// Bilingual convention: `*_np` (Devanagari, canonical, required) + `*_en`
// (English, independently canonical, optional) + `*_romanized` (ASCII search
// key — NEVER displayed; backend-generated). Never render `*_romanized`.

export type OrganizationType =
  | "ministry"
  | "agency"
  | "department"
  | "enterprise"
  | "division"
  | "office"
  | "committee"
  | "project_body"
  | "external_partner"
  | "system"
  | "other";

export type OrganizationStatus =
  | "draft"
  | "active"
  | "inactive"
  | "suspended"
  | "archived";

export interface Organization {
  id: string;
  name_np: string;
  name_en: string;
  name_romanized: string;
  code: string;
  organization_type: OrganizationType;
  status: OrganizationStatus;
  parent_organization: string | null;
  legal_name_np: string;
  short_name_np: string;
  short_name_en: string;
  description: string;
  country_code: string;
  timezone: string;
  sort_order: number;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UnitType =
  | "root"
  | "department"
  | "division"
  | "branch"
  | "section"
  | "subsection"
  | "cell"
  | "team"
  | "committee"
  | "project_unit"
  | "field_office"
  | "regional_office"
  | "district_office"
  | "temporary_unit"
  | "other";

export type UnitStatus =
  | "draft"
  | "active"
  | "inactive"
  | "merged"
  | "split"
  | "renamed"
  | "archived";

export interface OrganizationUnit {
  id: string;
  organization: string;
  parent: string | null;
  name_np: string;
  name_en: string;
  name_romanized: string;
  code: string;
  unit_type: UnitType;
  status: UnitStatus;
  description: string;
  sort_order: number;
  depth: number;
  path_cache: string;
  is_operational: boolean;
  is_active: boolean;
  effective_from: string | null;
  effective_to: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Flat node shape returned by `GET /organizations/<organization_id>/unit-tree-nodes/`
 * (the primary tree endpoint). Nodes come back ordered so every parent precedes its
 * children — the client assembles the tree in a single forward pass off `parent_id`.
 * `positions` is only present when the request passes `include_members=true`.
 */
export interface UnitTreeNodeFlat {
  id: string;
  parent_id: string | null;
  name_np: string;
  name_en: string;
  code: string;
  unit_type: UnitType;
  status: UnitStatus;
  depth: number;
  sort_order: number;
  path_cache: string;
  is_operational: boolean;
  is_active: boolean;
  has_children: boolean;
  /**
   * Lightweight aggregates present on every node (including the cheap `max_depth=0`
   * root fetch), computed under the request's `status` filter. `has_children` is
   * always `child_count > 0`; `member_count` counts each person once across
   * positions and direct memberships; `descendant_count` is the number of
   * descendant units (excludes this unit itself).
   */
  child_count: number;
  member_count: number;
  position_count: number;
  descendant_count?: number;
  positions?: UnitPositionNode[];
  /** Direct `UnitMembership` people (no position) — only with `include_members=true`. */
  unit_members?: UnitMember[];
}

/** A position on a unit, with its active holders — from `unit-tree-nodes/?include_members=true`. */
export interface UnitPositionNode {
  id: string;
  title_np: string;
  title_en: string;
  code: string;
  position_type: PositionType;
  is_leadership: boolean;
  is_supervisory: boolean;
  status: PositionStatus;
  holders: PositionHolder[];
}

/** A person currently holding a position, as surfaced by the tree endpoint. */
export interface PositionHolder {
  assignment_id: string;
  user_id: string;
  username: string;
  display_name: string;
  assignment_type: string;
  is_primary: boolean;
}

/** One ancestor in a unit-search hit's root→node path. */
export interface UnitSearchAncestor {
  id: string;
  name_np: string;
  name_en: string;
}

/** A unit-search match with its ancestor path, so the client can reveal it (T4). */
export interface UnitSearchResult {
  id: string;
  name_np: string;
  name_en: string;
  code: string;
  unit_type: UnitType;
  depth: number;
  path: UnitSearchAncestor[];
}

/** Count fields a mutation reports for a parent whose child set changed (T5). */
export interface UnitParentPatch {
  id: string;
  has_children: boolean;
  child_count: number;
}

/**
 * Shape returned by unit CRUD mutations (create/update/move/deactivate) — the
 * affected node in tree shape plus any parent whose `has_children`/counts changed
 * (for `move`, both the old and new parent). Lets the client patch the cache in
 * place instead of invalidating the whole tree.
 */
export interface UnitMutationResult {
  node: UnitTreeNodeFlat;
  affected_parents: UnitParentPatch[];
}

/** A person placed directly in a unit via `UnitMembership` (no position). */
export interface UnitMember {
  membership_id: string;
  user_id: string;
  username: string;
  display_name: string;
  membership_type: string;
  is_primary: boolean;
}

export type PositionType =
  | "executive"
  | "head"
  | "deputy_head"
  | "manager"
  | "supervisor"
  | "officer"
  | "assistant"
  | "specialist"
  | "analyst"
  | "auditor"
  | "reviewer"
  | "field_staff"
  | "system_actor"
  | "external_reviewer"
  | "temporary"
  | "other";

export type PositionStatus =
  | "draft"
  | "active"
  | "inactive"
  | "abolished"
  | "archived";

export interface Position {
  id: string;
  organization: string;
  unit: string;
  title_np: string;
  title_en: string;
  title_romanized: string;
  code: string;
  position_type: PositionType;
  status: PositionStatus;
  description: string;
  sort_order: number;
  is_leadership: boolean;
  is_supervisory: boolean;
  is_single_occupant: boolean;
  max_occupants: number;
  effective_from: string | null;
  effective_to: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type MembershipStatus =
  | "invited"
  | "active"
  | "inactive"
  | "suspended"
  | "transferred"
  | "ended"
  | "archived";

export interface OrganizationMembership {
  id: string;
  organization: string;
  user: string;
  employee_code: string;
  membership_status: MembershipStatus;
  joined_at: string | null;
  ended_at: string | null;
  is_primary: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Reuses `MembershipStatus` per the data contract. */
export interface UnitMembership {
  id: string;
  organization: string;
  membership: string;
  unit: string;
  membership_type: string;
  status: MembershipStatus;
  is_primary: boolean;
  valid_from: string | null;
  valid_to: string | null;
  reason: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type AssignmentType =
  | "primary"
  | "secondary"
  | "acting"
  | "temporary"
  | "delegated"
  | "observer"
  | "external"
  | "system";

export type AssignmentStatus =
  | "planned"
  | "active"
  | "paused"
  | "ended"
  | "revoked"
  | "archived";

export interface PositionAssignment {
  id: string;
  organization: string;
  membership: string;
  position: string;
  assignment_type: AssignmentType;
  status: AssignmentStatus;
  starts_at: string | null;
  ends_at: string | null;
  assigned_by: string | null;
  ended_by: string | null;
  reason: string;
  end_reason: string;
  is_primary: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ReportingLineType =
  | "administrative"
  | "functional"
  | "disciplinary"
  | "technical"
  | "project"
  | "case_specific"
  | "temporary"
  | "matrix"
  | "other";

/** Reuses `AssignmentStatus` per the data contract. */
export interface ReportingLine {
  id: string;
  organization: string;
  source_position: string;
  target_position: string;
  reporting_line_type: ReportingLineType;
  status: AssignmentStatus;
  valid_from: string | null;
  valid_to: string | null;
  is_primary: boolean;
  reason: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type DelegationType =
  | "acting_authority"
  | "temporary_supervision"
  | "case_supervision"
  | "approval_substitution"
  | "workload_transfer"
  | "emergency"
  | "other";

export type DelegationStatus =
  | "planned"
  | "active"
  | "expired"
  | "revoked"
  | "cancelled"
  | "archived";

export interface AuthorityDelegation {
  id: string;
  organization: string;
  from_assignment: string;
  to_assignment: string;
  delegation_type: DelegationType;
  status: DelegationStatus;
  scope_unit: string | null;
  starts_at: string;
  ends_at: string | null;
  reason: string;
  approved_by: string | null;
  revoked_by: string | null;
  revoked_at: string | null;
  revocation_reason: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type OrganizationEventType =
  | "organization_created"
  | "organization_updated"
  | "organization_status_changed"
  | "unit_created"
  | "unit_updated"
  | "unit_moved"
  | "unit_renamed"
  | "unit_deactivated"
  | "unit_reactivated"
  | "position_created"
  | "position_updated"
  | "position_deactivated"
  | "membership_created"
  | "membership_status_changed"
  | "unit_membership_created"
  | "unit_membership_ended"
  | "position_assigned"
  | "position_assignment_ended"
  | "reporting_line_created"
  | "reporting_line_ended"
  | "delegation_created"
  | "delegation_revoked"
  | "site_created"
  | "site_assigned"
  | "integrity_rebuilt"
  | "metadata_updated";

/** Append-only — no create/update/delete endpoint exists for this resource. */
export interface OrganizationEventLog {
  id: string;
  organization: string | null;
  actor: string | null;
  event_type: OrganizationEventType;
  object_type: string;
  object_id: string | null;
  object_key: string;
  summary: string;
  detail: string;
  reason: string;
  acting_assignment: string | null;
  previous_state: Record<string, unknown>;
  new_state: Record<string, unknown>;
  request_id: string;
  source: string;
  created_at: string;
}

export interface ActorContextOrganizationRef {
  id: string;
  code: string;
  name_np: string;
  name_en: string;
}

export interface ActorContextMembership {
  id: string;
  status: MembershipStatus;
  is_primary: boolean;
}

export interface ActorContextUnitRef {
  id: string;
  code: string;
  path_cache: string;
}

export interface ActorContextUnitMembership {
  id: string;
  unit: ActorContextUnitRef;
  is_primary: boolean;
  status: MembershipStatus;
}

export interface ActorContextPositionRef {
  id: string;
  code: string;
  title_np: string;
  title_en: string;
}

export interface ActorContextPositionAssignment {
  id: string;
  position: ActorContextPositionRef;
  assignment_type: AssignmentType;
  status: AssignmentStatus;
  is_primary: boolean;
}

export interface ActorContextReportingChainLink {
  position: { id: string; code: string };
  reports_to: { id: string; code: string };
  reporting_line_type: ReportingLineType;
}

/** Response shape of `GET /api/v1/organization/actor-context/`. */
export interface ActorContext {
  user_id: string;
  organization: ActorContextOrganizationRef | null;
  membership: ActorContextMembership | null;
  unit_memberships: ActorContextUnitMembership[];
  position_assignments: ActorContextPositionAssignment[];
  reporting_chain: ActorContextReportingChainLink[];
  active_delegations_received: AuthorityDelegation[];
  resolved_at: string;
}

export interface OrganizationPaginationMeta {
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  /** Mapped from `count` — `DataTableWrapper`'s `paginationKey` lookup requires a `total` field. */
  total: number;
}

export interface OrganizationListResponse<T> {
  data: T[];
  meta: OrganizationPaginationMeta;
}

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

export type UnitStatus =
  | "draft"
  | "active"
  | "inactive"
  | "merged"
  | "split"
  | "renamed"
  | "archived";

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

export type PositionStatus =
  | "draft"
  | "active"
  | "inactive"
  | "abolished"
  | "archived";

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

export type MembershipStatus =
  | "invited"
  | "active"
  | "inactive"
  | "suspended"
  | "transferred"
  | "ended"
  | "archived";

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

export interface OrganizationEventLog {
  id: string;
  organization: string | null;
  actor: string | null;
  eventType: OrganizationEventType;
  objectType: string;
  objectId: string | null;
  objectKey: string;
  summary: string;
  detail: string;
  reason: string;
  actingAssignment: string | null;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  requestId: string;
  source: string;
  createdAt: string;
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

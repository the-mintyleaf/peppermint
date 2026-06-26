export const ORGANIZATION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  archived: "Archived",
};

export const ORGANIZATION_STATUS_COLORS: Record<string, string> = {
  draft: "gray",
  active: "green",
  inactive: "orange",
  suspended: "red",
  archived: "dark",
};

export const UNIT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
  merged: "Merged",
  split: "Split",
  renamed: "Renamed",
  archived: "Archived",
};

export const UNIT_STATUS_COLORS: Record<string, string> = {
  draft: "gray",
  active: "green",
  inactive: "orange",
  merged: "violet",
  split: "cyan",
  renamed: "blue",
  archived: "dark",
};

export const POSITION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
  abolished: "Abolished",
  archived: "Archived",
};

export const POSITION_STATUS_COLORS: Record<string, string> = {
  draft: "gray",
  active: "green",
  inactive: "orange",
  abolished: "red",
  archived: "dark",
};

export const MEMBERSHIP_STATUS_LABELS: Record<string, string> = {
  invited: "Invited",
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  transferred: "Transferred",
  ended: "Ended",
  archived: "Archived",
};

export const MEMBERSHIP_STATUS_COLORS: Record<string, string> = {
  invited: "blue",
  active: "green",
  inactive: "orange",
  suspended: "red",
  transferred: "violet",
  ended: "gray",
  archived: "dark",
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  ended: "Ended",
  revoked: "Revoked",
  archived: "Archived",
};

export const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  planned: "blue",
  active: "green",
  paused: "yellow",
  ended: "gray",
  revoked: "red",
  archived: "dark",
};

export const DELEGATION_STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  active: "Active",
  expired: "Expired",
  revoked: "Revoked",
  cancelled: "Cancelled",
  archived: "Archived",
};

export const DELEGATION_STATUS_COLORS: Record<string, string> = {
  planned: "blue",
  active: "green",
  expired: "gray",
  revoked: "red",
  cancelled: "orange",
  archived: "dark",
};

export const DELEGATION_TYPE_LABELS: Record<string, string> = {
  acting_authority: "Acting Authority",
  temporary_supervision: "Temporary Supervision",
  case_supervision: "Case Supervision",
  approval_substitution: "Approval Substitution",
  workload_transfer: "Workload Transfer",
  emergency: "Emergency",
  other: "Other",
};

export const ORG_EVENT_TYPE_LABELS: Record<string, string> = {
  organization_created: "Org Created",
  organization_updated: "Org Updated",
  organization_status_changed: "Status Changed",
  unit_created: "Unit Created",
  unit_updated: "Unit Updated",
  unit_moved: "Unit Moved",
  unit_renamed: "Unit Renamed",
  unit_deactivated: "Unit Deactivated",
  unit_reactivated: "Unit Reactivated",
  position_created: "Position Created",
  position_updated: "Position Updated",
  position_deactivated: "Position Deactivated",
  membership_created: "Member Added",
  membership_status_changed: "Membership Status Changed",
  unit_membership_created: "Unit Assigned",
  unit_membership_ended: "Unit Assignment Ended",
  position_assigned: "Position Assigned",
  position_assignment_ended: "Assignment Ended",
  reporting_line_created: "Reporting Line Created",
  reporting_line_ended: "Reporting Line Ended",
  delegation_created: "Delegation Created",
  delegation_revoked: "Delegation Revoked",
  site_created: "Site Created",
  site_assigned: "Site Assigned",
  integrity_rebuilt: "Integrity Rebuilt",
  metadata_updated: "Metadata Updated",
};

export const POSITION_TYPE_LABELS: Record<string, string> = {
  executive: "Executive",
  head: "Head",
  deputy_head: "Deputy Head",
  manager: "Manager",
  supervisor: "Supervisor",
  officer: "Officer",
  assistant: "Assistant",
  specialist: "Specialist",
  analyst: "Analyst",
  auditor: "Auditor",
  reviewer: "Reviewer",
  field_staff: "Field Staff",
  system_actor: "System Actor",
  external_reviewer: "External Reviewer",
  temporary: "Temporary",
  other: "Other",
};

export const ORGANIZATION_TYPE_LABELS: Record<string, string> = {
  ministry: "Ministry",
  agency: "Agency",
  department: "Department",
  enterprise: "Enterprise",
  division: "Division",
  office: "Office",
  committee: "Committee",
  project_body: "Project Body",
  external_partner: "External Partner",
  system: "System",
  other: "Other",
};

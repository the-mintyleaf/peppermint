export type OrgNodeType = "org" | "department" | "person" | "group";

export type OrgStatus = "active" | "inactive" | "archived";

export type OrgOfficeType =
  | "ministry"
  | "office"
  | "department"
  | "organization"
  | "branch"
  | "district";

export type DeptType =
  | "department"
  | "division"
  | "section"
  | "unit"
  | "team"
  | "branch"
  | "committee";

export type PersonRole =
  | "head"
  | "manager"
  | "coordinator"
  | "officer"
  | "member"
  | "advisor"
  | "minister"
  | "secretary"
  | "joint_secretary"
  | "under_secretary"
  | "section_officer"
  | "assistant";

export type RelationshipType =
  | "contains"
  | "reports_to"
  | "heads"
  | "supervises"
  | "member_of"
  | "assigned_to";

export type NodeHealthIssue =
  | "missing_head"
  | "empty_dept"
  | "no_parent"
  | "too_many_reports"
  | "inactive_head";

export type FilterKey =
  | "depts_only"
  | "people_only"
  | "leadership_only"
  | "health_issues_only"
  | "empty_depts_only"
  | "no_head_only"
  | "active_only"
  | "inactive_only";

export type ExpandStrategy =
  | "direct"
  | "depts_only"
  | "people_only"
  | "leadership"
  | "full_branch";

export interface DescendantStats {
  totalPeople: number;
  totalDepts: number;
  hiddenLevels: number;
}

export interface OrgOfficeData extends Record<string, unknown> {
  nodeType: "org";
  name: string;
  orgType: OrgOfficeType;
  description?: string;
  location?: string;
  status: OrgStatus;
  headCount?: number;
  activeTasks?: number;
}

export interface DepartmentData extends Record<string, unknown> {
  nodeType: "department";
  name: string;
  deptType: DeptType;
  description?: string;
  head?: string;
  parentName?: string;
  peopleCount?: number;
  activeTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  status: OrgStatus;
  color?: string;
  recentActivity?: ActivityItem[];
  createdAt?: string;
  updatedAt?: string;
  assignedPeople?: PersonRef[];
  childDeptNames?: string[];
}

export interface PersonData extends Record<string, unknown> {
  nodeType: "person";
  fullName: string;
  designation: string;
  department?: string;
  role?: PersonRole;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  reportingManager?: string;
  status: OrgStatus;
  responsibilities?: string[];
  activeTasks?: number;
  recentActivity?: ActivityItem[];
  accountStatus?: "active" | "inactive" | "none";
  roleName?: string;
}

export interface GroupData extends Record<string, unknown> {
  nodeType: "group";
  name: string;
  groupCategory: "dept" | "person";
  memberCount: number;
  memberIds: string[];
  status: OrgStatus;
}

export type OrgNodeData = OrgOfficeData | DepartmentData | PersonData | GroupData;

export interface PersonRef {
  id: string;
  name: string;
  designation?: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
}

export interface NodeModalConfig {
  open: boolean;
  mode: "add" | "edit";
  nodeType?: OrgNodeType;
  editingNodeId?: string;
  pendingParentId?: string;
  pendingParentName?: string;
}

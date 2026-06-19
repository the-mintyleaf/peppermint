export type OrgNodeType = "org" | "department" | "person";

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
  | "advisor";

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
}

export type OrgNodeData = OrgOfficeData | DepartmentData | PersonData;

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
}

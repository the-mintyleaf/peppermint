export type { PermissionAction, PermissionArea, PermissionSet } from "../_shared/PermissionsMatrix";

export type RoleStatus = "active" | "inactive";

export interface Role extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  permissions: import("../_shared/PermissionsMatrix").PermissionSet[];
  status: RoleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RolesFetchResponse {
  data: Role[];
  meta: { total: number; page: number; pageSize: number };
}

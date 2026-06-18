import type { PermissionSet } from "../_shared/PermissionsMatrix";

export type AccountStatus = "active" | "inactive" | "suspended";

export interface Account extends Record<string, unknown> {
  id: string;
  fullName: string;
  address: string;
  birthday: string;
  roleId: string | null;
  roleName: string | null;
  personalizedPermissions: PermissionSet[];
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AccountsFetchResponse {
  data: Account[];
  meta: { total: number; page: number; pageSize: number };
}

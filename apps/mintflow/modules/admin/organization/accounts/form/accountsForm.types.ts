import type { PermissionSet } from "../../_shared/PermissionsMatrix";

export interface AccountFormValues extends Record<string, unknown> {
  fullName: string;
  address: string;
  birthday: string;
  roleId: string;
  personalizedPermissions: PermissionSet[];
  status: string;
}

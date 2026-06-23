export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve" | "manage";
export type PermissionArea =
  | "tickets"
  | "users"
  | "reports"
  | "settings"
  | "organization"
  | "roles"
  | "accounts";

export interface PermissionSet {
  area: PermissionArea;
  actions: PermissionAction[];
}

export interface PermissionsMatrixProps {
  value: PermissionSet[];
  onChange: (value: PermissionSet[]) => void;
  disabled?: boolean;
}

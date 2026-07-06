export interface Role extends Record<string, unknown> {
  id: string;
  key: string;
  display_name: string;
  description: string;
  role_type: string;
  is_system_role: boolean;
  is_assignable: boolean;
  is_active: boolean;
  is_deprecated: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface RolesFetchResponse {
  data: Role[];
  meta: { total: number; count?: number };
}

export type PermissionRiskLevel = "low" | "medium" | "high" | "critical";

export interface RolePermission {
  id: string;
  role: string;
  permission_key: string;
  operation_type_snapshot: string;
  risk_level_snapshot: PermissionRiskLevel;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface PolicyPermission {
  key: string;
  label: string;
  operation: string;
  description: string;
  risk_level: "low" | "medium" | "high" | "critical";
  is_sensitive: boolean;
  dependencies: string[];
}

export interface PolicyPermissionGroup {
  key: string;
  label: string;
  permissions: PolicyPermission[];
}

export interface PolicyAppTree {
  app: string;
  groups: PolicyPermissionGroup[];
}

export interface PolicyApp {
  id: string;
  key: string;
  display_name: string;
  description: string;
  current_version: string;
  is_active: boolean;
  is_deprecated: boolean;
}

export type ActorType = "human" | "system" | "ai" | "external";

export type AccountStatus =
  | "pending"
  | "active"
  | "suspended"
  | "deactivated"
  | "archived";

export interface CurrentUser {
  id: string;
  username: string;
  email: string | null;
  display_name: string;
  actor_type: ActorType;
  account_status: AccountStatus;
  is_login_enabled: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export type ScopeType = "global" | "organization" | "organization_unit";

export interface ScopeValue {
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
}

/** Minimal nested user representation returned on permission-engine resources
 * (e.g. `subject_user`, `approved_by`, `created_by`, `revoked_by`). */
export interface PermissionUserRef {
  id: string;
  username: string;
  display_name: string;
}

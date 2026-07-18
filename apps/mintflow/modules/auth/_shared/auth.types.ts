export type ActorType = "human" | "system" | "ai" | "external";

export type AccountStatus =
  | "pending"
  | "active"
  | "suspended"
  | "deactivated"
  | "archived";

/** The signed-in account, as returned by `GET /api/v1/auth/me/`. */
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
  /** Set when the account must replace its password before using the app. */
  password_change_required?: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

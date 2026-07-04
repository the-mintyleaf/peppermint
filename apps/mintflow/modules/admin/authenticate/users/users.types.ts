import type {
  AccountStatus,
  ActorType,
} from "@/modules/admin/authenticate/_shared/authenticate.types";

export type { AccountStatus, ActorType };

export interface User extends Record<string, unknown> {
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

export interface UsersFetchResponse {
  data: User[];
  meta: {
    count: number;
    page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
    /** Mapped from `count` — DataTableWrapper's paginationKey lookup requires a `total` field. */
    total: number;
  };
}

export interface UserSession extends Record<string, unknown> {
  id: string;
  device_label: string;
  ip_address: string;
  issued_at: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at: string | null;
  revoked_reason: string | null;
  is_active: boolean;
}

export interface UserSessionsFetchResponse {
  data: UserSession[];
  meta: {
    count: number;
    page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
    total: number;
  };
}

export type AuthEventType =
  | "login_success"
  | "login_failed"
  | "login_blocked_disabled"
  | "login_blocked_inactive"
  | "login_blocked_locked"
  | "login_blocked_device_limit"
  | "logout_success"
  | "refresh_success"
  | "refresh_failed"
  | "password_changed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "account_locked"
  | "account_unlocked"
  | "login_enabled"
  | "login_disabled"
  | "mfa_challenge_created"
  | "mfa_challenge_failed"
  | "mfa_challenge_success"
  | "mfa_disabled"
  | "mfa_reset_by_staff"
  | "session_revoked"
  | "all_sessions_revoked"
  | "service_account_credential_created"
  | "service_account_credential_revoked"
  | "service_account_auth_failed";

export interface AuthEvent extends Record<string, unknown> {
  id: string;
  user: string;
  identifier_entered: string;
  event_type: AuthEventType;
  success: boolean;
  failure_reason: string | null;
  ip_address: string;
  user_agent_hash: string;
  request_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuthEventsFetchResponse {
  data: AuthEvent[];
  meta: {
    count: number;
    page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
    total: number;
  };
}

export interface ServiceAccountCredential extends Record<string, unknown> {
  id: string;
  key_id: string;
  name: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ServiceAccountCredentialCreateResponse extends ServiceAccountCredential {
  /** One-time value — only present on the create response. Never re-displayed. */
  token: string;
}

export interface ServiceAccountCredentialsFetchResponse {
  data: ServiceAccountCredential[];
  meta: {
    count: number;
    page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
    total: number;
  };
}

/**
 * Grandway `authenticate` app shapes. Source of truth:
 * `docs/backend/authenticate/INTEGRATION.md` §4–5 (v1.2.0).
 */

export type AuthorityType = "superadmin" | "admin" | "lead_manager";

/** `GET /api/v1/auth/me/` and the `login`-nested user — identical shape (API §4). */
export interface User {
  id: string;
  username: string;
  authority_type: AuthorityType;
  display_name: string;
  full_name_np: string;
  full_name_en: string;
  email: string;
  phone: string;
  is_active: boolean;
  must_change_password: boolean;
  mfa_enabled: boolean;
  mfa_enrollment_required: boolean;
  last_login: string | null;
  created_at: string;
}

export type SessionRevokedReason =
  | ""
  | "logout"
  | "password_change"
  | "replaced_same_device"
  | "rotated"
  | "rotated_reuse"
  | "device_limit"
  | "blocked"
  | "admin_revoked"
  | "mfa_change";

/** `GET /sessions/` (own) and `GET /users/<id>/sessions/` (admin) — API §4. */
export interface Session {
  id: string;
  device_id: string;
  device_name: string;
  ip_address: string | null;
  user_agent: string;
  is_active: boolean;
  revoked_reason: SessionRevokedReason;
  revoked_at: string | null;
  last_used_at: string;
  idle_expires_at: string;
  expires_at: string;
  created_at: string;
}

export type AuthEventType =
  | "superadmin_bootstrap"
  | "login_success"
  | "login_failure"
  | "forced_password_change"
  | "password_change"
  | "logout"
  | "session_refreshed"
  | "session_revoked"
  | "account_created"
  | "account_updated"
  | "account_blocked"
  | "account_restored"
  | "admin_password_reset"
  | "mfa_enabled"
  | "mfa_disabled"
  | "mfa_verification_failure"
  | "mfa_reset";

/** `GET /users/<id>/events/` — API §4. */
export interface AuthEvent {
  id: string;
  event_type: AuthEventType;
  actor_username: string | null;
  subject_username: string;
  success: boolean;
  reason: string;
  ip_address: string | null;
  device_id: string;
  created_at: string;
}

/** `POST /mfa/enroll/` response — returned once (API §4). */
export interface MfaEnrollment {
  secret: string;
  otpauth_url: string;
}

/** `POST /users/` and `POST /users/<id>/reset-password/` responses (API §4). */
export interface AccountCreateResult {
  user?: User;
  temporary_password?: string;
}

export interface LoginTokens {
  access: string;
  refresh?: string;
  must_change_password: boolean;
  mfa_enrollment_required: boolean;
  user: User;
}

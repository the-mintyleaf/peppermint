/**
 * Grandway `authenticate` app shapes. Source of truth:
 * `.todo/auth_doc_grandway/DATA_CONTRACT.md` §1–7 and `API.md`.
 * Other apps reference a user only by the opaque UUID `id` and the singular `role`.
 */

export type Role = "superadmin" | "admin" | "staff";

export type AccountStatus = "active" | "suspended" | "deactivated";

export type EmploymentStatus = "active" | "ended";

/** Operational employee data, 1:1 with an account (DATA_CONTRACT §2). */
export interface EmployeeProfile {
  employee_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_name: string;
  profile_image: string | null;
  email: string | null;
  phone: string | null;
  job_title: string;
  employment_start_date: string;
  employment_end_date: string | null;
  employment_status: EmploymentStatus;
  /** Admin-only notes — present on the admin read, absent from `me`. */
  remarks?: string;
}

/** `GET /api/v1/auth/me/` — the signed-in account + profile (API §2.1). */
export interface CurrentUser {
  id: string;
  username: string;
  role: Role;
  account_status: AccountStatus;
  password_change_required: boolean;
  last_login_at: string | null;
  employee_profile: EmployeeProfile;
}

/** A known-device summary for the owning user (`GET /sessions/`, API §1.5). */
export interface SessionDevice {
  id: string;
  ua_summary: string;
  first_seen_at: string;
  last_seen_at: string;
  last_ip: string | null;
  is_current: boolean;
}

/** Administration list/read/create user shape (API §3, DATA_CONTRACT UserAdmin). */
export interface UserAdmin {
  id: string;
  username: string;
  role: Role;
  account_status: AccountStatus;
  password_change_required: boolean;
  last_login_at: string | null;
  created_at: string;
  deactivated_at: string | null;
  suspended_at: string | null;
  employee_profile: EmployeeProfile;
}

export type SecurityEventType =
  | "login_succeeded"
  | "login_failed"
  | "login_rejected_cooldown"
  | "cooldown_started"
  | "account_auto_suspended"
  | "logout"
  | "logout_all"
  | "session_revoked_new_login"
  | "refresh_succeeded"
  | "refresh_rejected"
  | "account_created"
  | "account_deactivated"
  | "account_reactivated"
  | "account_suspended"
  | "account_unsuspended"
  | "password_changed"
  | "password_reset"
  | "first_login_challenge_issued"
  | "first_login_password_completed"
  | "username_changed"
  | "profile_security_changed"
  | "session_revoked_admin";

/** Superadmin audit event (`GET /security-events/`, DATA_CONTRACT §4). */
export interface SecurityEvent {
  id: string;
  event_type: SecurityEventType;
  success: boolean;
  actor_username: string;
  target_username: string;
  session_id: string | null;
  device_id: string | null;
  ip: string | null;
  ua_summary: string;
  reason_code: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

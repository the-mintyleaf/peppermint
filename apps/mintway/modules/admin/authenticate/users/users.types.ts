import type {
  AccountStatus,
  EmploymentStatus,
  Role,
  SessionDevice,
  UserAdmin,
} from "@/modules/admin/authenticate/_shared/authenticate.types";

export type { UserAdmin, SessionDevice };

/** Create-account form values (`POST /api/v1/auth/users/`, API §3). */
export interface CreateUserValues extends Record<string, unknown> {
  username: string;
  temporary_password: string;
  role: Extract<Role, "admin" | "staff">;
  employee_code: string;
  first_name: string;
  last_name: string;
  job_title: string;
  employment_start_date: string;
  middle_name: string;
  preferred_name: string;
  contact_email: string;
  contact_phone: string;
  remarks: string;
}

/** Profile-update form values (`PATCH /api/v1/auth/users/<id>/profile/`, API §3). */
export interface ProfileUpdateValues extends Record<string, unknown> {
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_name: string;
  job_title: string;
  contact_email: string;
  contact_phone: string;
  employment_end_date: string;
  employment_status: EmploymentStatus;
  remarks: string;
}

export interface UsersListParams {
  page?: number;
  page_size?: number;
  role?: Role;
  status?: AccountStatus;
  search?: string;
}

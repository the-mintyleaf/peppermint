import type { QueryParams } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  Role,
  SessionDevice,
  UserAdmin,
} from "@/modules/admin/authenticate/_shared/authenticate.types";
import type { CreateUserValues, ProfileUpdateValues } from "./users.types";

export interface UsersFetchResponse {
  data: UserAdmin[];
  meta: { total: number } & Record<string, unknown>;
}

/** `GET /api/v1/auth/users/` — paginated admin user list (API §3). */
export async function fetchUsers(
  params?: QueryParams,
): Promise<UsersFetchResponse> {
  const { data } = await api.get("/api/v1/auth/users/", {
    params: {
      page: params?.page,
      page_size: params?.pageSize,
      search: params?.search || undefined,
      ...params?.filters,
    },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

/** `GET /api/v1/auth/users/<id>/`. */
export async function getUser(id: string): Promise<UserAdmin> {
  const { data } = await api.get<UserAdmin>(`/api/v1/auth/users/${id}/`);
  return data;
}

/** `POST /api/v1/auth/users/` → the created account (temp password never returned). */
export async function createUser(values: CreateUserValues): Promise<UserAdmin> {
  const { data } = await api.post<UserAdmin>("/api/v1/auth/users/", values);
  return data;
}

/**
 * `PATCH /api/v1/auth/users/<id>/profile/` — non-security profile fields only.
 *
 * Required fields are always sent; optional fields are omitted when empty so a save
 * never (a) submits `""` to the nullable `employment_end_date` date field (DRF would
 * reject it), nor (b) clobbers an existing optional value (e.g. admin-only `remarks`,
 * which isn't returned by the read and so can't be pre-filled).
 */
export async function updateUserProfile(
  id: string,
  values: ProfileUpdateValues,
): Promise<UserAdmin> {
  const payload: Record<string, unknown> = {
    first_name: values.first_name,
    last_name: values.last_name,
    job_title: values.job_title,
    employment_status: values.employment_status,
  };
  const optional: (keyof ProfileUpdateValues)[] = [
    "middle_name",
    "preferred_name",
    "contact_email",
    "contact_phone",
    "employment_end_date",
    "remarks",
  ];
  for (const key of optional) {
    if (values[key] !== "") payload[key] = values[key];
  }
  const { data } = await api.patch<UserAdmin>(
    `/api/v1/auth/users/${id}/profile/`,
    payload,
  );
  return data;
}

/** `PATCH /api/v1/auth/users/<id>/` — change a user's role (superadmin only). */
export async function changeUserRole(
  id: string,
  role: Role,
): Promise<UserAdmin> {
  const { data } = await api.patch<UserAdmin>(`/api/v1/auth/users/${id}/`, {
    role,
  });
  return data;
}

// ─── Lifecycle (admin: deactivate/reactivate on staff; superadmin: the rest) ───

export async function deactivateUser(
  id: string,
  reason: string,
): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/deactivate/`, { reason });
}

export async function reactivateUser(id: string): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/reactivate/`);
}

export async function suspendUser(id: string, reason: string): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/suspend/`, { reason });
}

export async function unsuspendUser(id: string): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/unsuspend/`);
}

export async function resetUserPassword(
  id: string,
  temporaryPassword: string,
): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/reset-password/`, {
    temporary_password: temporaryPassword,
  });
}

// ─── Target sessions (superadmin) ───

export async function fetchUserSessions(id: string): Promise<SessionDevice[]> {
  const { data } = await api.get<SessionDevice[]>(
    `/api/v1/auth/users/${id}/sessions/`,
  );
  return data;
}

export async function revokeUserSessions(
  id: string,
): Promise<{ sessions_revoked: number }> {
  const { data } = await api.post<{ sessions_revoked: number }>(
    `/api/v1/auth/users/${id}/revoke-sessions/`,
  );
  return data;
}

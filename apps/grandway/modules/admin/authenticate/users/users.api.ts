import type { QueryParams } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  AccountCreateResult,
  AuthEvent,
  Session,
  User,
} from "@/modules/admin/authenticate/_shared/authenticate.types";
import type { CreateUserApiPayload, UpdateUserValues } from "./users.types";

export interface PagedResult<T> {
  data: T[];
  meta: { total: number } & Record<string, unknown>;
}

/**
 * `GET /api/v1/auth/users/` — paginated, scoped server-side to the tier the caller
 * manages (API §7). No search/filter/order params exist on this endpoint (API §3).
 */
export async function fetchUsers(
  params?: QueryParams,
): Promise<PagedResult<User>> {
  const { data } = await api.get("/api/v1/auth/users/", {
    params: { page: params?.page, page_size: params?.pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

/** `GET /api/v1/auth/users/<id>/`. */
export async function getUser(id: string): Promise<User> {
  const { data } = await api.get<User>(`/api/v1/auth/users/${id}/`);
  return data;
}

/** `POST /api/v1/auth/users/` — 201, returns `{ user, temporary_password? }`. */
export async function createUser(
  values: CreateUserApiPayload,
): Promise<AccountCreateResult> {
  const payload: Record<string, unknown> = {
    username: values.username,
    authority_type: values.authority_type,
    display_name: values.display_name,
    full_name: values.full_name,
    email: values.email,
    phone: values.phone,
  };
  if (values.password) payload.password = values.password;
  const { data } = await api.post<AccountCreateResult>(
    "/api/v1/auth/users/",
    payload,
  );
  return data;
}

/** `PATCH /api/v1/auth/users/<id>/` — profile fields only; username/authority are immutable. */
export async function updateUser(
  id: string,
  values: UpdateUserValues,
): Promise<User> {
  const { data } = await api.patch<User>(`/api/v1/auth/users/${id}/`, values);
  return data;
}

/** `POST /api/v1/auth/users/<id>/block/` — revokes all the target's sessions. */
export async function blockUser(id: string, reason?: string): Promise<void> {
  await api.post(
    `/api/v1/auth/users/${id}/block/`,
    reason ? { reason } : undefined,
  );
}

/** `POST /api/v1/auth/users/<id>/restore/`. */
export async function restoreUser(id: string): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/restore/`);
}

/**
 * `POST /api/v1/auth/users/<id>/reset-password/` — forces a change at next login and
 * revokes all the target's sessions. `temporary_password` is present only when the
 * server generated it (no `password` supplied).
 */
export async function resetUserPassword(
  id: string,
  password?: string,
): Promise<{ temporary_password?: string }> {
  const { data } = await api.post(
    `/api/v1/auth/users/${id}/reset-password/`,
    password ? { password } : undefined,
  );
  return data;
}

/** `POST /api/v1/auth/users/<id>/reset-mfa/` — removes MFA, revokes all sessions. */
export async function resetUserMfa(id: string): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/reset-mfa/`);
}

/** `GET /api/v1/auth/users/<id>/sessions/` — unpaginated, active sessions only. */
export async function fetchUserSessions(id: string): Promise<Session[]> {
  const { data } = await api.get<Session[]>(
    `/api/v1/auth/users/${id}/sessions/`,
  );
  return data;
}

/** `POST /api/v1/auth/users/<id>/sessions/revoke/` — omit `sessionId` to revoke all. */
export async function revokeUserSessions(
  id: string,
  sessionId?: string,
): Promise<{ revoked: number }> {
  const { data } = await api.post(
    `/api/v1/auth/users/${id}/sessions/revoke/`,
    sessionId ? { session_id: sessionId } : undefined,
  );
  return data;
}

/** `GET /api/v1/auth/users/<id>/events/` — paginated, newest-first. */
export async function fetchUserEvents(
  id: string,
  params?: QueryParams,
): Promise<PagedResult<AuthEvent>> {
  const { data } = await api.get(`/api/v1/auth/users/${id}/events/`, {
    params: { page: params?.page, page_size: params?.pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";

import type {
  AuthEventsFetchResponse,
  AuthEventType,
  ServiceAccountCredentialCreateResponse,
  ServiceAccountCredentialsFetchResponse,
  User,
  UserSessionsFetchResponse,
  UsersFetchResponse,
} from "./users.types";

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

export interface CreateUserPayload {
  username: string;
  display_name: string;
  email: string | null;
  actor_type: User["actor_type"];
  account_status: User["account_status"];
  is_login_enabled: boolean;
  password?: string;
}

export async function createUser(values: CreateUserPayload): Promise<User> {
  const { data } = await api.post("/api/v1/auth/users/", values);
  return data;
}

export interface UpdateUserPayload {
  display_name?: string;
  email?: string | null;
  actor_type?: User["actor_type"];
}

export async function updateUser(
  id: string,
  values: UpdateUserPayload,
): Promise<User> {
  const { display_name, email, actor_type } = values;
  const { data } = await api.patch(`/api/v1/auth/users/${id}/`, {
    display_name,
    email,
    actor_type,
  });
  return data;
}

export async function enableUserLogin(id: string): Promise<User> {
  const { data } = await api.post(`/api/v1/auth/users/${id}/enable-login/`);
  return data;
}

export async function disableUserLogin(id: string): Promise<User> {
  const { data } = await api.post(`/api/v1/auth/users/${id}/disable-login/`);
  return data;
}

export interface LockUserPayload {
  reason: string;
  duration_minutes?: number;
}

export async function lockUser(
  id: string,
  payload: LockUserPayload,
): Promise<User> {
  const { data } = await api.post(`/api/v1/auth/users/${id}/lock/`, payload);
  return data;
}

export async function unlockUser(id: string): Promise<User> {
  const { data } = await api.post(`/api/v1/auth/users/${id}/unlock/`);
  return data;
}

export async function forcePasswordChange(id: string): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/force-password-change/`);
}

export async function setTemporaryPassword(
  id: string,
  temporaryPassword: string,
): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/set-temporary-password/`, {
    temporary_password: temporaryPassword,
  });
}

export async function fetchUserSessions(
  id: string,
  params: { page: number; pageSize: number },
): Promise<UserSessionsFetchResponse> {
  const { data } = await api.get(`/api/v1/auth/users/${id}/sessions/`, {
    params: { page: params.page, page_size: params.pageSize },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

export async function revokeAllUserSessions(
  id: string,
): Promise<{ revoked_count: number }> {
  const { data } = await api.post(
    `/api/v1/auth/users/${id}/sessions/revoke-all/`,
  );
  return data;
}

export async function fetchUserAuthEvents(
  id: string,
  params: { page: number; pageSize: number; eventType?: AuthEventType },
): Promise<AuthEventsFetchResponse> {
  const { data } = await api.get(`/api/v1/auth/users/${id}/auth-events/`, {
    params: {
      page: params.page,
      page_size: params.pageSize,
      event_type: params.eventType || undefined,
    },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

export async function resetUserMfa(id: string): Promise<void> {
  await api.post(`/api/v1/auth/users/${id}/mfa/reset/`);
}

export async function fetchUserServiceAccountCredentials(
  id: string,
  params: { page: number; pageSize: number },
): Promise<ServiceAccountCredentialsFetchResponse> {
  const { data } = await api.get(
    `/api/v1/auth/users/${id}/service-account-credentials/`,
    { params: { page: params.page, page_size: params.pageSize } },
  );
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

export interface CreateServiceAccountCredentialPayload {
  name?: string;
  expires_at?: string | null;
}

export async function createServiceAccountCredential(
  id: string,
  values: CreateServiceAccountCredentialPayload,
): Promise<ServiceAccountCredentialCreateResponse> {
  const { data } = await api.post(
    `/api/v1/auth/users/${id}/service-account-credentials/`,
    values,
  );
  return data;
}

export async function revokeServiceAccountCredential(
  id: string,
  credentialId: string,
): Promise<void> {
  await api.post(
    `/api/v1/auth/users/${id}/service-account-credentials/${credentialId}/revoke/`,
  );
}

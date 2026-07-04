import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";

import type { Role, RolePermission, RolesFetchResponse } from "./roles.types";

export async function fetchRoles(
  params?: QueryParams,
): Promise<RolesFetchResponse> {
  const { data } = await api.get("/api/v1/permissions/roles/", {
    params: {
      page: params?.page,
      page_size: params?.pageSize,
      search: params?.search || undefined,
      ...params?.filters,
    },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

/**
 * Roles eligible for a binding: active + assignable. The list endpoint
 * doesn't document a server-side filter for this, so fetch a large page and
 * filter client-side.
 */
export async function fetchAssignableRoles(): Promise<Role[]> {
  const { data } = await api.get("/api/v1/permissions/roles/", {
    params: { page_size: 200 },
  });
  return (data.data as Role[]).filter(
    (role) => role.is_assignable && role.is_active,
  );
}

export interface CreateRolePayload {
  key: string;
  display_name: string;
  description?: string;
  role_type?: string;
  is_system_role?: boolean;
  is_assignable?: boolean;
}

export async function createRole(values: CreateRolePayload): Promise<Role> {
  const { data } = await api.post("/api/v1/permissions/roles/", values);
  return data;
}

export interface UpdateRolePayload {
  display_name?: string;
  description?: string;
  role_type?: string;
  is_assignable?: boolean;
}

export async function updateRole(
  id: string,
  values: UpdateRolePayload,
): Promise<Role> {
  const { data } = await api.patch(`/api/v1/permissions/roles/${id}/`, values);
  return data;
}

export async function deprecateRole(id: string): Promise<Role> {
  const { data } = await api.post(`/api/v1/permissions/roles/${id}/deprecate/`);
  return data;
}

export async function fetchRolePermissions(
  roleId: string,
): Promise<RolePermission[]> {
  const { data } = await api.get(
    `/api/v1/permissions/roles/${roleId}/permissions/`,
  );
  return data;
}

export async function attachRolePermission(
  roleId: string,
  permissionKey: string,
): Promise<RolePermission> {
  const { data } = await api.post(
    `/api/v1/permissions/roles/${roleId}/permissions/`,
    { permission_key: permissionKey },
  );
  return data;
}

export async function detachRolePermission(
  roleId: string,
  permissionKey: string,
): Promise<void> {
  await api.delete(
    `/api/v1/permissions/roles/${roleId}/permissions/${permissionKey}/`,
  );
}

import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";

import type { RoleBinding, RoleBindingsFetchResponse } from "./bindings.types";

export async function fetchRoleBindings(
  params?: QueryParams,
): Promise<RoleBindingsFetchResponse> {
  const { data } = await api.get("/api/v1/permissions/role-bindings/", {
    params: {
      page: params?.page,
      page_size: params?.pageSize,
      search: params?.search || undefined,
      ...params?.filters,
    },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

export async function fetchRoleBindingsForSubject(
  subjectUserId: string,
): Promise<RoleBinding[]> {
  const { data } = await api.get("/api/v1/permissions/role-bindings/", {
    params: { subject_user_id: subjectUserId, page_size: 200 },
  });
  return data.data;
}

export interface CreateRoleBindingPayload {
  subject_user_id: string;
  role_id: string;
  scope_type: RoleBinding["scope_type"];
  organization: string | null;
  organization_unit: string | null;
  valid_from: string | null;
  valid_until: string | null;
  assignment_reason: string;
}

export async function createRoleBinding(
  values: CreateRoleBindingPayload,
): Promise<RoleBinding> {
  const { data } = await api.post("/api/v1/permissions/role-bindings/", values);
  return data;
}

export async function revokeRoleBinding(
  id: string,
  reason?: string,
): Promise<RoleBinding> {
  const { data } = await api.post(
    `/api/v1/permissions/role-bindings/${id}/revoke/`,
    reason ? { reason } : {},
  );
  return data;
}

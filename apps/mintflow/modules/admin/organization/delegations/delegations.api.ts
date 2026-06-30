import api from "@/lib/api";
import type { QueryParams } from "@peppermint/admin";
import type {
  AssignmentOption,
  Delegation,
  DelegationCreatePayload,
  DelegationsFetchResponse,
  RevokePayload,
} from "./delegations.types";

export async function fetchDelegations(
  orgId: string,
  params?: QueryParams,
): Promise<DelegationsFetchResponse> {
  const res = await api.get(
    `/api/v1/organization/organizations/${orgId}/delegations/`,
    {
      params: {
        page: params?.page ?? 1,
        page_size: params?.pageSize ?? 20,
        search: params?.search,
        status: params?.filters?.status,
      },
    },
  );
  const d = res.data;
  return {
    data: d.data ?? d.results ?? d,
    meta: {
      total: d.meta?.count ?? d.count ?? 0,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    },
  };
}

export async function createDelegation(
  orgId: string,
  payload: DelegationCreatePayload,
): Promise<Delegation> {
  const res = await api.post(
    `/api/v1/organization/organizations/${orgId}/delegations/`,
    {
      from_assignment_id: payload.from_assignment_id,
      to_assignment_id: payload.to_assignment_id,
      delegation_type: payload.delegation_type,
      status: payload.status,
      scope_unit: payload.scope_unit ?? null,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at ?? null,
      reason: payload.reason,
    },
  );
  return res.data;
}

export async function revokeDelegation(
  id: string,
  payload: RevokePayload,
): Promise<Delegation> {
  const res = await api.post(
    `/api/v1/organization/delegations/${id}/revoke/`,
    payload,
  );
  return res.data;
}

export async function fetchAssignmentOptions(
  search: string,
): Promise<AssignmentOption[]> {
  const res = await api.get("/api/v1/organization/assignments/", {
    params: { search },
  });
  const d = res.data;
  const items: Array<Record<string, unknown>> = d.data ?? d.results ?? d ?? [];
  return items.map((a) => ({
    id: String(a.id),
    title: String(a.title ?? a.position_title ?? ""),
    code: String(a.code ?? ""),
    unitName: a.unit_name ? String(a.unit_name) : undefined,
    unitId: a.unit_id ? String(a.unit_id) : undefined,
  }));
}

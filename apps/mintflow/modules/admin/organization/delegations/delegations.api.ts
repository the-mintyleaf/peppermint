import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";

import type { OrganizationListResponse } from "../_shared/organization.types";
import type { AuthorityDelegation, DelegationType } from "./delegations.types";

export async function fetchDelegations(
  organizationId: string,
  params?: QueryParams,
): Promise<OrganizationListResponse<AuthorityDelegation>> {
  const { data } = await api.get(
    `/api/v1/organization/organizations/${organizationId}/delegations/`,
    {
      params: {
        page: params?.page,
        page_size: params?.pageSize,
        search: params?.search || undefined,
        ...params?.filters,
      },
    },
  );
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

export interface CreateDelegationPayload {
  from_assignment_id: string;
  to_assignment_id: string;
  delegation_type: DelegationType;
  status?: AuthorityDelegation["status"];
  scope_unit?: string | null;
  starts_at: string;
  ends_at?: string | null;
  reason: string;
}

export async function createDelegation(
  organizationId: string,
  values: CreateDelegationPayload,
): Promise<AuthorityDelegation> {
  const { data } = await api.post(
    `/api/v1/organization/organizations/${organizationId}/delegations/`,
    values,
  );
  return data;
}

export async function revokeDelegation(
  delegationId: string,
  payload: { reason: string },
): Promise<AuthorityDelegation> {
  const { data } = await api.post(
    `/api/v1/organization/delegations/${delegationId}/revoke/`,
    payload,
  );
  return data;
}

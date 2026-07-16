import api from "@/lib/api";

import type {
  Organization,
  OrganizationListResponse,
  OrganizationStatus,
  OrganizationType,
} from "./organizations.types";

export async function fetchOrganizations(): Promise<Organization[]> {
  const { data } = await api.get<OrganizationListResponse<Organization>>(
    "/api/v1/organization/organizations/",
    { params: { page_size: 200 } },
  );
  return data.data;
}

export async function fetchOrganization(id: string): Promise<Organization> {
  const { data } = await api.get(`/api/v1/organization/organizations/${id}/`);
  return data;
}

export interface CreateOrganizationPayload {
  name_np: string;
  name_en?: string;
  code: string;
  organization_type: OrganizationType;
  legal_name_np?: string;
  short_name_np?: string;
  short_name_en?: string;
  description?: string;
  country_code?: string;
  timezone?: string;
  sort_order: number;
}

export async function createOrganization(
  values: CreateOrganizationPayload,
): Promise<Organization> {
  const { data } = await api.post(
    "/api/v1/organization/organizations/",
    values,
  );
  return data;
}

/** Never send `code`, `status`, or `organization_type` through this endpoint. */
export interface UpdateOrganizationPayload {
  name_np?: string;
  name_en?: string;
  legal_name_np?: string;
  short_name_np?: string;
  short_name_en?: string;
  description?: string;
  country_code?: string;
  timezone?: string;
  sort_order?: number;
}

export async function updateOrganization(
  id: string,
  values: UpdateOrganizationPayload,
): Promise<Organization> {
  const { data } = await api.patch(
    `/api/v1/organization/organizations/${id}/`,
    values,
  );
  return data;
}

export interface ChangeOrganizationStatusPayload {
  status: OrganizationStatus;
  reason: string;
}

export async function changeOrganizationStatus(
  id: string,
  payload: ChangeOrganizationStatusPayload,
): Promise<Organization> {
  const { data } = await api.post(
    `/api/v1/organization/organizations/${id}/status/`,
    payload,
  );
  return data;
}

/** Bare count for the Overview setup-progress check — not the full members list. */
export async function fetchMembershipsCount(
  organizationId: string,
): Promise<number> {
  const { data } = await api.get<{ meta: { count: number } }>(
    `/api/v1/organization/organizations/${organizationId}/memberships/`,
    { params: { page_size: 1 } },
  );
  return data.meta.count;
}

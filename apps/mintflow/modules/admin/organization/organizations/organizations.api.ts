import api from "@/lib/api";
import type { QueryParams } from "@peppermint/admin";
import type {
  ChangeStatusPayload,
  Organization,
  OrganizationsFetchResponse,
} from "./organizations.types";

export async function fetchOrganizations(
  params?: QueryParams,
): Promise<OrganizationsFetchResponse> {
  const res = await api.get("/api/v1/organization/organizations/", {
    params: {
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      search: params?.search,
      status: params?.filters?.status,
    },
  });
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

export async function fetchOrganization(id: string): Promise<Organization> {
  const res = await api.get(`/api/v1/organization/organizations/${id}/`);
  return res.data;
}

export async function createOrganization(
  values: Partial<Organization>,
): Promise<Organization> {
  const res = await api.post("/api/v1/organization/organizations/", values);
  return res.data;
}

export async function updateOrganization(
  id: string,
  values: Partial<Organization>,
): Promise<Organization> {
  const res = await api.patch(
    `/api/v1/organization/organizations/${id}/`,
    values,
  );
  return res.data;
}

export async function deleteOrganization(id: string): Promise<void> {
  await api.delete(`/api/v1/organization/organizations/${id}/`);
}

export async function changeOrganizationStatus(
  id: string,
  payload: ChangeStatusPayload,
): Promise<Organization> {
  const res = await api.post(
    `/api/v1/organization/organizations/${id}/status/`,
    payload,
  );
  return res.data;
}

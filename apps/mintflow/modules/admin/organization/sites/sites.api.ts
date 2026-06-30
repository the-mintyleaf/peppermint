import api from "@/lib/api";
import type { QueryParams } from "@peppermint/admin";
import type { CreateSitePayload, Site, SitesFetchResponse } from "./sites.types";

export async function fetchSites(
  orgId: string,
  params?: QueryParams,
): Promise<SitesFetchResponse> {
  const res = await api.get(
    `/api/v1/organization/organizations/${orgId}/sites/`,
    {
      params: {
        page: params?.page ?? 1,
        page_size: params?.pageSize ?? 20,
        search: params?.search,
        is_active: params?.filters?.is_active,
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

export async function createSite(
  orgId: string,
  values: CreateSitePayload,
): Promise<Site> {
  const res = await api.post(
    `/api/v1/organization/organizations/${orgId}/sites/`,
    values,
  );
  return res.data;
}

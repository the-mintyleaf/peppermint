import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";

import type { OrganizationListResponse } from "../_shared/organization.types";
import type { OrganizationEventLog } from "./eventLog.types";

export async function fetchEventLog(
  organizationId: string,
  params?: QueryParams,
): Promise<OrganizationListResponse<OrganizationEventLog>> {
  const { data } = await api.get(
    `/api/v1/organization/organizations/${organizationId}/events/`,
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

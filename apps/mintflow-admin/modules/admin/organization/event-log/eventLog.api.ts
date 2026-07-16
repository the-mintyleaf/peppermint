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
        ordering: "-created_at",
        ...params?.filters,
      },
    },
  );
  const sorted = [...data.data].sort(
    (a: OrganizationEventLog, b: OrganizationEventLog) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return { data: sorted, meta: { ...data.meta, total: data.meta.count } };
}

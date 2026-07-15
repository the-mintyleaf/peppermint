import type { QueryParams } from "@peppermint/admin";
import api from "@/lib/api";
import type { SecurityEventsFetchResponse } from "./securityEvents.types";

/**
 * `GET /api/v1/auth/security-events/` — superadmin-only, paginated audit feed.
 * Filterable by `event_type` and `target_id` (passed through `params.filters`).
 */
export async function fetchSecurityEvents(
  params?: QueryParams,
): Promise<SecurityEventsFetchResponse> {
  const { data } = await api.get("/api/v1/auth/security-events/", {
    params: {
      page: params?.page,
      page_size: params?.pageSize,
      ...params?.filters,
    },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

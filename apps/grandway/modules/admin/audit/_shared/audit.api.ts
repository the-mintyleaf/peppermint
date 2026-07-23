import type { QueryParams } from "@peppermint/admin";
import api from "@/lib/api";
import type { AuditEvent } from "./audit.types";

export interface PagedResult<T> {
  data: T[];
  meta: { total: number } & Record<string, unknown>;
}

/**
 * `GET /api/v1/audit/events/` — paginated, newest-first (`audit/docs/INTEGRATION.md`
 * §3, §7). Admin/superadmin only. Filters are exact-match and AND-combined; there is
 * no free-text search or ordering param on this endpoint — only `params.filters`
 * (never `params.search`) is forwarded.
 */
export async function fetchAuditEvents(
  params?: QueryParams,
): Promise<PagedResult<AuditEvent>> {
  const { data } = await api.get("/api/v1/audit/events/", {
    params: {
      page: params?.page,
      page_size: params?.pageSize,
      ...params?.filters,
    },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

/** `GET /api/v1/audit/events/<id>/`. */
export async function getAuditEvent(id: string): Promise<AuditEvent> {
  const { data } = await api.get<AuditEvent>(`/api/v1/audit/events/${id}/`);
  return data;
}

import api from "@/lib/api";
import type {
  HistoryFetchParams,
  HistoryFetchResponse,
  OrganizationEventLog,
} from "./history.types";

function toEventLog(raw: Record<string, unknown>): OrganizationEventLog {
  return {
    id: String(raw.id),
    organization: raw.organization ? String(raw.organization) : null,
    actor: raw.actor ? String(raw.actor) : null,
    eventType: raw.event_type as OrganizationEventLog["eventType"],
    objectType: String(raw.object_type ?? ""),
    objectId: raw.object_id ? String(raw.object_id) : null,
    objectKey: String(raw.object_key ?? ""),
    summary: String(raw.summary ?? ""),
    detail: String(raw.detail ?? ""),
    reason: String(raw.reason ?? ""),
    actingAssignment: raw.acting_assignment
      ? String(raw.acting_assignment)
      : null,
    previousState:
      (raw.previous_state as Record<string, unknown> | null) ?? null,
    newState: (raw.new_state as Record<string, unknown> | null) ?? null,
    requestId: String(raw.request_id ?? ""),
    source: String(raw.source ?? ""),
    createdAt: String(raw.created_at ?? ""),
  };
}

export async function fetchEvents(
  orgId: string,
  params: HistoryFetchParams = {},
): Promise<HistoryFetchResponse> {
  const res = await api.get(
    `/api/v1/organization/organizations/${orgId}/events/`,
    {
      params: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
        event_type: params.eventType,
        acting_assignment: params.actingAssignment,
      },
    },
  );
  const d = res.data;
  const raw: Array<Record<string, unknown>> = d.data ?? d.results ?? d ?? [];
  return {
    data: raw.map(toEventLog),
    meta: {
      total: d.meta?.count ?? d.count ?? 0,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  };
}

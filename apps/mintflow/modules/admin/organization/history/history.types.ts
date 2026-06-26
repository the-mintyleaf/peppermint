import type {
  OrganizationEventLog,
  OrganizationEventType,
} from "../organization.types";

export type { OrganizationEventLog, OrganizationEventType };

export interface HistoryFetchResponse {
  data: OrganizationEventLog[];
  meta: { total: number; page: number; pageSize: number };
}

export interface HistoryFetchParams {
  page?: number;
  pageSize?: number;
  eventType?: string;
  actingAssignment?: string;
}

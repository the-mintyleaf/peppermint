import type {
  OrganizationEventLog,
  OrganizationEventType,
} from "../../organization.types";

export interface EventLogFilters {
  eventType?: OrganizationEventType | "";
  actingAssignment?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EventLogListProps {
  events: OrganizationEventLog[];
  loading?: boolean;
  total: number;
  page: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  filters: EventLogFilters;
  onFiltersChange: (filters: EventLogFilters) => void;
}

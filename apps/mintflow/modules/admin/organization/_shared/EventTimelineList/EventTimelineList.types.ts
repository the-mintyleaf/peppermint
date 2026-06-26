import type { OrganizationEventLog } from "../../organization.types";

export interface EventTimelineListProps {
  events: OrganizationEventLog[];
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Array-form React Query keys for the work domain (matches mintflow's own
 * convention — see `useCurrentUser` `["auth","me"]`). Hierarchical so a parent
 * key invalidates its children: invalidating `["work"]` drops everything,
 * `workKeys.items()` drops every work list, etc. Params objects are part of the
 * key so distinct filters cache separately.
 */

export type WorkListParams = {
  status?: string;
  priority?: string;
  responsible_unit?: string;
  fiscal_year?: string;
  overdue?: boolean;
  page?: number;
  page_size?: number;
};

export const workKeys = {
  all: ["work"] as const,

  items: () => [...workKeys.all, "items"] as const,
  itemList: (params?: WorkListParams) =>
    [...workKeys.items(), "list", params ?? {}] as const,
  item: (id: string) => [...workKeys.items(), "detail", id] as const,
  itemHierarchyPreview: (id: string) =>
    [...workKeys.item(id), "hierarchy-preview"] as const,

  tasks: (workId: string) => [...workKeys.item(workId), "tasks"] as const,
  task: (taskId: string) => [...workKeys.all, "task", taskId] as const,

  activities: (workId: string) =>
    [...workKeys.item(workId), "activities"] as const,
  attachments: (workId: string) =>
    [...workKeys.item(workId), "attachments"] as const,
  evidence: (workId: string) => [...workKeys.item(workId), "evidence"] as const,
  reviews: (workId: string) => [...workKeys.item(workId), "reviews"] as const,
  stakeholders: (workId: string) =>
    [...workKeys.item(workId), "stakeholders"] as const,
  participants: (workId: string) =>
    [...workKeys.item(workId), "participants"] as const,

  // Dashboards
  myActive: () => [...workKeys.all, "my", "active"] as const,
  myPendingAssignments: () =>
    [...workKeys.all, "my", "pending-assignments"] as const,
  myPendingReviews: () => [...workKeys.all, "my", "pending-reviews"] as const,
  unitQueue: (unitId: string) =>
    [...workKeys.all, "unit", unitId, "queue"] as const,
  unitHierarchyOverview: (unitId: string) =>
    [...workKeys.all, "unit", unitId, "hierarchy-overview"] as const,
};

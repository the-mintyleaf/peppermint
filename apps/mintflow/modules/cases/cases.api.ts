/**
 * Real work-item (case) fetchers — the backend `work` read surface for the
 * cases module. Types/keys/enums come from the frozen `@/lib/work` contract;
 * this file only maps endpoints → typed calls. Mutations land in later phases.
 */

import api from "@/lib/api";
import type {
  HierarchyPreview,
  Page,
  Paginated,
  WorkActivityEntry,
  WorkItem,
  WorkListParams,
  WorkTask,
} from "@/lib/work";
import { toPage } from "@/lib/work";

/** List visible work items (paginated, visibility-filtered by the backend). */
export async function listWorkItems(
  params?: WorkListParams,
): Promise<Page<WorkItem>> {
  const { data } = await api.get<Paginated<WorkItem>>("/api/v1/work/items/", {
    params,
  });
  return toPage(data);
}

/** Read a single work item. Unknown/invisible → 404 WORK_ITEM_NOT_FOUND. */
export async function getWorkItem(id: string): Promise<WorkItem> {
  const { data } = await api.get<WorkItem>(`/api/v1/work/items/${id}/`);
  return data;
}

/**
 * Task tree for a work item — a single prefetched, sequence-ordered list
 * (parent_task links the hierarchy). Returned unpaginated per the contract.
 */
export async function getTaskTree(workId: string): Promise<WorkTask[]> {
  const { data } = await api.get<WorkTask[]>(
    `/api/v1/work/items/${workId}/tasks/`,
  );
  return data;
}

/** Activity timeline (paginated, visibility-filtered at the query layer). */
export async function listActivities(
  workId: string,
  params?: { page?: number; page_size?: number },
): Promise<Page<WorkActivityEntry>> {
  const { data } = await api.get<Paginated<WorkActivityEntry>>(
    `/api/v1/work/items/${workId}/activities/`,
    { params },
  );
  return toPage(data);
}

/** Read-only dry run of the hierarchy resolver for a work item. */
export async function getHierarchyPreview(
  id: string,
): Promise<HierarchyPreview> {
  const { data } = await api.get<HierarchyPreview>(
    `/api/v1/work/items/${id}/hierarchy-preview/`,
  );
  return data;
}

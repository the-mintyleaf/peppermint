import {
  fetchContentItems,
  approveContentItem,
  rejectContentItem,
  updateContentItem,
} from "../content/content.api";
import type { ContentItem } from "../shared/domain.types";
import { delay } from "../shared/mock.utils";
import { PaginatedResponse } from "../shared/mock.utils";

export async function fetchPendingApprovals(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<ContentItem>> {
  return fetchContentItems({
    status: "pending_review",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
  });
}

export async function approveItem(
  id: string,
  notes?: string,
): Promise<ContentItem> {
  return approveContentItem(id, notes);
}

export async function rejectItem(
  id: string,
  notes: string,
): Promise<ContentItem> {
  return rejectContentItem(id, notes);
}

export async function assignItem(
  id: string,
  userId: string,
): Promise<ContentItem> {
  await delay(300);
  return updateContentItem(id, { createdBy: userId });
}

// TODO(backend): replace with real approval workflow API

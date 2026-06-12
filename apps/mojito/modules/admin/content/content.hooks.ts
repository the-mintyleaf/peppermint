"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { contentKeys } from "./content.queryKeys";
import type { QueryParams } from "./content.api";
import type { ContentItem } from "../shared/domain.types";
import {
  fetchContentItems,
  fetchContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  scheduleContentItem,
  publishNowContentItem,
  approveContentItem,
  rejectContentItem,
  duplicateContentItem,
} from "./content.api";

export function useContentItems(params?: QueryParams) {
  return useQuery({
    queryKey: contentKeys.list(params as Record<string, unknown>),
    queryFn: () => fetchContentItems(params),
  });
}

export function useContentItem(id: string) {
  return useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: () => fetchContentItem(id),
    enabled: !!id,
  });
}

function useContentMutation<TVariables>(
  mutateFn: (vars: TVariables) => Promise<ContentItem | void>,
  successMessage: string,
  invalidateKeys?: unknown[][]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutateFn,
    onSuccess: () => {
      const keys = invalidateKeys ?? [contentKeys.lists()];
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      notifications.show({ message: successMessage, color: "green" });
    },
    onError: (error: Error) => {
      notifications.show({
        message: error.message ?? "Something went wrong",
        color: "red",
      });
    },
  });
}

export function useCreateContent() {
  return useContentMutation(
    (data: Parameters<typeof createContentItem>[0]) => createContentItem(data),
    "Content created successfully"
  );
}

export function useUpdateContent() {
  return useContentMutation(
    ({ id, data }: { id: string; data: Partial<ContentItem> }) =>
      updateContentItem(id, data),
    "Content updated successfully"
  );
}

export function useDeleteContent() {
  return useContentMutation(
    (id: string) => deleteContentItem(id),
    "Content deleted"
  );
}

export function useScheduleContent() {
  return useContentMutation(
    ({
      id,
      scheduledAt,
      timezone,
    }: {
      id: string;
      scheduledAt: Date;
      timezone: string;
    }) => scheduleContentItem(id, scheduledAt, timezone),
    "Content scheduled"
  );
}

export function usePublishNow() {
  return useContentMutation(
    (id: string) => publishNowContentItem(id),
    "Publishing content…"
  );
}

export function useApproveContent() {
  return useContentMutation(
    ({ id, notes }: { id: string; notes?: string }) =>
      approveContentItem(id, notes),
    "Content approved"
  );
}

export function useRejectContent() {
  return useContentMutation(
    ({ id, notes }: { id: string; notes: string }) =>
      rejectContentItem(id, notes),
    "Content rejected"
  );
}

export function useDuplicateContent() {
  return useContentMutation(
    (id: string) => duplicateContentItem(id),
    "Content duplicated"
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { queueKeys } from "./queue.queryKeys";
import type { QueueSlot } from "../shared/entities.types";
import {
  fetchQueueSlots,
  fetchQueuedContent,
  addQueueSlot,
  updateQueueSlot,
  deleteQueueSlot,
  placeInQueue,
  removeFromQueue,
} from "./queue.api";

export function useQueueSlots(channelId?: string) {
  return useQuery({
    queryKey: queueKeys.slots(channelId),
    queryFn: () => fetchQueueSlots(channelId),
  });
}

export function useQueuedContent(channelId?: string) {
  return useQuery({
    queryKey: queueKeys.content(channelId),
    queryFn: () => fetchQueuedContent(channelId),
  });
}

export function useAddQueueSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slot: Omit<QueueSlot, "id">) => addQueueSlot(slot),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queueKeys.slots() });
      notifications.show({ message: "Slot added", color: "green" });
    },
  });
}

export function useUpdateQueueSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QueueSlot> }) =>
      updateQueueSlot(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queueKeys.slots() });
    },
  });
}

export function useDeleteQueueSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQueueSlot(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queueKeys.slots() });
      notifications.show({ message: "Slot removed", color: "green" });
    },
  });
}

export function usePlaceInQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      contentId,
      slotId,
    }: {
      contentId: string;
      slotId: string;
    }) => placeInQueue(contentId, slotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queueKeys.content() });
    },
  });
}

export function useRemoveFromQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contentId: string) => removeFromQueue(contentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queueKeys.content() });
    },
  });
}

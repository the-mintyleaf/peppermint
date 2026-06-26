"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { approvalsKeys } from "./approvals.queryKeys";
import {
  fetchPendingApprovals,
  approveItem,
  rejectItem,
  assignItem,
} from "./approvals.api";

export function useApprovals(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: approvalsKeys.list({ page, pageSize }),
    queryFn: () => fetchPendingApprovals({ page, pageSize }),
  });
}

export function useApproveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      approveItem(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.list() });
      notifications.show({ message: "Content approved", color: "green" });
    },
  });
}

export function useRejectItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      rejectItem(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.list() });
      notifications.show({ message: "Content rejected", color: "orange" });
    },
  });
}

export function useAssignItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      assignItem(id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalsKeys.list() });
    },
  });
}

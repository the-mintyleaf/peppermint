"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { runsKeys } from "./runs.queryKeys";
import { fetchRuns, fetchRun, approveGate, retryRun, cancelRun, RunsFilter } from "./runs.api";
import type { AutomationRun } from "../shared/entities.types";

export function useRuns(filters?: RunsFilter) {
  return useQuery({
    queryKey: runsKeys.list(filters as Record<string, unknown>),
    queryFn: () => fetchRuns(filters),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasRunning = data.data.some((r) => r.status === "running");
      return hasRunning ? 5000 : false;
    },
  });
}

export function useRun(id: string) {
  return useQuery({
    queryKey: runsKeys.detail(id),
    queryFn: () => fetchRun(id),
    enabled: !!id,
    refetchInterval: (query) => {
      return query.state.data?.status === "running" ? 3000 : false;
    },
  });
}

function useRunMutation(
  mutateFn: (id: string) => Promise<AutomationRun>,
  successMessage: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mutateFn,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: runsKeys.lists() });
      qc.invalidateQueries({ queryKey: runsKeys.detail(id) });
      notifications.show({ message: successMessage, color: "green" });
    },
    onError: () => notifications.show({ message: "Action failed", color: "red" }),
  });
}

export function useApproveGate() {
  return useRunMutation(approveGate, "Run approved — resuming workflow");
}

export function useRetryRun() {
  return useRunMutation(retryRun, "Run restarted");
}

export function useCancelRun() {
  return useRunMutation(cancelRun, "Run cancelled");
}

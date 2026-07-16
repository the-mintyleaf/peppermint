"use client";

import { useCallback, useMemo, useState } from "react";
import { notifications, useQuery } from "@peppermint/ui";

import { FOCUS_LIMIT, WIP_LIMIT, fetchDashboard } from "./module.api";
import type {
  DashboardData,
  FlowColumn,
  FlowTask,
  FocusTask,
  Kpi,
  WorkFile,
} from "./module.api";

export type DashboardVariant = "populated" | "empty";

/** Shared "no backend yet" feedback for inert actions across the module. */
export function notConnected(): void {
  notifications.show({ message: "Not connected yet", color: "gray" });
}

export function useDashboard(variant: DashboardVariant = "populated") {
  return useQuery({
    queryKey: ["dashboard", variant],
    queryFn: () => fetchDashboard(variant),
  });
}

// ── Work-file ranking (spec §7 — involvement → deadline → blockers → activity;
//    never alphabetical) ─────────────────────────────────────────────────────

export function rankWorkFiles(files: WorkFile[]): WorkFile[] {
  return [...files].sort(
    (a, b) =>
      b.involvement - a.involvement ||
      a.deadlineRank - b.deadlineRank ||
      b.blockers - a.blockers ||
      a.activityRank - b.activityRank,
  );
}

// ── Rate readout gate (spec §11 — never "0%") ────────────────────────────────

export const RATE_EMPTY_COPY =
  "Not enough data yet — check back after a few more completed tasks.";

/** A rate KPI shows its value only once it has enough history (N ≥ threshold). */
export function hasEnoughData(kpi: Kpi): boolean {
  if (kpi.kind !== "rate") return true;
  const n = kpi.sampleN ?? 0;
  return n >= (kpi.rateThreshold ?? 5);
}

// ── Focus + flow board state ─────────────────────────────────────────────────

function isUrgent(task: FlowTask): boolean {
  return (
    task.priority === "high" &&
    (task.overdue || task.dueRelative === "Due today")
  );
}

interface SwapOffer {
  incoming: FlowTask;
}

export interface DashboardBoard {
  focus: FocusTask[];
  flowByColumn: Record<FlowColumn, FlowTask[]>;
  wipCount: number;
  wipFull: boolean;
  swapOffer: SwapOffer | null;
  toggleFocusDone: (id: string) => void;
  moveFlow: (taskId: string, to: FlowColumn) => void;
  quickComplete: (taskId: string) => void;
  acceptSwap: (replaceFocusId: string) => void;
  dismissSwap: () => void;
}

/**
 * Owns the drag-reorderable focus + flow copies seeded from the fetched
 * payload. Encodes the WIP limit (§6) and the auto-focus rule (§5): an urgent
 * task entering In Progress slots into Focus if there's room, otherwise offers
 * a swap — it never silently overwrites a manual pick.
 */
export function useDashboardBoard(
  data: DashboardData | undefined,
): DashboardBoard {
  const [focus, setFocus] = useState<FocusTask[]>(data?.focus ?? []);
  const [flow, setFlow] = useState<FlowTask[]>(data?.flow ?? []);
  const [swapOffer, setSwapOffer] = useState<SwapOffer | null>(null);

  // Re-seed the local copies whenever the fetched payload changes (render-time
  // sync per React's "you might not need an effect" guidance).
  const [synced, setSynced] = useState<DashboardData | undefined>(data);
  if (synced !== data) {
    setSynced(data);
    setFocus(data?.focus ?? []);
    setFlow(data?.flow ?? []);
    setSwapOffer(null);
  }

  const flowByColumn = useMemo(() => groupByColumn(flow), [flow]);
  const wipCount = flowByColumn.in_progress.length;
  const wipFull = wipCount >= WIP_LIMIT;

  const focusFromFlow = useCallback(
    (task: FlowTask): FocusTask => ({
      id: `focus-${task.id}`,
      title: task.title,
      file: task.file,
      priority: task.priority,
      due: task.dueRelative,
      overdue: task.overdue,
      state: "in_progress",
      collaborator: task.avatar,
    }),
    [],
  );

  const promoteToFocus = useCallback(
    (task: FlowTask) => {
      setFocus((prev) => {
        if (prev.some((f) => f.id === `focus-${task.id}`)) return prev;
        if (prev.length < FOCUS_LIMIT) return [...prev, focusFromFlow(task)];
        // Focus is full — offer a swap instead of overwriting a manual pick.
        setSwapOffer({ incoming: task });
        return prev;
      });
    },
    [focusFromFlow],
  );

  const moveFlow = useCallback(
    (taskId: string, to: FlowColumn) => {
      setFlow((prev) => {
        const task = prev.find((t) => t.id === taskId);
        if (!task || task.column === to) return prev;
        // WIP guard — In progress is capped (§6).
        if (to === "in_progress") {
          const current = prev.filter((t) => t.column === "in_progress").length;
          if (current >= WIP_LIMIT) {
            notifications.show({
              color: "yellow",
              message:
                "In progress is full. Finish or hand off one task before starting another.",
            });
            return prev;
          }
        }
        const next = prev.map((t) =>
          t.id === taskId ? { ...t, column: to } : t,
        );
        if (to === "in_progress" && isUrgent(task)) promoteToFocus(task);
        return next;
      });
    },
    [promoteToFocus],
  );

  const quickComplete = useCallback((taskId: string) => {
    setFlow((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, column: "done" } : t)),
    );
  }, []);

  const toggleFocusDone = useCallback((id: string) => {
    setFocus((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              state: f.state === "done" ? "in_progress" : "done",
              completedAt: f.state === "done" ? undefined : "Completed now",
            }
          : f,
      ),
    );
  }, []);

  const acceptSwap = useCallback(
    (replaceFocusId: string) => {
      setSwapOffer((offer) => {
        if (!offer) return null;
        setFocus((prev) => [
          ...prev.filter((f) => f.id !== replaceFocusId),
          focusFromFlow(offer.incoming),
        ]);
        return null;
      });
    },
    [focusFromFlow],
  );

  const dismissSwap = useCallback(() => setSwapOffer(null), []);

  return {
    focus,
    flowByColumn,
    wipCount,
    wipFull,
    swapOffer,
    toggleFocusDone,
    moveFlow,
    quickComplete,
    acceptSwap,
    dismissSwap,
  };
}

function groupByColumn(flow: FlowTask[]): Record<FlowColumn, FlowTask[]> {
  const result: Record<FlowColumn, FlowTask[]> = {
    up_next: [],
    in_progress: [],
    done: [],
  };
  for (const task of flow) result[task.column].push(task);
  return result;
}

// ── Task-detail drawer (spec §15) ────────────────────────────────────────────

export function useDrawer() {
  const [task, setTask] = useState<FlowTask | null>(null);
  const open = useCallback((next: FlowTask) => setTask(next), []);
  const close = useCallback(() => setTask(null), []);
  return { task, opened: task !== null, open, close };
}

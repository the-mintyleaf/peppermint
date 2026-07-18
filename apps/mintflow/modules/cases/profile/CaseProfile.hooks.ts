"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@peppermint/ui";

import {
  isWorkNotFound,
  useActorDirectory,
  useUnitDirectory,
  workKeys,
} from "@/lib/work";
import {
  getTaskTree,
  getWorkItem,
  listActivities,
  listEvidence,
} from "../cases.api";
import {
  buildActivityView,
  buildCaseView,
  caseActorIds,
  caseUnitIds,
  type ActivityView,
  type CaseView,
} from "./caseView";

export type WorkTab = "activity" | "evidence" | "people";

/**
 * Full case profile: the work item (the gate — a 404 here is "not found"),
 * plus its task tree and activity timeline, all resolved to a single view-model
 * with owner/assignee/unit names filled in from the directory.
 */
export function useCaseProfile(caseId: string) {
  const itemQuery = useQuery({
    queryKey: workKeys.item(caseId),
    queryFn: () => getWorkItem(caseId),
    retry: false,
  });
  const item = itemQuery.data;

  const tasksQuery = useQuery({
    queryKey: workKeys.tasks(caseId),
    queryFn: () => getTaskTree(caseId),
    enabled: Boolean(item),
  });
  const activityQuery = useQuery({
    queryKey: workKeys.activities(caseId),
    queryFn: () => listActivities(caseId).then((page) => page.items),
    enabled: Boolean(item),
  });

  const tasks = tasksQuery.data ?? [];
  const activity = activityQuery.data ?? [];

  const actorDir = useActorDirectory(caseActorIds(item, tasks, activity));
  const unitDir = useUnitDirectory(caseUnitIds(item, tasks));

  const view: CaseView | null = item
    ? buildCaseView(item, tasks, activity, actorDir, unitDir)
    : null;
  const activityView: ActivityView[] = buildActivityView(activity, actorDir);

  const notFound = itemQuery.isError && isWorkNotFound(itemQuery.error);

  return {
    view,
    activity: activityView,
    isLoading: itemQuery.isLoading,
    isError: itemQuery.isError && !notFound,
    notFound,
    refetch: itemQuery.refetch,
  };
}

/** Evidence for a work item — fetched lazily when the Evidence tab is open. */
export function useEvidence(caseId: string, enabled: boolean) {
  return useQuery({
    queryKey: workKeys.evidence(caseId),
    queryFn: () => listEvidence(caseId).then((page) => page.items),
    enabled,
  });
}

/** Selected task (feed filter) + active work tab. */
export function useProfileView() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [tab, setTab] = useState<WorkTab>("activity");

  const toggleTask = (id: string) =>
    setTaskId((current) => (current === id ? null : id));

  return { taskId, setTaskId, toggleTask, tab, setTab };
}

/**
 * Activity filtered to a selected task, or the full feed when none is picked. A
 * task with no events yields an empty list (not the full feed) so the "showing
 * activity for X" banner never lies.
 */
export function useVisibleActivity(
  activity: ActivityView[],
  taskId: string | null,
): ActivityView[] {
  return useMemo(() => {
    if (!taskId) return activity;
    return activity.filter((e) => e.taskId === taskId);
  }, [activity, taskId]);
}

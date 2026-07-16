"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@peppermint/ui";

import { fetchCaseProfile } from "./profile.api";
import type { CaseActivityEvent } from "./profile.api";

export type WorkTab = "activity" | "files" | "people";

export function useCaseProfile(caseId: string) {
  return useQuery({
    queryKey: ["cases", "profile", caseId],
    queryFn: () => fetchCaseProfile(caseId),
  });
}

/** Selected checklist-task (feed filter) + active work tab. */
export function useProfileView() {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [tab, setTab] = useState<WorkTab>("activity");

  const toggleTask = (id: string) =>
    setTaskId((current) => (current === id ? null : id));

  return { taskId, setTaskId, toggleTask, tab, setTab };
}

/** Activity filtered to a selected task, or the full feed when none is picked. */
export function useVisibleActivity(
  activity: CaseActivityEvent[] | undefined,
  taskId: string | null,
): CaseActivityEvent[] {
  return useMemo(() => {
    const feed = activity ?? [];
    if (!taskId) return feed;
    const scoped = feed.filter((e) => e.taskId === taskId);
    return scoped.length > 0 ? scoped : feed;
  }, [activity, taskId]);
}

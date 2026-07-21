"use client";

import { useMemo } from "react";
import { TEAM_MEMBERS } from "../kanban/module.api";
import type { Task, TeamMember } from "../kanban/module.api";

export type DisplayStatus =
  | "in_progress"
  | "ready_for_review"
  | "in_review"
  | "new"
  | "rejected";

export const DISPLAY_STATUS_ORDER: DisplayStatus[] = [
  "new",
  "in_progress",
  "ready_for_review",
  "in_review",
  "rejected",
];

export const DISPLAY_STATUS_LABELS: Record<DisplayStatus, string> = {
  new: "New",
  in_progress: "In progress",
  ready_for_review: "Ready for review",
  in_review: "In review",
  rejected: "Rejected",
};

export function getDisplayStatus(task: Task): DisplayStatus {
  if (task.status === "inbox") return "new";
  if (task.status === "rejected") return "rejected";
  if (task.status === "hold") return "in_review";
  // ongoing — check subtask completion
  const total = task.subtasks?.length ?? 0;
  const completed =
    task.subtasks?.filter((s) => s.status === "completed").length ?? 0;
  if (total > 0 && completed === total) return "ready_for_review";
  return "in_progress";
}

export function useTeamMembers(tasks: Task[] | undefined): {
  members: TeamMember[];
  taskCountByMember: Record<string, number>;
} {
  const taskCountByMember = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const member of TEAM_MEMBERS) counts[member.id] = 0;
    for (const task of tasks ?? []) {
      const assignees = task.assignees ?? [
        { name: task.assignee, initials: "", color: "" },
      ];
      for (const a of assignees) {
        const match = TEAM_MEMBERS.find((m) => m.name === a.name);
        if (match) counts[match.id] = (counts[match.id] ?? 0) + 1;
      }
    }
    return counts;
  }, [tasks]);

  return { members: TEAM_MEMBERS, taskCountByMember };
}

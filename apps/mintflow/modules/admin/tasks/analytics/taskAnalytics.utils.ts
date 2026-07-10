import type { Task } from "../kanban/module.api";
import type { ScheduledTask } from "./taskAnalytics.types";

export function scheduledTaskToTask(scheduled: ScheduledTask): Task {
  return {
    id: scheduled.id,
    taskNumber: scheduled.taskNumber,
    title: scheduled.title,
    category: "general",
    status: "ongoing",
    priority: scheduled.categoryFilter === "urgent" ? "urgent" : "normal",
    assignee: scheduled.assignees[0]?.name ?? "Unassigned",
    createdAt: "Today",
    group: scheduled.category,
    assignees: scheduled.assignees,
    description: scheduled.checklist
      ? `Checklist:\n${scheduled.checklist.map((item) => `• ${item}`).join("\n")}`
      : undefined,
  };
}

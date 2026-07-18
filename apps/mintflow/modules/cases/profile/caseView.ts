/**
 * Case-profile view-model — transforms the real `work` DTOs (WorkItem + task
 * tree + activity) plus resolved actor/unit names into one stable shape the
 * profile components render. Centralizes the faithful-reshape mapping so each
 * component stays presentational. Replaces the mock `profile.api.ts`.
 */

import { tokens } from "@/config/design";
import {
  actorInitials,
  actorLabel,
  avatarColorForId,
  formatGregorian,
  resolveTitle,
  unitLabel,
  type Directory,
  type DirectoryUnit,
  type DirectoryUser,
  type TaskStatus,
  type WorkActivityEntry,
  type WorkItem,
  type WorkPriority,
  type WorkStatus,
  type WorkTask,
} from "@/lib/work";

export type TaskState = "done" | "in_progress" | "pending";

export interface PersonView {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
}

export interface TaskChipView {
  id: string;
  title: string;
  state: TaskState;
  status: TaskStatus;
  /** For optimistic-concurrency on task commands. */
  version: number;
}

/** Coarse activity buckets that drive the timeline icon/tint. */
export type ActivityKind =
  | "submission"
  | "review"
  | "blocker"
  | "correction"
  | "decision"
  | "note";

export interface ActivityView {
  id: string;
  title: string;
  who: string;
  when: string;
  note?: string;
  kind: ActivityKind;
  taskId?: string | null;
}

export interface CaseView {
  item: WorkItem;
  title: string;
  referenceNumber: string;
  objective: string;
  unitName: string;
  owner: PersonView | null;
  people: PersonView[];
  tasks: TaskChipView[];
  progress: { done: number; total: number; pct: number };
  breakdown: { done: number; inProgress: number; pending: number };
  dueLabel: string;
  dueBs: string;
  createdLabel: string;
  updatedLabel: string;
  priority: WorkPriority;
  reviewRequired: boolean;
}

const TERMINAL_TASK: ReadonlySet<TaskStatus> = new Set([
  "cancelled",
  "archived",
]);

function taskState(status: TaskStatus): TaskState {
  if (status === "completed") return "done";
  if (status === "in_progress" || status === "review_pending")
    return "in_progress";
  return "pending";
}

export type TaskActionKind = "start" | "complete" | "return" | "archive";

export const TASK_ACTION_LABEL: Record<TaskActionKind, string> = {
  start: "Start",
  complete: "Complete",
  return: "Return uncompleted",
  archive: "Archive",
};

export type WorkActionKind =
  | "start"
  | "submit_review"
  | "submit_closure"
  | "deadline"
  | "close"
  | "reopen"
  | "archive"
  | "restore";

export const WORK_ACTION_LABEL: Record<WorkActionKind, string> = {
  start: "Start work",
  submit_review: "Submit for review",
  submit_closure: "Submit for closure",
  deadline: "Extend deadline",
  close: "Close work",
  reopen: "Reopen",
  archive: "Archive",
  restore: "Restore",
};

/** Work commands that need a form (the rest run directly). */
export const FORM_BACKED_WORK_ACTIONS: ReadonlySet<WorkActionKind> = new Set([
  "deadline",
  "close",
  "reopen",
]);

/**
 * Work-item commands offered for a status. The backend validates the transition
 * (invalid → 409), so this is a sensible menu, not the full rule set. Direct
 * in_progress→closed is forbidden — closure goes through submit-closure first.
 */
export function availableWorkActions(status: WorkStatus): WorkActionKind[] {
  switch (status) {
    case "archived":
      return ["restore"];
    case "closed":
      return ["reopen", "archive"];
    case "closure_pending":
      return ["close", "archive"];
    case "review_pending":
      return ["archive"];
    case "changes_requested":
      return ["start", "submit_review", "deadline", "archive"];
    case "blocked":
      return ["deadline", "archive"];
    case "in_progress":
      return ["submit_review", "submit_closure", "deadline", "archive"];
    case "accepted":
      return ["start", "deadline", "archive"];
    default:
      return ["archive"];
  }
}

/**
 * Commands offered for a task in a given status. The backend is the authority
 * (an invalid transition returns 409), so this is a sensible menu, not the full
 * validation — terminal statuses offer nothing.
 */
export function availableTaskActions(status: TaskStatus): TaskActionKind[] {
  if (status === "cancelled" || status === "archived" || status === "completed")
    return [];
  const actions: TaskActionKind[] = [];
  if (
    status === "not_started" ||
    status === "accepted" ||
    status === "changes_requested"
  )
    actions.push("start");
  if (status === "in_progress") actions.push("complete");
  if (status === "in_progress" || status === "review_pending")
    actions.push("return");
  actions.push("archive");
  return actions;
}

function activityKind(type: WorkActivityEntry["activity_type"]): ActivityKind {
  switch (type) {
    case "submission":
    case "document_prepared":
      return "submission";
    case "review_response":
      return "review";
    case "blocker_reported":
    case "dependency_resolved":
      return "blocker";
    case "correction":
      return "correction";
    case "decision":
      return "decision";
    default:
      return "note";
  }
}

function person(
  id: string | null | undefined,
  role: string,
  actorDir: Directory<DirectoryUser>,
): PersonView | null {
  if (!id) return null;
  return {
    id,
    name: actorLabel(id, actorDir),
    initials: actorInitials(id, actorDir),
    color: avatarColorForId(id),
    role,
  };
}

/** Every actor/unit id referenced by a case (for batch name resolution). */
export function caseActorIds(
  item: WorkItem | undefined,
  tasks: WorkTask[],
  activity: WorkActivityEntry[],
): string[] {
  const ids: (string | null)[] = [];
  if (item) ids.push(item.current_owner, item.created_by);
  tasks.forEach((t) => ids.push(t.current_assignee, t.created_by));
  activity.forEach((a) => ids.push(a.actor));
  return ids.filter((id): id is string => Boolean(id));
}

export function caseUnitIds(
  item: WorkItem | undefined,
  tasks: WorkTask[],
): string[] {
  const ids: (string | null)[] = [];
  if (item) ids.push(item.responsible_unit);
  tasks.forEach((t) => ids.push(t.responsible_unit));
  return ids.filter((id): id is string => Boolean(id));
}

export function buildCaseView(
  item: WorkItem,
  tasks: WorkTask[],
  activity: WorkActivityEntry[],
  actorDir: Directory<DirectoryUser>,
  unitDir: Directory<DirectoryUnit>,
): CaseView {
  const counted = tasks.filter((t) => !TERMINAL_TASK.has(t.status));
  const done = counted.filter((t) => t.status === "completed").length;
  const inProgress = counted.filter(
    (t) => taskState(t.status) === "in_progress",
  ).length;
  const total = counted.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const owner = person(item.current_owner, "Accountable owner", actorDir);

  // People = owner + distinct task assignees (participants arrive in P4).
  const peopleById = new Map<string, PersonView>();
  if (owner) peopleById.set(owner.id, owner);
  tasks.forEach((t) => {
    const p = person(t.current_assignee, "Task assignee", actorDir);
    if (p && !peopleById.has(p.id)) peopleById.set(p.id, p);
  });

  return {
    item,
    title: resolveTitle(item),
    referenceNumber: item.reference_number,
    objective: item.objective,
    unitName: unitLabel(item.responsible_unit, unitDir),
    owner,
    people: Array.from(peopleById.values()),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: resolveTitle(t),
      state: taskState(t.status),
      status: t.status,
      version: t.aggregate_version,
    })),
    progress: { done, total, pct },
    breakdown: { done, inProgress, pending: total - done - inProgress },
    dueLabel: formatGregorian(item.due_at),
    dueBs: item.due_at_bs?.display_en ?? "",
    createdLabel: formatGregorian(item.created_at),
    updatedLabel: formatGregorian(item.updated_at),
    priority: item.priority,
    reviewRequired: item.review_required,
  };
}

export function buildActivityView(
  activity: WorkActivityEntry[],
  actorDir: Directory<DirectoryUser>,
): ActivityView[] {
  return activity.map((a) => ({
    id: a.id,
    title: a.description,
    who: actorLabel(a.actor, actorDir),
    when: formatGregorian(a.occurred_at),
    note: a.correction_reason ?? undefined,
    kind: activityKind(a.activity_type),
    taskId: a.task,
  }));
}

/* Presentational maps keyed to the view-model's derived types. */

export const TASK_STATE_STYLE: Record<
  TaskState,
  { label: string; color: string }
> = {
  done: { label: "Done", color: tokens.green },
  in_progress: { label: "In progress", color: tokens.blue },
  pending: { label: "Pending", color: tokens.muted },
};

export const ACTIVITY_STYLE: Record<
  ActivityKind,
  { fg: string; ring: string }
> = {
  submission: { fg: tokens.purpleInk, ring: tokens.purpleSoft },
  review: { fg: tokens.accentDark, ring: tokens.accentSoft },
  blocker: { fg: "rgb(176,116,20)", ring: "rgba(176,116,20,0.12)" },
  correction: { fg: tokens.muted2, ring: "rgba(0,0,0,0.06)" },
  decision: { fg: tokens.blueInk, ring: tokens.blueSoft },
  note: { fg: tokens.muted2, ring: "rgba(0,0,0,0.06)" },
};

/** Priority as a 5-segment urgency meter (one segment per WorkPriority level). */
export const PRIORITY_METER: Record<
  WorkPriority,
  {
    label: string;
    level: number;
    fg: string;
    bg: string;
    bar: string;
    note: string;
  }
> = {
  low: {
    label: "Low",
    level: 1,
    fg: tokens.muted2,
    bg: "rgba(0,0,0,0.06)",
    bar: tokens.muted,
    note: "Low priority — worked as capacity allows.",
  },
  normal: {
    label: "Normal",
    level: 2,
    fg: tokens.blueInk,
    bg: tokens.blueSoft,
    bar: tokens.blue,
    note: "Standard handling against the target date.",
  },
  high: {
    label: "High",
    level: 3,
    fg: tokens.accentDark,
    bg: tokens.accentSoft,
    bar: tokens.accent,
    note: "Elevated priority — progress reviewed frequently.",
  },
  urgent: {
    label: "Urgent",
    level: 4,
    fg: tokens.accentDark,
    bg: tokens.accentSoft,
    bar: tokens.accent,
    note: "Urgent — active daily coordination required.",
  },
  critical: {
    label: "Critical",
    level: 5,
    fg: "rgb(201,42,42)",
    bg: "rgba(201,42,42,0.1)",
    bar: "rgb(201,42,42)",
    note: "Critical — highest priority, immediate attention.",
  },
};

import { tokens } from "@/config/design";
import { MOCK_CASES, MOCK_FILES } from "../module.api";
import { formatDate } from "./CaseProfile.utils";
import type { CaseFile, CasePriority, WorkCase } from "../module.api";

export type {
  CaseFile,
  CasePriority,
  CaseStatus,
  CaseTask,
  Officer,
  TaskState,
  WorkCase,
} from "../module.api";
export {
  CATEGORY_STYLE,
  FILE_STYLE,
  PRIORITY_STYLE,
  STATUS_STYLE,
  caseProgress,
} from "../module.api";

/** Kind of entry in a case's synthesized activity feed. */
export type CaseActivityKind =
  | "opened"
  | "task_done"
  | "task_progress"
  | "file"
  | "status"
  | "note";

export interface CaseActivityEvent {
  id: string;
  kind: CaseActivityKind;
  title: string;
  who: string;
  when: string;
  note?: string;
  /** Links the event to a case task, so the strip can filter the feed. */
  taskId?: string;
}

/** Everything the profile page renders for one case. */
export interface CaseProfileData {
  workCase: WorkCase;
  files: CaseFile[];
  activity: CaseActivityEvent[];
}

/* --------------------------------------------------------------------------
 * Presentational maps that the design needs but the domain model doesn't carry
 * — priority urgency meter + activity-node tints. All from the fixed tokens.
 * ------------------------------------------------------------------------ */

/** Priority read as a 4-segment urgency meter (design's "Urgency" card). */
export const PRIORITY_METER: Record<
  CasePriority,
  {
    label: string;
    level: number;
    fg: string;
    bg: string;
    bar: string;
    note: string;
  }
> = {
  urgent: {
    label: "Urgent",
    level: 4,
    fg: tokens.accentDark,
    bg: tokens.accentSoft,
    bar: tokens.accent,
    note: "Highest priority — active daily coordination required.",
  },
  high: {
    label: "High",
    level: 3,
    fg: tokens.accentDark,
    bg: tokens.accentSoft,
    bar: tokens.accent,
    note: "Elevated priority — progress reviewed frequently.",
  },
  normal: {
    label: "Normal",
    level: 2,
    fg: tokens.blueInk,
    bg: tokens.blueSoft,
    bar: tokens.blue,
    note: "Standard handling against the target date.",
  },
  low: {
    label: "Low",
    level: 1,
    fg: tokens.muted2,
    bg: "rgba(0,0,0,0.06)",
    bar: tokens.muted,
    note: "Low priority — worked as capacity allows.",
  },
};

/** Task-state dot color for the checklist strip + people/task rows. */
export const TASK_STATE_STYLE: Record<
  "done" | "in_progress" | "pending",
  { label: string; color: string }
> = {
  done: { label: "Done", color: tokens.green },
  in_progress: { label: "In progress", color: tokens.blue },
  pending: { label: "Pending", color: tokens.muted },
};

/** Activity node tint per kind (icon chosen in the component). */
export const ACTIVITY_STYLE: Record<
  CaseActivityKind,
  { fg: string; ring: string }
> = {
  opened: { fg: tokens.accentDark, ring: tokens.accentSoft },
  task_done: { fg: tokens.green, ring: tokens.greenTint },
  task_progress: { fg: tokens.blueInk, ring: tokens.blueSoft },
  file: { fg: tokens.purpleInk, ring: tokens.purpleSoft },
  status: { fg: tokens.accentDark, ring: tokens.accentSoft },
  note: { fg: tokens.muted2, ring: "rgba(0,0,0,0.06)" },
};

/* --------------------------------------------------------------------------
 * Activity synthesis — a plausible, deterministic feed derived from the case's
 * real tasks, files, and dates (no backend). Newest first.
 * ------------------------------------------------------------------------ */

// Coarse relative labels applied by position so the feed reads chronologically.
const REL_STEPS = [
  "Yesterday",
  "2d ago",
  "4d ago",
  "6d ago",
  "1w ago",
  "2w ago",
];

function buildActivity(
  workCase: WorkCase,
  files: CaseFile[],
): CaseActivityEvent[] {
  const lead = workCase.officers[0];
  const leadName = lead?.name ?? "Case system";
  const events: CaseActivityEvent[] = [];

  const inProgress = workCase.tasks.filter((t) => t.state === "in_progress");
  const done = workCase.tasks.filter((t) => t.state === "done");

  inProgress.forEach((task) =>
    events.push({
      id: `act-${task.id}`,
      kind: "task_progress",
      title: `Working on “${task.title}”`,
      who: leadName,
      when: workCase.updated,
      taskId: task.id,
    }),
  );

  files.slice(0, 2).forEach((file, i) =>
    events.push({
      id: `act-file-${file.id}`,
      kind: "file",
      title: `Filed ${file.name}`,
      who: file.owner.name,
      when: `${file.modified}`,
      note: i === 0 ? `${file.size} · ${file.ext}` : undefined,
    }),
  );

  done
    .slice()
    .reverse()
    .forEach((task) =>
      events.push({
        id: `act-${task.id}`,
        kind: "task_done",
        title: `Completed “${task.title}”`,
        who: leadName,
        when: "",
        taskId: task.id,
      }),
    );

  events.push({
    id: "act-opened",
    kind: "opened",
    title: `Case opened · ${workCase.caseNumber}`,
    who: leadName,
    when: formatDate(workCase.openedDate),
    note: `Filed under ${workCase.departments.join(" · ")}`,
  });

  // Fill in coarse relative labels for the untimed middle of the feed.
  return events.map((e, i) =>
    e.when ? e : { ...e, when: REL_STEPS[Math.min(i, REL_STEPS.length - 1)] },
  );
}

const NETWORK_DELAY_MS = 200;

/** Fetch the full profile for one case, or `null` for an unknown id. */
export async function fetchCaseProfile(
  caseId: string,
): Promise<CaseProfileData | null> {
  await new Promise((r) => setTimeout(r, NETWORK_DELAY_MS));
  const workCase = MOCK_CASES.find((c) => c.id === caseId);
  if (!workCase) return null;
  const files = MOCK_FILES.filter((f) => f.caseNumber === workCase.caseNumber);
  return { workCase, files, activity: buildActivity(workCase, files) };
}

/** Convenience: done / in-progress / pending counts for the breakdown card. */
export function taskBreakdown(workCase: WorkCase): {
  done: number;
  inProgress: number;
  pending: number;
} {
  return {
    done: workCase.tasks.filter((t) => t.state === "done").length,
    inProgress: workCase.tasks.filter((t) => t.state === "in_progress").length,
    pending: workCase.tasks.filter((t) => t.state === "pending").length,
  };
}

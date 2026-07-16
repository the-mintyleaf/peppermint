/**
 * Today's Focus dashboard — self-contained mock data + types (UI only, no
 * backend). Sample content follows the design spec §16. Colors map the spec's
 * moss / lavender / amber onto the app's fixed tokens (no new palette):
 *   moss     → tokens.green / greenSoft / greenTint
 *   lavender → tokens.purpleInk / purpleSoft
 *   amber    → AMBER / AMBER_SOFT (as in the cases module)
 *
 * Data rules encoded here (spec §11):
 *   - `estimate` is optional and left undefined in every task → the estimate
 *     chip never renders (there is no workload-vs-time engine).
 *   - rate-style KPIs carry a `sampleN`; the UI hides the rate until N ≥ 5 and
 *     shows the "not enough data yet" copy instead. On-time rate ships in that
 *     empty state on purpose (the §11 proof).
 */
import type { CaseIconKind } from "@/components";
import { tokens } from "@/config/design";

/** amber — late / on-hold-over-limit accents (shared with the cases module). */
export const AMBER = "rgb(176,116,20)";
export const AMBER_SOFT = "rgba(176,116,20,0.12)";

/** moss — the daily-commitment / "yours" / momentum accent. */
export const MOSS = tokens.green;
export const MOSS_SOFT = tokens.greenTint;

/** lavender — the "on hold" flag (never a column). */
export const LAVENDER = tokens.purpleInk;
export const LAVENDER_SOFT = tokens.purpleSoft;

/** Max focus tasks a day (spec §5) and the flow WIP limit (spec §6). */
export const FOCUS_LIMIT = 3;
export const WIP_LIMIT = 3;

export type Priority = "high" | "medium" | "low";

export interface Person {
  name: string;
  initials: string;
  /** Mantine color name for the avatar. */
  color: string;
}

/** The work-file a task belongs to — swatch + name is the only chip shown. */
export interface FileRef {
  name: string;
  /** Swatch color. */
  swatch: string;
}

// ── §5 Focus ───────────────────────────────────────────────────────────────

export type FocusState = "done" | "in_progress" | "todo";

export interface FocusTask {
  id: string;
  title: string;
  file: FileRef;
  priority: Priority;
  /** Relative due label, e.g. "Due 2 PM". */
  due: string;
  /** A late focus task is still late (spec §5) — amber due chip. */
  overdue?: boolean;
  state: FocusState;
  /** "Completed 09:12" — present only when state is "done". */
  completedAt?: string;
  collaborator?: Person;
  /**
   * Optional effort estimate. NEVER populated in mock data and NEVER required
   * (spec §11) — the chip is render-guarded so it stays hidden.
   */
  estimate?: string;
}

// ── §6 Task flow ─────────────────────────────────────────────────────────────

export type FlowColumn = "up_next" | "in_progress" | "done";

/** "On hold" is a flag, not a column (spec §6) — plain reason + duration. */
export interface OnHold {
  reason: string;
  duration: string;
}

export interface FlowTask {
  id: string;
  file: FileRef;
  title: string;
  /** Relative due, e.g. "Due in 2 days" / "Due today". */
  dueRelative: string;
  column: FlowColumn;
  priority: Priority;
  subtasks?: { done: number; total: number };
  onHold?: OnHold;
  overdue?: boolean;
  /** One avatar, only when relevant. */
  avatar?: Person;
  // Drawer detail fields (spec §15) —
  description?: string;
  dependencies?: string[];
  comments?: number;
  attachments?: { name: string; ext: string }[];
  activity?: { id: string; text: string; when: string }[];
}

// ── §7 Work files ────────────────────────────────────────────────────────────

export interface WorkFile {
  id: string;
  name: string;
  /** Swatch + icon tint. */
  swatch: string;
  icon: CaseIconKind;
  department: string;
  milestone: string;
  openCount: number;
  /** 0–1. */
  completion: number;
  /** "N yours" — moss badge. */
  yoursCount: number;
  /** "N overdue" — amber badge (0 → hidden). */
  overdueCount: number;
  pinned: boolean;
  alert: boolean;
  team: Person[];
  /**
   * Ranking inputs (spec §7: involvement → deadline → blockers → activity;
   * NEVER alphabetical). Lower `deadlineRank`/`activityRank` = sooner/fresher.
   */
  involvement: number;
  deadlineRank: number;
  blockers: number;
  activityRank: number;
}

// ── §8 Needs your attention ──────────────────────────────────────────────────

export type AttentionTone = "approval" | "hold" | "deadline";

export interface AttentionItem {
  id: string;
  tone: AttentionTone;
  /** One-line, blame-free statement. */
  statement: string;
  detail: string;
  actionLabel: string;
}

// ── §10 KPIs + momentum ──────────────────────────────────────────────────────

export type KpiKind = "count" | "ratio" | "rate";

export interface Kpi {
  id: string;
  label: string;
  kind: KpiKind;
  /** Display value for count/ratio kinds. */
  value?: string;
  /** what / trend / action (spec §10). */
  trend?: string;
  actionLabel: string;
  /** Extra line, e.g. the on-hold reason. */
  detail?: string;
  /** Weekly sparkline series (focus kept). */
  sparkline?: number[];
  /**
   * Sample size behind a `rate`. The UI hides the rate until N ≥ 5 and shows
   * the "not enough data yet" copy — never "0%" (spec §11).
   */
  sampleN?: number;
  rateThreshold?: number;
}

export interface Momentum {
  /** Short bold headline, e.g. "Steady week so far". */
  title: string;
  line: string;
  actionLabel: string;
}

export interface DashboardData {
  focus: FocusTask[];
  flow: FlowTask[];
  workFiles: WorkFile[];
  attention: AttentionItem[];
  kpis: Kpi[];
  momentum: Momentum;
}

// ── Style maps ───────────────────────────────────────────────────────────────

export const PRIORITY_STYLE: Record<
  Priority,
  { label: string; fg: string; bg: string }
> = {
  high: { label: "High", fg: tokens.accentDark, bg: tokens.accentSoft },
  medium: { label: "Medium", fg: tokens.blueInk, bg: tokens.blueSoft },
  low: { label: "Low", fg: tokens.muted2, bg: "rgba(0,0,0,0.06)" },
};

export const FLOW_COLUMN_META: Record<
  FlowColumn,
  { label: string; hint: string }
> = {
  up_next: { label: "Up next", hint: "Ready to pick up" },
  in_progress: { label: "In progress", hint: "Being worked on" },
  done: { label: "Done today", hint: "Finished today" },
};

export const ATTENTION_TONE: Record<AttentionTone, { fg: string; bg: string }> =
  {
    approval: { fg: tokens.blueInk, bg: tokens.blueSoft },
    hold: { fg: LAVENDER, bg: LAVENDER_SOFT },
    deadline: { fg: AMBER, bg: AMBER_SOFT },
  };

// ── Swatches (work-file colors, spec §16) ────────────────────────────────────

const SWATCH = {
  disaster: tokens.accentDark,
  citizenship: tokens.blueInk,
  district: AMBER,
  passport: MOSS,
  grievance: LAVENDER,
} as const;

// ── People ───────────────────────────────────────────────────────────────────

const PEOPLE: Record<string, Person> = {
  aarati: { name: "Aarati Shrestha", initials: "AS", color: "blue" },
  bikash: { name: "Bikash Rai", initials: "BR", color: "violet" },
  deepa: { name: "Deepa Karki", initials: "DK", color: "teal" },
  nabin: { name: "Nabin Gurung", initials: "NG", color: "orange" },
};

// ── Mock data (spec §16) ─────────────────────────────────────────────────────

const MOCK: DashboardData = {
  // §5 — three honest states: done · high+overdue · medium in-progress.
  focus: [
    {
      id: "f1",
      title: "Sign off citizenship batch #4471",
      file: { name: "Citizenship Backlog Review", swatch: SWATCH.citizenship },
      priority: "medium",
      due: "Due 10 AM",
      state: "done",
      completedAt: "Completed 09:12",
    },
    {
      id: "f2",
      title: "Approve district deployment plan",
      file: { name: "District Security Coordination", swatch: SWATCH.district },
      priority: "high",
      due: "Due 2 PM",
      overdue: true,
      state: "todo",
      collaborator: PEOPLE.nabin,
    },
    {
      id: "f3",
      title: "Review grievance escalation cases",
      file: { name: "Public Grievance Portal", swatch: SWATCH.grievance },
      priority: "medium",
      due: "Due 5 PM",
      state: "in_progress",
    },
  ],

  // §6 — three columns; on-hold is a lavender flag kept in its real column.
  flow: [
    {
      id: "t1",
      file: { name: "Passport Office Automation", swatch: SWATCH.passport },
      title: "Draft rollout checklist for biometric kiosks",
      dueRelative: "Due in 3 days",
      column: "up_next",
      priority: "medium",
      subtasks: { done: 1, total: 5 },
      description:
        "Prepare the phased rollout checklist for the new biometric kiosks across the three pilot district offices.",
      dependencies: ["Vendor hardware sign-off"],
      comments: 2,
    },
    {
      id: "t2",
      file: { name: "Citizenship Backlog Review", swatch: SWATCH.citizenship },
      title: "Verify supporting documents for batch #4472",
      dueRelative: "Due tomorrow",
      column: "up_next",
      priority: "medium",
      onHold: { reason: "Waiting on District Office", duration: "2 days" },
      avatar: PEOPLE.deepa,
    },
    {
      id: "t3",
      file: { name: "District Security Coordination", swatch: SWATCH.district },
      title: "Approve district deployment plan",
      dueRelative: "Due today",
      column: "in_progress",
      priority: "high",
      overdue: true,
      subtasks: { done: 2, total: 4 },
      avatar: PEOPLE.nabin,
      description:
        "Final sign-off on the deployment plan for additional personnel across the eastern district.",
      comments: 4,
      attachments: [{ name: "deployment-plan-v3.pdf", ext: "PDF" }],
    },
    {
      id: "t4",
      file: { name: "Public Grievance Portal", swatch: SWATCH.grievance },
      title: "Review grievance escalation cases",
      dueRelative: "Due today",
      column: "in_progress",
      priority: "medium",
      subtasks: { done: 3, total: 7 },
    },
    {
      id: "t5",
      file: { name: "Disaster Response Readiness", swatch: SWATCH.disaster },
      title: "Circulate updated evacuation route map",
      dueRelative: "Due in 5 days",
      column: "in_progress",
      priority: "high",
      avatar: PEOPLE.aarati,
    },
    {
      id: "t6",
      file: { name: "Citizenship Backlog Review", swatch: SWATCH.citizenship },
      title: "Sign off citizenship batch #4471",
      dueRelative: "Done 09:12",
      column: "done",
      priority: "medium",
    },
    {
      id: "t7",
      file: { name: "Passport Office Automation", swatch: SWATCH.passport },
      title: "Confirm vendor SLA amendments",
      dueRelative: "Done 08:40",
      column: "done",
      priority: "low",
    },
  ],

  // §7 — prioritized 2–3 (ranked, never alphabetical).
  workFiles: [
    {
      id: "w1",
      name: "Disaster Response Readiness",
      swatch: SWATCH.disaster,
      icon: "security",
      department: "Emergency Management",
      milestone: "Milestone: Field drill sign-off",
      openCount: 17,
      completion: 0.42,
      yoursCount: 4,
      overdueCount: 2,
      pinned: true,
      alert: false,
      team: [PEOPLE.aarati, PEOPLE.nabin, PEOPLE.deepa],
      involvement: 4,
      deadlineRank: 0,
      blockers: 1,
      activityRank: 0,
    },
    {
      id: "w2",
      name: "Citizenship Backlog Review",
      swatch: SWATCH.citizenship,
      icon: "case",
      department: "Citizenship Dept.",
      milestone: "Milestone: Q3 backlog cleared",
      openCount: 12,
      completion: 0.68,
      yoursCount: 3,
      overdueCount: 0,
      pinned: true,
      alert: false,
      team: [PEOPLE.deepa, PEOPLE.bikash],
      involvement: 3,
      deadlineRank: 1,
      blockers: 0,
      activityRank: 1,
    },
    {
      id: "w3",
      name: "District Security Coordination",
      swatch: SWATCH.district,
      icon: "security",
      department: "District Administration",
      milestone: "Milestone: Deployment approved",
      openCount: 8,
      completion: 0.55,
      yoursCount: 1,
      overdueCount: 1,
      pinned: false,
      alert: true,
      team: [PEOPLE.nabin],
      involvement: 1,
      deadlineRank: 2,
      blockers: 1,
      activityRank: 2,
    },
  ],

  // §8 — exceptions only, blame-free, one action each.
  attention: [
    {
      id: "a1",
      tone: "approval",
      statement: "2 cases waiting for your approval",
      detail: "Citizenship batch #4472 · District deployment plan",
      actionLabel: "Review approvals",
    },
    {
      id: "a2",
      tone: "hold",
      statement: "1 task on hold over 24 hours",
      detail: "Verify supporting documents · waiting on District Office",
      actionLabel: "Send a reminder",
    },
    {
      id: "a3",
      tone: "deadline",
      statement: "Deadline today, little progress",
      detail: "District deployment plan · 2 of 4 subtasks done",
      actionLabel: "Start now",
    },
  ],

  // §10 — what / trend / action; on-time ships in its empty state (§11).
  kpis: [
    {
      id: "k1",
      label: "Done this week",
      kind: "count",
      value: "14",
      trend: "+8% vs 4-wk avg",
      actionLabel: "View completed",
    },
    {
      id: "k2",
      label: "Focus kept",
      kind: "ratio",
      value: "8/10",
      trend: "Last 10 days",
      actionLabel: "See focus history",
      sparkline: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    },
    {
      id: "k3",
      label: "On-time rate",
      kind: "rate",
      actionLabel: "How this works",
      sampleN: 3,
      rateThreshold: 5,
    },
    {
      id: "k4",
      label: "On hold now",
      kind: "count",
      value: "1",
      trend: "Waiting on District Office",
      detail: "Verify supporting documents · 2 days",
      actionLabel: "Review on-hold",
    },
  ],

  momentum: {
    title: "Steady week so far",
    line: "Plan tomorrow when today's work is done — no need to look further than that.",
    actionLabel: "Plan tomorrow",
  },
};

/** Empty / first-run payload — everything at 0, no red, rates stay hidden. */
const EMPTY: DashboardData = {
  focus: [],
  flow: [],
  workFiles: [],
  attention: [],
  kpis: [
    {
      id: "k1",
      label: "Done this week",
      kind: "count",
      value: "0",
      actionLabel: "View completed",
    },
    {
      id: "k2",
      label: "Focus kept",
      kind: "rate",
      actionLabel: "See focus history",
      sampleN: 0,
      rateThreshold: 5,
    },
    {
      id: "k3",
      label: "On-time rate",
      kind: "rate",
      actionLabel: "How this works",
      sampleN: 0,
      rateThreshold: 5,
    },
    {
      id: "k4",
      label: "On hold now",
      kind: "count",
      value: "0",
      actionLabel: "Review on-hold",
    },
  ],
  momentum: {
    title: "A fresh start",
    line: "Pick up to three focus tasks and the day takes shape.",
    actionLabel: "Choose focus tasks",
  },
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Fetch the dashboard payload (mock). Pass "empty" for the first-run variant. */
export async function fetchDashboard(
  variant: "populated" | "empty" = "populated",
): Promise<DashboardData> {
  await wait(180);
  return variant === "empty" ? EMPTY : MOCK;
}

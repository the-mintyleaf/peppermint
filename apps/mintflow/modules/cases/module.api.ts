import { tokens } from "@/config/design";
import type { CaseIconKind } from "@/components";

/** Lifecycle of a case — drives the status tabs, badges, and list column. */
export type CaseStatus =
  | "open"
  | "in_progress"
  | "under_review"
  | "on_hold"
  | "resolved"
  | "closed";

export type CasePriority = "urgent" | "high" | "normal" | "low";

/** The kind of matter the ministry is handling. */
export type CaseCategory =
  | "criminal"
  | "harassment"
  | "missing_person"
  | "public_order"
  | "immigration"
  | "administrative";

export type TaskState = "done" | "in_progress" | "pending";

export interface Officer {
  id: string;
  name: string;
  initials: string;
  /** Mantine color name for the avatar. */
  color: string;
  role: string;
}

export interface CaseTask {
  id: string;
  title: string;
  state: TaskState;
}

/** A case = a single matter before the Ministry of Home Affairs. */
export interface WorkCase {
  id: string;
  caseNumber: string;
  title: string;
  summary: string;
  category: CaseCategory;
  status: CaseStatus;
  priority: CasePriority;
  tasks: CaseTask[];
  officers: Officer[];
  departments: string[];
  location: string;
  /** ISO date the case was opened. */
  openedDate: string;
  /** ISO target date. */
  dueDate: string;
  /** Relative "last activity" label. */
  updated: string;
}

/** A document filed against a case (reports, warrants, statements, evidence). */
export type CaseFileKind =
  | "report"
  | "warrant"
  | "statement"
  | "evidence"
  | "form";

export interface CaseFile {
  id: string;
  name: string;
  kind: CaseFileKind;
  /** Extension label shown on the badge, e.g. "PDF". */
  ext: string;
  size: string;
  modified: string;
  owner: Officer;
  caseNumber: string;
}

interface StatusStyle {
  label: string;
  /** Foreground for the status pill. */
  fg: string;
  /** Soft pill background. */
  bg: string;
  /** Flat status-keyed tint for the card surface (over paper). */
  cardTint: string;
}

const AMBER = "rgb(176,116,20)";
const AMBER_SOFT = "rgba(176,116,20,0.12)";

export const STATUS_STYLE: Record<CaseStatus, StatusStyle> = {
  open: {
    label: "Open",
    fg: tokens.blueInk,
    bg: tokens.blueSoft,
    cardTint: "rgba(44,110,202,0.08)",
  },
  in_progress: {
    label: "In Progress",
    fg: tokens.accentDark,
    bg: tokens.accentSoft,
    cardTint: "rgba(238,87,41,0.08)",
  },
  under_review: {
    label: "Under Review",
    fg: tokens.purpleInk,
    bg: tokens.purpleSoft,
    cardTint: "rgba(120,90,200,0.08)",
  },
  on_hold: {
    label: "On Hold",
    fg: AMBER,
    bg: AMBER_SOFT,
    cardTint: "rgba(176,116,20,0.09)",
  },
  resolved: {
    label: "Resolved",
    fg: tokens.green,
    bg: tokens.greenTint,
    cardTint: "rgba(16,130,85,0.08)",
  },
  closed: {
    label: "Closed",
    fg: tokens.muted2,
    bg: "rgba(0,0,0,0.06)",
    cardTint: "rgba(0,0,0,0.035)",
  },
};

/**
 * Priority styling — `color` is the Mantine `Badge` color name (list/modal);
 * `fg`/`bg` drive the soft flag pill on the card.
 */
export const PRIORITY_STYLE: Record<
  CasePriority,
  { label: string; color: string; fg: string; bg: string }
> = {
  urgent: {
    label: "Urgent",
    color: "red",
    fg: "rgb(201,42,42)",
    bg: "rgba(201,42,42,0.1)",
  },
  high: {
    label: "High",
    color: "orange",
    fg: tokens.accentDark,
    bg: tokens.accentSoft,
  },
  normal: {
    label: "Normal",
    color: "blue",
    fg: tokens.blueInk,
    bg: tokens.blueSoft,
  },
  low: {
    label: "Low",
    color: "gray",
    fg: tokens.muted2,
    bg: "rgba(0,0,0,0.06)",
  },
};

export const CATEGORY_STYLE: Record<
  CaseCategory,
  { icon: CaseIconKind; color: string; tint: string; label: string }
> = {
  criminal: {
    icon: "security",
    color: tokens.accentDark,
    tint: tokens.accentSoft,
    label: "Criminal",
  },
  harassment: {
    icon: "case",
    color: tokens.purpleInk,
    tint: tokens.purpleSoft,
    label: "Harassment",
  },
  missing_person: {
    icon: "case",
    color: tokens.blueInk,
    tint: tokens.blueSoft,
    label: "Missing Person",
  },
  public_order: {
    icon: "press",
    color: AMBER,
    tint: AMBER_SOFT,
    label: "Public Order",
  },
  immigration: {
    icon: "folder",
    color: tokens.green,
    tint: tokens.greenTint,
    label: "Immigration",
  },
  administrative: {
    icon: "finance",
    color: tokens.muted2,
    tint: "rgba(0,0,0,0.06)",
    label: "Administrative",
  },
};

export const FILE_STYLE: Record<
  CaseFileKind,
  { type: string; fg: string; bg: string }
> = {
  report: { type: "Report", fg: tokens.accentDark, bg: tokens.accentSoft },
  warrant: { type: "Warrant", fg: tokens.purpleInk, bg: tokens.purpleSoft },
  statement: { type: "Statement", fg: tokens.blueInk, bg: tokens.blueSoft },
  evidence: { type: "Evidence", fg: tokens.green, bg: tokens.greenTint },
  form: { type: "Form", fg: tokens.muted2, bg: "rgba(0,0,0,0.06)" },
};

/** Completed / total tasks and percentage for a case. */
export function caseProgress(workCase: WorkCase): {
  done: number;
  total: number;
  pct: number;
} {
  const total = workCase.tasks.length;
  const done = workCase.tasks.filter((t) => t.state === "done").length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}

const P: Record<string, Officer> = {
  ar: {
    id: "ar",
    name: "Anisa Rahman",
    initials: "AR",
    color: "orange",
    role: "Lead Investigator",
  },
  lm: {
    id: "lm",
    name: "Leo Mabotja",
    initials: "LM",
    color: "green",
    role: "Case Officer",
  },
  mt: {
    id: "mt",
    name: "Maya Tan",
    initials: "MT",
    color: "teal",
    role: "Legal Counsel",
  },
  sk: {
    id: "sk",
    name: "Sam Koirala",
    initials: "SK",
    color: "grape",
    role: "Forensics Analyst",
  },
  jd: {
    id: "jd",
    name: "Jonas Devries",
    initials: "JD",
    color: "blue",
    role: "Field Agent",
  },
  pv: {
    id: "pv",
    name: "Priya Verma",
    initials: "PV",
    color: "pink",
    role: "Victim Support",
  },
};

function tasks(titles: [string, TaskState][]): CaseTask[] {
  return titles.map(([title, state], i) => ({ id: `t${i}`, title, state }));
}

// Ordered most-recently-updated first (default sort is order-preserving).
export const MOCK_CASES: WorkCase[] = [
  {
    id: "c1",
    caseNumber: "MHA-2026-0151",
    title: "Missing Person — Minor, Ward 7",
    summary:
      "Report of a missing 14-year-old last seen near the Ward 7 transit hub. Cross-referencing CCTV and coordinating a district-wide search.",
    category: "missing_person",
    status: "in_progress",
    priority: "urgent",
    tasks: tasks([
      ["Log initial report and description", "done"],
      ["Pull transit-hub CCTV footage", "done"],
      ["Issue district-wide alert", "in_progress"],
      ["Interview family and school contacts", "in_progress"],
      ["Coordinate search teams", "pending"],
      ["Compile daily situation report", "pending"],
    ]),
    officers: [P.ar, P.jd, P.lm, P.pv],
    departments: ["Search & Rescue", "Criminal Investigation"],
    location: "Ward 7, Transit District",
    openedDate: "2026-07-14",
    dueDate: "2026-07-20",
    updated: "22m ago",
  },
  {
    id: "c2",
    caseNumber: "MHA-2026-0142",
    title: "Murder Investigation — Riverside District",
    summary:
      "Homicide reported at a Riverside residence. Forensic collection complete; awaiting autopsy findings before charging decisions.",
    category: "criminal",
    status: "in_progress",
    priority: "urgent",
    tasks: tasks([
      ["Secure and process the scene", "done"],
      ["Collect forensic evidence", "done"],
      ["Obtain autopsy report", "in_progress"],
      ["Interview persons of interest", "in_progress"],
      ["Review CCTV timeline", "pending"],
      ["Prepare charging brief", "pending"],
      ["File with prosecutor", "pending"],
    ]),
    officers: [P.ar, P.sk, P.jd],
    departments: ["Criminal Investigation", "Forensics"],
    location: "Riverside, Ward 4",
    openedDate: "2026-06-02",
    dueDate: "2026-08-15",
    updated: "4h ago",
  },
  {
    id: "c3",
    caseNumber: "MHA-2026-0155",
    title: "Fraudulent Documents Ring — Cross-District",
    summary:
      "Organised production of forged identity documents spanning three districts. Cyber Unit tracing distribution channels.",
    category: "criminal",
    status: "under_review",
    priority: "high",
    tasks: tasks([
      ["Map the distribution network", "done"],
      ["Seize suspected print equipment", "done"],
      ["Analyse seized devices", "done"],
      ["Cross-check flagged documents", "in_progress"],
      ["Coordinate with district units", "in_progress"],
      ["Draft indictment package", "pending"],
      ["Legal review of evidence chain", "pending"],
      ["Schedule coordinated arrests", "pending"],
    ]),
    officers: [P.jd, P.sk, P.ar, P.mt, P.lm],
    departments: ["Criminal Investigation", "Forensics", "Cyber Unit"],
    location: "Districts 2, 5 & 8",
    openedDate: "2026-06-20",
    dueDate: "2026-09-01",
    updated: "6h ago",
  },
  {
    id: "c4",
    caseNumber: "MHA-2026-0147",
    title: "Domestic Assault — Protective Order",
    summary:
      "Assault complaint with an active protective-order request. Victim support engaged; awaiting court hearing date.",
    category: "criminal",
    status: "in_progress",
    priority: "high",
    tasks: tasks([
      ["Record victim statement", "done"],
      ["File protective-order request", "done"],
      ["Gather medical documentation", "done"],
      ["Serve notice to respondent", "in_progress"],
      ["Prepare hearing bundle", "pending"],
      ["Arrange victim support follow-up", "pending"],
    ]),
    officers: [P.pv, P.mt],
    departments: ["Criminal Investigation", "Victim Support"],
    location: "Ward 2",
    openedDate: "2026-06-28",
    dueDate: "2026-07-25",
    updated: "9h ago",
  },
  {
    id: "c5",
    caseNumber: "MHA-2026-0138",
    title: "Workplace Harassment Complaint — Dept. of Transport",
    summary:
      "Formal harassment complaint against a supervisor. Statements collected; legal review of findings underway.",
    category: "harassment",
    status: "under_review",
    priority: "high",
    tasks: tasks([
      ["Register the complaint", "done"],
      ["Interview complainant", "done"],
      ["Interview witnesses", "done"],
      ["Interview respondent", "done"],
      ["Draft findings for legal review", "in_progress"],
    ]),
    officers: [P.mt, P.lm],
    departments: ["Legal", "HR Oversight"],
    location: "Dept. of Transport, HQ",
    openedDate: "2026-06-10",
    dueDate: "2026-07-30",
    updated: "1d ago",
  },
  {
    id: "c6",
    caseNumber: "MHA-2026-0129",
    title: "Public Order — Permit Dispute, Central Square",
    summary:
      "Disputed assembly permit for Central Square. On hold pending a legal opinion on competing applications.",
    category: "public_order",
    status: "on_hold",
    priority: "normal",
    tasks: tasks([
      ["Log both permit applications", "done"],
      ["Request legal opinion", "in_progress"],
      ["Consult public-safety assessment", "pending"],
      ["Issue determination", "pending"],
    ]),
    officers: [P.lm, P.mt],
    departments: ["Public Safety", "Legal"],
    location: "Central Square",
    openedDate: "2026-06-15",
    dueDate: "2026-08-05",
    updated: "3d ago",
  },
  {
    id: "c7",
    caseNumber: "MHA-2026-0110",
    title: "Immigration Status Appeal — Case 4471",
    summary:
      "Appeal against a residency-status decision. All documentation verified; determination issued in the applicant's favour.",
    category: "immigration",
    status: "resolved",
    priority: "normal",
    tasks: tasks([
      ["Verify submitted documents", "done"],
      ["Confirm eligibility criteria", "done"],
      ["Legal review of appeal grounds", "done"],
      ["Issue determination", "done"],
      ["Notify applicant and close", "done"],
    ]),
    officers: [P.mt],
    departments: ["Immigration", "Legal"],
    location: "Immigration Office, Ward 1",
    openedDate: "2026-05-18",
    dueDate: "2026-07-01",
    updated: "1w ago",
  },
  {
    id: "c8",
    caseNumber: "MHA-2026-0098",
    title: "Records Audit — Q2 Case Closures",
    summary:
      "Routine audit of second-quarter case closures for records integrity. Completed and archived.",
    category: "administrative",
    status: "closed",
    priority: "low",
    tasks: tasks([
      ["Pull Q2 closure records", "done"],
      ["Reconcile against the register", "done"],
      ["File audit summary", "done"],
    ]),
    officers: [P.lm],
    departments: ["Records & Administration"],
    location: "Central Registry",
    openedDate: "2026-04-01",
    dueDate: "2026-06-30",
    updated: "2w ago",
  },
];

export const MOCK_FILES: CaseFile[] = [
  {
    id: "f1",
    name: "Autopsy Report.pdf",
    kind: "report",
    ext: "PDF",
    size: "2.4 MB",
    modified: "Jul 14",
    owner: P.sk,
    caseNumber: "MHA-2026-0142",
  },
  {
    id: "f2",
    name: "Search Warrant — Riverside.docx",
    kind: "warrant",
    ext: "DOCX",
    size: "640 KB",
    modified: "Jul 12",
    owner: P.mt,
    caseNumber: "MHA-2026-0142",
  },
  {
    id: "f3",
    name: "Witness Statement — J. Okoro.pdf",
    kind: "statement",
    ext: "PDF",
    size: "1.1 MB",
    modified: "Jul 11",
    owner: P.jd,
    caseNumber: "MHA-2026-0151",
  },
  {
    id: "f4",
    name: "Evidence Log — Case 0155.pdf",
    kind: "evidence",
    ext: "PDF",
    size: "3.2 MB",
    modified: "Jul 9",
    owner: P.sk,
    caseNumber: "MHA-2026-0155",
  },
  {
    id: "f5",
    name: "Harassment Complaint Form.pdf",
    kind: "form",
    ext: "PDF",
    size: "320 KB",
    modified: "Jul 8",
    owner: P.lm,
    caseNumber: "MHA-2026-0138",
  },
  {
    id: "f6",
    name: "Forensic Analysis.pdf",
    kind: "report",
    ext: "PDF",
    size: "5.1 MB",
    modified: "Jul 7",
    owner: P.sk,
    caseNumber: "MHA-2026-0147",
  },
];

const NETWORK_DELAY_MS = 200;

export async function fetchCases(): Promise<WorkCase[]> {
  await new Promise((r) => setTimeout(r, NETWORK_DELAY_MS));
  return MOCK_CASES;
}

export async function fetchFiles(): Promise<CaseFile[]> {
  await new Promise((r) => setTimeout(r, NETWORK_DELAY_MS));
  return MOCK_FILES;
}

import { tokens } from "@/config/design";
import type { CaseIconKind } from "@/components";

/** Home-ministry case categories — align with `categoryStyles` in design tokens. */
export type CaseCategory =
  | "general"
  | "press"
  | "security"
  | "finance"
  | "admin";

export type FileKind = "pdf" | "doc" | "sheet" | "image" | "video" | "deck";

export interface Person {
  id: string;
  name: string;
  initials: string;
  /** Mantine color name for the avatar. */
  color: string;
}

/** A case = a unit of ministry work (a "folder" of tasks, sub-tasks, and files). */
export interface WorkCase {
  id: string;
  name: string;
  category: CaseCategory;
  fileCount: number;
  taskCount: number;
  size: string;
  modified: string;
  people: Person[];
}

/** A file that lives at the top of the work area (or inside a case). */
export interface WorkFile {
  id: string;
  name: string;
  kind: FileKind;
  /** Extension label shown on the thumbnail badge, e.g. "PDF". */
  ext: string;
  size: string;
  modified: string;
  owner: Person;
  people: Person[];
  /** Owning case, when the file is filed under one. */
  caseId?: string;
}

/** Case-card icon glyph + tint per category. */
export const CASE_STYLE: Record<
  CaseCategory,
  { icon: CaseIconKind; color: string; tint: string; label: string }
> = {
  general: {
    icon: "folder",
    color: tokens.blueInk,
    tint: tokens.blueSoft,
    label: "General",
  },
  press: {
    icon: "press",
    color: tokens.accentDark,
    tint: tokens.accentSoft,
    label: "Press",
  },
  security: {
    icon: "security",
    color: tokens.green,
    tint: tokens.greenTint,
    label: "Security",
  },
  finance: {
    icon: "finance",
    color: tokens.purpleInk,
    tint: tokens.purpleSoft,
    label: "Finance",
  },
  admin: {
    icon: "case",
    color: tokens.muted2,
    tint: "rgba(0,0,0,0.06)",
    label: "Admin",
  },
};

/** File thumbnail + badge styling per kind. */
export const FILE_STYLE: Record<
  FileKind,
  { type: string; fg: string; bg: string; thumb: string; line: string }
> = {
  pdf: {
    type: "PDF",
    fg: tokens.accentDark,
    bg: tokens.accentSoft,
    thumb: "rgba(238,87,41,0.06)",
    line: "rgba(238,87,41,0.22)",
  },
  doc: {
    type: "Document",
    fg: tokens.blueInk,
    bg: tokens.blueSoft,
    thumb: "rgba(44,110,202,0.06)",
    line: "rgba(44,110,202,0.22)",
  },
  sheet: {
    type: "Spreadsheet",
    fg: tokens.green,
    bg: tokens.greenTint,
    thumb: "rgba(16,130,85,0.06)",
    line: "rgba(16,130,85,0.22)",
  },
  image: {
    type: "Image",
    fg: tokens.purpleInk,
    bg: tokens.purpleSoft,
    thumb: "rgba(120,90,200,0.06)",
    line: "rgba(120,90,200,0.22)",
  },
  video: {
    type: "Video",
    fg: tokens.green,
    bg: tokens.greenTint,
    thumb: "rgba(16,130,85,0.06)",
    line: "rgba(16,130,85,0.22)",
  },
  deck: {
    type: "Deck",
    fg: tokens.muted2,
    bg: "rgba(0,0,0,0.06)",
    thumb: "rgba(0,0,0,0.03)",
    line: "rgba(0,0,0,0.14)",
  },
};

const PEOPLE: Record<string, Person> = {
  ar: { id: "ar", name: "Anisa Rahman", initials: "AR", color: "orange" },
  lm: { id: "lm", name: "Leo Mabotja", initials: "LM", color: "green" },
  mt: { id: "mt", name: "Maya Tan", initials: "MT", color: "teal" },
  sk: { id: "sk", name: "Sam Koirala", initials: "SK", color: "grape" },
  jd: { id: "jd", name: "Jonas Devries", initials: "JD", color: "blue" },
};

// Ordered most-recently-modified first (the default "Modified" sort is order-preserving).
export const MOCK_CASES: WorkCase[] = [
  {
    id: "c6",
    name: "Records & Administration",
    category: "admin",
    fileCount: 210,
    taskCount: 4,
    size: "6.4 GB",
    modified: "4h ago",
    people: [PEOPLE.ar, PEOPLE.lm, PEOPLE.sk],
  },
  {
    id: "c2",
    name: "Press & Public Statements",
    category: "press",
    fileCount: 128,
    taskCount: 14,
    size: "4.8 GB",
    modified: "5h ago",
    people: [PEOPLE.lm, PEOPLE.ar, PEOPLE.sk],
  },
  {
    id: "c5",
    name: "Counter-Terrorism Ops",
    category: "security",
    fileCount: 74,
    taskCount: 19,
    size: "2.1 GB",
    modified: "1d ago",
    people: [PEOPLE.lm, PEOPLE.mt, PEOPLE.jd],
  },
  {
    id: "c1",
    name: "Border Security Review",
    category: "security",
    fileCount: 42,
    taskCount: 8,
    size: "1.2 GB",
    modified: "2d ago",
    people: [PEOPLE.ar, PEOPLE.mt],
  },
  {
    id: "c4",
    name: "Departmental Budget",
    category: "finance",
    fileCount: 56,
    taskCount: 11,
    size: "890 MB",
    modified: "3d ago",
    people: [PEOPLE.mt, PEOPLE.sk],
  },
  {
    id: "c3",
    name: "Immigration Casework",
    category: "general",
    fileCount: 24,
    taskCount: 6,
    size: "320 MB",
    modified: "1w ago",
    people: [PEOPLE.ar],
  },
];

export const MOCK_FILES: WorkFile[] = [
  {
    id: "f1",
    name: "Q3 Security Briefing.pdf",
    kind: "pdf",
    ext: "PDF",
    size: "4.2 MB",
    modified: "Jul 14",
    owner: PEOPLE.ar,
    people: [PEOPLE.ar, PEOPLE.mt],
    caseId: "c1",
  },
  {
    id: "f2",
    name: "Press Kit — Autumn.fig",
    kind: "image",
    ext: "FIG",
    size: "22 MB",
    modified: "Jul 12",
    owner: PEOPLE.lm,
    people: [PEOPLE.lm, PEOPLE.ar, PEOPLE.sk],
    caseId: "c2",
  },
  {
    id: "f3",
    name: "Budget Model FY26.xlsx",
    kind: "sheet",
    ext: "XLS",
    size: "1.1 MB",
    modified: "Jul 11",
    owner: PEOPLE.mt,
    people: [PEOPLE.mt],
    caseId: "c4",
  },
  {
    id: "f4",
    name: "Ministerial Address.mp4",
    kind: "video",
    ext: "MP4",
    size: "210 MB",
    modified: "Jul 9",
    owner: PEOPLE.sk,
    people: [PEOPLE.sk, PEOPLE.lm],
    caseId: "c2",
  },
  {
    id: "f5",
    name: "Vendor Agreement.docx",
    kind: "doc",
    ext: "DOC",
    size: "640 KB",
    modified: "Jul 8",
    owner: PEOPLE.ar,
    people: [PEOPLE.ar],
    caseId: "c3",
  },
  {
    id: "f6",
    name: "Checkpoint Map.png",
    kind: "image",
    ext: "PNG",
    size: "8.4 MB",
    modified: "Jul 7",
    owner: PEOPLE.lm,
    people: [PEOPLE.lm, PEOPLE.mt],
    caseId: "c1",
  },
  {
    id: "f7",
    name: "Cabinet Deck.key",
    kind: "deck",
    ext: "KEY",
    size: "33 MB",
    modified: "Jul 5",
    owner: PEOPLE.mt,
    people: [PEOPLE.mt, PEOPLE.ar, PEOPLE.sk],
  },
  {
    id: "f8",
    name: "Audit 2025.pdf",
    kind: "pdf",
    ext: "PDF",
    size: "2.7 MB",
    modified: "Jul 2",
    owner: PEOPLE.sk,
    people: [PEOPLE.sk],
    caseId: "c4",
  },
];

const NETWORK_DELAY_MS = 200;

export async function fetchCases(): Promise<WorkCase[]> {
  await new Promise((r) => setTimeout(r, NETWORK_DELAY_MS));
  return MOCK_CASES;
}

export async function fetchFiles(): Promise<WorkFile[]> {
  await new Promise((r) => setTimeout(r, NETWORK_DELAY_MS));
  return MOCK_FILES;
}

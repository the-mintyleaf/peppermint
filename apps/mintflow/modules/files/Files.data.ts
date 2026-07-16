import type {
  BandStyle,
  FileBand,
  FileItem,
  FilterOption,
} from "./Files.types";

/**
 * Seed work-file collections. Static mock data (no backend) mirroring the
 * app's "not wired" convention.
 */
export const FILES: FileItem[] = [
  {
    id: "media-propaganda",
    name: "Media Propaganda case",
    type: "case",
    color: "rgb(238,87,41)",
    tint: "rgba(238,87,41,0.12)",
    created: "12 Mar 2026",
    tasks: 18,
    done: 14,
    status: "IN REVIEW",
    band: "review",
  },
  {
    id: "q1-budget",
    name: "Q1 Budget expenditure",
    type: "finance",
    color: "rgb(44,110,202)",
    tint: "rgba(44,110,202,0.12)",
    created: "04 Mar 2026",
    tasks: 9,
    done: 9,
    status: "APPROVED",
    band: "approved",
  },
  {
    id: "border-briefing",
    name: "Border district briefing",
    type: "security",
    color: "rgb(15,115,75)",
    tint: "rgba(16,130,85,0.12)",
    created: "09 Mar 2026",
    tasks: 12,
    done: 5,
    status: "ACTIVE",
    band: "active",
  },
  {
    id: "press-march",
    name: "Press queries — March",
    type: "press",
    color: "rgb(238,87,41)",
    tint: "rgba(238,87,41,0.12)",
    created: "01 Mar 2026",
    tasks: 7,
    done: 4,
    status: "ACTIVE",
    band: "active",
  },
  {
    id: "appointment-letters",
    name: "Appointment letters",
    type: "folder",
    color: "rgba(0,0,0,0.55)",
    tint: "rgba(0,0,0,0.06)",
    created: "22 Feb 2026",
    tasks: 5,
    done: 5,
    status: "ARCHIVED",
    band: "archived",
  },
  {
    id: "parliament-prep",
    name: "Parliament session prep",
    type: "case",
    color: "rgb(44,110,202)",
    tint: "rgba(44,110,202,0.12)",
    created: "14 Mar 2026",
    tasks: 11,
    done: 3,
    status: "ACTIVE",
    band: "active",
  },
];

/** Status badge palette keyed by band. */
export const BAND_STYLES: Record<FileBand, BandStyle> = {
  active: { fg: "rgb(205,66,26)", bg: "rgba(238,87,41,0.1)" },
  review: { fg: "rgb(44,110,202)", bg: "rgba(44,110,202,0.1)" },
  approved: { fg: "rgb(30,120,75)", bg: "rgba(16,130,85,0.12)" },
  archived: { fg: "rgba(0,0,0,0.55)", bg: "rgba(0,0,0,0.06)" },
};

/** Filter chips (left → right). `null` band matches everything. */
export const FILTERS: FilterOption[] = [
  { label: "All", band: null },
  { label: "Active", band: "active" },
  { label: "In review", band: "review" },
  { label: "Approved", band: "approved" },
  { label: "Archived", band: "archived" },
];

/** Total open (incomplete) tasks across all collections. */
export const OPEN_TASKS = FILES.reduce((sum, f) => sum + (f.tasks - f.done), 0);

// The dashboard's seven views. The page used to stack all eight sections in one
// scroll; the sections are unchanged, but only one is mounted at a time so the
// landing view is a signal board rather than a wall of detail.
//
// Each tab is one question an operator arrives with (DESIGN.md Part 5C). The
// `subtitle` is the contract caveat that section carries — it stays with the
// section, so switching tabs never loses the "how to read this" line.

export const DASHBOARD_TAB_VALUES = [
  "overview",
  "today",
  "pipeline",
  "blockers",
  "workload",
  "performance",
  "activity",
] as const;

export type DashboardTab = (typeof DASHBOARD_TAB_VALUES)[number];

export const DEFAULT_DASHBOARD_TAB: DashboardTab = "overview";

export function isDashboardTab(value: string | null): value is DashboardTab {
  return (
    value !== null &&
    (DASHBOARD_TAB_VALUES as readonly string[]).includes(value)
  );
}

export interface DashboardTabMeta {
  /** Short tab-bar label. */
  label: string;
  /** The question the tab answers — the panel heading. */
  title: string;
  /** The contract caveat for reading this panel's figures. */
  subtitle: string;
}

export const DASHBOARD_TAB_META: Record<DashboardTab, DashboardTabMeta> = {
  overview: {
    label: "Overview",
    title: "Is everything okay?",
    subtitle:
      "What needs a human, and where the pipeline stands. Open a tab for the full detail.",
  },
  today: {
    label: "Today",
    title: "Today's worklists",
    subtitle: "Six queues — each preview is capped at 10 rows.",
  },
  pipeline: {
    label: "Pipeline",
    title: "Pipeline",
    subtitle:
      "Zero-filled counts — every status is always shown, windowed on creation date.",
  },
  blockers: {
    label: "Blockers",
    title: "Blockers",
    subtitle:
      "Five groups where work is stuck — an empty group is the healthy state.",
  },
  workload: {
    label: "Workload",
    title: "Workload by owner",
    subtitle: "Three independent measures — never joined or summed.",
  },
  performance: {
    label: "Performance",
    title: "Conversion & outcomes",
    subtitle:
      "Four independent rates (blank when the denominator is 0), and two outcome windows that must not be summed.",
  },
  activity: {
    label: "Activity",
    title: "Recent activity",
    subtitle:
      "Fiscal-year scope only — the destination country filter does not apply.",
  },
};

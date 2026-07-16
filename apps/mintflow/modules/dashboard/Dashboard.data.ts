import type { DashboardDataset, Period } from "./Dashboard.types";

/**
 * Static reporting mock, keyed by period. Not wired to a backend — the freshness
 * cue in the header ("MON · 28.03 · ALL ON TRACK" + period range) is the "as of"
 * indicator. Long-running-job and async-error states are N/A for a static mock.
 */
export const DASHBOARD_DATA: Record<Period, DashboardDataset> = {
  Week: {
    completion: "87%",
    ring: 0.87,
    closed: "142",
    overdue: "6",
    cycle: "2.4",
    trend: "+12%",
    total: "163",
    mix: [0.28, 0.14, 0.58],
    legend: ["48", "23", "92"],
    bars: [
      { label: "M", value: 0.55, count: 18 },
      { label: "T", value: 0.8, count: 26 },
      { label: "W", value: 0.45, count: 15 },
      { label: "T", value: 0.95, count: 31 },
      { label: "F", value: 0.7, count: 23 },
      { label: "S", value: 0.3, count: 10 },
      { label: "S", value: 0.2, count: 6 },
    ],
    periodWord: "week",
    periodLabel: "Mon–Sun",
  },
  Month: {
    completion: "81%",
    ring: 0.81,
    closed: "612",
    overdue: "14",
    cycle: "2.9",
    trend: "+8%",
    total: "742",
    mix: [0.31, 0.18, 0.51],
    legend: ["228", "132", "382"],
    bars: [
      { label: "W1", value: 0.6, count: 132 },
      { label: "W2", value: 0.85, count: 187 },
      { label: "W3", value: 0.5, count: 110 },
      { label: "W4", value: 1.0, count: 220 },
    ],
    periodWord: "month",
    periodLabel: "Last 4 weeks",
  },
};

/** Reporting period toggle. */
export type Period = "Week" | "Month";

/** One throughput bar: axis label, 0–1 height ratio, and the raw count. */
export interface ThroughputBar {
  label: string;
  value: number;
  count: number;
}

/** A full reporting dataset for one period (static mock — not backend-wired). */
export interface DashboardDataset {
  /** Completion rate, e.g. "87%". */
  completion: string;
  /** Completion ratio 0–1 for the progress fill. */
  ring: number;
  /** Cases closed this period. */
  closed: string;
  /** Overdue cases needing attention. */
  overdue: string;
  /** Average cycle time in days. */
  cycle: string;
  /** Period-over-period trend, e.g. "+12%". */
  trend: string;
  /** Total cases across the status mix. */
  total: string;
  /** Status mix ratios [Ongoing, On-Next, Done], summing to ~1. */
  mix: [number, number, number];
  /** Raw counts matching each mix segment. */
  legend: [string, string, string];
  /** Throughput bars for the period. */
  bars: ThroughputBar[];
  /** Lowercase noun for inline copy, e.g. "week". */
  periodWord: string;
  /** Human range label, e.g. "Mon–Sun". */
  periodLabel: string;
}

/** Props shared by the mobile and desktop layout components. */
export interface DashboardLayoutProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  data: DashboardDataset;
}

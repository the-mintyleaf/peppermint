export interface HomeTask {
  id: string;
  title: string;
  /** Task category — shown as the check-row subtitle. */
  category: string;
}

/** The single "focus now" card at the top of the Home screen. */
export interface FocusTask {
  category: string;
  /** Uppercase mono meta timestamp, e.g. "09:00 · TODAY". */
  time: string;
  /** Accent mono countdown, e.g. "32 min left". */
  timeLeft: string;
  title: string;
  assignee: string;
  /** Related case label. */
  caseLabel: string;
}

export type HomeNavIcon = "calendar" | "sparkle";

/** A leading-icon nav row below the task list (Schedule / Reflect). */
export interface HomeNavRowData {
  id: string;
  label: string;
  icon: HomeNavIcon;
}

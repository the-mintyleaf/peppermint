export type TaskStatus = "Ongoing" | "On-Next" | "Complete";

export type TaskCategory =
  | "GENERAL"
  | "PRESS"
  | "SECURITY"
  | "FINANCE"
  | "ADMIN";

export interface Task {
  category: TaskCategory;
  title: string;
  status: TaskStatus;
  /** Mono meta line (time left / due / submitted). */
  meta: string;
  /** Render the meta in the accent color to flag urgency. */
  urgent?: boolean;
}

/** Tab keys for the tasks filter row. "All" shows every task. */
export type TaskTab = "All" | TaskStatus;

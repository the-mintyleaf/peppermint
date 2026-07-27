import type { ReactNode } from "react";

export interface HistoryTableEntry {
  id: string;
  action: string;
  actor_label?: string | null;
  actor_type?: string | null;
  summary?: string | null;
  reason?: string | null;
  changes?: Record<string, { from: unknown; to: unknown }>;
  created_at: string;
}

export interface HistoryTableProps {
  entries: HistoryTableEntry[];
  /**
   * Per-action glyph + tint (recognition over recall). Returns `undefined` to
   * fall back to the neutral clock icon.
   */
  iconFor?: (action: string) => { icon: ReactNode; color: string } | undefined;
  /** Shown under the table when the server returned more than is displayed. */
  truncatedNote?: string;
}

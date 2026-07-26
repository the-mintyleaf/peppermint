import type { ReactNode } from "react";

export interface HistoryTimelineEntry {
  id: string;
  action: string;
  actor_label?: string | null;
  actor_type?: string | null;
  summary?: string | null;
  reason?: string | null;
  changes?: Record<string, { from: unknown; to: unknown }>;
  created_at: string;
}

export interface HistoryTimelineProps {
  entries: HistoryTimelineEntry[];
  /**
   * Per-action glyph + tint (recognition over recall). Returns `undefined` to
   * fall back to the neutral clock icon.
   */
  iconFor?: (action: string) => { icon: ReactNode; color: string } | undefined;
  /** Shown under the list when the server returned more than is displayed. */
  truncatedNote?: string;
}

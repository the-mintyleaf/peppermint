import type { CaseIconKind } from "@/components";

/** Status band — drives the status badge palette and filter matching. */
export type FileBand = "active" | "review" | "approved" | "archived";

/** A single work-file collection row. */
export interface FileItem {
  id: string;
  name: string;
  /** Maps directly onto the `CaseIcon` kind. */
  type: CaseIconKind;
  /** Tinted background for the `CaseIcon` square. */
  tint: string;
  /** Glyph color for the `CaseIcon`. */
  color: string;
  /** Created date, pre-formatted (mono). */
  created: string;
  /** Total task count. */
  tasks: number;
  /** Completed task count. */
  done: number;
  /** Uppercase status label. */
  status: string;
  band: FileBand;
}

/** Foreground / background pair for a status badge. */
export interface BandStyle {
  fg: string;
  bg: string;
}

/** A filter chip option — `band: null` means "All". */
export interface FilterOption {
  label: string;
  band: FileBand | null;
}

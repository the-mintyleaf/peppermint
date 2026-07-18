/**
 * Presentational maps for the cases surface, keyed to the **real** backend
 * enums (`WorkStatus`, `WorkPriority` from `@/lib/work`). Colors come from the
 * fixed design tokens; text labels come from the frozen enum label maps. This is
 * the faithful-reshape replacement for the mock `STATUS_STYLE`/`PRIORITY_STYLE`
 * (which were keyed to invented 6-state/4-level enums).
 */

import { tokens } from "@/config/design";
import type { WorkPriority, WorkStatus } from "@/lib/work";

// The token set has no amber; the mock defined it inline for attention states.
const AMBER = "rgb(176,116,20)";
const AMBER_SOFT = "rgba(176,116,20,0.12)";
const RED = "rgb(201,42,42)";
const RED_SOFT = "rgba(201,42,42,0.1)";

interface StatusStyle {
  /** Foreground for the status pill. */
  fg: string;
  /** Soft pill background. */
  bg: string;
  /** Flat status-keyed tint for a card surface (over opaque paper). */
  cardTint: string;
}

/** One entry per `WorkStatus` (9). Intent groups per work.reshape.md. */
export const STATUS_STYLE: Record<WorkStatus, StatusStyle> = {
  assignment_pending: {
    fg: tokens.blueInk,
    bg: tokens.blueSoft,
    cardTint: "rgba(44,110,202,0.06)",
  },
  accepted: {
    fg: tokens.blueInk,
    bg: tokens.blueSoft,
    cardTint: "rgba(44,110,202,0.08)",
  },
  in_progress: {
    fg: tokens.accentDark,
    bg: tokens.accentSoft,
    cardTint: "rgba(238,87,41,0.08)",
  },
  blocked: {
    fg: AMBER,
    bg: AMBER_SOFT,
    cardTint: "rgba(176,116,20,0.09)",
  },
  review_pending: {
    fg: tokens.purpleInk,
    bg: tokens.purpleSoft,
    cardTint: "rgba(120,90,200,0.08)",
  },
  changes_requested: {
    fg: AMBER,
    bg: AMBER_SOFT,
    cardTint: "rgba(176,116,20,0.09)",
  },
  closure_pending: {
    fg: tokens.purpleInk,
    bg: tokens.purpleSoft,
    cardTint: "rgba(120,90,200,0.08)",
  },
  closed: {
    fg: tokens.green,
    bg: tokens.greenTint,
    cardTint: "rgba(16,130,85,0.08)",
  },
  archived: {
    fg: tokens.muted2,
    bg: "rgba(0,0,0,0.06)",
    cardTint: "rgba(0,0,0,0.035)",
  },
};

interface PriorityStyle {
  /** Mantine `Badge` color name (list/modal). */
  color: string;
  /** Foreground for the soft flag pill on a card. */
  fg: string;
  /** Soft flag-pill background. */
  bg: string;
}

/** One entry per `WorkPriority` (5). */
export const PRIORITY_STYLE: Record<WorkPriority, PriorityStyle> = {
  low: { color: "gray", fg: tokens.muted2, bg: "rgba(0,0,0,0.06)" },
  normal: { color: "blue", fg: tokens.blueInk, bg: tokens.blueSoft },
  high: { color: "orange", fg: tokens.accentDark, bg: tokens.accentSoft },
  urgent: { color: "red", fg: RED, bg: RED_SOFT },
  critical: { color: "red", fg: RED, bg: RED_SOFT },
};

/** Priority ordering (most urgent first) for client-side sorting. */
export const PRIORITY_RANK: Record<WorkPriority, number> = {
  critical: 0,
  urgent: 1,
  high: 2,
  normal: 3,
  low: 4,
};

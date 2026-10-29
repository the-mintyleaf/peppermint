import { dayjs } from "@peppermint/ui";
import type { AxiosError } from "axios";

import {
  ERROR_MESSAGES,
  getApiError,
  getApiErrorMessage,
} from "@/lib/authErrorMessages";

import type {
  NoteCategory,
  NoteCounts,
  NoteFormValues,
  NotesListResult,
  NoteOrdering,
  NotesPanelNote,
  NoteTabCategory,
  NoteUpdatePayload,
} from "./NotesPanel.types";

/** The server's tolerance for a `noted_at` ahead of its clock. */
export const NOTE_FUTURE_TOLERANCE_MS = 5 * 60 * 1000;
export const NOTE_BODY_MAX = 10_000;
/** The picker's wall-clock value format (Mantine dates string values). */
export const PICKER_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const NOTE_TIME_DISPLAY = "MMM D, YYYY h:mm A";

export const NOTE_TABS: { value: NoteTabCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "visit", label: "Visit" },
];

export const NOTE_ORDERING_OPTIONS: { value: NoteOrdering; label: string }[] = [
  { value: "-noted_at", label: "Newest first" },
  { value: "noted_at", label: "Oldest first" },
  { value: "-created_at", label: "Recently written" },
];

/** Human label for a category; unknown future values render as their raw string. */
export function noteCategoryLabel(category: NoteCategory): string {
  return NOTE_TABS.find((tab) => tab.value === category)?.label ?? category;
}

export function userLabel(user: {
  display_name: string;
  username: string;
}): string {
  return user.display_name || user.username;
}

export function canModifyNote(
  note: NotesPanelNote,
  currentUserId: string | null | undefined,
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true;
  return Boolean(currentUserId) && note.author.id === currentUserId;
}

/**
 * Raw paginated notes body (`{ data, meta: { count, counts } }`, as the app's
 * Axios instance returns a list) → the `NotesListResult` an adapter returns.
 */
export function toNotesListResult<TNote extends NotesPanelNote>(body: {
  data: TNote[];
  meta: { count?: number; counts?: Partial<Record<string, number>> };
}): NotesListResult<TNote> {
  const raw = body.meta.counts ?? {};
  const counts: NoteCounts = { general: 0, visit: 0 };
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number") counts[key] = value;
  }
  return {
    data: Array.isArray(body.data) ? body.data : [],
    total: typeof body.meta.count === "number" ? body.meta.count : 0,
    counts,
  };
}

// ── Time ─────────────────────────────────────────────────────────────────────

/** Latest instant the server accepts for `noted_at`, as a picker value. */
export function latestAllowedPickerValue(): string {
  return dayjs().add(5, "minute").format(PICKER_FORMAT);
}

/** True when a picker value is beyond now + the server tolerance. */
export function isTooFarInFuture(pickerValue: string): boolean {
  return dayjs(pickerValue).valueOf() > Date.now() + NOTE_FUTURE_TOLERANCE_MS;
}

/** ISO UTC (API) → the picker's local wall-clock value. */
export function toPickerValue(iso: string): string {
  return dayjs(iso).format(PICKER_FORMAT);
}

/**
 * Picker wall-clock value → ISO 8601 **with the browser's UTC offset**. The
 * contract reads an offset-less value as Nepal time, so always sending one
 * keeps a browser outside Nepal from shifting the note by hours.
 */
export function toApiNotedAt(pickerValue: string): string {
  return dayjs(pickerValue).format();
}

export function formatNoteTime(iso: string): string {
  return dayjs(iso).format(NOTE_TIME_DISPLAY);
}

/**
 * Quick picks shown in the "When" dropdown. `includeNow` adds a "Now" preset
 * (value `null` = let the server stamp it) — composer only.
 */
export function notedAtPresets(
  includeNow: boolean,
): { value: string | null; label: string }[] {
  const now = dayjs();
  return [
    ...(includeNow ? [{ value: null, label: "Now" }] : []),
    {
      value: now.subtract(1, "hour").format(PICKER_FORMAT),
      label: "1 hour ago",
    },
    {
      value: now.subtract(1, "day").format(PICKER_FORMAT),
      label: "Yesterday, this time",
    },
  ];
}

// ── Edit diff ────────────────────────────────────────────────────────────────

/** Only the changed subset — the PATCH may carry any of the three fields. */
export function changedNoteFields(
  note: NotesPanelNote,
  values: NoteFormValues,
): NoteUpdatePayload | null {
  const payload: NoteUpdatePayload = {};
  const body = values.body.trim();
  if (body !== note.body) payload.body = body;
  if (values.category !== note.category) payload.category = values.category;
  if (values.noted_at && values.noted_at !== toPickerValue(note.noted_at)) {
    payload.noted_at = toApiNotedAt(values.noted_at);
  }
  return Object.keys(payload).length > 0 ? payload : null;
}

// ── Errors ───────────────────────────────────────────────────────────────────

/**
 * Domain-agnostic fallbacks keyed by code SUFFIX, so the panel reads correctly
 * for both `LEADS_*` and `APPLICANTS_*` even before a code has an entry in
 * `ERROR_MESSAGES` (which always wins when present).
 */
const SUFFIX_MESSAGES: { suffix: string; message: string }[] = [
  {
    suffix: "_NOTE_FUTURE_DATE",
    message: "A note can't be dated in the future. Pick a time up to now.",
  },
  {
    suffix: "_NOTE_FORBIDDEN",
    message: "Only the note's author or an Admin can change or remove it.",
  },
  {
    suffix: "_NOTE_NOT_FOUND",
    message: "That note no longer exists — it may have been deleted.",
  },
];

export function getNoteErrorMessage(error: unknown): string {
  const { code } = getApiError(error);
  if (ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  const fallback = SUFFIX_MESSAGES.find((entry) => code.endsWith(entry.suffix));
  return fallback?.message ?? getApiErrorMessage(error);
}

export function getErrorStatus(error: unknown): number | undefined {
  return (error as AxiosError | undefined)?.response?.status;
}

export function isFutureDateError(error: unknown): boolean {
  return getApiError(error).code.endsWith("_NOTE_FUTURE_DATE");
}

/**
 * First message per form field from a `VALIDATION_ERROR` body
 * (`details: { body: ["…"] }`), limited to the fields this form owns.
 */
export function noteFieldErrors(error: unknown): Record<string, string> {
  const { code, details } = getApiError(error);
  if (code !== "VALIDATION_ERROR" || !details) return {};
  const fields: Record<string, string> = {};
  for (const key of ["body", "noted_at", "category"] as const) {
    const value = details[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") fields[key] = first;
  }
  return fields;
}

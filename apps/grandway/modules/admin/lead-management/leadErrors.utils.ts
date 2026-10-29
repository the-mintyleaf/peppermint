import { getNoteErrorMessage } from "@/components/notes-panel";
import { getApiError } from "@/lib/authErrorMessages";

/**
 * 409s that mean "this client's copy of the lead is out of date": someone
 * deleted, restored or converted it since it loaded. `useAppMutation` only
 * invalidates on success, so every lead write refetches the lead and the
 * board when it is refused with one of these — the drawer, board and
 * dashboard then show the lead's real state instead of the stale one.
 */
const STALE_LEAD_CODES = new Set([
  "LEADS_LEAD_DELETED",
  "LEADS_LEAD_NOT_DELETED",
  "LEADS_LEAD_ALREADY_CONVERTED",
]);

export function isStaleLeadError(error: unknown): boolean {
  return STALE_LEAD_CODES.has(getApiError(error).code);
}

/** Shown wherever a lead's notes can no longer be written because it was converted. */
export const CONVERTED_LEAD_NOTES_MESSAGE =
  "Notes are on the applicant — this lead was converted, so its notes are read-only. Add the visit on the applicant's file.";

export const DELETED_LEAD_NOTES_MESSAGE =
  "This lead was deleted. An Admin must restore it before notes can be added.";

/**
 * Toast copy for a note write on a lead. The shared `ERROR_MESSAGES` copy for
 * the two stale-lead codes is written for other actions, so a note write
 * says where the note belongs instead; everything else (future date, blank
 * body, not found, …) resolves through the notes panel's own resolver.
 */
export function getLeadNoteErrorMessage(error: unknown): string {
  const { code } = getApiError(error);
  if (code === "LEADS_LEAD_ALREADY_CONVERTED") {
    return CONVERTED_LEAD_NOTES_MESSAGE;
  }
  if (code === "LEADS_LEAD_DELETED") return DELETED_LEAD_NOTES_MESSAGE;
  return getNoteErrorMessage(error);
}

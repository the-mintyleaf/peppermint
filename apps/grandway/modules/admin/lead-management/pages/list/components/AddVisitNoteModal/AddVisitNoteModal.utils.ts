import { getApiError } from "@/lib/authErrorMessages";

import { DELETED_LEAD_NOTES_MESSAGE } from "../../../../leadErrors.utils";
import type { VisitNoteBlock, VisitNoteLead } from "./AddVisitNoteModal.types";

/**
 * A write refused because the lead can never take notes again (converted
 * since it loaded — even if reopened — or deleted). The modal keeps the draft
 * on screen so it can be copied, and says where the note belongs instead.
 */
export function visitNoteBlockFor(error: unknown): VisitNoteBlock | null {
  const { code } = getApiError(error);
  if (code === "LEADS_LEAD_ALREADY_CONVERTED") {
    return {
      title: "Notes are on the applicant",
      message:
        "This lead was converted, so its notes are read-only. Copy what you wrote and add the visit on the applicant's file.",
    };
  }
  if (code === "LEADS_LEAD_DELETED") {
    return {
      title: "This lead was deleted",
      message: DELETED_LEAD_NOTES_MESSAGE,
    };
  }
  return null;
}

/**
 * Whether the board may offer "Add visit note" on this lead. Notes are
 * write-refused (409) once a lead is deleted or was EVER converted —
 * `converted_applicant_id` survives a reopen. The board's list shape carries
 * neither field (padded `null`), so a row only knows `stage === "converted"`;
 * a converted-then-reopened row still offers the action and the server's
 * `LEADS_LEAD_ALREADY_CONVERTED` is caught in the modal. Lost leads stay
 * writable (the contract allows notes on a lost lead).
 */
export function canAddVisitNote(lead: VisitNoteLead): boolean {
  return (
    lead.stage !== "converted" &&
    !lead.deleted_at &&
    !lead.converted_applicant_id
  );
}

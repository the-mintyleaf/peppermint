import type { LeadDetail } from "../../../../leadManagement.types";

/** The lead fields the quick visit note reads — a board row or a full detail. */
export type VisitNoteLead = Pick<
  LeadDetail,
  "id" | "full_name" | "stage" | "deleted_at" | "converted_applicant_id"
>;

export interface AddVisitNoteModalProps {
  lead: VisitNoteLead;
  opened: boolean;
  onClose: () => void;
}

/** Why the lead can no longer take notes — shown above the kept draft. */
export interface VisitNoteBlock {
  title: string;
  message: string;
}

export interface AddVisitNoteFormProps {
  lead: VisitNoteLead;
  onDone: () => void;
}

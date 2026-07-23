import type { LeadBoardRow } from "../../../../leadManagement.types";

export interface RecordFollowUpModalProps {
  lead: LeadBoardRow;
  opened: boolean;
  onClose: () => void;
}

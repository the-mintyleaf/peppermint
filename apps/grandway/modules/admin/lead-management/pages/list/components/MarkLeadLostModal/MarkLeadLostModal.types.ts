import type { LeadBoardRow } from "../../../../leadManagement.types";

export interface MarkLeadLostModalProps {
  lead: LeadBoardRow;
  opened: boolean;
  onClose: () => void;
}

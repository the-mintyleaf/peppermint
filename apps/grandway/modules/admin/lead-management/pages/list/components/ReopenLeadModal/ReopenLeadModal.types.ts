import type { LeadBoardRow } from "../../../../leadManagement.types";

export interface ReopenLeadModalProps {
  lead: LeadBoardRow;
  opened: boolean;
  onClose: () => void;
}

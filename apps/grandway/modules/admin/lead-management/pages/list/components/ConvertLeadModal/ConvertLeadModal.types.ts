import type { LeadBoardRow } from "../../../../leadManagement.types";

export interface ConvertLeadModalProps {
  lead: LeadBoardRow;
  opened: boolean;
  onClose: () => void;
}

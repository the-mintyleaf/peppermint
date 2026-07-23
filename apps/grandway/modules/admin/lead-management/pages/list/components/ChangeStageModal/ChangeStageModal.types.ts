import type { LeadBoardRow } from "../../../../leadManagement.types";

export interface ChangeStageModalProps {
  lead: LeadBoardRow;
  opened: boolean;
  onClose: () => void;
}

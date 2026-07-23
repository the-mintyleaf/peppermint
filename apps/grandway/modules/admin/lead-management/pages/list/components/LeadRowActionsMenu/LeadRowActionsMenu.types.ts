import type { LeadBoardRow } from "../../../../leadManagement.types";

export interface LeadRowActionsMenuProps {
  lead: LeadBoardRow;
  onViewDetails: (lead: LeadBoardRow) => void;
}

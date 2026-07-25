import type { Checklist } from "../../../../checklists.types";

export interface ChecklistRowActionsMenuProps {
  checklist: Checklist;
  onViewDetails: (checklist: Checklist) => void;
}

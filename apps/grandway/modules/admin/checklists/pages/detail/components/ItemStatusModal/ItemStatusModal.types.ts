import type { ChecklistItem } from "../../../../checklists.types";

export interface ItemStatusModalProps {
  checklistId: string;
  applicantId: string;
  item: ChecklistItem;
  opened: boolean;
  onClose: () => void;
}

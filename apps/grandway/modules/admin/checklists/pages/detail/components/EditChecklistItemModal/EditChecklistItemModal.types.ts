import type { ChecklistItem } from "../../../../checklists.types";

export interface EditChecklistItemModalProps {
  checklistId: string;
  item: ChecklistItem;
  opened: boolean;
  onClose: () => void;
}

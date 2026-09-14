import type { ChecklistItem, ItemStatus } from "../../../../checklists.types";

export interface ItemStatusModalProps {
  checklistId: string;
  applicantId: string;
  item: ChecklistItem;
  opened: boolean;
  onClose: () => void;
  /**
   * Status the form opens on. Defaults to the item's current status; the list's
   * switch passes the status its menu action named ("Waive…" opens on `waived`),
   * so the modal starts where the user already said they were going.
   */
  initialStatus?: ItemStatus;
}

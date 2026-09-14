import type { ChecklistItem, ItemStatus } from "../../../../checklists.types";

export interface ChecklistItemStatusSwitchProps {
  checklistId: string;
  /** The item whose status this switch owns. */
  item: ChecklistItem;
  /**
   * Opens the note/evidence modal on the given status — the switch itself can
   * only send the statuses that need nothing but a confirmation.
   */
  onOpenStatusModal: (item: ChecklistItem, initialStatus: ItemStatus) => void;
  /**
   * The checklist is `completed` or `archived`, so the API rejects every item
   * status change (`CHECKLISTS_INVALID_TRANSITION` / `CHECKLISTS_CHECKLIST_ARCHIVED`).
   * The switch renders as a plain badge instead of offering a move that cannot land.
   */
  frozen?: boolean;
}

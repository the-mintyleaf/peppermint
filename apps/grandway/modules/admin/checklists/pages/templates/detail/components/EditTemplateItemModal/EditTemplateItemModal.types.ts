import type { ChecklistTemplateItem } from "../../../../../checklists.types";

export interface EditTemplateItemModalProps {
  templateId: string;
  item: ChecklistTemplateItem;
  opened: boolean;
  onClose: () => void;
}

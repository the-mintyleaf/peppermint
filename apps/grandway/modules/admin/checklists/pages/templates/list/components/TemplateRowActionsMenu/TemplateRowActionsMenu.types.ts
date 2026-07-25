import type { ChecklistTemplate } from "../../../../../checklists.types";

export interface TemplateRowActionsMenuProps {
  template: ChecklistTemplate;
  onViewDetails: (template: ChecklistTemplate) => void;
}

import type { DepartmentData } from "../../../../organization.types";

export interface DepartmentDrawerProps {
  opened: boolean;
  onClose: () => void;
  nodeId: string;
  data: DepartmentData;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddPerson: () => void;
  onAddChild: () => void;
}

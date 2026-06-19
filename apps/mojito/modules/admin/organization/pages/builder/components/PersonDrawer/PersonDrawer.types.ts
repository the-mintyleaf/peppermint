import type { PersonData } from "../../../../organization.types";

export interface PersonDrawerProps {
  opened: boolean;
  onClose: () => void;
  nodeId: string;
  data: PersonData;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

import type { OrgNodeData, OrgNodeType } from "../../../../organization.types";

export interface NodeFormModalProps {
  opened: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  nodeType?: OrgNodeType;
  initialData?: Partial<OrgNodeData>;
  onSubmit: (data: OrgNodeData) => void;
}

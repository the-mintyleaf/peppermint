import type {
  OrgNodeData,
  ExtendedNodeType,
} from "../../OrganizationTree.types";
import type { Organization } from "../../../organizations/organizations.types";
import type { UnitsFormValues } from "./forms/UnitsForm/UnitsForm.types";
import type { PeopleFormValues } from "../../../people/form/peopleForm.types";
import type { PositionsFormValues } from "../../../positions/form/PositionsForm/PositionsForm.types";
import type { Site } from "../../../sites/sites.types";
import type { Delegation } from "../../../delegations/delegations.types";

export interface NodeFormModalProps {
  opened: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  nodeType?: ExtendedNodeType;
  initialData?: Partial<OrgNodeData>;
  onSubmitOrg: (data: Organization) => void;
  onSubmitDepartment: (data: UnitsFormValues) => void;
  onSubmitPerson: (data: PeopleFormValues) => void;
  onSubmitPosition: (data: PositionsFormValues) => void;
  onSubmitSite: (data: Partial<Site>) => void;
  onSubmitDelegation: (data: Delegation) => void;
  pendingParentName?: string;
  pendingContextNodeId?: string;
  isLoading?: boolean;
}

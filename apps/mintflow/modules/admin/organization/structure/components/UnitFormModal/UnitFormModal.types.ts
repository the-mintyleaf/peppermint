import type { UnitStatus, UnitType } from "../../../_shared/organization.types";

export interface UnitFormValues {
  name: string;
  code: string;
  unit_type: UnitType | "";
  status: UnitStatus;
  description: string;
  sort_order: number;
  is_operational: boolean;
}

export interface UnitFormModalProps {
  organizationId: string;
}

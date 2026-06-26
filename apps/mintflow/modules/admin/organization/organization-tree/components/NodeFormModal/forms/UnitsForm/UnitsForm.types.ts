import type { UnitType, UnitStatus } from "../../../../../organization.types";

export interface UnitsFormValues {
  name: string;
  code: string;
  unit_type: UnitType;
  description: string;
  status: UnitStatus;
}

export interface UnitsFormProps {
  initialValues?: Partial<UnitsFormValues>;
  onSubmit: (values: UnitsFormValues) => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

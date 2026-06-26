import type { PositionStatus, PositionType } from "../../positions.types";

export interface PositionsFormValues {
  title: string;
  code: string;
  position_type: PositionType;
  description: string;
  is_leadership: boolean;
  is_supervisory: boolean;
  is_single_occupant: boolean;
  max_occupants: number;
  effective_from: string | null;
  effective_to: string | null;
  status: PositionStatus;
}

export interface PositionsFormProps {
  initialValues?: Partial<PositionsFormValues>;
  onSubmit: (values: PositionsFormValues) => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

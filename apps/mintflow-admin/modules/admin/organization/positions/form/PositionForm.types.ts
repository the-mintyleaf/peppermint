import type { ModalFormComponentProps } from "@peppermint/admin";

import type { Position, PositionType } from "../positions.types";

export type PositionFormProps = ModalFormComponentProps<
  Position,
  PositionFormValues
>;

export interface PositionFormValues {
  title_np: string;
  title_en: string;
  sort_order: number;
  code: string;
  position_type: PositionType | "";
  is_leadership: boolean;
  is_supervisory: boolean;
  is_single_occupant: boolean;
  max_occupants: number;
  description: string;
}

import type { ModalFormComponentProps } from "@peppermint/admin";

import type { Position, PositionType } from "../positions.types";

export type PositionEditFormProps = ModalFormComponentProps<Position>;

export interface PositionEditFormValues {
  title: string;
  position_type: PositionType | "";
  status: Position["status"];
  is_leadership: boolean;
  is_supervisory: boolean;
  is_single_occupant: boolean;
  max_occupants: number;
  description: string;
}

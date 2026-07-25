import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Program, ProgramFormValues } from "../../institutions.types";

export type ProgramFormProps = ModalFormComponentProps<
  Program,
  ProgramFormValues
>;

/** Shared by the field-group components — whether inputs are locked while saving. */
export interface ProgramFieldsProps {
  disabled: boolean;
}

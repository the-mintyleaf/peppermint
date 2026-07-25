import type { ModalFormComponentProps } from "@peppermint/admin";
import type {
  Institution,
  InstitutionFormValues,
} from "../../institutions.types";

export type InstitutionFormProps = ModalFormComponentProps<
  Institution,
  InstitutionFormValues
>;

import type { ModalFormComponentProps } from "@peppermint/admin";

import type { Role } from "../roles.types";

export type RoleEditFormProps = ModalFormComponentProps<Role>;

export interface RoleEditFormValues {
  display_name: string;
  description: string;
  role_type: string;
  is_assignable: boolean;
}

import type { ModalFormComponentProps } from "@peppermint/admin";

import type { Role } from "../roles.types";

export type RoleFormProps = ModalFormComponentProps<Role, RoleFormValues>;

export interface RoleFormValues {
  key: string;
  display_name: string;
  description: string;
  role_type: string;
  is_system_role: boolean;
  is_assignable: boolean;
}

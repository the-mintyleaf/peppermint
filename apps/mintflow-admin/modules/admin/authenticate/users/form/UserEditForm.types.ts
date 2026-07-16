import type { ModalFormComponentProps } from "@peppermint/admin";

import type { User } from "../users.types";

export type UserEditFormProps = ModalFormComponentProps<
  User,
  UserEditFormValues
>;

export interface UserEditFormValues {
  display_name: string;
  email: string;
  actor_type: User["actor_type"];
}

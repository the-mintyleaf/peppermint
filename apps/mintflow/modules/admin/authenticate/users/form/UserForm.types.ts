import type { ModalFormComponentProps } from "@peppermint/admin";

import type { User } from "../users.types";

export type UserFormProps = ModalFormComponentProps<User, UserFormValues>;

export interface UserFormValues {
  username: string;
  display_name: string;
  email: string;
  actor_type: User["actor_type"];
  account_status: User["account_status"];
  is_login_enabled: boolean;
  password: string;
}

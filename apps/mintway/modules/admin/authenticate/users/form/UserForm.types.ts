import type { ModalFormComponentProps } from "@peppermint/admin";
import type { CreateUserValues, UserAdmin } from "../users.types";

export type UserFormProps = ModalFormComponentProps<
  UserAdmin,
  CreateUserValues
>;

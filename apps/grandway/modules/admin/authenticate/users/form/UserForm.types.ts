import type { ModalFormComponentProps } from "@peppermint/admin";
import type { CreateUserValues, UpdateUserValues, User } from "../users.types";

export type UserFormProps = ModalFormComponentProps<User, CreateUserValues>;
export type UserProfileEditFormProps = ModalFormComponentProps<
  User,
  UpdateUserValues
>;

import type { ModalFormComponentProps } from "@peppermint/admin";
import type { ProfileUpdateValues, UserAdmin } from "../users.types";

export type UserProfileEditFormProps = ModalFormComponentProps<
  UserAdmin,
  ProfileUpdateValues
>;

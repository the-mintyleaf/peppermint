import type { ModalFormComponentProps } from "@peppermint/admin";
import type {
  AuthorityType,
  CreateUserValues,
  UpdateUserValues,
  User,
} from "../users.types";

export type UserFormProps = ModalFormComponentProps<User, CreateUserValues>;

/** The tier this account will be created at, or `null` if the caller manages none. */
interface ManagedTierProp {
  managedTier: AuthorityType | null;
}

export type RoleNoticeProps = ManagedTierProp;

export interface UserFieldsProps {
  isLoading: boolean;
}

export type UserSubmitButtonProps = UserFieldsProps & ManagedTierProp;
export type UserProfileEditFormProps = ModalFormComponentProps<
  User,
  UpdateUserValues
>;

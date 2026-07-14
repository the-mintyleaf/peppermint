import type { ModalFormComponentProps } from "@peppermint/admin";

import type { OrganizationMembership } from "../members.types";

export type InviteMemberFormProps = ModalFormComponentProps<
  OrganizationMembership,
  InviteMemberFormValues
>;

export interface InviteMemberFormValues {
  user_id: string | null;
  employee_code: string;
  joined_at: string;
  is_primary: boolean;
}

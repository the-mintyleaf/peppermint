import type { ModalFormComponentProps } from "@peppermint/admin";

import type { ScopeType } from "@/modules/admin/authenticate/_shared/authenticate.types";
import type { RoleBinding } from "../bindings.types";

export type RoleBindingFormProps = ModalFormComponentProps<
  RoleBinding,
  RoleBindingFormValues
>;

export interface RoleBindingFormValues {
  subject_user_id: string | null;
  role_id: string | null;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  valid_from: string | null;
  valid_until: string | null;
  assignment_reason: string;
}

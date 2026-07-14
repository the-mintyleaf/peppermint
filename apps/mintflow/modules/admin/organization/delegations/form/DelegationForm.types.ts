import type { ModalFormComponentProps } from "@peppermint/admin";

import type { AuthorityDelegation, DelegationType } from "../delegations.types";

export type DelegationFormProps = ModalFormComponentProps<
  AuthorityDelegation,
  DelegationFormValues
>;

export interface DelegationFormValues {
  from_assignment_id: string | null;
  to_assignment_id: string | null;
  delegation_type: DelegationType | "";
  scope_unit: string | null;
  starts_at: string;
  ends_at: string;
  reason: string;
}

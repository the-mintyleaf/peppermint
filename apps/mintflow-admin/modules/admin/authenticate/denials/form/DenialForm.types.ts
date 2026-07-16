import type { ModalFormComponentProps } from "@peppermint/admin";
import type { ScopeType } from "../../_shared/authenticate.types";
import type { Denial, DenialSeverity } from "../denials.types";

/** Record type is `Denial` (edit prefill); form values are `DenialFormValues`,
 * so `onSubmit` is typed to what the form emits — no cast across the boundary. */
export type DenialFormProps = ModalFormComponentProps<Denial, DenialFormValues>;

export interface DenialFormValues {
  subject_user_id: string | null;
  permission_key: string | null;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  reason: string;
  severity: DenialSeverity;
}

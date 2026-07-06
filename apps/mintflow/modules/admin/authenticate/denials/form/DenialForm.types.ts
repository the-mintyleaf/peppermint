import type { ModalFormComponentProps } from "@peppermint/admin";
import type { ScopeType } from "../../../_shared/authenticate.types";
import type { Denial, DenialSeverity } from "../denials.types";

export type DenialFormProps = ModalFormComponentProps<Denial>;

/** Internal form state — this is the create-payload shape, not the `Denial`
 * read entity. `ModalFormComponentProps<Denial>` forces `onSubmit`'s declared
 * parameter type to `Denial`; the submit handler casts across that boundary
 * (see DenialForm.tsx). DenialsList.tsx's `onCreateApi` casts back to
 * `DenialCreatePayload` before calling the API. */
export interface DenialFormValues {
  subject_user_id: string | null;
  permission_key: string | null;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  reason: string;
  severity: DenialSeverity;
}

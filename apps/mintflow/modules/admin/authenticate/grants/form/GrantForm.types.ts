import type { ModalFormComponentProps } from "@peppermint/admin";
import type { ScopeType } from "../../_shared/authenticate.types";
import type { Grant } from "../grants.types";

export type GrantFormProps = ModalFormComponentProps<Grant>;

/** Internal form state — this is the create-payload shape, not the `Grant`
 * read entity. `ModalFormComponentProps<Grant>` forces `onSubmit`'s declared
 * parameter type to `Grant`; the submit handler casts across that boundary
 * (see GrantForm.tsx). GrantsList.tsx's `onCreateApi` casts back to
 * `GrantCreatePayload` before calling the API. */
export interface GrantFormValues {
  subject_user_id: string | null;
  permission_key: string | null;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  reason: string;
  approved_by_id: string | null;
}

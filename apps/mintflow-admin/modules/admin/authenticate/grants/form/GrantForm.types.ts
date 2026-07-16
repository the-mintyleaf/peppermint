import type { ModalFormComponentProps } from "@peppermint/admin";
import type { ScopeType } from "../../_shared/authenticate.types";
import type { Grant } from "../grants.types";

/** Record type is `Grant` (for edit prefill); the form's own value shape is
 * `GrantFormValues`, so `onSubmit` is typed to the values the form actually
 * emits — no cast across the boundary. */
export type GrantFormProps = ModalFormComponentProps<Grant, GrantFormValues>;

export interface GrantFormValues {
  subject_user_id: string | null;
  permission_key: string | null;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  reason: string;
  approved_by_id: string | null;
}

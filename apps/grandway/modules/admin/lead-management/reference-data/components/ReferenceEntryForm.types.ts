import type { ReferenceEntry } from "../../leadManagement.types";

/**
 * Name and the "needs an explanation" flag are the whole form. `code` is
 * derived from the name on create (`toReferenceCode`) and immutable after,
 * and `display_order` is left at the server default — neither is a decision
 * worth asking an admin to make.
 */
export interface ReferenceEntryFormValues extends Record<string, unknown> {
  name: string;
  requires_detail: boolean;
}

export interface ReferenceEntryFormProps {
  mode: "create" | "edit";
  /** Required when `mode === "edit"` — supplies the initial values. */
  initialEntry?: ReferenceEntry;
  isSubmitting: boolean;
  onSubmit: (
    values: ReferenceEntryFormValues,
  ) => Promise<{ ok: boolean; message?: string }>;
  onCancel: () => void;
}

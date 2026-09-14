import type { ReferenceEntry } from "../../leadManagement.types";

/**
 * `code` is always present (kept read-only in edit mode rather than omitted)
 * so the field never has to mount/unmount between create and edit — see
 * `LeadFormValues` for the same `*Values`-suffix `FormWrapper<T>` exemption.
 */
export interface ReferenceEntryFormValues extends Record<string, unknown> {
  code: string;
  name: string;
  requires_detail: boolean;
  display_order: number;
}

export interface ReferenceEntryFormProps {
  mode: "create" | "edit";
  /** Required when `mode === "edit"` — supplies `code` (read-only) and the initial values. */
  initialEntry?: ReferenceEntry;
  /** `mode === "create"` only — e.g. a quick-create trigger's search text. */
  prefillName?: string;
  isSubmitting: boolean;
  onSubmit: (
    values: ReferenceEntryFormValues,
  ) => Promise<{ ok: boolean; message?: string }>;
  onCancel: () => void;
}

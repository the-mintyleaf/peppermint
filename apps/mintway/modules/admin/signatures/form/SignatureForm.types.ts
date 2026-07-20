import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Signature } from "@/modules/documents";

/** The form's own value shape — what `onSubmit` emits (distinct from the read entity). */
export interface SignatureFormValues extends Record<string, unknown> {
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  /**
   * `Nullable=Yes` date bounds (`signature.md` §1), held as the `YYYY-MM-DD` strings
   * Mantine's `DateInput` reads/writes. `null` is "no bound", and on edit it clears the
   * stored value rather than leaving it untouched.
   */
  validFrom: string | null;
  validTo: string | null;
  imageFile: File | null;
}

export type SignatureFormProps = ModalFormComponentProps<
  Signature,
  SignatureFormValues
>;

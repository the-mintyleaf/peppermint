import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Signature } from "@/modules/documents";

/** The form's own value shape — what `onSubmit` emits (distinct from the read entity). */
export interface SignatureFormValues extends Record<string, unknown> {
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  imageFile: File | null;
}

export type SignatureFormProps = ModalFormComponentProps<
  Signature,
  SignatureFormValues
>;

import type { ModalFormComponentProps } from "@peppermint/admin";
import type { IdentityDocument } from "../../_shared";

export interface IdentityDocumentFormValues extends Record<string, unknown> {
  document_type: string;
  document_number: string;
  issuing_country: string;
  issued_at: string;
  expires_at: string;
  verification_status: string;
  verification_notes: string;
}

export interface IdentityDocumentPayload extends Record<string, unknown> {
  document_type: string;
}

export type IdentityDocumentFormProps = ModalFormComponentProps<
  IdentityDocument,
  IdentityDocumentPayload
>;

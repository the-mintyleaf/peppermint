import { documentsApi } from "@/modules/documents";
import type { Signature, SignatureInput } from "@/modules/documents";
import type { SignatureFormValues } from "./form/SignatureForm.types";

/**
 * Thin signature API surface for the admin module. The endpoints themselves live in the
 * shared document engine (`@/modules/documents`); the full-screen editor consumes the same
 * `listSignatures`, so this module re-exports rather than duplicating them.
 */
export const listSignatures = documentsApi.listSignatures;
export const createSignature = documentsApi.createSignature;
export const updateSignature = documentsApi.updateSignature;
export const deactivateSignature = documentsApi.deactivateSignature;

/**
 * Re-enable a deactivated signature. Lifecycle is owned by the list (status cell + row menu),
 * not the form, so reactivation rides the `is_active` field of the update endpoint — `name` is
 * required by the multipart body and is taken from the existing row.
 */
export function reactivateSignature(
  id: string,
  name: string,
): Promise<Signature> {
  return updateSignature(id, { name, isActive: true });
}

/**
 * Map the form's value shape to the API input (trims + drops empty optionals). Lifecycle
 * (`is_active`) is intentionally omitted — create sends it explicitly, edit never touches it.
 */
export function toSignatureInput(values: SignatureFormValues): SignatureInput {
  return {
    name: values.name.trim(),
    title: values.title.trim() || undefined,
    organization: values.organization.trim() || undefined,
    email: values.email.trim() || undefined,
    phone: values.phone.trim() || undefined,
    imageFile: values.imageFile,
  };
}

export type { Signature };

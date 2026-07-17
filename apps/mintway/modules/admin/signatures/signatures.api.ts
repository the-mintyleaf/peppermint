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

/** Map the form's value shape to the API input (trims + drops empty optionals). */
export function toSignatureInput(values: SignatureFormValues): SignatureInput {
  return {
    name: values.name.trim(),
    title: values.title.trim() || undefined,
    organization: values.organization.trim() || undefined,
    email: values.email.trim() || undefined,
    phone: values.phone.trim() || undefined,
    isActive: values.isActive,
    imageFile: values.imageFile,
  };
}

export type { Signature };

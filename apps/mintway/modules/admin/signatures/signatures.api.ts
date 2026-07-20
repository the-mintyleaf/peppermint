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
 * `Nullable=Yes` fields (`signature.md` §1) — cleared by sending `null`, which the api layer
 * writes as an empty multipart part. On **create** an unset bound is simply omitted; on
 * **edit** it must be sent as `null`, or clearing a date in the form would leave the stored
 * value in place. This is the same isEdit split the CRM forms use (see `SponsorForm`).
 */
const NULLABLE_KEYS = ["validFrom", "validTo"] as const;

/**
 * Map the form's value shape to the API input (trims + drops empty optionals). Lifecycle
 * (`is_active`) is intentionally omitted — create sends it explicitly, edit never touches it.
 *
 * The `Nullable=No` text fields keep their existing create-shaped behaviour: blank maps to
 * `undefined` and the api layer omits it, so clearing one retains the server's value. That
 * is a pre-existing limitation of these fields, tracked separately — the date bounds below
 * are `Nullable=Yes` and do clear.
 */
export function toSignatureInput(
  values: SignatureFormValues,
  isEdit = false,
): SignatureInput {
  const input: SignatureInput = {
    name: values.name.trim(),
    title: values.title.trim() || undefined,
    organization: values.organization.trim() || undefined,
    email: values.email.trim() || undefined,
    phone: values.phone.trim() || undefined,
    imageFile: values.imageFile,
  };

  for (const key of NULLABLE_KEYS) {
    const value = values[key];
    if (isEdit || value) input[key] = value || null;
  }

  return input;
}

export type { Signature };

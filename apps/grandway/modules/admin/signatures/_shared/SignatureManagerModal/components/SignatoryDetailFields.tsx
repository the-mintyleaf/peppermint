"use client";

import { useFormInstance } from "@peppermint/admin";
import { TextInput } from "@peppermint/ui";
import type { SignatoryFormValues } from "../../../signatures.types";

/**
 * The four text fields, shared by create and edit. Read through the narrower
 * `SignatoryFormValues` even when the surrounding form holds more (create also
 * carries `file`) — these four keys are present either way.
 */
export function SignatoryDetailFields() {
  const { form } = useFormInstance<SignatoryFormValues>();
  return (
    <>
      <TextInput
        label="Name"
        placeholder="Sunita Shrestha"
        required
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Title"
        placeholder="Director"
        description="Shown under the signature on a certificate."
        {...form.getInputProps("title")}
      />
      <TextInput
        label="Role"
        placeholder="director"
        description="Free text. It does not restrict which signature slot this person can fill."
        {...form.getInputProps("role")}
      />
      <TextInput
        label="Signature image URL"
        placeholder="https://…"
        description="Optional fallback, used only when no image has been uploaded. Never fetched or checked by the server."
        {...form.getInputProps("signature_image_url")}
      />
    </>
  );
}

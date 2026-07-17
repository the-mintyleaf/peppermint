"use client";

import { Button, Group, Stack, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import type { Signature } from "@/modules/documents";
import { SignatureImageField } from "./SignatureImageField";
import type {
  SignatureFormProps,
  SignatureFormValues,
} from "./SignatureForm.types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  title: z.string(),
  organization: z.string(),
  email: z
    .string()
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
  phone: z.string(),
  // File | null — kept loose; the shell/API validate the upload itself.
  imageFile: z.any(),
});

/**
 * `Signature` (the read row) carries no email/phone, so the edit prefill maps only the fields it
 * exposes. Email/phone can't be prefilled on edit — the entity doesn't expose them. Because
 * `toSignatureInput` maps blank → `undefined` and the API omits undefined fields, a save that
 * leaves them blank *retains* the server's existing values (it does not wipe them) — the flip
 * side being this form can't clear an already-set email/phone. Lifecycle (`is_active`) is not a
 * form field: new signatures are created active, and status is toggled from the list.
 */
function toInitial(record?: Partial<Signature>): SignatureFormValues {
  return {
    name: record?.name ?? "",
    title: record?.title ?? "",
    organization: record?.organization ?? "",
    email: "",
    phone: "",
    imageFile: null,
  };
}

export function SignatureForm({
  initialValues,
  onSubmit,
  isLoading,
}: SignatureFormProps) {
  const isEditing = initialValues !== undefined;
  return (
    <FormWrapper<SignatureFormValues>
      initial={toInitial(initialValues)}
      validation={[schema]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <SignatureFields
        isLoading={isLoading}
        isEditing={isEditing}
        existingImageUrl={initialValues?.signature_image}
        hasExistingImage={initialValues?.has_image ?? false}
      />
    </FormWrapper>
  );
}

function SignatureFields({
  isLoading,
  isEditing,
  existingImageUrl,
  hasExistingImage,
}: {
  isLoading: boolean;
  isEditing: boolean;
  existingImageUrl?: string;
  hasExistingImage: boolean;
}) {
  const { form } = useFormInstance<SignatureFormValues>();
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Stack gap="md" p="md">
      <SignatureImageField
        disabled={isLoading}
        existingImageUrl={existingImageUrl}
        hasExistingImage={hasExistingImage}
      />
      <TextInput
        label="Name"
        required
        placeholder="e.g. Dr. Jane Doe"
        disabled={isLoading}
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Title"
        placeholder="e.g. Program Director"
        disabled={isLoading}
        {...form.getInputProps("title")}
      />
      <TextInput
        label="Organization"
        placeholder="e.g. Peppermint Institute"
        disabled={isLoading}
        {...form.getInputProps("organization")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Email"
          type="email"
          placeholder="name@example.com"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
        <TextInput
          label="Phone"
          placeholder="+1 555 000 1234"
          disabled={isLoading}
          {...form.getInputProps("phone")}
        />
      </Group>
      <Button
        onClick={handleSubmit}
        loading={isLoading || submitting}
        fullWidth
      >
        {isEditing ? "Save changes" : "Add signature"}
      </Button>
    </Stack>
  );
}

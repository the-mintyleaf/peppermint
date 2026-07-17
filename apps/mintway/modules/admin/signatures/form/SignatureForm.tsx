"use client";

import {
  Button,
  FileInput,
  Group,
  Stack,
  Switch,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import type { Signature } from "@/modules/documents";
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
  isActive: z.boolean(),
  // File | null — kept loose; the shell/API validate the upload itself.
  imageFile: z.any(),
});

/**
 * `Signature` (the read row) carries `is_active` and no email/phone, so the edit prefill is
 * mapped explicitly. Email/phone can't be prefilled on edit — the entity doesn't expose them
 * (known limitation; a save leaves them blank unless re-entered).
 */
function toInitial(record?: Partial<Signature>): SignatureFormValues {
  return {
    name: record?.name ?? "",
    title: record?.title ?? "",
    organization: record?.organization ?? "",
    email: "",
    phone: "",
    isActive: record?.is_active ?? true,
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
      <SignatureFields isLoading={isLoading} isEditing={isEditing} />
    </FormWrapper>
  );
}

function SignatureFields({
  isLoading,
  isEditing,
}: {
  isLoading: boolean;
  isEditing: boolean;
}) {
  const { form } = useFormInstance<SignatureFormValues>();
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Stack gap="md" p="md">
      <TextInput
        label="Name"
        required
        disabled={isLoading}
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Title"
        disabled={isLoading}
        {...form.getInputProps("title")}
      />
      <TextInput
        label="Organization"
        disabled={isLoading}
        {...form.getInputProps("organization")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Email"
          type="email"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
        <TextInput
          label="Phone"
          disabled={isLoading}
          {...form.getInputProps("phone")}
        />
      </Group>
      <FileInput
        label="Signature image"
        placeholder={
          isEditing ? "Replace image (optional)" : "Upload image (optional)"
        }
        accept="image/png,image/jpeg,image/webp"
        clearable
        disabled={isLoading}
        {...form.getInputProps("imageFile")}
      />
      <Switch
        label="Active"
        disabled={isLoading}
        {...form.getInputProps("isActive", { type: "checkbox" })}
      />
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

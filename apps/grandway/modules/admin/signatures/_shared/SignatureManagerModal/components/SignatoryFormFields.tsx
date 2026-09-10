"use client";

import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { Button, Group, Stack, TextInput } from "@peppermint/ui";
import { z } from "zod";
import { confirmDiscardChanges } from "../../confirmDiscardChanges";
import type { SignatoryFormValues } from "../../../signatures.types";

/**
 * `role` is **free text, max 100** — the contract is explicit that it is not an
 * enum and that a picker must never filter by it, because a director may
 * legitimately sign as the instructor. Do not turn this into a Select.
 *
 * `signature_image_url` is validated only for well-formedness, matching the
 * server: it never fetches the link, so a valid URL pointing at nothing passes
 * here exactly as it does there.
 */
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "A name is required")
    .max(255, "Max 255 characters"),
  title: z.string().max(255, "Max 255 characters"),
  role: z.string().max(100, "Max 100 characters"),
  signature_image_url: z
    .union([z.literal(""), z.string().url("Enter a full URL, or leave blank")])
    .refine((v) => v.length <= 500, "Max 500 characters"),
});

interface SignatoryFormFieldsProps {
  initial: SignatoryFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: SignatoryFormValues) => Promise<void>;
}

export function SignatoryFormFields({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: SignatoryFormFieldsProps) {
  return (
    <FormWrapper<SignatoryFormValues>
      initial={initial}
      validation={[schema]}
      hasDirtCheck
      finalSubmitFn={async (values) => {
        await onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="sm">
        <Fields />
        <SubmitRow submitLabel={submitLabel} onCancel={onCancel} />
      </Stack>
    </FormWrapper>
  );
}

function Fields() {
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
        description="A fallback, used only when no image has been uploaded. Never fetched or checked by the server."
        {...form.getInputProps("signature_image_url")}
      />
    </>
  );
}

function SubmitRow({
  submitLabel,
  onCancel,
}: {
  submitLabel: string;
  onCancel: () => void;
}) {
  const { handleSubmit, isLoading, isDirty } = useFormControls();
  const handleCancel = () => {
    if (isDirty) confirmDiscardChanges(onCancel);
    else onCancel();
  };
  return (
    <Group justify="flex-end" gap="xs">
      <Button
        variant="default"
        size="xs"
        onClick={handleCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button size="xs" loading={isLoading} onClick={handleSubmit}>
        {submitLabel}
      </Button>
    </Group>
  );
}

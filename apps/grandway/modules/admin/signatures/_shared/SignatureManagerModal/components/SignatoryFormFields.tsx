"use client";

import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { Button, Group, Stack, TextInput } from "@peppermint/ui";
import { z } from "zod";
import type { SignatoryFormValues } from "../../../signatures.types";
import { DirtyReporter, type ReportDirty } from "./DirtyReporter";

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
  /** Guarded by the modal shell, which owns every exit path. Never confirm here as well. */
  onCancel: () => void;
  onSubmit: (values: SignatoryFormValues) => Promise<void>;
  /**
   * Reports dirtiness up to the shell. **Must be referentially stable** — it is
   * an effect dependency. The shell keeps it in a `useCallback` that only
   * writes a ref.
   */
  onDirtyChange: ReportDirty;
}

export function SignatoryFormFields({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
  onDirtyChange,
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
        <DirtyReporter source="details" onDirtyChange={onDirtyChange} />
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
  const { handleSubmit, isLoading } = useFormControls();
  return (
    <Group justify="flex-end" gap="xs">
      {/* No discard prompt here: `onCancel` is the shell's guarded leave, which
          already confirms. Prompting in both places would ask twice. */}
      <Button
        variant="default"
        size="xs"
        onClick={onCancel}
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

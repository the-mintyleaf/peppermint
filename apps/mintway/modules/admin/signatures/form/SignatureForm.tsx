"use client";

import { Button, DateInput, Group, Stack, TextInput } from "@peppermint/ui";
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

const schema = z
  .object({
    name: z.string().min(1, "Required"),
    title: z.string(),
    organization: z.string(),
    email: z
      .string()
      .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
    phone: z.string(),
    validFrom: z.string().nullable(),
    validTo: z.string().nullable(),
    // File | null — kept loose; the shell/API validate the upload itself.
    imageFile: z.any(),
  })
  // Both bounds are optional and either may stand alone, but an inverted window is a data
  // error the backend does not reject — catch it here rather than store a signatory that can
  // never be valid. `YYYY-MM-DD` compares correctly as a string.
  .refine((v) => !v.validFrom || !v.validTo || v.validFrom <= v.validTo, {
    message: "Valid to must be on or after Valid from",
    path: ["validTo"],
  });

/**
 * `Signature` now carries `email`/`phone`, so the edit prefill shows the stored values instead
 * of two misleadingly blank inputs. Note the remaining limitation: `toSignatureInput` maps blank
 * → `undefined` and the API omits undefined fields, so clearing a field *retains* the server's
 * value rather than wiping it. Lifecycle (`is_active`) is not a form field: new signatures are
 * created active, and status is toggled from the list.
 */
function toInitial(record?: Partial<Signature>): SignatureFormValues {
  return {
    name: record?.name ?? "",
    title: record?.title ?? "",
    organization: record?.organization ?? "",
    email: record?.email ?? "",
    phone: record?.phone ?? "",
    validFrom: record?.validFrom ?? null,
    validTo: record?.validTo ?? null,
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
      {/* Both bounds are optional: an open-ended signatory leaves them blank. They sit after
          the identity fields because they qualify the signatory rather than identify one. */}
      <Group grow align="flex-start">
        <DateInput
          label="Valid from"
          description="Optional"
          placeholder="No start date"
          valueFormat="YYYY-MM-DD"
          clearable
          disabled={isLoading}
          {...form.getInputProps("validFrom")}
        />
        <DateInput
          label="Valid to"
          description="Optional"
          placeholder="No end date"
          valueFormat="YYYY-MM-DD"
          clearable
          disabled={isLoading}
          {...form.getInputProps("validTo")}
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

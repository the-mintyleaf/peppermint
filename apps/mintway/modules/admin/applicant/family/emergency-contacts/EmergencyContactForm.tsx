"use client";

import { z } from "zod";
import {
  Button,
  Checkbox,
  Group,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import type { EmergencyContact } from "../../_shared";
import type {
  EmergencyContactFormProps,
  EmergencyContactFormValues,
  EmergencyContactPayload,
} from "./EmergencyContactForm.types";

const INITIAL: EmergencyContactFormValues = {
  name: "",
  relationship: "",
  phone: "",
  email: "",
  address: "",
  is_primary: false,
};

const VALIDATION = z.object({ name: z.string().min(1, "Name is required") });

function toInitial(
  record?: Partial<EmergencyContact>,
): EmergencyContactFormValues {
  if (!record) return INITIAL;
  return {
    name: record.name ?? "",
    relationship: record.relationship ?? "",
    phone: record.phone ?? "",
    email: record.email ?? "",
    address: record.address ?? "",
    is_primary: Boolean(record.is_primary),
  };
}

/** `Nullable=No` optional text — unset is the empty string, so blank clears. */
const TEXT_KEYS: (keyof EmergencyContactFormValues)[] = [
  "relationship",
  "phone",
  "email",
  "address",
];

/**
 * Build the api payload — always send name + is_primary. On create empty values are
 * dropped; on edit they are sent explicitly so a cleared field actually clears, rather
 * than the PATCH silently no-op'ing that key.
 */
function toPayload(
  values: EmergencyContactFormValues,
  isEdit: boolean,
): EmergencyContactPayload {
  const payload: Record<string, unknown> = {
    name: values.name,
    is_primary: values.is_primary,
  };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  return payload as EmergencyContactPayload;
}

/** Create/edit an emergency contact (§9). Admin-permitted; a locked/archived parent is
 * rejected by the server and surfaced by the shell. */
export function EmergencyContactForm({
  initialValues,
  onSubmit,
  isLoading,
}: EmergencyContactFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<EmergencyContactFormValues>
      initial={toInitial(initialValues)}
      validation={[VALIDATION]}
      finalSubmitFn={async (values) => {
        onSubmit(toPayload(values, isEdit));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Fields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<EmergencyContactFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Name"
          withAsterisk
          disabled={isLoading}
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Relationship"
          disabled={isLoading}
          {...form.getInputProps("relationship")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Phone"
          disabled={isLoading}
          {...form.getInputProps("phone")}
        />
        <TextInput
          label="Email"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
      </Group>
      <Textarea
        label="Address"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("address")}
      />
      <Checkbox
        label="Primary contact"
        disabled={isLoading}
        {...form.getInputProps("is_primary", { type: "checkbox" })}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save emergency contact
    </Button>
  );
}

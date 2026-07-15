"use client";

import { z } from "zod";
import { Button, Group, Stack, Textarea, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import type { Reference } from "../../_shared";
import type {
  ReferenceFormProps,
  ReferenceFormValues,
  ReferencePayload,
} from "./ReferenceForm.types";

const INITIAL: ReferenceFormValues = {
  reference_order: "",
  name: "",
  title: "",
  institution: "",
  address: "",
  email: "",
  contact: "",
  relationship_to_applicant: "",
  notes: "",
};

const VALIDATION = z.object({ name: z.string().min(1, "Name is required") });

function toInitial(record?: Partial<Reference>): ReferenceFormValues {
  if (!record) return INITIAL;
  return {
    reference_order:
      record.reference_order != null ? String(record.reference_order) : "",
    name: record.name ?? "",
    title: record.title ?? "",
    institution: record.institution ?? "",
    address: record.address ?? "",
    email: record.email ?? "",
    contact: record.contact ?? "",
    relationship_to_applicant: record.relationship_to_applicant ?? "",
    notes: record.notes ?? "",
  };
}

const TEXT_KEYS: (keyof ReferenceFormValues)[] = [
  "title",
  "institution",
  "address",
  "email",
  "contact",
  "relationship_to_applicant",
  "notes",
];

/** Build the api payload — always send name; parse reference_order to a number (omit if
 * empty); drop empty text fields. */
function toPayload(values: ReferenceFormValues): ReferencePayload {
  const payload: Record<string, unknown> = { name: values.name };
  const order = values.reference_order.trim();
  if (order !== "") {
    const parsed = Number(order);
    if (!Number.isNaN(parsed)) payload.reference_order = parsed;
  }
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = value;
  }
  return payload as ReferencePayload;
}

/** Create/edit a reference (§9). Admin-permitted; a locked/archived parent is rejected
 * by the server and surfaced by the shell. */
export function ReferenceForm({
  initialValues,
  onSubmit,
  isLoading,
}: ReferenceFormProps) {
  return (
    <FormWrapper<ReferenceFormValues>
      initial={toInitial(initialValues)}
      validation={[VALIDATION]}
      finalSubmitFn={async (values) => {
        onSubmit(toPayload(values));
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
  const { form } = useFormInstance<ReferenceFormValues>();
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
          label="Order"
          type="number"
          disabled={isLoading}
          {...form.getInputProps("reference_order")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Title"
          disabled={isLoading}
          {...form.getInputProps("title")}
        />
        <TextInput
          label="Institution"
          disabled={isLoading}
          {...form.getInputProps("institution")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Email"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
        <TextInput
          label="Contact"
          disabled={isLoading}
          {...form.getInputProps("contact")}
        />
      </Group>
      <TextInput
        label="Relationship to applicant"
        disabled={isLoading}
        {...form.getInputProps("relationship_to_applicant")}
      />
      <Textarea
        label="Address"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("address")}
      />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("notes")}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save reference
    </Button>
  );
}

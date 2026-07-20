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

/**
 * Every field on this resource is `Req ✗` — nothing here may be made mandatory. The plain
 * `≤N chars` caps ride on the inputs' `maxLength`; `contact` gets a rule instead, because
 * a silently clipped number still looks like a real one. An empty `email` stays valid.
 */
const VALIDATION = z.object({
  email: z
    .string()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Enter a valid email address",
    }),
  contact: z.string().max(64, "Contact can be at most 64 characters"),
});

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

/** `Nullable=No` optional text — unset is the empty string, so blank clears. */
const TEXT_KEYS: (keyof ReferenceFormValues)[] = [
  "title",
  "institution",
  "address",
  "email",
  "contact",
  "relationship_to_applicant",
  "notes",
];

/** `reference_order` is `Nullable=No` with a server default of 1 — blanking it can only
 * mean "back to the default", since DRF's IntegerField rejects both `""` and `null`. */
const REFERENCE_ORDER_DEFAULT = 1;

/**
 * Build the api payload — always send name; parse reference_order to a number. On create
 * empty values are dropped; on edit they are sent explicitly so a cleared field actually
 * clears, rather than the PATCH silently no-op'ing that key.
 */
function toPayload(
  values: ReferenceFormValues,
  isEdit: boolean,
): ReferencePayload {
  const payload: Record<string, unknown> = { name: values.name };
  const order = values.reference_order.trim();
  if (order !== "") {
    const parsed = Number(order);
    if (!Number.isNaN(parsed)) payload.reference_order = parsed;
  } else if (isEdit) {
    payload.reference_order = REFERENCE_ORDER_DEFAULT;
  }
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
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
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<ReferenceFormValues>
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
  const { form } = useFormInstance<ReferenceFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Name"
          maxLength={200}
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
          maxLength={150}
          disabled={isLoading}
          {...form.getInputProps("title")}
        />
        <TextInput
          label="Institution"
          maxLength={255}
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
        maxLength={100}
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

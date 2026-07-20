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

import type { FamilyMember } from "../../_shared";
import type {
  FamilyMemberFormProps,
  FamilyMemberFormValues,
  FamilyMemberPayload,
} from "./FamilyMemberForm.types";

const INITIAL: FamilyMemberFormValues = {
  name: "",
  relationship: "",
  date_of_birth: "",
  age_snapshot: "",
  occupation: "",
  contact: "",
  address: "",
  is_financial_sponsor: false,
  notes: "",
};

const VALIDATION = z.object({ name: z.string().min(1, "Name is required") });

function toInitial(record?: Partial<FamilyMember>): FamilyMemberFormValues {
  if (!record) return INITIAL;
  return {
    name: record.name ?? "",
    relationship: record.relationship ?? "",
    date_of_birth: record.date_of_birth
      ? record.date_of_birth.slice(0, 10)
      : "",
    age_snapshot:
      record.age_snapshot === undefined || record.age_snapshot === null
        ? ""
        : String(record.age_snapshot),
    occupation: record.occupation ?? "",
    contact: record.contact ?? "",
    address: record.address ?? "",
    is_financial_sponsor: Boolean(record.is_financial_sponsor),
    notes: record.notes ?? "",
  };
}

/** `Nullable=No` optional text — unset is the empty string, so blank clears. */
const TEXT_KEYS: (keyof FamilyMemberFormValues)[] = [
  "relationship",
  "occupation",
  "contact",
  "address",
  "notes",
];

/**
 * Build the api payload — always send name + is_financial_sponsor. On create empty
 * values are dropped; on edit they are sent explicitly so a cleared field actually
 * clears, rather than the PATCH silently no-op'ing that key. `date_of_birth` and
 * `age_snapshot` are `Nullable=Yes` and clear with `null` — DRF's DateField/IntegerField
 * reject `""` with a 400.
 */
function toPayload(
  values: FamilyMemberFormValues,
  isEdit: boolean,
): FamilyMemberPayload {
  const payload: Record<string, unknown> = {
    name: values.name,
    is_financial_sponsor: values.is_financial_sponsor,
  };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  if (values.date_of_birth) payload.date_of_birth = values.date_of_birth;
  else if (isEdit) payload.date_of_birth = null;
  if (values.age_snapshot !== "")
    payload.age_snapshot = Number(values.age_snapshot);
  else if (isEdit) payload.age_snapshot = null;
  return payload as FamilyMemberPayload;
}

/** Create/edit a family member (§9). Admin-permitted; a locked/archived parent is
 * rejected by the server and surfaced by the shell. */
export function FamilyMemberForm({
  initialValues,
  onSubmit,
  isLoading,
}: FamilyMemberFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<FamilyMemberFormValues>
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
  const { form } = useFormInstance<FamilyMemberFormValues>();
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
          label="Date of birth"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("date_of_birth")}
        />
        <TextInput
          label="Age"
          type="number"
          description="Age recorded at the time of intake"
          disabled={isLoading}
          {...form.getInputProps("age_snapshot")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Occupation"
          disabled={isLoading}
          {...form.getInputProps("occupation")}
        />
        <TextInput
          label="Contact"
          disabled={isLoading}
          {...form.getInputProps("contact")}
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
        label="Financial sponsor"
        disabled={isLoading}
        {...form.getInputProps("is_financial_sponsor", { type: "checkbox" })}
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
      Save family member
    </Button>
  );
}

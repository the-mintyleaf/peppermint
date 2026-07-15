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
    occupation: record.occupation ?? "",
    contact: record.contact ?? "",
    address: record.address ?? "",
    is_financial_sponsor: Boolean(record.is_financial_sponsor),
    notes: record.notes ?? "",
  };
}

const TEXT_KEYS: (keyof FamilyMemberFormValues)[] = [
  "relationship",
  "occupation",
  "contact",
  "address",
  "notes",
];

/** Build the api payload — always send name + is_financial_sponsor; drop empty text/date. */
function toPayload(values: FamilyMemberFormValues): FamilyMemberPayload {
  const payload: Record<string, unknown> = {
    name: values.name,
    is_financial_sponsor: values.is_financial_sponsor,
  };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = value;
  }
  if (values.date_of_birth) payload.date_of_birth = values.date_of_birth;
  return payload as FamilyMemberPayload;
}

/** Create/edit a family member (§9). Admin-permitted; a locked/archived parent is
 * rejected by the server and surfaced by the shell. */
export function FamilyMemberForm({
  initialValues,
  onSubmit,
  isLoading,
}: FamilyMemberFormProps) {
  return (
    <FormWrapper<FamilyMemberFormValues>
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
          label="Occupation"
          disabled={isLoading}
          {...form.getInputProps("occupation")}
        />
      </Group>
      <TextInput
        label="Contact"
        disabled={isLoading}
        {...form.getInputProps("contact")}
      />
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

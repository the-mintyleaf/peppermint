"use client";

import { z } from "zod";
import { Button, Group, Stack, Textarea, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import type { TravelHistory } from "../../_shared";
import type {
  TravelHistoryFormProps,
  TravelHistoryFormValues,
  TravelHistoryPayload,
} from "./TravelHistoryForm.types";

const VALIDATION = z.object({
  country: z.string().min(1, "Country is required"),
});

const INITIAL: TravelHistoryFormValues = {
  country: "",
  purpose: "",
  travelled_from: "",
  travelled_to: "",
  visa_type: "",
  notes: "",
};

function toInitial(record?: Partial<TravelHistory>): TravelHistoryFormValues {
  if (!record) return INITIAL;
  return {
    country: record.country ?? "",
    purpose: record.purpose ?? "",
    travelled_from: record.travelled_from
      ? record.travelled_from.slice(0, 10)
      : "",
    travelled_to: record.travelled_to ? record.travelled_to.slice(0, 10) : "",
    visa_type: record.visa_type ?? "",
    notes: record.notes ?? "",
  };
}

const TEXT_KEYS: (keyof TravelHistoryFormValues)[] = [
  "purpose",
  "visa_type",
  "notes",
];

/**
 * Build the api payload. Always send country. On create, empty text is dropped; on edit,
 * blank text is sent so a cleared field clears (PATCH). Empty dates (travelled_from,
 * travelled_to) are always dropped (DRF rejects "" for a date field).
 */
function toPayload(
  values: TravelHistoryFormValues,
  isEdit: boolean,
): TravelHistoryPayload {
  const payload: Record<string, unknown> = { country: values.country };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  if (values.travelled_from) payload.travelled_from = values.travelled_from;
  if (values.travelled_to) payload.travelled_to = values.travelled_to;
  return payload as TravelHistoryPayload;
}

/**
 * Create/edit an applicant travel-history entry (§8). Admin-only nested resource; a
 * locked/archived parent is rejected server-side and surfaced by the shell.
 */
export function TravelHistoryForm({
  initialValues,
  onSubmit,
  isLoading,
}: TravelHistoryFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<TravelHistoryFormValues>
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
  const { form } = useFormInstance<TravelHistoryFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Country"
          withAsterisk
          disabled={isLoading}
          {...form.getInputProps("country")}
        />
        <TextInput
          label="Purpose"
          disabled={isLoading}
          {...form.getInputProps("purpose")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Travelled from"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("travelled_from")}
        />
        <TextInput
          label="Travelled to"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("travelled_to")}
        />
      </Group>
      <TextInput
        label="Visa type"
        disabled={isLoading}
        {...form.getInputProps("visa_type")}
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
      Save travel history
    </Button>
  );
}

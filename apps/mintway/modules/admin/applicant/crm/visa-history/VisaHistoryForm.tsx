"use client";

import { z } from "zod";
import {
  Button,
  Group,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import { VISA_DECISION_LABELS, toOptions } from "../../_shared";
import type { VisaHistory } from "../../_shared";
import type {
  VisaHistoryFormProps,
  VisaHistoryFormValues,
  VisaHistoryPayload,
} from "./VisaHistoryForm.types";

const VISA_DECISION_OPTIONS = toOptions(VISA_DECISION_LABELS);

const VALIDATION = z.object({
  country: z.string().min(1, "Country is required"),
});

const INITIAL: VisaHistoryFormValues = {
  country: "",
  visa_type: "",
  application_date: "",
  decision_date: "",
  decision: "",
  reference_number: "",
  refusal_reason: "",
  notes: "",
};

function toInitial(record?: Partial<VisaHistory>): VisaHistoryFormValues {
  if (!record) return INITIAL;
  return {
    country: record.country ?? "",
    visa_type: record.visa_type ?? "",
    application_date: record.application_date
      ? record.application_date.slice(0, 10)
      : "",
    decision_date: record.decision_date
      ? record.decision_date.slice(0, 10)
      : "",
    decision: record.decision ?? "",
    reference_number: record.reference_number ?? "",
    refusal_reason: record.refusal_reason ?? "",
    notes: record.notes ?? "",
  };
}

const TEXT_KEYS: (keyof VisaHistoryFormValues)[] = [
  "visa_type",
  "reference_number",
  "refusal_reason",
  "notes",
];

/**
 * Build the api payload. Always send country. On create, empty text is dropped; on edit,
 * blank text is sent so a cleared field clears (PATCH). Empty dates (application_date,
 * decision_date) and the empty enum (decision) are always dropped (DRF rejects "").
 */
function toPayload(
  values: VisaHistoryFormValues,
  isEdit: boolean,
): VisaHistoryPayload {
  const payload: Record<string, unknown> = { country: values.country };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  if (values.decision) payload.decision = values.decision;
  if (values.application_date)
    payload.application_date = values.application_date;
  if (values.decision_date) payload.decision_date = values.decision_date;
  return payload as VisaHistoryPayload;
}

/**
 * Create/edit an applicant visa-history entry (§8). Admin-only nested resource; a
 * locked/archived parent is rejected server-side and surfaced by the shell.
 */
export function VisaHistoryForm({
  initialValues,
  onSubmit,
  isLoading,
}: VisaHistoryFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<VisaHistoryFormValues>
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
  const { form } = useFormInstance<VisaHistoryFormValues>();
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
          label="Visa type"
          disabled={isLoading}
          {...form.getInputProps("visa_type")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Application date"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("application_date")}
        />
        <TextInput
          label="Decision date"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("decision_date")}
        />
      </Group>
      <Group grow align="flex-start">
        <Select
          label="Decision"
          data={VISA_DECISION_OPTIONS}
          clearable
          disabled={isLoading}
          {...form.getInputProps("decision")}
        />
        <TextInput
          label="Reference number"
          disabled={isLoading}
          {...form.getInputProps("reference_number")}
        />
      </Group>
      <Textarea
        label="Refusal reason"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("refusal_reason")}
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
      Save visa history
    </Button>
  );
}

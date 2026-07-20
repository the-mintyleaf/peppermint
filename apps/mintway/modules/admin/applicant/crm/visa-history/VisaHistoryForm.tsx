"use client";

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

const INITIAL: VisaHistoryFormValues = {
  country: "",
  visa_type: "",
  application_date: "",
  decision_date: "",
  decision: "",
  reference_number: "",
  refusal_reason: "",
  notes: "",
  evidence_media: "",
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
    evidence_media: record.evidence_media ?? "",
  };
}

const TEXT_KEYS: (keyof VisaHistoryFormValues)[] = [
  "visa_type",
  "reference_number",
  "refusal_reason",
  "notes",
];

/** `Nullable=Yes` — cleared by sending `null`, never `""` (DRF rejects `""` for a
 * DateField, and for the `evidence_media` UUID relation). */
const NULLABLE_KEYS: (keyof VisaHistoryFormValues)[] = [
  "application_date",
  "decision_date",
  "evidence_media",
];

/**
 * Build the api payload. Always send country. On create, empty values are dropped; on
 * edit they are sent explicitly so a cleared field actually clears — `""` for the
 * nullable=No text fields, `null` for the dates and the media link. `decision` is an
 * enum and is always dropped when blank — DRF rejects `""` for a choice field.
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
  for (const key of NULLABLE_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "") payload[key] = value;
    else if (isEdit) payload[key] = null;
  }
  if (values.decision) payload.decision = values.decision;
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
      <TextInput
        label="Evidence media"
        description="Id of an uploaded media file belonging to this applicant"
        disabled={isLoading}
        {...form.getInputProps("evidence_media")}
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

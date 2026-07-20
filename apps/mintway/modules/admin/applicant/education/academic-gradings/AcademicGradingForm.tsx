"use client";

import { Button, Group, Stack, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import type { AcademicGrading } from "../../_shared";
import type {
  AcademicGradingFormProps,
  AcademicGradingFormValues,
  AcademicGradingPayload,
} from "./AcademicGradingForm.types";

const INITIAL: AcademicGradingFormValues = {
  context: "",
  month_or_period: "",
  grammar: "",
  conversation: "",
  composition: "",
  listening: "",
  reading: "",
  total_days: "",
  class_hours: "",
  present: "",
  absent: "",
  attendance_percentage: "",
};

function toStr(value: number | null | undefined): string {
  return value === undefined || value === null ? "" : String(value);
}

function toInitial(
  record?: Partial<AcademicGrading>,
): AcademicGradingFormValues {
  if (!record) return INITIAL;
  return {
    context: record.context ?? "",
    month_or_period: record.month_or_period ?? "",
    grammar: record.grammar ?? "",
    conversation: record.conversation ?? "",
    composition: record.composition ?? "",
    listening: record.listening ?? "",
    reading: record.reading ?? "",
    total_days: toStr(record.total_days),
    class_hours: record.class_hours ?? "",
    present: toStr(record.present),
    absent: toStr(record.absent),
    attendance_percentage: record.attendance_percentage ?? "",
  };
}

/** `Nullable=No` optional text — unset is the empty string, so blank clears. */
const TEXT_KEYS: (keyof AcademicGradingFormValues)[] = [
  "context",
  "month_or_period",
  "grammar",
  "conversation",
  "composition",
  "listening",
  "reading",
  "attendance_percentage",
];

/** `Nullable=Yes` decimal — a decimal STRING, never Number()'d; cleared with `null`. */
const NULLABLE_DECIMAL_KEYS: (keyof AcademicGradingFormValues)[] = [
  "class_hours",
];

/** `Nullable=Yes` integers — coerced on send, cleared with `null` (never `""`). */
const NULLABLE_NUMBER_KEYS: (keyof AcademicGradingFormValues)[] = [
  "total_days",
  "present",
  "absent",
];

/**
 * Build the api payload. On create empty values are dropped; on edit they are sent
 * explicitly so a cleared field actually clears, rather than the PATCH silently
 * no-op'ing that key. The nullable decimal/integer fields clear with `null` — DRF's
 * DecimalField/IntegerField have no `allow_blank` and reject `""` with a 400.
 */
function toPayload(
  values: AcademicGradingFormValues,
  isEdit: boolean,
): AcademicGradingPayload {
  const payload: Record<string, unknown> = {};
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  for (const key of NULLABLE_DECIMAL_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "") payload[key] = value;
    else if (isEdit) payload[key] = null;
  }
  for (const key of NULLABLE_NUMBER_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "") payload[key] = Number(value);
    else if (isEdit) payload[key] = null;
  }
  return payload;
}

/**
 * Create/edit an academic-grading record for the current applicant (§9). Admin-only
 * nested resource; a locked/archived parent is rejected server-side and surfaced by
 * the shell.
 */
export function AcademicGradingForm({
  initialValues,
  onSubmit,
  isLoading,
}: AcademicGradingFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<AcademicGradingFormValues>
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
  const { form } = useFormInstance<AcademicGradingFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Context"
          maxLength={150}
          disabled={isLoading}
          {...form.getInputProps("context")}
        />
        <TextInput
          label="Month / period"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("month_or_period")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Grammar"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("grammar")}
        />
        <TextInput
          label="Conversation"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("conversation")}
        />
        <TextInput
          label="Composition"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("composition")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Listening"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("listening")}
        />
        <TextInput
          label="Reading"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("reading")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Total days"
          type="number"
          disabled={isLoading}
          {...form.getInputProps("total_days")}
        />
        <TextInput
          label="Class hours"
          disabled={isLoading}
          {...form.getInputProps("class_hours")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Present"
          type="number"
          disabled={isLoading}
          {...form.getInputProps("present")}
        />
        <TextInput
          label="Absent"
          type="number"
          disabled={isLoading}
          {...form.getInputProps("absent")}
        />
        <TextInput
          label="Attendance %"
          maxLength={20}
          disabled={isLoading}
          {...form.getInputProps("attendance_percentage")}
        />
      </Group>
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save grading
    </Button>
  );
}

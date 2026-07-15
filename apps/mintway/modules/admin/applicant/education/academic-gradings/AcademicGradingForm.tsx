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

const TEXT_KEYS: (keyof AcademicGradingFormValues)[] = [
  "context",
  "month_or_period",
  "grammar",
  "conversation",
  "composition",
  "listening",
  "reading",
  "class_hours",
  "attendance_percentage",
];

const NUMBER_KEYS: (keyof AcademicGradingFormValues)[] = [
  "total_days",
  "present",
  "absent",
];

/** Build the api payload — drop empty text; coerce numeric fields; omit empties. */
function toPayload(values: AcademicGradingFormValues): AcademicGradingPayload {
  const payload: Record<string, unknown> = {};
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = value;
  }
  for (const key of NUMBER_KEYS) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = Number(value);
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
  return (
    <FormWrapper<AcademicGradingFormValues>
      initial={toInitial(initialValues)}
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
  const { form } = useFormInstance<AcademicGradingFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Context"
          disabled={isLoading}
          {...form.getInputProps("context")}
        />
        <TextInput
          label="Month / period"
          disabled={isLoading}
          {...form.getInputProps("month_or_period")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Grammar"
          disabled={isLoading}
          {...form.getInputProps("grammar")}
        />
        <TextInput
          label="Conversation"
          disabled={isLoading}
          {...form.getInputProps("conversation")}
        />
        <TextInput
          label="Composition"
          disabled={isLoading}
          {...form.getInputProps("composition")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Listening"
          disabled={isLoading}
          {...form.getInputProps("listening")}
        />
        <TextInput
          label="Reading"
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

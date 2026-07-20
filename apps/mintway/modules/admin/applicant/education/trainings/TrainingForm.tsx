"use client";

import { Button, Group, Stack, Textarea, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import type { Training } from "../../_shared";
import type {
  TrainingFormProps,
  TrainingFormValues,
  TrainingPayload,
} from "./TrainingForm.types";

const INITIAL: TrainingFormValues = {
  course_or_training: "",
  institution: "",
  start_date: "",
  end_date: "",
  credential: "",
  notes: "",
};

function toInitial(record?: Partial<Training>): TrainingFormValues {
  if (!record) return INITIAL;
  return {
    course_or_training: record.course_or_training ?? "",
    institution: record.institution ?? "",
    start_date: record.start_date ? record.start_date.slice(0, 10) : "",
    end_date: record.end_date ? record.end_date.slice(0, 10) : "",
    credential: record.credential ?? "",
    notes: record.notes ?? "",
  };
}

/** `Nullable=No` optional text — unset is the empty string, so blank clears. */
const TEXT_KEYS: (keyof TrainingFormValues)[] = [
  "institution",
  "credential",
  "notes",
];

/** `Nullable=Yes` — cleared by sending `null`, never `""` (DRF's DateField rejects it). */
const NULLABLE_KEYS: (keyof TrainingFormValues)[] = ["start_date", "end_date"];

/**
 * Build the api payload — always send course_or_training. On create empty values are
 * dropped; on edit they are sent explicitly so a cleared field actually clears, rather
 * than the PATCH silently no-op'ing that key.
 */
function toPayload(
  values: TrainingFormValues,
  isEdit: boolean,
): TrainingPayload {
  const payload: Record<string, unknown> = {
    course_or_training: values.course_or_training,
  };
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
  return payload as TrainingPayload;
}

/**
 * Create/edit an applicant training/course record (§9). Admin-only nested resource;
 * a locked/archived parent is rejected server-side and surfaced by the shell.
 */
export function TrainingForm({
  initialValues,
  onSubmit,
  isLoading,
}: TrainingFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<TrainingFormValues>
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
  const { form } = useFormInstance<TrainingFormValues>();
  return (
    <>
      <TextInput
        label="Course / training"
        maxLength={255}
        disabled={isLoading}
        {...form.getInputProps("course_or_training")}
      />
      <TextInput
        label="Institution"
        maxLength={255}
        disabled={isLoading}
        {...form.getInputProps("institution")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Start date"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("start_date")}
        />
        <TextInput
          label="End date"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("end_date")}
        />
      </Group>
      <TextInput
        label="Credential"
        maxLength={150}
        disabled={isLoading}
        {...form.getInputProps("credential")}
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
      Save training
    </Button>
  );
}

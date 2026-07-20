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

import { COMPLETION_STATUS_LABELS, toOptions } from "../../_shared";
import type { Education } from "../../_shared";
import type {
  EducationFormProps,
  EducationFormValues,
  EducationPayload,
} from "./EducationForm.types";

const COMPLETION_STATUS_OPTIONS = toOptions(COMPLETION_STATUS_LABELS);

/**
 * No field on this resource is required (every row is `Req ✗`). The remaining `≤N chars`
 * caps are enforced with the input's `maxLength`; `registration_number` gets an explicit
 * rule instead, because a silently clipped identifier still looks like a valid one.
 */
const VALIDATION = z.object({
  registration_number: z
    .string()
    .max(100, "Registration number can be at most 100 characters"),
});

const INITIAL: EducationFormValues = {
  institution: "",
  degree: "",
  qualification: "",
  field_of_study: "",
  program: "",
  country: "",
  start_period: "",
  end_period: "",
  start_date: "",
  end_date: "",
  completion_status: "",
  gpa: "",
  grade: "",
  grading_system: "",
  registration_number: "",
  graduation_year: "",
  academic_year_start: "",
  academic_year_end: "",
  year_of_completion: "",
  completion_year_bs: "",
  completion_year_ad: "",
  study_duration: "",
  notes: "",
};

function toInitial(record?: Partial<Education>): EducationFormValues {
  if (!record) return INITIAL;
  return {
    institution: record.institution ?? "",
    degree: record.degree ?? "",
    qualification: record.qualification ?? "",
    field_of_study: record.field_of_study ?? "",
    program: record.program ?? "",
    country: record.country ?? "",
    start_period: record.start_period ?? "",
    end_period: record.end_period ?? "",
    start_date: record.start_date ? record.start_date.slice(0, 10) : "",
    end_date: record.end_date ? record.end_date.slice(0, 10) : "",
    completion_status: record.completion_status ?? "",
    gpa: record.gpa ?? "",
    grade: record.grade ?? "",
    grading_system: record.grading_system ?? "",
    registration_number: record.registration_number ?? "",
    graduation_year: record.graduation_year ?? "",
    academic_year_start: record.academic_year_start ?? "",
    academic_year_end: record.academic_year_end ?? "",
    year_of_completion: record.year_of_completion ?? "",
    completion_year_bs: record.completion_year_bs ?? "",
    completion_year_ad: record.completion_year_ad ?? "",
    study_duration: record.study_duration ?? "",
    notes: record.notes ?? "",
  };
}

/** `Nullable=No` optional text — unset is the empty string, so blank clears. */
const TEXT_KEYS: (keyof EducationFormValues)[] = [
  "institution",
  "degree",
  "qualification",
  "field_of_study",
  "program",
  "country",
  "start_period",
  "end_period",
  "gpa",
  "grade",
  "grading_system",
  "registration_number",
  "academic_year_start",
  "academic_year_end",
  "graduation_year",
  "year_of_completion",
  "completion_year_bs",
  "completion_year_ad",
  "study_duration",
  "notes",
];

/** `Nullable=Yes` — cleared by sending `null`. */
const NULLABLE_KEYS: (keyof EducationFormValues)[] = ["start_date", "end_date"];

/**
 * Build the api payload. On create empty values are dropped; on edit they are sent
 * explicitly so a cleared field actually clears, rather than the PATCH silently
 * no-op'ing that key. `completion_status` is an enum and is always dropped when
 * blank — DRF rejects `""` for a choice field with no blank option.
 */
function toPayload(
  values: EducationFormValues,
  isEdit: boolean,
): EducationPayload {
  const payload: Record<string, unknown> = {};
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
  if (values.completion_status)
    payload.completion_status = values.completion_status;
  return payload;
}

/**
 * Create/edit an applicant education record (§9). Admin-only nested resource; a
 * locked/archived parent is rejected server-side and surfaced by the shell.
 */
export function EducationForm({
  initialValues,
  onSubmit,
  isLoading,
}: EducationFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<EducationFormValues>
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
  const { form } = useFormInstance<EducationFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Institution"
          maxLength={255}
          disabled={isLoading}
          {...form.getInputProps("institution")}
        />
        <TextInput
          label="Degree"
          maxLength={150}
          disabled={isLoading}
          {...form.getInputProps("degree")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Qualification"
          maxLength={150}
          disabled={isLoading}
          {...form.getInputProps("qualification")}
        />
        <TextInput
          label="Field of study"
          maxLength={150}
          disabled={isLoading}
          {...form.getInputProps("field_of_study")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Program"
          maxLength={150}
          disabled={isLoading}
          {...form.getInputProps("program")}
        />
        <TextInput
          label="Country"
          maxLength={100}
          disabled={isLoading}
          {...form.getInputProps("country")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Start period"
          description="Free text, e.g. Spring 2021"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("start_period")}
        />
        <TextInput
          label="End period"
          description="Free text, e.g. Fall 2024"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("end_period")}
        />
      </Group>
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
        <Select
          label="Completion status"
          data={COMPLETION_STATUS_OPTIONS}
          clearable
          disabled={isLoading}
          {...form.getInputProps("completion_status")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="GPA"
          maxLength={20}
          disabled={isLoading}
          {...form.getInputProps("gpa")}
        />
        <TextInput
          label="Grade"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("grade")}
        />
        <TextInput
          label="Grading system"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("grading_system")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Registration number"
          disabled={isLoading}
          {...form.getInputProps("registration_number")}
        />
        <TextInput
          label="Study duration"
          description="e.g. 4 years"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("study_duration")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Academic year start"
          maxLength={20}
          disabled={isLoading}
          {...form.getInputProps("academic_year_start")}
        />
        <TextInput
          label="Academic year end"
          maxLength={20}
          disabled={isLoading}
          {...form.getInputProps("academic_year_end")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Graduation year"
          maxLength={20}
          disabled={isLoading}
          {...form.getInputProps("graduation_year")}
        />
        <TextInput
          label="Year of completion"
          maxLength={20}
          disabled={isLoading}
          {...form.getInputProps("year_of_completion")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Completion year (BS)"
          description="As written on the certificate, e.g. 2078"
          maxLength={20}
          disabled={isLoading}
          {...form.getInputProps("completion_year_bs")}
        />
        <TextInput
          label="Completion year (AD)"
          maxLength={20}
          disabled={isLoading}
          {...form.getInputProps("completion_year_ad")}
        />
      </Group>
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
      Save education
    </Button>
  );
}

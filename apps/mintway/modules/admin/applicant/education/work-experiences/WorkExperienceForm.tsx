"use client";

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

import type { WorkExperience } from "../../_shared";
import type {
  WorkExperienceFormProps,
  WorkExperienceFormValues,
  WorkExperiencePayload,
} from "./WorkExperienceForm.types";

const INITIAL: WorkExperienceFormValues = {
  company: "",
  role: "",
  country: "",
  start_period: "",
  end_period: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
};

function toInitial(record?: Partial<WorkExperience>): WorkExperienceFormValues {
  if (!record) return INITIAL;
  return {
    company: record.company ?? "",
    role: record.role ?? "",
    country: record.country ?? "",
    start_period: record.start_period ?? "",
    end_period: record.end_period ?? "",
    start_date: record.start_date ? record.start_date.slice(0, 10) : "",
    end_date: record.end_date ? record.end_date.slice(0, 10) : "",
    is_current: Boolean(record.is_current),
    description: record.description ?? "",
  };
}

/** `Nullable=No` optional text — unset is the empty string, so blank clears. */
const TEXT_KEYS: (keyof WorkExperienceFormValues)[] = [
  "company",
  "role",
  "country",
  "start_period",
  "end_period",
  "description",
];

/** `Nullable=Yes` — cleared by sending `null`. */
const NULLABLE_KEYS: (keyof WorkExperienceFormValues)[] = [
  "start_date",
  "end_date",
];

/**
 * Build the api payload. `is_current` is always sent (a boolean has no "unset").
 * On create empty values are dropped; on edit they are sent explicitly so a
 * cleared field actually clears rather than the PATCH no-op'ing that key.
 */
function toPayload(
  values: WorkExperienceFormValues,
  isEdit: boolean,
): WorkExperiencePayload {
  const payload: Record<string, unknown> = { is_current: values.is_current };
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
  return payload;
}

/**
 * Create/edit a work-experience record (§9). Admin-only nested resource; a
 * locked/archived parent is rejected server-side and surfaced by the shell.
 *
 * Both a free-text period and a real date are offered because the contract keeps
 * both: applicants often give "Summer 2022" rather than a date, and the period
 * fields let that be recorded without inventing a precision that wasn't given.
 */
export function WorkExperienceForm({
  initialValues,
  onSubmit,
  isLoading,
}: WorkExperienceFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<WorkExperienceFormValues>
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
  const { form } = useFormInstance<WorkExperienceFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Company"
          maxLength={255}
          disabled={isLoading}
          {...form.getInputProps("company")}
        />
        <TextInput
          label="Role"
          maxLength={150}
          disabled={isLoading}
          {...form.getInputProps("role")}
        />
      </Group>
      <TextInput
        label="Country"
        maxLength={100}
        disabled={isLoading}
        {...form.getInputProps("country")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Start period"
          description="Free text, e.g. Summer 2022"
          maxLength={50}
          disabled={isLoading}
          {...form.getInputProps("start_period")}
        />
        <TextInput
          label="End period"
          description="Leave blank if still there"
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
      </Group>
      <Checkbox
        label="Currently working here"
        disabled={isLoading}
        {...form.getInputProps("is_current", { type: "checkbox" })}
      />
      <Textarea
        label="Description"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("description")}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save work experience
    </Button>
  );
}

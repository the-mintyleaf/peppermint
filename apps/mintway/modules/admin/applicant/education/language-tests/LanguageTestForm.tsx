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

import { LANGUAGE_TEST_TYPE_LABELS, toOptions } from "../../_shared";
import type { LanguageTest } from "../../_shared";
import type {
  LanguageTestFormProps,
  LanguageTestFormValues,
  LanguageTestPayload,
} from "./LanguageTestForm.types";

const TEST_TYPE_OPTIONS = toOptions(LANGUAGE_TEST_TYPE_LABELS);

const INITIAL: LanguageTestFormValues = {
  test_type: "ielts",
  test_date: "",
  overall_score: "",
  listening_score: "",
  reading_score: "",
  writing_score: "",
  speaking_score: "",
  certificate_number: "",
  expiry_date: "",
  notes: "",
};

function toInitial(record?: Partial<LanguageTest>): LanguageTestFormValues {
  if (!record) return INITIAL;
  return {
    test_type: record.test_type ?? "ielts",
    test_date: record.test_date ? record.test_date.slice(0, 10) : "",
    overall_score: record.overall_score ?? "",
    listening_score: record.listening_score ?? "",
    reading_score: record.reading_score ?? "",
    writing_score: record.writing_score ?? "",
    speaking_score: record.speaking_score ?? "",
    certificate_number: record.certificate_number ?? "",
    expiry_date: record.expiry_date ? record.expiry_date.slice(0, 10) : "",
    notes: record.notes ?? "",
  };
}

/** `Nullable=Yes` in the contract — cleared by sending `null`, never `""`. */
const NULLABLE_KEYS: (keyof LanguageTestFormValues)[] = [
  "test_date",
  "overall_score",
  "listening_score",
  "reading_score",
  "writing_score",
  "speaking_score",
  "expiry_date",
];

/** `Nullable=No` optional text — unset is the empty string. */
const BLANKABLE_KEYS: (keyof LanguageTestFormValues)[] = [
  "certificate_number",
  "notes",
];

/**
 * Build the api payload — always send test_type. Scores are decimal STRINGS, never
 * Number()'d, and are range-validated server-side per test_type (IELTS 0–9, PTE 10–90,
 * TOEFL 0–120, Duolingo 10–160); an out-of-range value surfaces as a 400.
 *
 * Create and edit differ: on create an untouched field is simply omitted, but on edit
 * omitting it makes the PATCH a no-op for that key, so a user who blanks a field could
 * never clear it. On edit we therefore send the cleared value explicitly — `null` for
 * the nullable fields, `""` for the blank-able text ones.
 */
function toPayload(
  values: LanguageTestFormValues,
  isEdit: boolean,
): LanguageTestPayload {
  const payload: Record<string, unknown> = { test_type: values.test_type };
  for (const key of NULLABLE_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "") payload[key] = value;
    else if (isEdit) payload[key] = null;
  }
  for (const key of BLANKABLE_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  return payload as LanguageTestPayload;
}

/**
 * Create/edit an applicant language test (§9). Admin-only nested resource; a
 * locked/archived parent is rejected server-side and surfaced by the shell.
 */
export function LanguageTestForm({
  initialValues,
  onSubmit,
  isLoading,
}: LanguageTestFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<LanguageTestFormValues>
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
  const { form } = useFormInstance<LanguageTestFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <Select
          label="Test type"
          data={TEST_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("test_type")}
        />
        <TextInput
          label="Test date"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("test_date")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Overall"
          disabled={isLoading}
          {...form.getInputProps("overall_score")}
        />
        <TextInput
          label="Listening"
          disabled={isLoading}
          {...form.getInputProps("listening_score")}
        />
        <TextInput
          label="Reading"
          disabled={isLoading}
          {...form.getInputProps("reading_score")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Writing"
          disabled={isLoading}
          {...form.getInputProps("writing_score")}
        />
        <TextInput
          label="Speaking"
          disabled={isLoading}
          {...form.getInputProps("speaking_score")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Certificate number"
          disabled={isLoading}
          {...form.getInputProps("certificate_number")}
        />
        <TextInput
          label="Expiry date"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("expiry_date")}
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
      Save language test
    </Button>
  );
}

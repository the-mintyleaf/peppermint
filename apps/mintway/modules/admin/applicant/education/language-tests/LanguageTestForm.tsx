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

const TEXT_KEYS: (keyof LanguageTestFormValues)[] = [
  "overall_score",
  "listening_score",
  "reading_score",
  "writing_score",
  "speaking_score",
  "certificate_number",
  "notes",
];

/**
 * Build the api payload — always send test_type; drop empty scores/dates. Scores are
 * range-validated server-side per test_type (IELTS 0–9, PTE 10–90, TOEFL 0–120,
 * Duolingo 10–160); an out-of-range value surfaces as a 400 (not blocked here).
 */
function toPayload(values: LanguageTestFormValues): LanguageTestPayload {
  const payload: Record<string, unknown> = { test_type: values.test_type };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = value;
  }
  if (values.test_date) payload.test_date = values.test_date;
  if (values.expiry_date) payload.expiry_date = values.expiry_date;
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
  return (
    <FormWrapper<LanguageTestFormValues>
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

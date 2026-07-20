"use client";

import {
  Alert,
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

import { ELIGIBILITY_RESULT_LABELS, toOptions } from "../../_shared";
import type {
  AssessmentFormProps,
  AssessmentFormValues,
  AssessmentPayload,
} from "./AssessmentForm.types";

const ELIGIBILITY_OPTIONS = toOptions(ELIGIBILITY_RESULT_LABELS);

const INITIAL: AssessmentFormValues = {
  assessment_date: "",
  preferred_destination: "",
  preferred_program_or_field: "",
  education_summary: "",
  study_gap_summary: "",
  language_readiness: "",
  financial_readiness: "",
  funding_summary: "",
  visa_risk_summary: "",
  eligibility_result: "pending",
  conditions: "",
  recommendation: "",
  notes: "",
  valid_until: "",
};

const TEXT_KEYS: (keyof AssessmentFormValues)[] = [
  "preferred_destination",
  "preferred_program_or_field",
  "education_summary",
  "study_gap_summary",
  "language_readiness",
  "financial_readiness",
  "funding_summary",
  "visa_risk_summary",
  "conditions",
  "recommendation",
  "notes",
];
const DATE_KEYS: (keyof AssessmentFormValues)[] = [
  "assessment_date",
  "valid_until",
];

/** Assessments are append-only, so this is create-only: drop empties, keep the enum. */
function toPayload(values: AssessmentFormValues): AssessmentPayload {
  const payload: Record<string, unknown> = {
    eligibility_result: values.eligibility_result,
  };
  for (const key of [...TEXT_KEYS, ...DATE_KEYS]) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = value;
  }
  return payload;
}

/**
 * Record a qualification assessment (§9). Append-only — a new assessment supersedes the
 * prior current one; there is no edit or delete. The returned id backs a move to
 * Potential on the lifecycle transition.
 */
export function AssessmentForm({ onSubmit, isLoading }: AssessmentFormProps) {
  return (
    <FormWrapper<AssessmentFormValues>
      initial={INITIAL}
      finalSubmitFn={async (values) => {
        onSubmit(toPayload(values));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Alert color="blue" variant="light" py="xs">
          Assessments can&apos;t be edited or deleted. Recording a new one
          supersedes the current assessment.
        </Alert>
        <Fields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<AssessmentFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <Select
          label="Eligibility result"
          data={ELIGIBILITY_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("eligibility_result")}
        />
        <TextInput
          label="Assessment date"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("assessment_date")}
        />
        <TextInput
          label="Valid until"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("valid_until")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Preferred destination"
          disabled={isLoading}
          {...form.getInputProps("preferred_destination")}
        />
        <TextInput
          label="Preferred program / field"
          disabled={isLoading}
          {...form.getInputProps("preferred_program_or_field")}
        />
      </Group>
      <Textarea
        label="Education summary"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("education_summary")}
      />
      <Textarea
        label="Language readiness"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("language_readiness")}
      />
      <Textarea
        label="Study gap summary"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("study_gap_summary")}
      />
      <Textarea
        label="Financial readiness"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("financial_readiness")}
      />
      <Textarea
        label="Funding summary"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("funding_summary")}
      />
      <Textarea
        label="Visa risk summary"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("visa_risk_summary")}
      />
      <Textarea
        label="Recommendation"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("recommendation")}
      />
      <Textarea
        label="Conditions"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("conditions")}
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
      Record assessment
    </Button>
  );
}

"use client";

import { Button, Group, Stack, Textarea, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import type { ApplicationCase } from "../../_shared";

/**
 * Every field the contract marks writable on a case. `case_status` is deliberately
 * absent — it moves only through the transition endpoint and must never appear in a
 * PATCH body.
 */
interface CaseEditFormValues extends Record<string, unknown> {
  destination_country: string;
  institution: string;
  institution_campus: string;
  program: string;
  program_full_name: string;
  study_level: string;
  study_field: string;
  subject: string;
  intake: string;
  application_year: string;
  application_reference: string;
  qualification: string;
  qualification_year: string;
  grade: string;
  outcome: string;
  outcome_reason: string;
  notes: string;
}

const KEYS: (keyof CaseEditFormValues)[] = [
  "destination_country",
  "institution",
  "institution_campus",
  "program",
  "program_full_name",
  "study_level",
  "study_field",
  "subject",
  "intake",
  "application_year",
  "application_reference",
  "qualification",
  "qualification_year",
  "grade",
  "outcome",
  "outcome_reason",
  "notes",
];

function toInitial(record: ApplicationCase): CaseEditFormValues {
  return {
    destination_country: record.destination_country ?? "",
    institution: record.institution ?? "",
    institution_campus: record.institution_campus ?? "",
    program: record.program ?? "",
    program_full_name: record.program_full_name ?? "",
    study_level: record.study_level ?? "",
    study_field: record.study_field ?? "",
    subject: record.subject ?? "",
    intake: record.intake ?? "",
    application_year: record.application_year ?? "",
    application_reference: record.application_reference ?? "",
    qualification: record.qualification ?? "",
    qualification_year: record.qualification_year ?? "",
    grade: record.grade ?? "",
    outcome: record.outcome ?? "",
    outcome_reason: record.outcome_reason ?? "",
    notes: record.notes ?? "",
  };
}

/** Edit payload — all text, sent verbatim on edit so cleared fields clear. */
function toPayload(values: CaseEditFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const key of KEYS) payload[key] = values[key];
  return payload;
}

interface CaseEditFormProps {
  kase: ApplicationCase;
  onSubmit: (payload: Record<string, unknown>) => void;
  isLoading: boolean;
}

/** Edit a case's non-status fields (§10.2). Status changes go through the transition. */
export function CaseEditForm({ kase, onSubmit, isLoading }: CaseEditFormProps) {
  return (
    <FormWrapper<CaseEditFormValues>
      initial={toInitial(kase)}
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
  const { form } = useFormInstance<CaseEditFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Destination country"
          disabled={isLoading}
          {...form.getInputProps("destination_country")}
        />
        <TextInput
          label="Institution"
          disabled={isLoading}
          {...form.getInputProps("institution")}
        />
        <TextInput
          label="Campus"
          disabled={isLoading}
          {...form.getInputProps("institution_campus")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Program"
          disabled={isLoading}
          {...form.getInputProps("program")}
        />
        <TextInput
          label="Program full name"
          description="As it appears on the offer letter"
          disabled={isLoading}
          {...form.getInputProps("program_full_name")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Study level"
          disabled={isLoading}
          {...form.getInputProps("study_level")}
        />
        <TextInput
          label="Study field"
          disabled={isLoading}
          {...form.getInputProps("study_field")}
        />
        <TextInput
          label="Subject"
          disabled={isLoading}
          {...form.getInputProps("subject")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Intake"
          disabled={isLoading}
          {...form.getInputProps("intake")}
        />
        <TextInput
          label="Application year"
          disabled={isLoading}
          {...form.getInputProps("application_year")}
        />
        <TextInput
          label="Application reference"
          disabled={isLoading}
          {...form.getInputProps("application_reference")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Prior qualification"
          disabled={isLoading}
          {...form.getInputProps("qualification")}
        />
        <TextInput
          label="Qualification year"
          disabled={isLoading}
          {...form.getInputProps("qualification_year")}
        />
        <TextInput
          label="Grade"
          disabled={isLoading}
          {...form.getInputProps("grade")}
        />
      </Group>
      <TextInput
        label="Outcome"
        disabled={isLoading}
        {...form.getInputProps("outcome")}
      />
      <Textarea
        label="Outcome reason"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("outcome_reason")}
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
      Save changes
    </Button>
  );
}

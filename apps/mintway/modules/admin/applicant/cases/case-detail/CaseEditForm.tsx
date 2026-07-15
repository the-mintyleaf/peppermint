"use client";

import { Button, Group, Stack, Textarea, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import type { ApplicationCase } from "../../_shared";

interface CaseEditFormValues extends Record<string, unknown> {
  destination_country: string;
  institution: string;
  program: string;
  study_level: string;
  intake: string;
  application_reference: string;
  outcome: string;
  outcome_reason: string;
  notes: string;
}

const KEYS: (keyof CaseEditFormValues)[] = [
  "destination_country",
  "institution",
  "program",
  "study_level",
  "intake",
  "application_reference",
  "outcome",
  "outcome_reason",
  "notes",
];

function toInitial(record: ApplicationCase): CaseEditFormValues {
  return {
    destination_country: record.destination_country ?? "",
    institution: record.institution ?? "",
    program: record.program ?? "",
    study_level: record.study_level ?? "",
    intake: record.intake ?? "",
    application_reference: record.application_reference ?? "",
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
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Program"
          disabled={isLoading}
          {...form.getInputProps("program")}
        />
        <TextInput
          label="Study level"
          disabled={isLoading}
          {...form.getInputProps("study_level")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Intake"
          disabled={isLoading}
          {...form.getInputProps("intake")}
        />
        <TextInput
          label="Application reference"
          disabled={isLoading}
          {...form.getInputProps("application_reference")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Outcome"
          disabled={isLoading}
          {...form.getInputProps("outcome")}
        />
        <TextInput
          label="Outcome reason"
          disabled={isLoading}
          {...form.getInputProps("outcome_reason")}
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
      Save changes
    </Button>
  );
}

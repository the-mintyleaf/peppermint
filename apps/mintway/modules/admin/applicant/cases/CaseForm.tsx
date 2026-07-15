"use client";

import { Button, Group, Stack, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import type { ModalFormComponentProps } from "@peppermint/admin";

import type { ApplicationCase } from "../_shared";
import type { CaseCreatePayload } from "./cases.api";

interface CaseFormValues extends Record<string, unknown> {
  destination_country: string;
  institution: string;
  program: string;
  study_level: string;
  intake: string;
  application_reference: string;
}

const INITIAL: CaseFormValues = {
  destination_country: "",
  institution: "",
  program: "",
  study_level: "",
  intake: "",
  application_reference: "",
};

const KEYS: (keyof CaseFormValues)[] = [
  "destination_country",
  "institution",
  "program",
  "study_level",
  "intake",
  "application_reference",
];

function toPayload(values: CaseFormValues): CaseCreatePayload {
  const payload: Record<string, unknown> = {};
  for (const key of KEYS) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = value;
  }
  return payload as CaseCreatePayload;
}

/** Open a new application case (§10.1). Status starts at `planning`; it advances only
 *  through the case detail's transition action. */
export function CaseForm({
  onSubmit,
  isLoading,
}: ModalFormComponentProps<ApplicationCase, CaseCreatePayload>) {
  return (
    <FormWrapper<CaseFormValues>
      initial={INITIAL}
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
  const { form } = useFormInstance<CaseFormValues>();
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
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Open case
    </Button>
  );
}

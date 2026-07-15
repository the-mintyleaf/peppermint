"use client";

import {
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import { PROFICIENCY_LABELS, toOptions } from "../../_shared";
import type { LanguageEntry } from "../../_shared";
import type {
  LanguageFormProps,
  LanguageFormValues,
  LanguagePayload,
} from "./LanguageForm.types";

const PROFICIENCY_OPTIONS = toOptions(PROFICIENCY_LABELS);

const INITIAL: LanguageFormValues = {
  language: "",
  proficiency: "",
  is_native: false,
};

function toInitial(record?: Partial<LanguageEntry>): LanguageFormValues {
  if (!record) return INITIAL;
  return {
    language: record.language ?? "",
    proficiency: record.proficiency ?? "",
    is_native: Boolean(record.is_native),
  };
}

/** Build the api payload — always send language + is_native; drop empty proficiency. */
function toPayload(values: LanguageFormValues): LanguagePayload {
  const payload: Record<string, unknown> = {
    language: values.language,
    is_native: values.is_native,
  };
  if (values.proficiency) payload.proficiency = values.proficiency;
  return payload as LanguagePayload;
}

/**
 * Create/edit an applicant language (§9). Admin-only nested resource; a locked/archived
 * parent is rejected server-side and surfaced by the shell.
 */
export function LanguageForm({
  initialValues,
  onSubmit,
  isLoading,
}: LanguageFormProps) {
  return (
    <FormWrapper<LanguageFormValues>
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
  const { form } = useFormInstance<LanguageFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Language"
          disabled={isLoading}
          {...form.getInputProps("language")}
        />
        <Select
          label="Proficiency"
          data={PROFICIENCY_OPTIONS}
          clearable
          disabled={isLoading}
          {...form.getInputProps("proficiency")}
        />
      </Group>
      <Checkbox
        label="Native language"
        disabled={isLoading}
        {...form.getInputProps("is_native", { type: "checkbox" })}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save language
    </Button>
  );
}

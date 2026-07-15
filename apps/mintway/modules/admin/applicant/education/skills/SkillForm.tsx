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

import { PROFICIENCY_LABELS, toOptions } from "../../_shared";
import type { Skill } from "../../_shared";
import type {
  SkillFormProps,
  SkillFormValues,
  SkillPayload,
} from "./SkillForm.types";

const PROFICIENCY_OPTIONS = toOptions(PROFICIENCY_LABELS);

const INITIAL: SkillFormValues = {
  name: "",
  proficiency: "",
  notes: "",
  sort_order: "",
};

function toInitial(record?: Partial<Skill>): SkillFormValues {
  if (!record) return INITIAL;
  return {
    name: record.name ?? "",
    proficiency: record.proficiency ?? "",
    notes: record.notes ?? "",
    sort_order:
      record.sort_order === undefined || record.sort_order === null
        ? ""
        : String(record.sort_order),
  };
}

/** Build the api payload — always send name; drop empty proficiency/notes/sort_order. */
function toPayload(values: SkillFormValues): SkillPayload {
  const payload: Record<string, unknown> = { name: values.name };
  if (values.proficiency) payload.proficiency = values.proficiency;
  if (values.notes) payload.notes = values.notes;
  if (values.sort_order !== "") payload.sort_order = Number(values.sort_order);
  return payload as SkillPayload;
}

/**
 * Create/edit an applicant skill (§9). Admin-only nested resource; a locked/archived
 * parent is rejected server-side and surfaced by the shell.
 */
export function SkillForm({
  initialValues,
  onSubmit,
  isLoading,
}: SkillFormProps) {
  return (
    <FormWrapper<SkillFormValues>
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
  const { form } = useFormInstance<SkillFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Name"
          disabled={isLoading}
          {...form.getInputProps("name")}
        />
        <Select
          label="Proficiency"
          data={PROFICIENCY_OPTIONS}
          clearable
          disabled={isLoading}
          {...form.getInputProps("proficiency")}
        />
      </Group>
      <TextInput
        label="Sort order"
        type="number"
        disabled={isLoading}
        {...form.getInputProps("sort_order")}
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
      Save skill
    </Button>
  );
}

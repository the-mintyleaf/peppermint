"use client";

import {
  Button,
  Divider,
  Group,
  Stack,
  TagsInput,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import type { InterestProfile } from "../../_shared";
import type {
  InterestProfileFormProps,
  InterestProfileFormValues,
  InterestProfilePayload,
} from "./InterestProfileForm.types";

const INITIAL: InterestProfileFormValues = {
  preferred_countries: [],
  preferred_study_levels: [],
  preferred_fields: [],
  preferred_programs: [],
  preferred_cities: [],
  preferred_intake: "",
  preferred_year: "",
  estimated_budget: "",
  budget_currency: "",
  funding_method: "",
  study_gap_summary: "",
  travel_history_summary: "",
  visa_refusal_history_summary: "",
  interests: "",
  qualification_summary: "",
  target_program: "",
  notes: "",
};

const LIST_KEYS: (keyof InterestProfileFormValues)[] = [
  "preferred_countries",
  "preferred_study_levels",
  "preferred_fields",
  "preferred_programs",
  "preferred_cities",
];

const TEXT_KEYS: (keyof InterestProfileFormValues)[] = [
  "preferred_intake",
  "preferred_year",
  "estimated_budget",
  "budget_currency",
  "funding_method",
  "study_gap_summary",
  "travel_history_summary",
  "visa_refusal_history_summary",
  "interests",
  "qualification_summary",
  "target_program",
  "notes",
];

function toInitial(
  record?: Partial<InterestProfile>,
): InterestProfileFormValues {
  if (!record) return INITIAL;
  return {
    ...INITIAL,
    preferred_countries: record.preferred_countries ?? [],
    preferred_study_levels: record.preferred_study_levels ?? [],
    preferred_fields: record.preferred_fields ?? [],
    preferred_programs: record.preferred_programs ?? [],
    preferred_cities: record.preferred_cities ?? [],
    preferred_intake: record.preferred_intake ?? "",
    preferred_year: record.preferred_year ?? "",
    estimated_budget: record.estimated_budget ?? "",
    budget_currency: record.budget_currency ?? "",
    funding_method: record.funding_method ?? "",
    study_gap_summary: record.study_gap_summary ?? "",
    travel_history_summary: record.travel_history_summary ?? "",
    visa_refusal_history_summary: record.visa_refusal_history_summary ?? "",
    interests: record.interests ?? "",
    qualification_summary: record.qualification_summary ?? "",
    target_program: record.target_program ?? "",
    notes: record.notes ?? "",
  };
}

/** JSON-list fields always sent (empty array clears); text cleared on edit only. */
function toPayload(
  values: InterestProfileFormValues,
  isEdit: boolean,
): InterestProfilePayload {
  const payload: Record<string, unknown> = {};
  for (const key of LIST_KEYS) payload[key] = values[key];
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  return payload;
}

/** Create or edit the applicant's OneToOne interest profile (§6). */
export function InterestProfileForm({
  initialValues,
  onSubmit,
  isLoading,
}: InterestProfileFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<InterestProfileFormValues>
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
  const { form } = useFormInstance<InterestProfileFormValues>();
  return (
    <>
      <Divider label="Preferences" labelPosition="left" />
      <Group grow align="flex-start">
        <TagsInput
          label="Preferred countries"
          disabled={isLoading}
          {...form.getInputProps("preferred_countries")}
        />
        <TagsInput
          label="Preferred study levels"
          disabled={isLoading}
          {...form.getInputProps("preferred_study_levels")}
        />
      </Group>
      <Group grow align="flex-start">
        <TagsInput
          label="Preferred fields"
          disabled={isLoading}
          {...form.getInputProps("preferred_fields")}
        />
        <TagsInput
          label="Preferred programs"
          disabled={isLoading}
          {...form.getInputProps("preferred_programs")}
        />
      </Group>
      <TagsInput
        label="Preferred cities"
        disabled={isLoading}
        {...form.getInputProps("preferred_cities")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Preferred intake"
          disabled={isLoading}
          {...form.getInputProps("preferred_intake")}
        />
        <TextInput
          label="Preferred year"
          disabled={isLoading}
          {...form.getInputProps("preferred_year")}
        />
        <TextInput
          label="Target program"
          disabled={isLoading}
          {...form.getInputProps("target_program")}
        />
      </Group>

      <Divider label="Funding" labelPosition="left" />
      <Group grow align="flex-start">
        <TextInput
          label="Estimated budget"
          disabled={isLoading}
          {...form.getInputProps("estimated_budget")}
        />
        <TextInput
          label="Budget currency"
          disabled={isLoading}
          {...form.getInputProps("budget_currency")}
        />
        <TextInput
          label="Funding method"
          disabled={isLoading}
          {...form.getInputProps("funding_method")}
        />
      </Group>

      <Divider label="Summaries" labelPosition="left" />
      <Textarea
        label="Interests"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("interests")}
      />
      <Textarea
        label="Qualification summary"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("qualification_summary")}
      />
      <Textarea
        label="Study gap summary"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("study_gap_summary")}
      />
      <Textarea
        label="Travel history summary"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("travel_history_summary")}
      />
      <Textarea
        label="Visa refusal history summary"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("visa_refusal_history_summary")}
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
      Save interest profile
    </Button>
  );
}

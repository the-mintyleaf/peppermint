"use client";

import { useEffect, useState } from "react";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import type { ModalFormComponentProps } from "@peppermint/admin";
import {
  Button,
  Fieldset,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  useQuery,
} from "@peppermint/ui";
import { z } from "zod";
import api from "@/lib/api";
import type {
  ApplicantJourney,
  ApplicantJourneyDetail,
} from "../applicantJourneys.types";
import type { JourneyFormValues } from "./JourneyForm.types";

const STUDY_LEVEL_OPTIONS = [
  { value: "school", label: "School" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "postgraduate_diploma", label: "Postgraduate Diploma" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
  { value: "other", label: "Other" },
];

const INITIAL: JourneyFormValues = {
  applicant: "",
  target_country: "",
  target_institution_name: "",
  target_program_name: "",
  study_level: "",
  field_of_study: "",
  preferred_intake: "",
  budget_amount: null,
  budget_currency: "",
  scholarship_interest: false,
  notes: "",
};

function toFormValues(
  record?: Partial<ApplicantJourneyDetail>,
  presetApplicantId?: string,
): JourneyFormValues {
  if (!record) {
    return { ...INITIAL, applicant: presetApplicantId ?? "" };
  }
  return {
    applicant: record.applicant?.id ?? "",
    target_country: record.target_country ?? "",
    target_institution_name: record.target_institution_name ?? "",
    target_program_name: record.target_program_name ?? "",
    study_level: record.study_level ?? "",
    field_of_study: record.field_of_study ?? "",
    preferred_intake: record.preferred_intake ?? "",
    budget_amount:
      record.budget_amount != null ? Number(record.budget_amount) : null,
    budget_currency: record.budget_currency ?? "",
    scholarship_interest: record.scholarship_interest ?? false,
    notes: record.notes ?? "",
  };
}

/**
 * `applicant`/`target_country`/etc. map 1:1 onto the create/update request
 * body (INTEGRATION.md §7) — trimmed strings, uppercased currency code, same
 * convention `leadManagement`'s `LeadForm` uses. Exported so
 * `JourneyWorklist`'s `onCreateApi`/`onEditApi` can turn `JourneyFormValues`
 * into the two API payload shapes without duplicating this mapping.
 */
export function toJourneyPayload(values: JourneyFormValues) {
  return {
    applicant: values.applicant,
    target_country: values.target_country.trim(),
    target_institution_name: values.target_institution_name.trim(),
    target_program_name: values.target_program_name.trim(),
    study_level: values.study_level,
    field_of_study: values.field_of_study.trim(),
    preferred_intake: values.preferred_intake.trim(),
    // Decimal string, not a number — the backend's `budget_amount` is a
    // DecimalField and the read model already returns it as a string
    // (INTEGRATION.md §4); sending a JS number risks float precision loss.
    budget_amount:
      values.budget_amount != null ? String(values.budget_amount) : null,
    budget_currency: values.budget_currency.trim().toUpperCase(),
    scholarship_interest: values.scholarship_interest,
    notes: values.notes.trim(),
  };
}

const journeySchema = z.object({
  applicant: z.string().min(1, "Select an applicant"),
  target_country: z.string(),
  target_institution_name: z.string(),
  target_program_name: z.string(),
  study_level: z.string(),
  field_of_study: z.string(),
  preferred_intake: z.string(),
  budget_amount: z.number().min(0).nullable(),
  budget_currency: z.string().max(3, "3-letter code, e.g. USD"),
  scholarship_interest: z.boolean(),
  notes: z.string(),
});

export interface JourneyFormProps extends ModalFormComponentProps<
  ApplicantJourneyDetail,
  JourneyFormValues
> {
  /**
   * When provided, the applicant picker is hidden and the value is locked to
   * this id — for opening the form from a context that already knows the
   * applicant (e.g. Applicant Detail → Journeys panel "New journey"). That
   * panel doesn't exist yet; this prop is the hook for the orchestrator to
   * wire it in a later phase without touching this form's internals.
   */
  applicantId?: string;
}

/**
 * Shared create+edit form (`POST`/`PATCH /api/v1/journeys/`). "Nothing
 * required beyond the applicant" (`CONCEPT.md` "New Journey Form") — every
 * other field is optional, so only `applicant` carries a Zod message. No
 * `stage` field (never writable here — moves only through the dedicated
 * lifecycle actions).
 */
export function JourneyForm({
  onSubmit,
  isLoading,
  initialValues,
  applicantId,
}: JourneyFormProps) {
  const isEdit = Boolean(initialValues);
  const initial = toFormValues(initialValues, applicantId);

  return (
    <FormWrapper<JourneyFormValues>
      initial={initial}
      validation={[journeySchema]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Fields
          isLoading={isLoading}
          isEdit={isEdit}
          applicantId={applicantId}
          existingApplicant={initialValues?.applicant}
        />
        <SubmitButton isLoading={isLoading} isEdit={isEdit} />
      </Stack>
    </FormWrapper>
  );
}

interface FieldsProps {
  isLoading: boolean;
  isEdit: boolean;
  applicantId?: string;
  existingApplicant?: ApplicantJourney["applicant"];
}

function Fields({
  isLoading,
  isEdit,
  applicantId,
  existingApplicant,
}: FieldsProps) {
  return (
    <>
      <ApplicantField
        isLoading={isLoading}
        isEdit={isEdit}
        applicantId={applicantId}
        existingApplicant={existingApplicant}
      />

      <Fieldset legend="Destination & level">
        <Stack gap="md">
          <DestinationLevelFields isLoading={isLoading} />
        </Stack>
      </Fieldset>

      <Fieldset legend="Timing & budget">
        <Stack gap="md">
          <TimingBudgetFields isLoading={isLoading} />
        </Stack>
      </Fieldset>

      <Fieldset legend="Notes (optional)">
        <NotesField isLoading={isLoading} />
      </Fieldset>
    </>
  );
}

function NotesField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<JourneyFormValues>();
  return (
    <Textarea
      placeholder="Anything else worth recording about this objective"
      autosize
      minRows={2}
      disabled={isLoading}
      {...form.getInputProps("notes")}
    />
  );
}

function DestinationLevelFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<JourneyFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Target country"
          placeholder="Australia"
          disabled={isLoading}
          {...form.getInputProps("target_country")}
        />
        <Select
          label="Study level"
          placeholder="Not decided yet"
          data={STUDY_LEVEL_OPTIONS}
          clearable
          disabled={isLoading}
          {...form.getInputProps("study_level")}
          // Mantine's clearable Select emits `null`, but the field is a
          // plain `StudyLevel | ""` (`""` means unset) — normalize so a
          // cleared value round-trips instead of tripping `z.string()`.
          onChange={(value) => form.setFieldValue("study_level", value ?? "")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Target institution"
          placeholder="University of Melbourne"
          disabled={isLoading}
          {...form.getInputProps("target_institution_name")}
        />
        <TextInput
          label="Target program"
          placeholder="Master of Data Science"
          disabled={isLoading}
          {...form.getInputProps("target_program_name")}
        />
      </Group>
      <TextInput
        label="Field of study"
        placeholder="Computer Science"
        disabled={isLoading}
        {...form.getInputProps("field_of_study")}
      />
    </>
  );
}

function TimingBudgetFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<JourneyFormValues>();
  return (
    <>
      <TextInput
        label="Preferred intake"
        placeholder="Fall 2026"
        disabled={isLoading}
        {...form.getInputProps("preferred_intake")}
      />
      <Group grow align="flex-start">
        <NumberInput
          label="Approximate budget"
          placeholder="20000"
          min={0}
          disabled={isLoading}
          {...form.getInputProps("budget_amount")}
          // Mantine's NumberInput emits "" when cleared, but the field is
          // `number | null` — normalize so clearing a previously entered
          // budget round-trips instead of tripping `z.number()`.
          onChange={(value) =>
            form.setFieldValue(
              "budget_amount",
              value === "" ? null : Number(value),
            )
          }
        />
        <TextInput
          label="Currency"
          placeholder="USD"
          maxLength={3}
          w={120}
          disabled={isLoading}
          {...form.getInputProps("budget_currency")}
        />
      </Group>
      <Switch
        label="Interested in scholarships"
        disabled={isLoading}
        {...form.getInputProps("scholarship_interest", { type: "checkbox" })}
      />
    </>
  );
}

function SubmitButton({
  isLoading,
  isEdit,
}: {
  isLoading: boolean;
  isEdit: boolean;
}) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      {isEdit ? "Save changes" : "Add journey"}
    </Button>
  );
}

// ── Applicant field ──────────────────────────────────────────────────────────
//
// FLOWS.md "Work an objective forward": "The applicant cannot be changed here
// — no person picker on the edit form." So edit mode never shows a picker,
// only a locked, read-only field. Create mode shows either a locked field
// (when `applicantId` is preset by the caller) or a live search picker.

interface ApplicantOption {
  value: string;
  label: string;
}

// TODO(orchestrator): the `applicants` module doesn't yet export a stable,
// cleanly-importable search hook at the time this form was built — swap this
// inline debounced fetch for `useApplicantList`/`useApplicantDetail` from
// "@/modules/admin/applicants" once that module's barrel settles, keeping
// the same `ApplicantOption[]` shape this picker already renders.
async function searchApplicantsInline(
  search: string,
): Promise<ApplicantOption[]> {
  const { data } = await api.get<{
    data: Array<{ id: string; full_name_en: string; full_name_np: string }>;
  }>("/api/v1/applicants/", { params: { search, page_size: 20 } });
  return data.data.map((a) => ({
    value: a.id,
    label: a.full_name_en || a.full_name_np,
  }));
}

async function fetchApplicantLabelInline(
  id: string,
): Promise<ApplicantOption | null> {
  try {
    const { data } = await api.get<{
      id: string;
      full_name_en: string;
      full_name_np: string;
    }>(`/api/v1/applicants/${id}/`);
    return { value: data.id, label: data.full_name_en || data.full_name_np };
  } catch {
    return null;
  }
}

function useDebouncedText(value: string, delay = 300): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function ApplicantField({
  isLoading,
  isEdit,
  applicantId,
  existingApplicant,
}: FieldsProps) {
  const { form } = useFormInstance<JourneyFormValues>();

  if (isEdit) {
    const label =
      existingApplicant?.full_name_en ||
      existingApplicant?.full_name_np ||
      form.values.applicant;
    return (
      <TextInput
        label="Applicant"
        description="Not changeable after a journey is created"
        value={label}
        disabled
      />
    );
  }

  if (applicantId) {
    return <PresetApplicantField applicantId={applicantId} />;
  }

  return <ApplicantSearchField isLoading={isLoading} />;
}

function PresetApplicantField({ applicantId }: { applicantId: string }) {
  const { data } = useQuery({
    queryKey: ["applicant-journeys.applicant-label", applicantId],
    queryFn: () => fetchApplicantLabelInline(applicantId),
  });

  return (
    <TextInput
      label="Applicant"
      description="This journey is being added for this applicant"
      value={data?.label ?? applicantId}
      disabled
    />
  );
}

function ApplicantSearchField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<JourneyFormValues>();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedText(searchInput);
  const trimmed = debouncedSearch.trim();

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["applicant-journeys.applicant-search", trimmed],
    queryFn: () => searchApplicantsInline(trimmed),
    enabled: trimmed.length >= 2,
  });

  return (
    <Stack gap={4}>
      <Select
        label="Applicant"
        placeholder="Search by name"
        description="Who is pursuing this objective?"
        required
        searchable
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        data={options}
        nothingFoundMessage={
          trimmed.length < 2
            ? "Type at least 2 characters"
            : isFetching
              ? "Searching…"
              : "No matches"
        }
        disabled={isLoading}
        {...form.getInputProps("applicant")}
        onChange={(value) => {
          form.setFieldValue("applicant", value ?? "");
          const selected = options.find((o) => o.value === value);
          if (selected) setSearchInput(selected.label);
        }}
      />
      <Text size="xs" c="dimmed">
        Only the applicant is required — everything else can be filled in later.
      </Text>
    </Stack>
  );
}

"use client";

import { useState } from "react";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import type { ModalFormComponentProps } from "@peppermint/admin";
import {
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { z } from "zod";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useCreateLeadSource, useLeadSources } from "../leadManagement.hooks";
import type {
  ContactNumberInput,
  LeadBoardRow,
  LeadCreatePayload,
  LeadSource,
} from "../leadManagement.types";
import { ReferenceEntryForm } from "../reference-data/components/ReferenceEntryForm";
import { ContactNumbersField } from "./ContactNumbersField";
import { StudyInterestSection } from "./StudyInterestSection";
import type { LeadFormValues, StudyInterestFormValues } from "./LeadForm.types";

const CREATE_SOURCE_VALUE = "__create_new_source__";

const INITIAL_STUDY_INTEREST: StudyInterestFormValues = {
  interested_countries: [],
  study_level: "",
  field_of_study: "",
  preferred_intake: "",
  budget_amount: null,
  budget_currency: "",
  scholarship_interest: false,
  highest_qualification: "",
  language_test_status: "",
  interest_notes: "",
};

const INITIAL: LeadFormValues = {
  full_name: "",
  email: "",
  address: "",
  source: "",
  source_detail: "",
  contact_numbers: [],
  study_interest: INITIAL_STUDY_INTEREST,
};

/**
 * Guarantees exactly one `is_primary: true` by the time the form is
 * interactive — nothing in the backend contract enforces that invariant on
 * the data it returns, so a pre-existing record with zero or multiple
 * primaries must be normalized on load rather than silently resubmitted
 * as-is (or compounded further by `ContactNumbersField`'s add/remove logic,
 * which assumes a clean starting state).
 */
function normalizeContactNumbers(
  rows: ContactNumberInput[],
): ContactNumberInput[] {
  if (rows.length === 0) return rows;
  const primaryIndex = rows.findIndex((r) => r.is_primary);
  const targetIndex = primaryIndex >= 0 ? primaryIndex : 0;
  return rows.map((r, i) => ({ ...r, is_primary: i === targetIndex }));
}

function toFormValues(record?: Partial<LeadBoardRow>): LeadFormValues {
  if (!record) return INITIAL;
  const interest = record.study_interest;
  return {
    full_name: record.full_name ?? "",
    email: record.email ?? "",
    address: record.address ?? "",
    source: record.source?.id ?? "",
    source_detail: record.source_detail ?? "",
    contact_numbers: normalizeContactNumbers(record.contact_numbers ?? []),
    study_interest: interest
      ? {
          interested_countries: interest.interested_countries,
          study_level: interest.study_level,
          field_of_study: interest.field_of_study,
          preferred_intake: interest.preferred_intake,
          budget_amount:
            interest.budget_amount !== null
              ? Number(interest.budget_amount)
              : null,
          budget_currency: interest.budget_currency,
          scholarship_interest: interest.scholarship_interest,
          highest_qualification: interest.highest_qualification,
          language_test_status: interest.language_test_status,
          interest_notes: interest.interest_notes,
        }
      : INITIAL_STUDY_INTEREST,
  };
}

function isBlankStudyInterest(v: StudyInterestFormValues): boolean {
  return (
    v.interested_countries.length === 0 &&
    v.study_level === "" &&
    v.field_of_study.trim() === "" &&
    v.preferred_intake.trim() === "" &&
    v.budget_amount === null &&
    v.budget_currency.trim() === "" &&
    !v.scholarship_interest &&
    v.highest_qualification.trim() === "" &&
    v.language_test_status === "" &&
    v.interest_notes.trim() === ""
  );
}

/**
 * `study_interest` is omitted entirely (not sent as an all-blank object)
 * when the section is blank *and* the record never had one — the backend
 * distinguishes "no study interest on file" (`study_interest: null`) from
 * "an explicitly blank record," and creating the latter for every lead
 * nobody filled this section in for would be a real, if quiet, data-shape
 * drift. `hadExistingStudyInterest` is the escape hatch: if a record already
 * carried study interest and the user deliberately cleared every field, that
 * blank object must still be sent — omitting it would leave the old data
 * untouched server-side (PATCH semantics), silently ignoring the clear.
 * Contact numbers never carry an `id` — the write contract's shape is
 * `{number, label, is_primary}` only.
 */
function toLeadPayload(
  values: LeadFormValues,
  hadExistingStudyInterest: boolean,
): LeadCreatePayload {
  const payload: LeadCreatePayload = {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    source: values.source,
    source_detail: values.source_detail.trim(),
    contact_numbers: values.contact_numbers.map((c) => ({
      number: c.number.trim(),
      label: c.label,
      is_primary: c.is_primary,
    })),
  };
  if (
    hadExistingStudyInterest ||
    !isBlankStudyInterest(values.study_interest)
  ) {
    payload.study_interest = {
      interested_countries: values.study_interest.interested_countries,
      study_level: values.study_interest.study_level,
      field_of_study: values.study_interest.field_of_study.trim(),
      preferred_intake: values.study_interest.preferred_intake.trim(),
      budget_amount: values.study_interest.budget_amount,
      budget_currency: values.study_interest.budget_currency
        .trim()
        .toUpperCase(),
      scholarship_interest: values.study_interest.scholarship_interest,
      highest_qualification: values.study_interest.highest_qualification.trim(),
      language_test_status: values.study_interest.language_test_status,
      interest_notes: values.study_interest.interest_notes.trim(),
    };
  }
  return payload;
}

function buildSchema(sources: LeadSource[]) {
  return z
    .object({
      full_name: z.string().min(1, "Required").max(255),
      email: z
        .string()
        .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
      address: z.string(),
      source: z.string().min(1, "Select a lead source"),
      source_detail: z.string().max(255),
      contact_numbers: z
        .array(
          z.object({
            id: z.string().optional(),
            number: z
              .string()
              .min(1, "Required")
              .regex(
                /^\+?[0-9][0-9 ()\-]{4,31}$/,
                "Enter a valid phone number",
              ),
            label: z.enum([
              "mobile",
              "home",
              "work",
              "whatsapp",
              "viber",
              "other",
            ]),
            is_primary: z.boolean(),
          }),
        )
        .min(1, "Add at least one contact number"),
      study_interest: z.object({
        interested_countries: z.array(z.string()),
        study_level: z.string(),
        field_of_study: z.string(),
        preferred_intake: z.string(),
        budget_amount: z.number().min(0).nullable(),
        budget_currency: z.string().max(3),
        scholarship_interest: z.boolean(),
        highest_qualification: z.string(),
        language_test_status: z.string(),
        interest_notes: z.string(),
      }),
    })
    .superRefine((values, ctx) => {
      const selectedSource = sources.find((s) => s.id === values.source);
      if (selectedSource?.requires_detail && !values.source_detail.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["source_detail"],
          message: "This lead source requires a short description.",
        });
      }
    });
}

/**
 * Shared create+edit form (`POST`/`PATCH /api/v1/leads/`,
 * `docs/backend/lead-management/INTEGRATION.md` §7). No `stage` field —
 * never writable here; stage moves only through the dedicated lifecycle
 * actions built in a later phase. Same field set both times, so one
 * component serves both `createFormComponent` and `editFormComponent`.
 */
export function LeadForm({
  onSubmit,
  isLoading,
  initialValues,
}: ModalFormComponentProps<LeadBoardRow, LeadCreatePayload>) {
  const { data: sources = [] } = useLeadSources();
  const initial = toFormValues(initialValues);
  const schema = buildSchema(sources);
  const hadExistingStudyInterest = Boolean(initialValues?.study_interest);

  return (
    <FormWrapper<LeadFormValues>
      initial={initial}
      validation={[schema]}
      finalSubmitFn={async (values) => {
        // `FormWrapper` freezes its `validation` schemas at mount, so if
        // `sources` was still loading then, the zod-level requires_detail
        // check above can be stale — this re-checks against the *live*
        // `sources` closure (finalSubmitFn itself isn't frozen) as the
        // authoritative gate.
        const selectedSource = sources.find((s) => s.id === values.source);
        if (selectedSource?.requires_detail && !values.source_detail.trim()) {
          return {
            ok: false,
            message: "This lead source requires a short description.",
          };
        }
        onSubmit(toLeadPayload(values, hadExistingStudyInterest));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Fields sources={sources} isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} isEdit={Boolean(initialValues)} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({
  sources,
  isLoading,
}: {
  sources: LeadSource[];
  isLoading: boolean;
}) {
  const { form } = useFormInstance<LeadFormValues>();
  const { authorityType } = useCurrentUser();
  // Deliberately narrower than `useCurrentUser().isAdmin`, which also covers
  // `superadmin` — the backend rejects a source create from `superadmin` too
  // (`LEADS_ACTOR_FORBIDDEN`, INTEGRATION.md §6), so this option must stay
  // gated on the exact tier, not the broader flag.
  const isAdmin = authorityType === "admin";
  const selectedSource = sources.find((s) => s.id === form.values.source);
  const [sourceSearch, setSourceSearch] = useState("");
  const [creatingSource, setCreatingSource] = useState(false);
  const createSourceMutation = useCreateLeadSource();

  // `fetchLeadSources()` never sends `include_inactive=true` (retired
  // sources must stay hidden from every picker except the reference-data
  // admin screen), so `sources` never contains a retired entry to resolve a
  // label from. Editing a lead whose source has since been retired shows
  // this field blank — a known, accepted limitation shared with every other
  // reference-data picker in this app, not something to work around here.
  // `toUpdatePayload` (LeadManagementBoard.tsx) still omits `source` from
  // the PATCH when it's untouched, so leaving the field alone doesn't block
  // saving the rest of the edit.
  const sourceOptions = sources.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const trimmedSearch = sourceSearch.trim();
  const filteredSourceOptions = trimmedSearch
    ? sourceOptions.filter((o) =>
        o.label.toLowerCase().includes(trimmedSearch.toLowerCase()),
      )
    : sourceOptions;
  // Only Admins may create a source (`LEADS_ACTOR_FORBIDDEN` for anyone else
  // — `docs/backend/lead-management/INTEGRATION.md` §6), so this option only
  // ever appears for `authorityType === "admin"`.
  const showCreateSourceOption = isAdmin && filteredSourceOptions.length === 0;
  const selectData = showCreateSourceOption
    ? [
        {
          value: CREATE_SOURCE_VALUE,
          label: trimmedSearch
            ? `+ Add "${trimmedSearch}" as a new lead source`
            : "+ Add a new lead source",
        },
      ]
    : filteredSourceOptions;

  return (
    <>
      <TextInput
        label="Full name"
        placeholder="Ram Bahadur Shrestha"
        required
        disabled={isLoading}
        {...form.getInputProps("full_name")}
      />

      <Group grow align="flex-start">
        <TextInput
          label="Email"
          type="email"
          placeholder="ram@example.com"
          autoComplete="email"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
        <Select
          label="Lead source"
          placeholder={
            creatingSource
              ? "Creating a new source below…"
              : "How did they hear about us?"
          }
          data={selectData}
          filter={({ options }) => options}
          searchable
          searchValue={sourceSearch}
          onSearchChange={setSourceSearch}
          required
          disabled={isLoading || creatingSource}
          {...form.getInputProps("source")}
          onChange={(value) => {
            if (value === CREATE_SOURCE_VALUE) {
              setCreatingSource(true);
              return;
            }
            form.setFieldValue("source", value ?? "");
            // Always clear on any source change, not just when the new
            // source doesn't require one — an explanation written for the
            // old source is never valid for a different one, even when
            // both happen to require detail.
            form.setFieldValue("source_detail", "");
          }}
        />
      </Group>

      {selectedSource?.requires_detail ? (
        <TextInput
          label="Please specify"
          placeholder="e.g. friend's name, event name"
          required
          disabled={isLoading}
          {...form.getInputProps("source_detail")}
        />
      ) : null}

      {creatingSource ? (
        <Card withBorder padding="sm" radius="md">
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              New lead source
            </Text>
            <ReferenceEntryForm
              mode="create"
              prefillName={trimmedSearch || undefined}
              isSubmitting={createSourceMutation.isPending}
              onSubmit={async (values) => {
                try {
                  const created =
                    await createSourceMutation.mutateAsync(values);
                  form.setFieldValue("source", created.id);
                  form.setFieldValue("source_detail", "");
                  setCreatingSource(false);
                  setSourceSearch("");
                  return { ok: true };
                } catch (error) {
                  // `useCreateLeadSource`'s own toast already fired; passing
                  // the same resolved message here (rather than leaving it
                  // blank) keeps `FormWrapper`'s own notification from
                  // showing a second, vaguer "Something went wrong."
                  return { ok: false, message: getApiErrorMessage(error) };
                }
              }}
              onCancel={() => {
                setCreatingSource(false);
                setSourceSearch("");
              }}
            />
          </Stack>
        </Card>
      ) : null}

      <Textarea
        label="Address"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("address")}
      />

      <ContactNumbersField />

      <StudyInterestSection />
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
      {isEdit ? "Save changes" : "Add lead"}
    </Button>
  );
}

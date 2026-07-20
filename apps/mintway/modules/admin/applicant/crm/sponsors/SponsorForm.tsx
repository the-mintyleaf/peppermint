"use client";

import { z } from "zod";
import {
  Button,
  Checkbox,
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

import {
  SPONSOR_TYPE_LABELS,
  VERIFICATION_STATUS_LABELS,
  toOptions,
} from "../../_shared";
import type { Sponsor } from "../../_shared";
import type {
  SponsorFormProps,
  SponsorFormValues,
  SponsorPayload,
} from "./SponsorForm.types";

const SPONSOR_TYPE_OPTIONS = toOptions(SPONSOR_TYPE_LABELS);
const VERIFICATION_STATUS_OPTIONS = toOptions(VERIFICATION_STATUS_LABELS);

/**
 * `sponsor_type` is the only `Req ✓` field. `phone` carries its `≤32 chars` cap as a rule
 * rather than a `maxLength` — a silently clipped number still looks like a real one.
 * `email` is `Req ✗`, so an empty string stays valid and still clears on edit.
 */
const VALIDATION = z.object({
  sponsor_type: z.string().min(1, "Sponsor type is required"),
  phone: z.string().max(32, "Phone can be at most 32 characters"),
  email: z
    .string()
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "Enter a valid email address",
    }),
});

const INITIAL: SponsorFormValues = {
  sponsor_type: "self",
  name: "",
  relationship_to_applicant: "",
  occupation_or_business: "",
  organization_name: "",
  address: "",
  country: "",
  phone: "",
  email: "",
  annual_income: "",
  income_currency: "",
  funding_amount: "",
  funding_currency: "",
  funding_source: "",
  is_primary: false,
  verification_status: "",
  verification_notes: "",
};

function toInitial(record?: Partial<Sponsor>): SponsorFormValues {
  if (!record) return INITIAL;
  return {
    sponsor_type: record.sponsor_type ?? "self",
    name: record.name ?? "",
    relationship_to_applicant: record.relationship_to_applicant ?? "",
    occupation_or_business: record.occupation_or_business ?? "",
    organization_name: record.organization_name ?? "",
    address: record.address ?? "",
    country: record.country ?? "",
    phone: record.phone ?? "",
    email: record.email ?? "",
    annual_income: record.annual_income ?? "",
    income_currency: record.income_currency ?? "",
    funding_amount: record.funding_amount ?? "",
    funding_currency: record.funding_currency ?? "",
    funding_source: record.funding_source ?? "",
    is_primary: Boolean(record.is_primary),
    verification_status: record.verification_status ?? "",
    verification_notes: record.verification_notes ?? "",
  };
}

// Money fields are decimal STRINGS — sent as-is, never Number()'d, to preserve
// precision. They are also the only `Nullable=Yes` fields here, so they clear with
// `null`; DRF's DecimalField has no allow_blank and rejects `""` with a 400.
const MONEY_KEYS: (keyof SponsorFormValues)[] = [
  "annual_income",
  "funding_amount",
];

/** `Nullable=No` optional text — unset is the empty string. */
const TEXT_KEYS: (keyof SponsorFormValues)[] = [
  "name",
  "relationship_to_applicant",
  "occupation_or_business",
  "organization_name",
  "address",
  "country",
  "phone",
  "email",
  "income_currency",
  "funding_currency",
  "funding_source",
  "verification_notes",
];

/**
 * Build the api payload. Always send sponsor_type + is_primary. On create, empty values
 * are dropped; on edit they are sent explicitly so a cleared field actually clears —
 * `""` for the nullable=No text fields, `null` for the two decimals (DRF's DecimalField
 * rejects `""`). The optional enum (verification_status) is always dropped when empty.
 */
function toPayload(values: SponsorFormValues, isEdit: boolean): SponsorPayload {
  const payload: Record<string, unknown> = {
    sponsor_type: values.sponsor_type,
    is_primary: values.is_primary,
  };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  for (const key of MONEY_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "") payload[key] = value;
    else if (isEdit) payload[key] = null;
  }
  if (values.verification_status)
    payload.verification_status = values.verification_status;
  return payload as SponsorPayload;
}

/**
 * Create/edit an applicant sponsor (§8). Admin-only nested resource; a locked/archived
 * parent is rejected server-side and surfaced by the shell.
 */
export function SponsorForm({
  initialValues,
  onSubmit,
  isLoading,
}: SponsorFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<SponsorFormValues>
      initial={toInitial(initialValues)}
      validation={[VALIDATION]}
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
  const { form } = useFormInstance<SponsorFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <Select
          label="Sponsor type"
          withAsterisk
          data={SPONSOR_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("sponsor_type")}
        />
        <TextInput
          label="Name"
          maxLength={200}
          disabled={isLoading}
          {...form.getInputProps("name")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Relationship"
          maxLength={100}
          disabled={isLoading}
          {...form.getInputProps("relationship_to_applicant")}
        />
        <TextInput
          label="Occupation"
          maxLength={200}
          disabled={isLoading}
          {...form.getInputProps("occupation_or_business")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Organization"
          maxLength={255}
          disabled={isLoading}
          {...form.getInputProps("organization_name")}
        />
        <TextInput
          label="Country"
          maxLength={100}
          disabled={isLoading}
          {...form.getInputProps("country")}
        />
      </Group>
      <Textarea
        label="Address"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("address")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Phone"
          disabled={isLoading}
          {...form.getInputProps("phone")}
        />
        <TextInput
          label="Email"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Annual income"
          description="Decimal amount, e.g. 1200000.00"
          disabled={isLoading}
          {...form.getInputProps("annual_income")}
        />
        <TextInput
          label="Income currency"
          maxLength={8}
          disabled={isLoading}
          {...form.getInputProps("income_currency")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Funding amount"
          description="Decimal amount, e.g. 500000.00"
          disabled={isLoading}
          {...form.getInputProps("funding_amount")}
        />
        <TextInput
          label="Funding currency"
          maxLength={8}
          disabled={isLoading}
          {...form.getInputProps("funding_currency")}
        />
      </Group>
      <TextInput
        label="Funding source"
        maxLength={150}
        disabled={isLoading}
        {...form.getInputProps("funding_source")}
      />
      <Group grow align="flex-start">
        <Select
          label="Verification status"
          data={VERIFICATION_STATUS_OPTIONS}
          clearable
          disabled={isLoading}
          {...form.getInputProps("verification_status")}
        />
      </Group>
      <Textarea
        label="Verification notes"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("verification_notes")}
      />
      <Checkbox
        label="Primary sponsor"
        disabled={isLoading}
        {...form.getInputProps("is_primary", { type: "checkbox" })}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save sponsor
    </Button>
  );
}

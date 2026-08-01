"use client";

import {
  FormShell,
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { DateInput, Group, Select, Stack, TextInput } from "@peppermint/ui";
import { z } from "zod";
import type { ZodTypeAny } from "zod";
import type {
  AddressInput,
  AddressType,
  ApplicantAddress,
  ApplicantCreatePayload,
  ApplicantDetail,
  FamilyRelationship,
} from "../applicants.types";
import { ApplicantPhotoField } from "../photograph";
import { AddressesSection } from "./components/AddressesSection";
import { ContactNumbersField } from "./components/ContactNumbersField";
import { EmergencyContactsField } from "./components/EmergencyContactsField";
import { FamilyMembersField } from "./components/FamilyMembersField";
import { PassportSection } from "./components/PassportSection";
import type {
  AddressSectionValues,
  ApplicantFormValues,
} from "./ApplicantForm.types";

const PHONE_REGEX = /^\+?[0-9][0-9 ()\-]{4,31}$/;

const EMPTY_ADDRESS: AddressSectionValues = {
  country: "",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  street_address: "",
  postal_code: "",
};

const INITIAL: ApplicantFormValues = {
  photograph: null,
  full_name: "",
  date_of_birth: null,
  gender: "",
  nationality: "",
  email: "",
  contact_numbers: [],
  permanent_address: { ...EMPTY_ADDRESS },
  current_address: { ...EMPTY_ADDRESS },
  passport_number: "",
  issuing_country: "",
  place_of_issue: "",
  issued_date: null,
  expiry_date: null,
  family_members: [],
  emergency_contacts: [],
};

/** Only step 1 has a required-field schema — steps 2–4 stay fully optional
 * (`docs/backend/applicants/CONCEPT.md`: "Only name is required"). */
const identitySchema = z.object({
  // Shape only — the picker itself rejects an oversized/wrong-typed file before
  // it ever reaches form state, so this is the backstop, not the message the
  // user normally sees. Always optional: a photograph is never required to save
  // a record, and on create it can't be attached at all (no id to own it yet).
  photograph: z.instanceof(File).nullable(),
  full_name: z.string().min(1, "Required").max(255),
  date_of_birth: z.string().nullable(),
  gender: z.enum(["male", "female", "other", "undisclosed", ""]),
  nationality: z.string().max(255),
  email: z
    .string()
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
  contact_numbers: z
    .array(
      z.object({
        id: z.string().optional(),
        number: z
          .string()
          .min(1, "Required")
          .regex(PHONE_REGEX, "Enter a valid phone number"),
        label: z.enum(["mobile", "home", "work", "whatsapp", "viber", "other"]),
        is_primary: z.boolean(),
      }),
    )
    .min(1, "Add at least one contact number"),
});

/** Fully optional, but expiry must follow issue when both are present (INTEGRATION.md §4). */
const passportSchema = z
  .object({
    passport_number: z.string(),
    issuing_country: z.string(),
    place_of_issue: z.string(),
    issued_date: z.string().nullable(),
    expiry_date: z.string().nullable(),
  })
  .superRefine((values, ctx) => {
    const anyFilled =
      values.passport_number.trim() ||
      values.issuing_country.trim() ||
      values.place_of_issue.trim() ||
      values.issued_date ||
      values.expiry_date;
    if (anyFilled && !values.passport_number.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passport_number"],
        message:
          "Passport number is required when any passport detail is entered.",
      });
    }
    if (
      values.issued_date &&
      values.expiry_date &&
      values.expiry_date <= values.issued_date
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiry_date"],
        message: "Expiry date must be after the issue date",
      });
    }
  });

/**
 * A row, once added, requires the backend's non-optional fields for that
 * collection — plus `full_name`, which the backend allows blank but which the
 * form insists on: a nameless person is not a record anyone can act on.
 */
const familyEmergencySchema = z.object({
  family_members: z.array(
    z.object({
      relationship: z.string().min(1, "Select a relationship"),
      full_name: z.string().min(1, "Required"),
      occupation: z.string(),
      contact_number: z.string(),
    }),
  ),
  emergency_contacts: z.array(
    z.object({
      full_name: z.string().min(1, "Required"),
      relationship: z.string().min(1, "Required"),
      contact_number: z
        .string()
        .min(1, "Required")
        .regex(PHONE_REGEX, "Enter a valid phone number"),
      email: z
        .string()
        .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
      address: z.string(),
    }),
  ),
});

/**
 * `FormWrapper`'s `validation` prop is declared `ZodTypeAny[]` (not
 * `(ZodTypeAny | undefined)[]`), so a step with no schema (addresses, step
 * index 1) can't be written as an array-literal hole — it has to be a real
 * sparse-array hole via index assignment instead. `Array.prototype.filter`
 * (used internally to compose the full-form validator) skips holes exactly
 * like it would skip an explicit `undefined`, so this is behaviorally
 * identical to `[identitySchema, undefined, passportSchema,
 * familyEmergencySchema]` without the type error.
 */
const STEP_VALIDATION: ZodTypeAny[] = [identitySchema];
STEP_VALIDATION[2] = passportSchema;
STEP_VALIDATION[3] = familyEmergencySchema;

const STEP_FIELDS: string[][] = [
  [
    "photograph",
    "full_name",
    "date_of_birth",
    "gender",
    "nationality",
    "email",
    "contact_numbers",
  ],
  [], // addresses — fully optional, no gate on Next
  [
    "passport_number",
    "issuing_country",
    "place_of_issue",
    "issued_date",
    "expiry_date",
  ],
  ["family_members", "emergency_contacts"],
];

const STEPS = [
  {
    label: "Identity & Contact",
    description: "Name, DOB, and how to reach them",
  },
  { label: "Addresses", description: "Permanent and current address" },
  { label: "Passport", description: "Travel document details" },
  {
    label: "Family & Emergency Contacts",
    description: "Next of kin and who to call",
  },
];

/**
 * Guarantees exactly one `is_primary: true` once the list is non-empty — a
 * pre-existing record with zero or multiple primaries must be normalized on
 * load rather than resubmitted as-is (same rationale as `lead-management`'s
 * `LeadForm.tsx`).
 */
function normalizeContactNumbers(
  rows: ApplicantFormValues["contact_numbers"],
): ApplicantFormValues["contact_numbers"] {
  if (rows.length === 0) return rows;
  const primaryIndex = rows.findIndex((r) => r.is_primary);
  const targetIndex = primaryIndex >= 0 ? primaryIndex : 0;
  return rows.map((r, i) => ({ ...r, is_primary: i === targetIndex }));
}

function findAddress(
  addresses: ApplicantAddress[] | undefined,
  type: AddressType,
): AddressSectionValues {
  const match = addresses?.find((a) => a.address_type === type);
  if (!match) return { ...EMPTY_ADDRESS };
  return {
    country: match.country ?? "",
    province: match.province ?? "",
    district: match.district ?? "",
    municipality: match.municipality ?? "",
    ward: match.ward ?? "",
    street_address: match.street_address ?? "",
    postal_code: match.postal_code ?? "",
  };
}

/** Prefill for edit; `INITIAL` for create. */
function toFormValues(record?: ApplicantDetail): ApplicantFormValues {
  if (!record) return INITIAL;
  return {
    // Always `null`, never the existing photograph: this field stages a *new*
    // upload, and the record's current photo is read live by the field itself.
    // Seeding it would make an untouched form dirty and re-upload the same
    // bytes on every save.
    photograph: null,
    full_name: record.full_name ?? "",
    date_of_birth: record.date_of_birth,
    gender: record.gender ?? "",
    nationality: record.nationality ?? "",
    email: record.email ?? "",
    contact_numbers: normalizeContactNumbers(
      (record.contact_numbers ?? []).map((c) => ({
        id: c.id,
        number: c.number,
        label: c.label,
        is_primary: c.is_primary,
      })),
    ),
    permanent_address: findAddress(record.addresses, "permanent"),
    current_address: findAddress(record.addresses, "current"),
    passport_number: record.passport?.passport_number ?? "",
    issuing_country: record.passport?.issuing_country ?? "",
    place_of_issue: record.passport?.place_of_issue ?? "",
    issued_date: record.passport?.issued_date ?? null,
    expiry_date: record.passport?.expiry_date ?? null,
    family_members: (record.family_members ?? []).map((m) => ({
      relationship: m.relationship,
      full_name: m.full_name ?? "",
      occupation: m.occupation ?? "",
      contact_number: m.contact_number ?? "",
    })),
    emergency_contacts: (record.emergency_contacts ?? []).map((e) => ({
      full_name: e.full_name ?? "",
      relationship: e.relationship,
      contact_number: e.contact_number,
      email: e.email ?? "",
      address: e.address ?? "",
    })),
  };
}

function isBlankAddress(values: AddressSectionValues): boolean {
  return Object.values(values).every((v) => v.trim() === "");
}

function addressToInput(
  type: AddressType,
  values: AddressSectionValues,
): AddressInput | null {
  if (isBlankAddress(values)) return null;
  return {
    address_type: type,
    country: values.country.trim(),
    province: values.province.trim(),
    district: values.district.trim(),
    municipality: values.municipality.trim(),
    ward: values.ward.trim(),
    street_address: values.street_address.trim(),
    postal_code: values.postal_code.trim(),
  };
}

function isBlankPassport(values: ApplicantFormValues): boolean {
  return (
    !values.passport_number.trim() &&
    !values.issuing_country.trim() &&
    !values.place_of_issue.trim() &&
    !values.issued_date &&
    !values.expiry_date
  );
}

/**
 * `hadExistingPassport` is the same escape hatch as `LeadForm.tsx`'s
 * `hadExistingStudyInterest`: a record that already carried a passport, then
 * had every field deliberately cleared, must still send the (now-blank)
 * `passport` key — omitting it would leave the old data untouched
 * server-side (PATCH semantics), silently ignoring the clear. A record that
 * never had one and stays blank omits the key entirely, matching "no
 * passport on file" rather than fabricating an all-blank record.
 */
export function toApplicantPayload(
  values: ApplicantFormValues,
  hadExistingPassport: boolean,
): ApplicantCreatePayload {
  const addresses = [
    addressToInput("permanent", values.permanent_address),
    addressToInput("current", values.current_address),
  ].filter((a): a is AddressInput => a !== null);

  const payload: ApplicantCreatePayload = {
    full_name: values.full_name.trim(),
    nationality: values.nationality.trim(),
    email: values.email.trim(),
    contact_numbers: values.contact_numbers.map((c) => ({
      number: c.number.trim(),
      label: c.label,
      is_primary: c.is_primary,
    })),
    addresses,
    family_members: values.family_members.map((m) => ({
      relationship: m.relationship as FamilyRelationship,
      full_name: m.full_name.trim(),
      occupation: m.occupation.trim(),
      contact_number: m.contact_number.trim(),
    })),
    emergency_contacts: values.emergency_contacts.map((e) => ({
      full_name: e.full_name.trim(),
      relationship: e.relationship.trim(),
      contact_number: e.contact_number.trim(),
      email: e.email.trim(),
      address: e.address.trim(),
    })),
  };

  // Always sent (as explicit `null`/`""` when cleared) — `undefined`/omitted
  // would be dropped from the JSON body entirely, which PATCH reads as
  // "untouched," silently reverting a clear.
  payload.date_of_birth = values.date_of_birth || null;
  payload.gender = values.gender;

  // A record that already has a passport can't have it removed via this API
  // (upsert-only, no delete) — sending an empty `passport_number` would just
  // 400. Blanking every field back to nothing is therefore not submitted as a
  // "clear," it's simply not sent (PassportSection surfaces this to the user
  // instead of silently no-op'ing or erroring).
  if (!hadExistingPassport && isBlankPassport(values)) {
    // omit `passport` entirely — no passport on file, nothing to send
  } else if (hadExistingPassport && isBlankPassport(values)) {
    // omit — see comment above; PassportSection blocks this state at the UI level
  } else {
    payload.passport = {
      passport_number: values.passport_number.trim(),
      issuing_country: values.issuing_country.trim(),
      place_of_issue: values.place_of_issue.trim(),
      // Explicit `null` (not `undefined`) so a cleared date actually clears
      // server-side — `undefined` is dropped from the JSON body entirely,
      // which PATCH reads as "untouched," silently reverting the clear.
      issued_date: values.issued_date || null,
      expiry_date: values.expiry_date || null,
    };
  }

  return payload;
}

/**
 * `applicantId` is `null` on create, and the photo control is hidden entirely
 * there rather than shown-and-disabled: a file's owner must exist before
 * `POST /files/` accepts it, so on create there is nothing to attach to and a
 * disabled control would only advertise a step the user can't take. The photo
 * is added from the edit form once the record exists.
 */
function StepIdentity({ applicantId }: { applicantId: string | null }) {
  const { form } = useFormInstance<ApplicantFormValues>();
  return (
    <Stack gap="md">
      {applicantId ? (
        <ApplicantPhotoField
          applicantId={applicantId}
          name={form.values.full_name || "this applicant"}
          mode="deferred"
          value={form.values.photograph}
          onChange={(file) => form.setFieldValue("photograph", file)}
          error={form.errors.photograph as string | undefined}
        />
      ) : null}

      <TextInput
        label="Full name"
        placeholder="Ram Bahadur Shrestha"
        required
        {...form.getInputProps("full_name")}
      />

      <Group grow align="flex-start">
        <DateInput
          label="Date of birth"
          valueFormat="YYYY-MM-DD"
          clearable
          {...form.getInputProps("date_of_birth")}
        />
        <Select
          label="Gender"
          data={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
            { value: "undisclosed", label: "Undisclosed" },
          ]}
          clearable
          {...form.getInputProps("gender")}
          onChange={(value) => form.setFieldValue("gender", value ?? "")}
        />
      </Group>

      <Group grow align="flex-start">
        <TextInput
          label="Nationality"
          placeholder="Nepali"
          {...form.getInputProps("nationality")}
        />
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="ram@example.com"
          {...form.getInputProps("email")}
        />
      </Group>

      <ContactNumbersField />
    </Stack>
  );
}

function StepAddresses() {
  return <AddressesSection />;
}

function StepPassport({
  hadExistingPassport,
}: {
  hadExistingPassport: boolean;
}) {
  return <PassportSection hadExistingPassport={hadExistingPassport} />;
}

function StepFamilyEmergency() {
  return (
    <Stack gap="md">
      <FamilyMembersField />
      <EmergencyContactsField />
    </Stack>
  );
}

function ApplicantFormBody({
  title,
  description,
  onBack,
  hadExistingPassport,
  applicantId,
}: {
  title: string;
  description: string;
  onBack: () => void;
  hadExistingPassport: boolean;
  applicantId: string | null;
}) {
  const { current, handleStepNext, handleStepBack } = useFormControls();
  const stepComponents = [
    <StepIdentity key="identity" applicantId={applicantId} />,
    <StepAddresses key="addresses" />,
    <StepPassport key="passport" hadExistingPassport={hadExistingPassport} />,
    <StepFamilyEmergency key="family-emergency" />,
  ];
  return (
    <FormShell
      title={title}
      description={description}
      onBack={onBack}
      steps={STEPS}
      showStepper
      showDirtyBanner
      allowStepJump="completed-only"
      onStepNext={handleStepNext}
      onStepBack={handleStepBack}
    >
      {stepComponents[current]}
    </FormShell>
  );
}

export interface ApplicantFormProps {
  mode: "create" | "edit";
  /** Full detail to prefill from — required for `mode: "edit"`. */
  initialValues?: ApplicantDetail;
  onBack: () => void;
  /**
   * Receives the trimmed create/update payload; the page owns the mutation
   * (a `useAppMutation`-backed hook, which already shows its own
   * success/error notifications) and is expected to swallow a rejection
   * rather than let it propagate — `finalSubmitFn` below always resolves
   * `{ ok: true }` so `FormWrapper` never raises a second, duplicate error
   * notification of its own. Awaited so the Submit button's loading state
   * spans the whole request, not just this function call.
   */
  onSubmit: (
    payload: ApplicantCreatePayload,
    /**
     * A newly-picked photograph, or `null` when the photo was left alone.
     * Handed over separately from `payload` because it is not part of the
     * applicant resource at all — the page uploads it against the saved
     * record's id after the write lands (edit only; always `null` on create).
     */
    photograph: File | null,
  ) => Promise<void>;
}

/**
 * Shared create+edit form (`POST`/`PATCH /api/v1/applicants/`,
 * `docs/backend/applicants/INTEGRATION.md` §7). Same field set both times —
 * one component serves both routes. The page (`pages/new`, `pages/edit`)
 * owns the actual mutation and navigation; this component only assembles
 * and hands off the payload via `onSubmit`.
 */
export function ApplicantForm({
  mode,
  initialValues,
  onBack,
  onSubmit,
}: ApplicantFormProps) {
  const hadExistingPassport = Boolean(initialValues?.passport);

  return (
    <FormWrapper<ApplicantFormValues>
      initial={toFormValues(initialValues)}
      validation={STEP_VALIDATION}
      stepFields={STEP_FIELDS}
      finalSubmitFn={async (values) => {
        await onSubmit(
          toApplicantPayload(values, hadExistingPassport),
          values.photograph,
        );
        return { ok: true };
      }}
      hasDirtCheck
    >
      <ApplicantFormBody
        hadExistingPassport={hadExistingPassport}
        applicantId={initialValues?.id ?? null}
        title={mode === "create" ? "New applicant" : "Edit applicant"}
        description={
          mode === "create"
            ? "Only the name is required — the rest can be completed later."
            : "Nested collections (contact numbers, addresses, family, emergency contacts) are replaced as a complete set."
        }
        onBack={onBack}
      />
    </FormWrapper>
  );
}

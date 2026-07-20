"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Accordion,
  Box,
  Button,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { NotepadIcon } from "@phosphor-icons/react/dist/csr/Notepad";

import { NameFieldGroup } from "@/components/NameFieldGroup";
import {
  EDUCATION_LEVEL_LABELS,
  LEAD_SOURCE_LABELS,
  PAYMENT_STATUS_LABELS,
  toOptions,
} from "../_shared";
import type { Lead } from "./leads.types";
import type {
  LeadFormPayload,
  LeadFormProps,
  LeadFormValues,
} from "./LeadForm.types";

const LEAD_SOURCE_OPTIONS = toOptions(LEAD_SOURCE_LABELS);
const EDUCATION_LEVEL_OPTIONS = toOptions(EDUCATION_LEVEL_LABELS);
const PAYMENT_STATUS_OPTIONS = toOptions(PAYMENT_STATUS_LABELS);

/** Tri-state, not a checkbox — the contract's `null` means "we didn't ask". */
const VISA_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const VALIDATION = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(150),
  middle_name: z.string().max(150),
  last_name: z.string().max(150),
  full_name: z.string().max(300),
  name_native: z.string().max(300),
  email: z
    .string()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Enter a valid email address",
    }),
  contact_number: z
    .string()
    .max(32, "Contact number can be at most 32 characters"),
  lead_source_detail: z.string().max(255),
  passport_number: z.string().max(100),
  guardian_name: z.string().max(200),
  guardian_contact: z
    .string()
    .max(32, "Guardian contact can be at most 32 characters"),
});

const INITIAL: LeadFormValues = {
  first_name: "",
  middle_name: "",
  last_name: "",
  full_name: "",
  name_native: "",
  email: "",
  contact_number: "",
  lead_source: "",
  lead_source_detail: "",
  date_of_birth: "",
  address: "",
  passport_number: "",
  guardian_name: "",
  guardian_contact: "",
  education_level: "",
  payment_status: "",
  has_applied_visa_before: "",
  notes: "",
};

function visaToForm(value: boolean | null | undefined): string {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

function toInitial(record?: Partial<Lead>): LeadFormValues {
  if (!record) return INITIAL;
  return {
    first_name: record.first_name ?? "",
    middle_name: record.middle_name ?? "",
    last_name: record.last_name ?? "",
    full_name: record.full_name ?? "",
    name_native: record.name_native ?? "",
    email: record.email ?? "",
    contact_number: record.contact_number ?? "",
    lead_source: record.lead_source ?? "",
    lead_source_detail: record.lead_source_detail ?? "",
    date_of_birth: record.date_of_birth
      ? record.date_of_birth.slice(0, 10)
      : "",
    address: record.address ?? "",
    passport_number: record.passport_number ?? "",
    guardian_name: record.guardian_name ?? "",
    guardian_contact: record.guardian_contact ?? "",
    education_level: record.education_level ?? "",
    payment_status: record.payment_status ?? "",
    has_applied_visa_before: visaToForm(record.has_applied_visa_before),
    notes: record.notes ?? "",
  };
}

/** `Nullable=No` optional text — unset is the empty string, so blank clears. */
const TEXT_KEYS: (keyof LeadFormValues)[] = [
  "middle_name",
  "last_name",
  "full_name",
  "name_native",
  "email",
  "contact_number",
  "lead_source_detail",
  "address",
  "passport_number",
  "guardian_name",
  "guardian_contact",
  "notes",
];

/**
 * Optional **enums**. These are `Nullable=No` / Django `blank=True`, so `""` is
 * their unset value and DRF accepts it — they clear exactly like text does. They
 * are NOT dropped when blank: doing that makes every clearable Select a no-op,
 * which is the bug corrected across the rest of the module in 56d61a9.
 */
const ENUM_KEYS: (keyof LeadFormValues)[] = [
  "lead_source",
  "education_level",
  "payment_status",
];

/**
 * Read a Select/TextInput value as a string.
 *
 * A Mantine `clearable` Select writes `null` into form state on clear, not `""`.
 * Reading these fields with a `typeof === "string"` guard would therefore skip
 * exactly the case we need to send — the cleared one — so normalise first.
 */
function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Build the api payload. `first_name` is always sent (the one required field).
 * On create empty values are dropped; on edit they are sent explicitly so a
 * cleared field actually clears rather than the PATCH no-op'ing that key —
 * `""` for the `Nullable=No` text and enums, `null` for `date_of_birth` and the
 * tri-state visa flag, which are the only nullable fields here.
 */
function toPayload(values: LeadFormValues, isEdit: boolean): LeadFormPayload {
  const payload: Record<string, unknown> = {
    first_name: asString(values.first_name).trim(),
  };
  for (const key of [...TEXT_KEYS, ...ENUM_KEYS]) {
    const value = asString(values[key]);
    if (value !== "" || isEdit) payload[key] = value;
  }
  const dob = asString(values.date_of_birth);
  if (dob) payload.date_of_birth = dob;
  else if (isEdit) payload.date_of_birth = null;

  // "" is genuinely "unknown" here, so it maps to null rather than being dropped —
  // on edit that lets an operator walk back a wrong yes/no.
  if (values.has_applied_visa_before === "yes")
    payload.has_applied_visa_before = true;
  else if (values.has_applied_visa_before === "no")
    payload.has_applied_visa_before = false;
  else if (isEdit) payload.has_applied_visa_before = null;

  return payload;
}

const PANEL = {
  enquiry: "enquiry",
  identity: "identity",
  notes: "notes",
} as const;

/** Fields backing each panel — drives auto-open when the form arrives prefilled. */
const PANEL_FIELDS: Record<string, (keyof LeadFormValues)[]> = {
  [PANEL.enquiry]: [
    "education_level",
    "payment_status",
    "has_applied_visa_before",
  ],
  [PANEL.identity]: [
    "date_of_birth",
    "address",
    "passport_number",
    "guardian_name",
    "guardian_contact",
  ],
  [PANEL.notes]: ["notes"],
};

const ACCORDION_STYLES = {
  control: { paddingInline: 0 },
  content: { paddingInline: 0 },
} as const;

const ICON_SIZE = 16;

/**
 * Capture or refine an enquiry. Only `first_name` is required — the contract is
 * explicitly built for partial information, so the essentials stay visible and
 * everything else sits behind disclosure panels that a staff member opens only
 * when the caller actually volunteers that detail.
 *
 * A converted lead is frozen server-side; the list withholds the edit action for
 * those rather than letting this form 409 on save.
 */
export function LeadForm({
  initialValues,
  onSubmit,
  isLoading,
}: LeadFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<LeadFormValues>
      initial={toInitial(initialValues)}
      validation={[VALIDATION]}
      finalSubmitFn={async (values) => {
        onSubmit(toPayload(values, isEdit));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Fields isEdit={isEdit} isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text size="xs" fw={600}>
      {children}
    </Text>
  );
}

function Fields({
  isEdit,
  isLoading,
}: {
  isEdit: boolean;
  isLoading: boolean;
}) {
  const { form } = useFormInstance<LeadFormValues>();

  const [openPanels, setOpenPanels] = useState(() => {
    const values = form.getValues();
    return Object.keys(PANEL_FIELDS).filter((panel) =>
      PANEL_FIELDS[panel].some((field) => Boolean(values[field])),
    );
  });

  // Force a panel open when a field inside it has an error, so a validation
  // message can never hide behind a collapsed control.
  const erroredPanels = Object.keys(PANEL_FIELDS).filter((panel) =>
    PANEL_FIELDS[panel].some((field) => Boolean(form.errors[field])),
  );
  const value = Array.from(new Set([...openPanels, ...erroredPanels]));

  return (
    <Stack gap="md">
      <Stack gap={2}>
        <Text fw={600}>{isEdit ? "Edit enquiry" : "New enquiry"}</Text>
        <Text size="xs" c="dimmed">
          Only a first name is required. Capture whatever the enquiry gives you
          — you can fill in the rest on a follow-up.
        </Text>
      </Stack>

      <Box>
        <Stack gap="md">
          <Divider label="Who enquired" labelPosition="left" />
          <NameFieldGroup
            required
            lastNameRequired={false}
            disabled={isLoading}
            firstName={form.getInputProps("first_name")}
            middleName={form.getInputProps("middle_name")}
            lastName={form.getInputProps("last_name")}
          />
          <Group grow align="flex-start">
            <TextInput
              label="Full name"
              // The server composes this from the parts, but a mononym or a name
              // whose composed order is wrong needs an explicit override — and
              // this is the value the list's primary column shows.
              description="Leave blank to compose it from the parts above"
              maxLength={300}
              disabled={isLoading}
              {...form.getInputProps("full_name")}
            />
            <TextInput
              label="Name (native script)"
              placeholder="e.g. मनीषा श्रेष्ठ"
              maxLength={300}
              disabled={isLoading}
              {...form.getInputProps("name_native")}
            />
          </Group>

          <Divider label="How to reach them" labelPosition="left" />
          <Group grow align="flex-start">
            <TextInput
              label="Phone"
              placeholder="+977 98XXXXXXXX"
              disabled={isLoading}
              {...form.getInputProps("contact_number")}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="name@example.com"
              disabled={isLoading}
              {...form.getInputProps("email")}
            />
          </Group>

          <Divider label="Where they came from" labelPosition="left" />
          <Group grow align="flex-start">
            <Select
              label="Lead source"
              placeholder="How did they find us?"
              clearable
              data={LEAD_SOURCE_OPTIONS}
              disabled={isLoading}
              {...form.getInputProps("lead_source")}
            />
            <TextInput
              label="Source detail"
              placeholder="e.g. Referred by Ramesh T."
              maxLength={255}
              disabled={isLoading}
              {...form.getInputProps("lead_source_detail")}
            />
          </Group>
        </Stack>
      </Box>

      <Accordion
        multiple
        value={value}
        onChange={setOpenPanels}
        variant="filled"
        styles={ACCORDION_STYLES}
      >
        <Accordion.Item value={PANEL.enquiry}>
          <Accordion.Control
            icon={<GraduationCapIcon size={ICON_SIZE} aria-hidden />}
          >
            <SectionLabel>What they&rsquo;re asking about</SectionLabel>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md" pt="xs">
              <Group grow align="flex-start">
                <Select
                  label="Education level"
                  placeholder="Highest completed"
                  clearable
                  data={EDUCATION_LEVEL_OPTIONS}
                  disabled={isLoading}
                  {...form.getInputProps("education_level")}
                />
                <Select
                  label="Payment preference"
                  placeholder="Not discussed"
                  clearable
                  data={PAYMENT_STATUS_OPTIONS}
                  disabled={isLoading}
                  {...form.getInputProps("payment_status")}
                />
              </Group>
              <Select
                label="Applied for a visa before?"
                placeholder="Not asked"
                description="Leave blank if it didn't come up — blank means unknown, not no."
                clearable
                data={VISA_OPTIONS}
                disabled={isLoading}
                {...form.getInputProps("has_applied_visa_before")}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value={PANEL.identity}>
          <Accordion.Control
            icon={<AddressBookIcon size={ICON_SIZE} aria-hidden />}
          >
            <SectionLabel>Identity & guardian</SectionLabel>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md" pt="xs">
              <Group grow align="flex-start">
                <TextInput
                  label="Date of birth"
                  type="date"
                  disabled={isLoading}
                  {...form.getInputProps("date_of_birth")}
                />
                <TextInput
                  label="Passport number"
                  maxLength={100}
                  disabled={isLoading}
                  {...form.getInputProps("passport_number")}
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
                  label="Guardian name"
                  maxLength={200}
                  disabled={isLoading}
                  {...form.getInputProps("guardian_name")}
                />
                <TextInput
                  label="Guardian contact"
                  disabled={isLoading}
                  {...form.getInputProps("guardian_contact")}
                />
              </Group>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value={PANEL.notes}>
          <Accordion.Control
            icon={<NotepadIcon size={ICON_SIZE} aria-hidden />}
          >
            <SectionLabel>Notes</SectionLabel>
          </Accordion.Control>
          <Accordion.Panel>
            <Box pt="xs">
              <Textarea
                label="Enquiry notes"
                placeholder="Anything worth remembering before the follow-up call"
                autosize
                minRows={3}
                disabled={isLoading}
                {...form.getInputProps("notes")}
              />
            </Box>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save lead
    </Button>
  );
}

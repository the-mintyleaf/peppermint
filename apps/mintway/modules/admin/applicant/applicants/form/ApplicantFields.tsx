"use client";

import { useState } from "react";

import {
  Accordion,
  Box,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { NotepadIcon } from "@phosphor-icons/react/dist/csr/Notepad";

import { NameFieldGroup } from "@/components/NameFieldGroup";

import {
  FOLLOW_UP_PRIORITY_LABELS,
  PAYMENT_STATUS_LABELS,
  GENDER_LABELS,
  LEAD_SOURCE_LABELS,
  toOptions,
} from "../../_shared";
import type { ApplicantFormValues } from "./ApplicantForm.types";

const LEAD_SOURCE_OPTIONS = toOptions(LEAD_SOURCE_LABELS);
const GENDER_OPTIONS = toOptions(GENDER_LABELS);
const FOLLOW_UP_PRIORITY_OPTIONS = toOptions(FOLLOW_UP_PRIORITY_LABELS);
const PAYMENT_STATUS_OPTIONS = toOptions(PAYMENT_STATUS_LABELS);

/** Optional-panel keys, one per collapsible Accordion section. */
const PANEL = {
  altContact: "alt-contact",
  additional: "additional",
  summaries: "summaries",
} as const;

/** Fields backing each panel — drives auto-open when the form arrives prefilled (edit). */
const PANEL_FIELDS: Record<string, (keyof ApplicantFormValues)[]> = {
  [PANEL.altContact]: ["alternate_email", "alternate_phone"],
  [PANEL.additional]: [
    "date_of_birth",
    "gender",
    "religion",
    "payment_status",
    "last_contacted_at",
    "next_follow_up_at",
    "follow_up_priority",
  ],
  [PANEL.summaries]: ["summary", "eligibility_summary", "counselling_notes"],
};

/** Zero the accordion's own inset so header + fields align with the block above. */
const ACCORDION_STYLES = {
  control: { paddingInline: 0 },
  content: { paddingInline: 0 },
} as const;

const ICON_SIZE = 16;

/** Form intro copy, keyed by mode — heading orients the task, sub explains the rule that trips people up. */
const INTRO: Record<"create" | "edit", { heading: string; sub: string }> = {
  create: {
    heading: "Add a new applicant",
    sub: "Only a first name is required. Capture whatever contact details and context you have now — the rest can wait.",
  },
  edit: {
    heading: "Edit applicant",
    sub: "Update this person's profile. Clearing a text field saves it as blank, so only empty what you mean to remove.",
  },
};

interface ApplicantFieldsProps {
  mode: "create" | "edit";
  isAdmin: boolean;
  isLoading: boolean;
}

/** Section heading: xs label with a leading Phosphor glyph for quick recognition. */
function SectionLabel({ children }: { children: string }) {
  return (
    <Text size="xs" fw={600}>
      {children}
    </Text>
  );
}

/** Modal-body lead-in: a task heading + one guidance line above the fields. */
function FormIntro({ mode }: { mode: "create" | "edit" }) {
  const { heading, sub } = INTRO[mode];
  return (
    <Stack gap={2}>
      <Text fw={600}>{heading}</Text>
      <Text size="xs" c="dimmed">
        {sub}
      </Text>
    </Stack>
  );
}

/**
 * Role-aware applicant field layout. The essentials (identity, primary contact, lead)
 * are always visible; alternate contact and the admin-only additional/summary blocks
 * live in collapsible Accordion panels so create stays short and only expands when
 * needed. A panel auto-opens on mount when any of its fields already holds a value, so
 * prefilled data (edit) is never hidden behind a closed panel. Admin additionally sees
 * the protected block (DOB, gender, religion, summaries, follow-up); the api layer
 * re-enforces the whitelist, so hiding here is UX, not the security boundary.
 */
export function ApplicantFields({
  mode,
  isAdmin,
  isLoading,
}: ApplicantFieldsProps) {
  const { form } = useFormInstance<ApplicantFormValues>();

  // Controlled open-state, seeded once from the (possibly prefilled) initial values so
  // edit records with data in a panel start expanded.
  const [openPanels, setOpenPanels] = useState(() => {
    const values = form.getValues();
    return Object.keys(PANEL_FIELDS).filter((panel) =>
      PANEL_FIELDS[panel].some((field) => Boolean(values[field])),
    );
  });

  // A panel holding a field with a validation error is force-opened: an alternate-email
  // error must never hide behind a collapsed control (blur/submit validation can set it).
  const erroredPanels = Object.keys(PANEL_FIELDS).filter((panel) =>
    PANEL_FIELDS[panel].some((field) => Boolean(form.errors[field])),
  );
  const value = Array.from(new Set([...openPanels, ...erroredPanels]));

  return (
    <Stack gap="md">
      <FormIntro mode={mode} />

      <Box>
        <Stack gap="md">
          <Divider label="Identity" labelPosition="left" />
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
              label="Preferred display name"
              placeholder="What they go by, e.g. Manny"
              disabled={isLoading}
              {...form.getInputProps("preferred_display_name")}
            />
            <TextInput
              label="Name (native script)"
              placeholder="e.g. मारिया गुरुङ"
              disabled={isLoading}
              {...form.getInputProps("name_native")}
            />
            <TextInput
              label="Nationality"
              placeholder="e.g. Nepali"
              disabled={isLoading}
              {...form.getInputProps("nationality")}
            />
          </Group>

          <Divider label="Contact" labelPosition="left" />
          <Group grow align="flex-start">
            <TextInput
              label="Primary email"
              type="email"
              placeholder="name@example.com"
              disabled={isLoading}
              {...form.getInputProps("primary_email")}
            />
            <TextInput
              label="Primary phone"
              placeholder="+977 98XXXXXXXX"
              disabled={isLoading}
              {...form.getInputProps("primary_phone")}
            />
          </Group>

          <Divider label="Lead" labelPosition="left" />
          <Group grow align="flex-start">
            <Select
              label="Lead source"
              placeholder="Where they came from"
              clearable
              data={LEAD_SOURCE_OPTIONS}
              disabled={isLoading}
              {...form.getInputProps("lead_source")}
            />
            <TextInput
              label="Lead source detail"
              placeholder="e.g. Referred by an existing applicant"
              disabled={isLoading}
              {...form.getInputProps("lead_source_detail")}
            />
          </Group>
          <Textarea
            label="Initial interest"
            placeholder="What are they after? e.g. BSc Nursing, planning to apply next intake"
            autosize
            minRows={2}
            disabled={isLoading}
            {...form.getInputProps("initial_interest")}
          />
        </Stack>
      </Box>

      <Accordion
        multiple
        value={value}
        onChange={setOpenPanels}
        variant="filled"
        radius="sm"
        styles={ACCORDION_STYLES}
      >
        <Accordion.Item value={PANEL.altContact}>
          <Accordion.Control
            icon={
              <AddressBookIcon
                size={ICON_SIZE}
                aria-label="Alternate contact"
              />
            }
          >
            <SectionLabel>Alternate contact</SectionLabel>
          </Accordion.Control>
          <Accordion.Panel>
            <Group grow align="flex-start">
              <TextInput
                label="Alternate email"
                type="email"
                placeholder="backup@example.com"
                disabled={isLoading}
                {...form.getInputProps("alternate_email")}
              />
              <TextInput
                label="Alternate phone"
                placeholder="+977 98XXXXXXXX"
                disabled={isLoading}
                {...form.getInputProps("alternate_phone")}
              />
            </Group>
          </Accordion.Panel>
        </Accordion.Item>

        {isAdmin && (
          <>
            <Accordion.Item value={PANEL.additional}>
              <Accordion.Control
                icon={
                  <IdentificationCardIcon
                    size={ICON_SIZE}
                    aria-label="Additional details"
                  />
                }
              >
                <SectionLabel>Additional details</SectionLabel>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Group grow align="flex-start">
                    <TextInput
                      label="Date of birth"
                      type="date"
                      disabled={isLoading}
                      {...form.getInputProps("date_of_birth")}
                    />
                    <Select
                      label="Gender"
                      placeholder="Select gender"
                      clearable
                      data={GENDER_OPTIONS}
                      disabled={isLoading}
                      {...form.getInputProps("gender")}
                    />
                    <TextInput
                      label="Religion"
                      placeholder="e.g. Hindu"
                      disabled={isLoading}
                      {...form.getInputProps("religion")}
                    />
                  </Group>
                  <Group grow align="flex-start">
                    <TextInput
                      label="Last contacted"
                      type="datetime-local"
                      disabled={isLoading}
                      {...form.getInputProps("last_contacted_at")}
                    />
                    <TextInput
                      label="Next follow-up"
                      type="datetime-local"
                      disabled={isLoading}
                      {...form.getInputProps("next_follow_up_at")}
                    />
                  </Group>
                  <Group grow align="flex-start">
                    <Select
                      label="Follow-up priority"
                      placeholder="Set a priority"
                      clearable
                      data={FOLLOW_UP_PRIORITY_OPTIONS}
                      disabled={isLoading}
                      {...form.getInputProps("follow_up_priority")}
                    />
                    <Select
                      label="Payment status"
                      placeholder="Not set"
                      clearable
                      data={PAYMENT_STATUS_OPTIONS}
                      disabled={isLoading}
                      {...form.getInputProps("payment_status")}
                    />
                  </Group>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value={PANEL.summaries}>
              <Accordion.Control
                icon={<NotepadIcon size={ICON_SIZE} aria-label="Summaries" />}
              >
                <SectionLabel>Summaries</SectionLabel>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Textarea
                    label="Summary"
                    placeholder="Short profile — background, current status, what stands out"
                    autosize
                    minRows={2}
                    disabled={isLoading}
                    {...form.getInputProps("summary")}
                  />
                  <Textarea
                    label="Eligibility summary"
                    placeholder="Do they meet the requirements? Note any gaps or conditions"
                    autosize
                    minRows={2}
                    disabled={isLoading}
                    {...form.getInputProps("eligibility_summary")}
                  />
                  <Textarea
                    label="Counselling notes"
                    placeholder="Notes from calls or meetings — kept internal"
                    autosize
                    minRows={2}
                    disabled={isLoading}
                    {...form.getInputProps("counselling_notes")}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </>
        )}
      </Accordion>
    </Stack>
  );
}

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

import {
  FOLLOW_UP_PRIORITY_LABELS,
  GENDER_LABELS,
  LEAD_SOURCE_LABELS,
  toOptions,
} from "../../_shared";
import type { ApplicantFormValues } from "./ApplicantForm.types";

const LEAD_SOURCE_OPTIONS = toOptions(LEAD_SOURCE_LABELS);
const GENDER_OPTIONS = toOptions(GENDER_LABELS);
const FOLLOW_UP_PRIORITY_OPTIONS = toOptions(FOLLOW_UP_PRIORITY_LABELS);

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

interface ApplicantFieldsProps {
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

/**
 * Role-aware applicant field layout. The essentials (identity, primary contact, lead)
 * are always visible; alternate contact and the admin-only additional/summary blocks
 * live in collapsible Accordion panels so create stays short and only expands when
 * needed. A panel auto-opens on mount when any of its fields already holds a value, so
 * prefilled data (edit) is never hidden behind a closed panel. Admin additionally sees
 * the protected block (DOB, gender, religion, summaries, follow-up); the api layer
 * re-enforces the whitelist, so hiding here is UX, not the security boundary.
 */
export function ApplicantFields({ isAdmin, isLoading }: ApplicantFieldsProps) {
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
      <Box>
        <Stack gap="md">
          <Group grow align="flex-start">
            <TextInput
              label="First name"
              required
              disabled={isLoading}
              {...form.getInputProps("first_name")}
            />
            <TextInput
              label="Middle name"
              disabled={isLoading}
              {...form.getInputProps("middle_name")}
            />
            <TextInput
              label="Last name"
              disabled={isLoading}
              {...form.getInputProps("last_name")}
            />
          </Group>
          <Group grow align="flex-start">
            <TextInput
              label="Preferred display name"
              disabled={isLoading}
              {...form.getInputProps("preferred_display_name")}
            />
            <TextInput
              label="Name (native script)"
              disabled={isLoading}
              {...form.getInputProps("name_native")}
            />
            <TextInput
              label="Nationality"
              disabled={isLoading}
              {...form.getInputProps("nationality")}
            />
          </Group>

          <Divider label="Contact" labelPosition="left" />
          <Group grow align="flex-start">
            <TextInput
              label="Primary email"
              type="email"
              disabled={isLoading}
              {...form.getInputProps("primary_email")}
            />
            <TextInput
              label="Primary phone"
              disabled={isLoading}
              {...form.getInputProps("primary_phone")}
            />
          </Group>

          <Divider label="Lead" labelPosition="left" />
          <Group grow align="flex-start">
            <Select
              label="Lead source"
              clearable
              data={LEAD_SOURCE_OPTIONS}
              disabled={isLoading}
              {...form.getInputProps("lead_source")}
            />
            <TextInput
              label="Lead source detail"
              disabled={isLoading}
              {...form.getInputProps("lead_source_detail")}
            />
          </Group>
          <Textarea
            label="Initial interest"
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
                disabled={isLoading}
                {...form.getInputProps("alternate_email")}
              />
              <TextInput
                label="Alternate phone"
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
                      clearable
                      data={GENDER_OPTIONS}
                      disabled={isLoading}
                      {...form.getInputProps("gender")}
                    />
                    <TextInput
                      label="Religion"
                      disabled={isLoading}
                      {...form.getInputProps("religion")}
                    />
                  </Group>
                  <Group grow align="flex-start">
                    <TextInput
                      label="Next follow-up"
                      type="datetime-local"
                      disabled={isLoading}
                      {...form.getInputProps("next_follow_up_at")}
                    />
                    <Select
                      label="Follow-up priority"
                      clearable
                      data={FOLLOW_UP_PRIORITY_OPTIONS}
                      disabled={isLoading}
                      {...form.getInputProps("follow_up_priority")}
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
                    autosize
                    minRows={2}
                    disabled={isLoading}
                    {...form.getInputProps("summary")}
                  />
                  <Textarea
                    label="Eligibility summary"
                    autosize
                    minRows={2}
                    disabled={isLoading}
                    {...form.getInputProps("eligibility_summary")}
                  />
                  <Textarea
                    label="Counselling notes"
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

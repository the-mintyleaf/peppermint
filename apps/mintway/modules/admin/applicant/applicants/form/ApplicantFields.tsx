"use client";

import { Divider, Group, Select, Textarea, TextInput } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";

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

interface ApplicantFieldsProps {
  isAdmin: boolean;
  isLoading: boolean;
}

/**
 * Role-aware applicant field layout. Staff see identity/contact/lead fields; admin
 * additionally sees the protected block (DOB, gender, religion, summaries, follow-up).
 * The api layer re-enforces the whitelist, so hiding here is UX, not the security
 * boundary.
 */
export function ApplicantFields({ isAdmin, isLoading }: ApplicantFieldsProps) {
  const { form } = useFormInstance<ApplicantFormValues>();

  return (
    <>
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

      {isAdmin && (
        <>
          <Divider label="Additional (admin)" labelPosition="left" />
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
        </>
      )}
    </>
  );
}

"use client";

import { useFormInstance } from "@peppermint/admin";
import {
  Accordion,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Switch,
  TagsInput,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import type { LeadFormValues } from "./LeadForm.types";

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

const LANGUAGE_TEST_STATUS_OPTIONS = [
  { value: "not_taken", label: "Not taken" },
  { value: "preparing", label: "Preparing" },
  { value: "booked", label: "Booked" },
  { value: "taken", label: "Taken" },
  { value: "not_required", label: "Not required" },
];

/**
 * Collapsed by default — every field here is independently optional and the
 * backend treats the whole block as preliminary, possibly-incomplete data
 * (`docs/backend/lead-management/CONCEPT.md` "Preliminary study interest").
 * Keeps the required fields above it the fast path through the modal.
 */
export function StudyInterestSection() {
  const { form } = useFormInstance<LeadFormValues>();

  return (
    <Accordion variant="separated">
      <Accordion.Item value="study-interest">
        <Accordion.Control>Study interest (optional)</Accordion.Control>
        <Accordion.Panel>
          <Group grow align="flex-start" mb="sm">
            <TagsInput
              label="Interested countries"
              placeholder="Add a country and press Enter"
              {...form.getInputProps("study_interest.interested_countries")}
            />
            <Select
              label="Intended study level"
              data={STUDY_LEVEL_OPTIONS}
              clearable
              {...form.getInputProps("study_interest.study_level")}
              // Mantine's clearable Select emits `null`, but the field is a
              // plain `string` (`""` means unset) — normalize so a cleared
              // value round-trips instead of tripping `z.string()`.
              onChange={(value) =>
                form.setFieldValue("study_interest.study_level", value ?? "")
              }
            />
          </Group>

          <Group grow align="flex-start" mb="sm">
            <TextInput
              label="Field of study"
              placeholder="Computer Science"
              {...form.getInputProps("study_interest.field_of_study")}
            />
            <TextInput
              label="Preferred intake"
              placeholder="Fall 2026"
              {...form.getInputProps("study_interest.preferred_intake")}
            />
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} mb="sm">
            <NumberInput
              label="Approximate budget"
              placeholder="1500000"
              min={0}
              {...form.getInputProps("study_interest.budget_amount")}
              // Mantine's NumberInput emits "" when cleared, but the field
              // is `number | null` — normalize so clearing a previously
              // entered budget round-trips instead of tripping `z.number()`.
              onChange={(value) =>
                form.setFieldValue(
                  "study_interest.budget_amount",
                  value === "" ? null : Number(value),
                )
              }
            />
            <TextInput
              label="Currency"
              placeholder="NPR"
              maxLength={3}
              {...form.getInputProps("study_interest.budget_currency")}
            />
            <TextInput
              label="Highest qualification"
              placeholder="Bachelor's in Business"
              {...form.getInputProps("study_interest.highest_qualification")}
            />
          </SimpleGrid>

          <Group align="center" mb="sm">
            <Select
              label="Language test status"
              data={LANGUAGE_TEST_STATUS_OPTIONS}
              clearable
              {...form.getInputProps("study_interest.language_test_status")}
              onChange={(value) =>
                form.setFieldValue(
                  "study_interest.language_test_status",
                  value ?? "",
                )
              }
            />
            <Switch
              label="Interested in scholarships"
              mt={24}
              {...form.getInputProps("study_interest.scholarship_interest", {
                type: "checkbox",
              })}
            />
          </Group>

          <Textarea
            label="Additional notes"
            placeholder="Anything else worth noting from the conversation"
            autosize
            minRows={2}
            {...form.getInputProps("study_interest.interest_notes")}
          />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

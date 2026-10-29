"use client";

import { useFormInstance } from "@peppermint/admin";
import {
  Group,
  NumberInput,
  Select,
  Switch,
  TagsInput,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { FormSection } from "@/components/FormSection";
import { STUDY_LEVEL_OPTIONS } from "../studyInterest.labels";
import type { LeadFormValues } from "./LeadForm.types";

/**
 * What they want to study next. A plain divided section, not a disclosure:
 * every field is independently optional and the backend treats the block as
 * preliminary, possibly-incomplete data (`CONCEPT.md` "Preliminary study
 * interest"), so the fields stay visible and skippable. Their past education
 * (`AcademicBackgroundSection`) and English tests (`LanguageSection`) are
 * separate sections — same `study_interest` record, different question.
 */
export function StudyInterestSection() {
  const { form } = useFormInstance<LeadFormValues>();

  return (
    <FormSection
      title="Study interest (optional)"
      description="Preliminary detail from the conversation — fill in what is known and skip the rest."
    >
      <Group grow align="flex-start">
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

      <Group grow align="flex-start">
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

      <Group align="flex-start" wrap="wrap">
        <NumberInput
          label="Approximate budget"
          placeholder="1500000"
          min={0}
          thousandSeparator=","
          style={{ flex: 1, minWidth: 160 }}
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
          w={96}
          {...form.getInputProps("study_interest.budget_currency")}
        />
        <Switch
          label="Interested in scholarships"
          mt={32}
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
    </FormSection>
  );
}

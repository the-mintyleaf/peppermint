"use client";

import {
  Group,
  NumberInput,
  Switch,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { AvailabilityFields } from "../../../components/AvailabilityFields";
import type { ProgramFormValues } from "../../../institutions.types";
import type { ProgramFieldsProps } from "../ProgramForm.types";

export function ProgramMetaFields({ disabled }: ProgramFieldsProps) {
  const { form } = useFormInstance<ProgramFormValues>();

  return (
    <>
      <Switch
        label="Scholarship available"
        disabled={disabled}
        checked={form.values.scholarship_available}
        onChange={(e) =>
          form.setFieldValue("scholarship_available", e.currentTarget.checked)
        }
      />
      {form.values.scholarship_available ? (
        <Textarea
          label="Scholarship notes"
          autosize
          minRows={2}
          disabled={disabled}
          {...form.getInputProps("scholarship_notes")}
        />
      ) : null}
      <Group grow align="flex-start">
        <NumberInput
          label="Duration (months)"
          min={1}
          max={120}
          disabled={disabled}
          {...form.getInputProps("duration_months")}
        />
        <TextInput
          label="Intake pattern"
          placeholder="Feb / Jul"
          disabled={disabled}
          {...form.getInputProps("intake_pattern")}
        />
      </Group>
      <AvailabilityFields disabled={disabled} />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("notes")}
      />
    </>
  );
}

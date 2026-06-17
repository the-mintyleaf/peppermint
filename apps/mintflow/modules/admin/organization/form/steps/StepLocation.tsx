"use client";

import { Select, Stack, TextInput } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import type { OrgUnitFormValues } from "../orgUnitForm.types";

const PROVINCE_OPTIONS = [
  { value: "Koshi", label: "Koshi Province (Province 1)" },
  { value: "Madhesh", label: "Madhesh Province (Province 2)" },
  { value: "Bagmati", label: "Bagmati Province (Province 3)" },
  { value: "Gandaki", label: "Gandaki Province (Province 4)" },
  { value: "Lumbini", label: "Lumbini Province (Province 5)" },
  { value: "Karnali", label: "Karnali Province (Province 6)" },
  { value: "Sudurpashchim", label: "Sudurpashchim Province (Province 7)" },
];

export function StepLocation() {
  const { form } = useFormInstance<OrgUnitFormValues>();

  return (
    <Stack gap="md">
      <Select
        label="Province"
        placeholder="Select province"
        required
        data={PROVINCE_OPTIONS}
        {...form.getInputProps("province")}
      />
      <TextInput
        label="District"
        placeholder="e.g. Kathmandu"
        required
        {...form.getInputProps("district")}
      />
      <TextInput
        label="Municipality / VDC"
        placeholder="e.g. Kathmandu Metropolitan City"
        {...form.getInputProps("municipality")}
      />
      <TextInput
        label="Ward No."
        placeholder="e.g. 1"
        {...form.getInputProps("ward")}
      />
      <TextInput
        label="Street Address"
        placeholder="e.g. Singha Durbar, Kathmandu"
        {...form.getInputProps("address")}
      />
    </Stack>
  );
}

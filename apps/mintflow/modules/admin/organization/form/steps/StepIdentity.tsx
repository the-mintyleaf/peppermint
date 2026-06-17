"use client";

import { Select, Stack, Textarea, TextInput } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import type { OrgUnitFormValues } from "../orgUnitForm.types";

const UNIT_TYPE_OPTIONS = [
  { value: "ministry", label: "Ministry" },
  { value: "department", label: "Department" },
  { value: "division", label: "Division" },
  { value: "section", label: "Section" },
  { value: "district_office", label: "District Administration Office" },
  { value: "area_office", label: "Area Administration Office" },
  { value: "security_agency", label: "Security Agency" },
  { value: "other", label: "Other" },
];

export function StepIdentity() {
  const { form } = useFormInstance<OrgUnitFormValues>();

  return (
    <Stack gap="md">
      <TextInput
        label="Office Name (English)"
        placeholder="e.g. Ministry of Home Affairs"
        required
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Office Name (Nepali)"
        placeholder="e.g. गृह मन्त्रालय"
        required
        {...form.getInputProps("nameNepali")}
      />
      <TextInput
        label="Office Code"
        placeholder="e.g. MHA"
        required
        description="Short unique identifier (max 20 chars)"
        {...form.getInputProps("code")}
      />
      <Select
        label="Unit Type"
        placeholder="Select unit type"
        required
        data={UNIT_TYPE_OPTIONS}
        {...form.getInputProps("unitType")}
      />
      <Textarea
        label="Description"
        placeholder="Brief description of this office unit"
        rows={3}
        {...form.getInputProps("description")}
      />
    </Stack>
  );
}

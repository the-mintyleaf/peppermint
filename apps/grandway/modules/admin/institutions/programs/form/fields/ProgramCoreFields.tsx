"use client";

import { useMemo } from "react";
import { Group, Select, TextInput } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { QUALIFICATION_LEVEL_OPTIONS } from "../../../institutions.constants";
import {
  useFields,
  useInstitutionCampuses,
  useInstitutions,
} from "../../../institutions.hooks";
import type { ProgramFormValues } from "../../../institutions.types";

interface ProgramCoreFieldsProps {
  disabled: boolean;
  /** Edit mode — `institution` is immutable, so the picker is read-only. */
  institutionLocked: boolean;
}

export function ProgramCoreFields({
  disabled,
  institutionLocked,
}: ProgramCoreFieldsProps) {
  const { form } = useFormInstance<ProgramFormValues>();
  const { data: institutions = [] } = useInstitutions();
  const { data: fields = [] } = useFields();
  const selectedInstitution = form.values.institution || null;
  const { data: campuses = [] } = useInstitutionCampuses(selectedInstitution);

  const institutionOptions = useMemo(
    () => institutions.map((i) => ({ value: i.id, label: i.name })),
    [institutions],
  );
  const fieldOptions = useMemo(
    () =>
      fields
        .filter((f) => f.is_active)
        .map((f) => ({ value: f.id, label: f.name })),
    [fields],
  );
  const campusOptions = useMemo(
    () => campuses.map((c) => ({ value: c.id, label: c.name })),
    [campuses],
  );

  return (
    <>
      <Select
        label="Institution"
        placeholder="Pick an institution"
        data={institutionOptions}
        required
        searchable
        disabled={disabled || institutionLocked}
        description={
          institutionLocked ? "Can't be changed after creation." : undefined
        }
        value={form.values.institution || null}
        error={form.errors.institution}
        onChange={(value) => {
          form.setFieldValue("institution", value ?? "");
          // A campus must belong to the chosen institution — clear a stale pick.
          form.setFieldValue("campus", null);
        }}
      />
      <Group grow align="flex-start">
        <Select
          label="Field"
          placeholder="Pick a field"
          data={fieldOptions}
          required
          searchable
          disabled={disabled}
          {...form.getInputProps("field")}
        />
        <Select
          label="Qualification level"
          placeholder="Pick a level"
          data={QUALIFICATION_LEVEL_OPTIONS}
          required
          disabled={disabled}
          {...form.getInputProps("qualification_level")}
        />
      </Group>
      <TextInput
        label="Title"
        required
        disabled={disabled}
        {...form.getInputProps("title")}
      />
      <Select
        label="Campus"
        placeholder={
          selectedInstitution
            ? "Optional — a campus of this institution"
            : "Pick an institution first"
        }
        data={campusOptions}
        clearable
        searchable
        disabled={disabled || !selectedInstitution}
        value={form.values.campus}
        error={form.errors.campus}
        onChange={(value) => form.setFieldValue("campus", value)}
      />
    </>
  );
}

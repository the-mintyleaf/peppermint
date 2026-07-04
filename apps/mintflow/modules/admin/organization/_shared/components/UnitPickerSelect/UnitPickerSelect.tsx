"use client";

import { Select } from "@peppermint/ui";

import { useUnitOptions } from "./UnitPickerSelect.hooks";
import type { UnitPickerSelectProps } from "./UnitPickerSelect.types";

export function UnitPickerSelect({
  organizationId,
  label = "Unit",
  placeholder = "Select a unit",
  required,
  disabled,
  clearable = true,
  excludeUnitIds,
  value,
  onChange,
  error,
}: UnitPickerSelectProps) {
  const { data: units, isFetching } = useUnitOptions(organizationId);
  const excluded = new Set(excludeUnitIds ?? []);

  const options = (units ?? [])
    .filter((unit) => !excluded.has(unit.id))
    .sort((a, b) => a.path_cache.localeCompare(b.path_cache))
    .map((unit) => ({
      value: unit.id,
      label: `${"  ".repeat(unit.depth)}${unit.name} (${unit.code})`,
    }));

  return (
    <Select
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      clearable={clearable}
      error={error}
      searchable
      data={options}
      value={value}
      onChange={onChange}
      rightSectionPointerEvents={isFetching ? "none" : "auto"}
      nothingFoundMessage={isFetching ? "Loading units..." : "No units found"}
    />
  );
}

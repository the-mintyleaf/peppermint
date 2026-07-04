"use client";

import { useState } from "react";
import { Select, Stack } from "@peppermint/ui";

import { UnitPickerSelect } from "../UnitPickerSelect";
import { usePositionOptions } from "./PositionPickerSelect.hooks";
import type { PositionPickerSelectProps } from "./PositionPickerSelect.types";

export function PositionPickerSelect({
  organizationId,
  label = "Position",
  unitLabel = "Unit",
  required,
  disabled,
  value,
  onChange,
  error,
}: PositionPickerSelectProps) {
  const [unitId, setUnitId] = useState<string | null>(null);
  const { data: positions, isFetching } = usePositionOptions(unitId);

  const options = (positions?.data ?? []).map((p) => ({
    value: p.id,
    label: `${p.title} (${p.code})`,
  }));

  return (
    <Stack gap="sm">
      <UnitPickerSelect
        organizationId={organizationId}
        label={unitLabel}
        disabled={disabled}
        value={unitId}
        onChange={(id) => {
          setUnitId(id);
          onChange(null);
        }}
      />
      <Select
        label={label}
        placeholder={unitId ? "Select a position" : "Select a unit first"}
        required={required}
        disabled={disabled || !unitId}
        searchable
        data={options}
        value={value}
        onChange={onChange}
        error={error}
        rightSectionPointerEvents={isFetching ? "none" : "auto"}
        nothingFoundMessage={
          isFetching ? "Loading positions..." : "No positions found"
        }
      />
    </Stack>
  );
}

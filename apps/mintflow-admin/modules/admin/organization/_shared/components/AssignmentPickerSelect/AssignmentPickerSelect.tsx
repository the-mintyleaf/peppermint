"use client";

import { useState } from "react";
import { Select, Stack } from "@peppermint/ui";

import { PositionPickerSelect } from "../PositionPickerSelect";
import { usePositionHolderOptions } from "./AssignmentPickerSelect.hooks";
import type { AssignmentPickerSelectProps } from "./AssignmentPickerSelect.types";

export function AssignmentPickerSelect({
  organizationId,
  label = "Assignment",
  required,
  disabled,
  value,
  onChange,
  error,
}: AssignmentPickerSelectProps) {
  const [positionId, setPositionId] = useState<string | null>(null);
  const { data: holders, isFetching } = usePositionHolderOptions(positionId);

  const activeHolders = (holders ?? []).filter((h) => h.status === "active");
  const options = activeHolders.map((h) => ({
    value: h.id,
    label: `${h.assignment_type} assignment${h.is_primary ? " (primary)" : ""}`,
  }));

  return (
    <Stack gap="sm">
      <PositionPickerSelect
        organizationId={organizationId}
        disabled={disabled}
        value={positionId}
        onChange={(id) => {
          setPositionId(id);
          onChange(null);
        }}
      />
      <Select
        label={label}
        placeholder={positionId ? "Select a holder" : "Select a position first"}
        required={required}
        disabled={disabled || !positionId}
        data={options}
        value={value}
        onChange={onChange}
        error={error}
        rightSectionPointerEvents={isFetching ? "none" : "auto"}
        nothingFoundMessage={
          isFetching
            ? "Loading holders..."
            : "No active holders for this position"
        }
      />
    </Stack>
  );
}

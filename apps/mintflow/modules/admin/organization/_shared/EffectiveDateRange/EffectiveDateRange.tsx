"use client";

import { Checkbox, DatePickerInput, Group, Stack } from "@peppermint/ui";
import { useState } from "react";
import type { EffectiveDateRangeProps } from "./EffectiveDateRange.types";

function toDateString(iso: string | null): string | null {
  if (!iso) return null;
  return iso.split("T")[0];
}

export function EffectiveDateRange({
  value,
  onChange,
  fromLabel = "Effective from",
  toLabel = "Effective to",
  fromError,
  toError,
  fromRequired,
  disabled,
}: EffectiveDateRangeProps) {
  const [openEnded, setOpenEnded] = useState(value.to === null);

  function handleOpenEndedChange(checked: boolean) {
    setOpenEnded(checked);
    if (checked) {
      onChange({ ...value, to: null });
    }
  }

  return (
    <Stack gap="xs">
      <Group align="flex-start" grow>
        <DatePickerInput
          label={fromLabel}
          placeholder="Select date"
          value={toDateString(value.from)}
          onChange={(val: string | null) => onChange({ ...value, from: val })}
          required={fromRequired}
          error={fromError}
          disabled={disabled}
          clearable
        />

        <DatePickerInput
          label={toLabel}
          placeholder={openEnded ? "Open-ended" : "Select date"}
          value={toDateString(value.to)}
          onChange={(val: string | null) => onChange({ ...value, to: val })}
          error={toError}
          disabled={disabled || openEnded}
          minDate={value.from ?? undefined}
          clearable
        />
      </Group>

      <Checkbox
        label="Open-ended (no end date)"
        checked={openEnded}
        onChange={(e) => handleOpenEndedChange(e.currentTarget.checked)}
        disabled={disabled}
        size="xs"
      />
    </Stack>
  );
}

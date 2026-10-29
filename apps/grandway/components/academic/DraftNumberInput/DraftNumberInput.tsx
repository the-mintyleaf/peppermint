"use client";

import { useState } from "react";
import { NumberInput } from "@peppermint/ui";

import type { DraftNumberInputProps } from "./DraftNumberInput.types";

/** Mantine emits `""` when cleared and a string for partial input ("3."). */
function toNumber(value: number | string): number | null {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) ? parsed : null;
}

/**
 * A `NumberInput` for a form field that holds `number | null`, which keeps the
 * user's raw text while they type.
 *
 * Feeding the parsed number straight back as `value` collapses partial input:
 * "3." parses to 3, the box re-renders "3", and "3.45" can never be typed. So
 * the raw text is kept as a local draft for display while the parsed number is
 * still written to the form on every keystroke (validation and submit read
 * the form). The draft is dropped on blur, when the box goes back to showing
 * the form value.
 */
export function DraftNumberInput({
  value,
  onNumberChange,
  onBlur,
  ...rest
}: DraftNumberInputProps) {
  const [draft, setDraft] = useState<number | string | null>(null);

  return (
    <NumberInput
      {...rest}
      value={draft ?? value ?? ""}
      onChange={(next) => {
        setDraft(next);
        onNumberChange(toNumber(next));
      }}
      onBlur={(event) => {
        setDraft(null);
        onBlur?.(event);
      }}
    />
  );
}

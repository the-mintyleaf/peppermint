"use client";

import { Select, Stack, Textarea } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import {
  AVAILABILITY_OPTIONS,
  statusRequiresNote,
} from "../../institutions.constants";
import type { AvailabilityStatus } from "../../institutions.types";
import type { AvailabilityFieldsProps } from "./AvailabilityFields.types";

/**
 * Status + note as ONE control. The note is required (and its description says so)
 * whenever the status is not `active` — the Zod schema enforces the same via
 * `refineAvailabilityNote`, mirroring `INSTITUTIONS_AVAILABILITY_NOTE_REQUIRED`.
 * Reads the ambient form instance, so it works inside any `FormWrapper` whose
 * values carry `availability_status` / `availability_note`.
 */
export function AvailabilityFields({
  disabled,
  label = "Availability",
}: AvailabilityFieldsProps) {
  const { form } = useFormInstance();
  const status = form.values.availability_status as AvailabilityStatus;
  const noteRequired = statusRequiresNote(status);

  return (
    <Stack gap="xs">
      <Select
        label={label}
        data={AVAILABILITY_OPTIONS}
        required
        allowDeselect={false}
        disabled={disabled}
        {...form.getInputProps("availability_status")}
      />
      <Textarea
        label="Availability note"
        placeholder="Paused until the provider confirms its 2027 intakes."
        description={
          noteRequired
            ? "Required — explain why this isn't fully available."
            : "Optional context on availability."
        }
        required={noteRequired}
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("availability_note")}
      />
    </Stack>
  );
}

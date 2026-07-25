"use client";

import { DateInput, Group, Select, Stack, TextInput } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { OFFER_TYPE_OPTIONS } from "../../offers.labels";
import type { OfferType } from "../../offers.types";

/**
 * The offer's own particulars, shared by create and edit (identical field
 * names). Dates are written Gregorian `YYYY-MM-DD` (§3) — `DateInput` with a
 * `YYYY-MM-DD` value format keeps the form value a bare date string.
 */
interface BasicsValues extends Record<string, unknown> {
  offer_type: OfferType;
  offer_reference: string;
  issue_date: string | null;
  response_deadline: string | null;
}

export function OfferBasicsFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<BasicsValues>();

  return (
    <Stack gap="md">
      <Group grow align="flex-start">
        <Select
          label="Offer type"
          data={OFFER_TYPE_OPTIONS}
          allowDeselect={false}
          disabled={isLoading}
          {...form.getInputProps("offer_type")}
          onChange={(value) =>
            form.setFieldValue(
              "offer_type",
              (value ?? "conditional") as OfferType,
            )
          }
        />
        <TextInput
          label="Offer reference"
          description="The institution's own letter number"
          placeholder="OFR-2027-0042"
          disabled={isLoading}
          {...form.getInputProps("offer_reference")}
        />
      </Group>
      <Group grow align="flex-start">
        <DateInput
          label="Issue date"
          valueFormat="YYYY-MM-DD"
          clearable
          disabled={isLoading}
          {...form.getInputProps("issue_date")}
        />
        <DateInput
          label="Response deadline"
          valueFormat="YYYY-MM-DD"
          clearable
          disabled={isLoading}
          {...form.getInputProps("response_deadline")}
        />
      </Group>
    </Stack>
  );
}

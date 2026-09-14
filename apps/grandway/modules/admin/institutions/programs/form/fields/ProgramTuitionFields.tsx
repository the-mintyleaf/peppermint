"use client";

import {
  Grid,
  Group,
  Select,
  Switch,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { FEE_PERIOD_OPTIONS } from "../../../institutions.constants";
import type { ProgramFormValues } from "../../../institutions.types";
import type { ProgramFieldsProps } from "../ProgramForm.types";

export function ProgramTuitionFields({ disabled }: ProgramFieldsProps) {
  const { form } = useFormInstance<ProgramFormValues>();

  return (
    <>
      {/* The money pair reads as one value, so it gets its own row — the amount
          wide, the three-character code only as wide as it needs to be. */}
      <Grid gap="md" align="flex-start">
        <Grid.Col span={{ base: 12, xs: 8 }}>
          <TextInput
            label="Tuition amount"
            description="A currency and period are required with an amount."
            placeholder="49824.00"
            inputMode="decimal"
            disabled={disabled}
            {...form.getInputProps("tuition_amount")}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 4 }}>
          <TextInput
            label="Currency"
            description="Three-letter ISO code."
            placeholder="AUD"
            maxLength={3}
            disabled={disabled}
            {...form.getInputProps("tuition_currency")}
            onChange={(e) =>
              form.setFieldValue(
                "tuition_currency",
                e.currentTarget.value.toUpperCase(),
              )
            }
          />
        </Grid.Col>
      </Grid>
      <Group grow align="flex-end">
        <Select
          label="Fee period"
          description="How often the amount above is charged."
          placeholder="Pick a fee period"
          data={FEE_PERIOD_OPTIONS}
          clearable
          disabled={disabled}
          value={form.values.tuition_fee_period || null}
          error={form.errors.tuition_fee_period}
          onChange={(value) =>
            form.setFieldValue(
              "tuition_fee_period",
              (value as ProgramFormValues["tuition_fee_period"]) ?? "",
            )
          }
        />
        <Switch
          label="Indicative only"
          description="The amount is a guide, not a confirmed fee."
          disabled={disabled}
          checked={form.values.tuition_is_indicative}
          onChange={(e) =>
            form.setFieldValue("tuition_is_indicative", e.currentTarget.checked)
          }
        />
      </Group>
      <Textarea
        label="Tuition notes"
        placeholder="Tuition covers coursework only — SSAF and OSHC are billed separately."
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("tuition_notes")}
      />
    </>
  );
}

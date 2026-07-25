"use client";

import { Group, Select, Switch, Textarea, TextInput } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { FEE_PERIOD_OPTIONS } from "../../../institutions.constants";
import type { ProgramFormValues } from "../../../institutions.types";
import type { ProgramFieldsProps } from "../ProgramForm.types";

export function ProgramTuitionFields({ disabled }: ProgramFieldsProps) {
  const { form } = useFormInstance<ProgramFormValues>();

  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Tuition amount"
          description="A currency and period are required with an amount."
          placeholder="49824.00"
          inputMode="decimal"
          disabled={disabled}
          {...form.getInputProps("tuition_amount")}
        />
        <TextInput
          label="Currency"
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
        <Select
          label="Fee period"
          placeholder="—"
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
      </Group>
      <Switch
        label="Indicative only"
        description="The amount is a guide, not a confirmed fee."
        disabled={disabled}
        checked={form.values.tuition_is_indicative}
        onChange={(e) =>
          form.setFieldValue("tuition_is_indicative", e.currentTarget.checked)
        }
      />
      <Textarea
        label="Tuition notes"
        autosize
        minRows={2}
        disabled={disabled}
        {...form.getInputProps("tuition_notes")}
      />
    </>
  );
}

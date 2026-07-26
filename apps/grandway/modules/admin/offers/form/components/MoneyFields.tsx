"use client";

import {
  DateInput,
  Group,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { FormSection } from "@/components/FormSection";
import { TUITION_FEE_PERIOD_OPTIONS } from "../../offers.labels";
import type { TuitionFeePeriod } from "../../offers.types";

/**
 * The nine money fields, shared by the create and edit forms (identical field
 * names). Amounts are decimal STRINGS kept as text — never `NumberInput` —
 * because the backend stores them exactly as quoted and a JS number risks
 * precision loss (§3). Each amount requires its own currency; that completeness
 * rule is enforced in each form's Zod schema (`OFFERS_AMOUNT_INCOMPLETE`).
 */
interface MoneyValues extends Record<string, unknown> {
  tuition_amount: string;
  tuition_currency: string;
  tuition_fee_period: TuitionFeePeriod | "";
  scholarship_amount: string;
  scholarship_currency: string;
  scholarship_notes: string;
  deposit_amount: string;
  deposit_currency: string;
  deposit_due_date: string | null;
  deposit_notes: string;
}

export function MoneyFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<MoneyValues>();

  return (
    <Stack gap="md">
      <FormSection title="Tuition">
        <Group grow align="flex-start">
          <TextInput
            label="Amount"
            placeholder="49824.00"
            inputMode="decimal"
            disabled={isLoading}
            {...form.getInputProps("tuition_amount")}
          />
          <TextInput
            label="Currency"
            placeholder="AUD"
            maxLength={3}
            w={110}
            disabled={isLoading}
            {...form.getInputProps("tuition_currency")}
          />
          <Select
            label="Fee period"
            placeholder="Not specified"
            data={TUITION_FEE_PERIOD_OPTIONS}
            clearable
            disabled={isLoading}
            {...form.getInputProps("tuition_fee_period")}
            onChange={(value) =>
              form.setFieldValue("tuition_fee_period", value ?? "")
            }
          />
        </Group>
      </FormSection>

      <FormSection title="Scholarship">
        <Group grow align="flex-start">
          <TextInput
            label="Amount"
            placeholder="10000.00"
            inputMode="decimal"
            disabled={isLoading}
            {...form.getInputProps("scholarship_amount")}
          />
          <TextInput
            label="Currency"
            placeholder="AUD"
            maxLength={3}
            w={110}
            disabled={isLoading}
            {...form.getInputProps("scholarship_currency")}
          />
        </Group>
        <Textarea
          label="Scholarship notes"
          placeholder="Merit scholarship, renewable on results…"
          autosize
          minRows={2}
          disabled={isLoading}
          {...form.getInputProps("scholarship_notes")}
        />
      </FormSection>

      <FormSection title="Deposit">
        <Group grow align="flex-start">
          <TextInput
            label="Amount"
            placeholder="5000.00"
            inputMode="decimal"
            disabled={isLoading}
            {...form.getInputProps("deposit_amount")}
          />
          <TextInput
            label="Currency"
            placeholder="AUD"
            maxLength={3}
            w={110}
            disabled={isLoading}
            {...form.getInputProps("deposit_currency")}
          />
          <DateInput
            label="Due date"
            valueFormat="YYYY-MM-DD"
            clearable
            disabled={isLoading}
            {...form.getInputProps("deposit_due_date")}
          />
        </Group>
        <Textarea
          label="Deposit notes"
          placeholder="Non-refundable, secures the place…"
          autosize
          minRows={2}
          disabled={isLoading}
          {...form.getInputProps("deposit_notes")}
        />
      </FormSection>
    </Stack>
  );
}

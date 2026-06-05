"use client";

import { Stack, TextInput, Select, Button, NumberInput } from "@zetsel/ui";
import { useForm } from "@zetsel/ui";
import type { DocumentFormProps, BankStatementContent } from "../../documents.types";

const BANK_OPTIONS = [
  { value: "mizuho", label: "Mizuho Bank" },
  { value: "smbc", label: "SMBC" },
  { value: "mufg", label: "MUFG Bank" },
];

export function BankStatementForm({ onSubmit, isLoading }: DocumentFormProps) {
  const form = useForm<BankStatementContent>({
    initialValues: {
      bankKey: "mizuho",
      accountHolder: "",
      accountNumber: "",
      periodStart: "",
      periodEnd: "",
      openingBalance: 0,
      closingBalance: 0,
      transactions: [],
    },
    validate: {
      accountHolder: (v) => (!v ? "Account holder is required" : null),
      accountNumber: (v) => (!v ? "Account number is required" : null),
    },
    onSubmit: (values) => onSubmit(values),
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md">
        <Select
          label="Bank"
          data={BANK_OPTIONS}
          {...form.getInputProps("bankKey")}
          disabled={isLoading}
        />
        <TextInput
          label="Account Holder"
          placeholder="Account holder name"
          {...form.getInputProps("accountHolder")}
          disabled={isLoading}
          required
        />
        <TextInput
          label="Account Number"
          placeholder="1234567890"
          {...form.getInputProps("accountNumber")}
          disabled={isLoading}
          required
        />
        <TextInput
          label="Period Start"
          type="date"
          {...form.getInputProps("periodStart")}
          disabled={isLoading}
        />
        <TextInput
          label="Period End"
          type="date"
          {...form.getInputProps("periodEnd")}
          disabled={isLoading}
        />
        <NumberInput
          label="Opening Balance"
          {...form.getInputProps("openingBalance")}
          disabled={isLoading}
        />
        <NumberInput
          label="Closing Balance"
          {...form.getInputProps("closingBalance")}
          disabled={isLoading}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create Bank Statement
        </Button>
      </Stack>
    </form>
  );
}

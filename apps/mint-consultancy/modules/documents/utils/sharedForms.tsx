"use client";

import { Stack, TextInput, Button, Textarea, Text } from "@zetsel/ui";
import { useForm } from "@zetsel/ui";
import type { DocumentFormProps } from "../documents.types";

export function createWodaForm(defaultValues: Record<string, unknown> = {}) {
  return function WodaVariantForm({ onSubmit, isLoading }: DocumentFormProps) {
    const form = useForm({
      initialValues: {
        wodadoc_refno: "",
        wodadoc_date: new Date().toISOString().split("T")[0],
        applicant_name: "",
        applicant_honorific: "Mr.",
        applicant_gender: "Male",
        spokesperson_name: "",
        spokesperson_post: "",
        spokesperson_contact: "",
        ...defaultValues,
      },
      onSubmit: (values) => onSubmit(values as never),
    });

    const extraFields = Object.keys(defaultValues);

    return (
      <form onSubmit={form.onSubmit}>
        <Stack gap="md">
          <TextInput label="Ref. No." {...form.getInputProps("wodadoc_refno")} disabled={isLoading} />
          <TextInput label="Date" type="date" {...form.getInputProps("wodadoc_date")} disabled={isLoading} />
          <TextInput label="Applicant Name" {...form.getInputProps("applicant_name")} required disabled={isLoading} />
          <TextInput label="Honorific" {...form.getInputProps("applicant_honorific")} disabled={isLoading} />
          <TextInput label="Spokesperson Name" {...form.getInputProps("spokesperson_name")} disabled={isLoading} />
          <TextInput label="Spokesperson Post" {...form.getInputProps("spokesperson_post")} disabled={isLoading} />
          {extraFields.map((key) => (
            <TextInput
              key={key}
              label={key.replace(/_/g, " ")}
              {...form.getInputProps(key)}
              disabled={isLoading}
            />
          ))}
          <Button type="submit" loading={isLoading} fullWidth>
            Create Document
          </Button>
        </Stack>
      </form>
    );
  };
}

export function createBankForm(defaultValues: Record<string, unknown> = {}) {
  return function BankVariantForm({ onSubmit, isLoading }: DocumentFormProps) {
    const form = useForm({
      initialValues: {
        statement_account_holder: "",
        statement_account_no: "",
        statement_account_address: "",
        statement_start_date: "",
        statement_end_date: new Date().toISOString().split("T")[0],
        statement_interest: "5",
        statement_opening_balance: 0,
        statement_closing_balance: 0,
        transactions: [],
        details: {},
        ...defaultValues,
      },
      onSubmit: (values) => onSubmit(values as never),
    });

    return (
      <form onSubmit={form.onSubmit}>
        <Stack gap="md">
          <TextInput
            label="Account Holder"
            {...form.getInputProps("statement_account_holder")}
            required
            disabled={isLoading}
          />
          <TextInput
            label="Account Number"
            {...form.getInputProps("statement_account_no")}
            required
            disabled={isLoading}
          />
          <Textarea
            label="Account Address"
            {...form.getInputProps("statement_account_address")}
            disabled={isLoading}
          />
          <TextInput
            label="Period Start"
            {...form.getInputProps("statement_start_date")}
            disabled={isLoading}
          />
          <TextInput
            label="Period End"
            type="date"
            {...form.getInputProps("statement_end_date")}
            disabled={isLoading}
          />
          <Button type="submit" loading={isLoading} fullWidth>
            Create Document
          </Button>
        </Stack>
      </form>
    );
  };
}

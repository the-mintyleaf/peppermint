"use client";

import {
  Button,
  DateInput,
  Divider,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  useForm,
} from "@peppermint/ui";
import type {
  BankCertificateContent,
  DocumentFormProps,
} from "../../documents.types";
import { currencyInWords } from "../../utils/numberToWords";

export function BankCertificateForm({
  initialContent,
  onSubmit,
  isLoading,
}: DocumentFormProps) {
  const existing = (initialContent ?? {}) as BankCertificateContent;

  const form = useForm<BankCertificateContent>({
    mode: "controlled",
    initialValues: {
      statement_account_holder: "",
      statement_account_no: "",
      statement_account_address: "",
      statement_account_type: "",
      statement_ref_no: "",
      statement_end_date: "",
      statement_interest: "",
      statement_spokesperson: "",
      statement_spokesperson_post: "",
      // preserve every passthrough key (bank, bank_template, details, headerProps, …)
      ...existing,
      statement_total_balance: Number(existing.statement_total_balance ?? 0),
      statement_usdrate: Number(existing.statement_usdrate ?? 0),
    },
    validate: {
      statement_account_holder: (v) =>
        !v ? "Account holder is required" : null,
      statement_account_no: (v) => (!v ? "Account number is required" : null),
    },
  });

  const values = form.getValues();
  const balance = Number(values.statement_total_balance ?? 0) || 0;
  const usdRate = Number(values.statement_usdrate ?? 0) || 0;
  const usdAmount = usdRate > 0 ? balance / usdRate : 0;

  return (
    <form onSubmit={form.onSubmit((v) => onSubmit(v as never))}>
      <Stack gap="md" p="md">
        <Text fw={600} size="sm">
          Account
        </Text>
        <TextInput
          label="Account holder"
          placeholder="Ram Bahadur Shrestha"
          required
          {...form.getInputProps("statement_account_holder")}
          disabled={isLoading}
        />
        <TextInput
          label="Account number"
          placeholder="0123456789012"
          required
          {...form.getInputProps("statement_account_no")}
          disabled={isLoading}
        />
        <Textarea
          label="Account holder address"
          placeholder="Birendranagar-5, Surkhet"
          autosize
          minRows={1}
          {...form.getInputProps("statement_account_address")}
          disabled={isLoading}
        />
        <Group grow>
          <TextInput
            label="Account type"
            placeholder="Savings"
            {...form.getInputProps("statement_account_type")}
            disabled={isLoading}
          />
          <TextInput
            label="Reference no."
            placeholder="079/80-1234"
            {...form.getInputProps("statement_ref_no")}
            disabled={isLoading}
          />
        </Group>
        <Group grow>
          <DateInput
            label="Certificate date"
            description="Date the balance is certified as of."
            valueFormat="YYYY-MM-DD"
            clearable
            {...form.getInputProps("statement_end_date")}
            disabled={isLoading}
          />
          <NumberInput
            label="Interest rate (%)"
            placeholder="6.5"
            hideControls
            decimalScale={2}
            min={0}
            {...form.getInputProps("statement_interest")}
            disabled={isLoading}
          />
        </Group>

        <Divider />
        <Text fw={600} size="sm">
          Balance
        </Text>
        <Group grow>
          <NumberInput
            label="Total balance (NPR)"
            description="Certified balance; converted to words below."
            placeholder="500000"
            hideControls
            decimalScale={2}
            thousandSeparator=","
            min={0}
            {...form.getInputProps("statement_total_balance")}
            disabled={isLoading}
          />
          <NumberInput
            label="Exchange rate (NPR per 1 US$)"
            description="Used for the USD equivalent below."
            placeholder="133.50"
            hideControls
            decimalScale={2}
            min={0}
            {...form.getInputProps("statement_usdrate")}
            disabled={isLoading}
          />
        </Group>
        <Paper withBorder p="xs" bg="var(--mantine-color-gray-0)">
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              In words: <b>{currencyInWords(balance)}</b>
            </Text>
            <Text size="xs" c="dimmed">
              USD equivalent:{" "}
              <b>
                {usdAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </b>
            </Text>
          </Stack>
        </Paper>

        <Divider />
        <Text fw={600} size="sm">
          Signatory
        </Text>
        <Group grow>
          <TextInput
            label="Spokesperson name"
            placeholder="Hari Prasad Sharma"
            {...form.getInputProps("statement_spokesperson")}
            disabled={isLoading}
          />
          <TextInput
            label="Spokesperson post / designation"
            placeholder="Branch Manager"
            {...form.getInputProps("statement_spokesperson_post")}
            disabled={isLoading}
          />
        </Group>

        <Button type="submit" loading={isLoading} fullWidth>
          Save Certificate
        </Button>
      </Stack>
    </form>
  );
}

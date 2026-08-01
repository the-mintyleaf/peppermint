"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  DateInput,
  Group,
  NumberInput,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  useForm,
} from "@peppermint/ui";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { PercentIcon } from "@phosphor-icons/react/dist/csr/Percent";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { TableIcon } from "@phosphor-icons/react/dist/csr/Table";
import { FormSection } from "@/components/FormSection";
import type {
  BankStatementContent,
  DocumentFormProps,
} from "../../documents.types";
import { computeBankStatement } from "../../utils/bankStatement";
import { TransactionGrid } from "./components/TransactionGrid";

type StatementTab = "details" | "transactions";

export function BankStatementForm({
  initialContent,
  onSubmit,
  isLoading,
}: DocumentFormProps) {
  const existing = (initialContent ?? {}) as BankStatementContent;

  const [tab, setTab] = useState<StatementTab>("details");

  const form = useForm<BankStatementContent>({
    mode: "controlled",
    initialValues: {
      statement_account_holder: "",
      statement_account_no: "",
      statement_account_address: "",
      statement_account_type: "",
      statement_ref_no: "",
      statement_start_date: "",
      statement_end_date: "",
      statement_opening_date: "",
      statement_interest: "",
      statement_tax: "",
      // preserve every passthrough key (bank, bank_template, details, headerProps, spokesperson, …)
      ...existing,
      statement_opening_balance: Number(
        existing.statement_opening_balance ?? 0,
      ),
      transactions: Array.isArray(existing.transactions)
        ? existing.transactions
        : [],
    },
    validate: {
      statement_account_holder: (v) =>
        !v ? "Account holder is required" : null,
      statement_account_no: (v) => (!v ? "Account number is required" : null),
    },
  });

  // Derived preview — shares the exact computation used by the print template.
  const computed = computeBankStatement(form.getValues());
  const transactions = form.getValues().transactions ?? [];

  // Default the date so a forgotten date never renders "Invalid Date" on the statement.
  // Interest/tax rows land at the period END; the opening row seeds the interest
  // checkpoint, so it lands at the period START — otherwise a same-day opening and
  // interest row make days = 0 and interest computes to 0.
  const fallbackDate = () =>
    form.getValues().statement_end_date ||
    new Date().toISOString().split("T")[0];

  const openingDate = () =>
    form.getValues().statement_start_date ||
    form.getValues().statement_end_date ||
    new Date().toISOString().split("T")[0];

  const addTransaction = () => {
    const isOpening = (form.getValues().transactions ?? []).length === 0;
    form.insertListItem("transactions", {
      date: isOpening ? openingDate() : fallbackDate(),
      description: "",
      debit: 0,
      credit: 0,
      type: "normal",
    });
  };

  // Interest is always followed by the tax deducted on it, so the pair is inserted
  // together. Neither row stores an amount — computeBankStatement derives both from the
  // rows above (at each row's own rate), so they re-sync when those rows change.
  // Disabled until an opening row exists.
  const addInterestAndTax = () => {
    const date = fallbackDate();
    form.insertListItem("transactions", {
      date,
      description: "Interest Deposit",
      debit: 0,
      credit: 0,
      type: "interest",
      interest_rate: Number(form.getValues().statement_interest) || 0,
    });
    form.insertListItem("transactions", {
      date,
      description: "Tax Deduction",
      debit: 0,
      credit: 0,
      type: "tax",
      tax_rate: Number(form.getValues().statement_tax) || 0,
    });
  };

  // The required fields all live on Details, so a failed submit from the sheet must
  // surface them rather than fail silently behind the tab.
  const handleSubmit = form.onSubmit(
    (values) => onSubmit(values as never),
    () => setTab("details"),
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md" p="md">
        <Tabs
          value={tab}
          onChange={(value) => setTab((value as StatementTab) ?? "details")}
          keepMounted={false}
        >
          <Tabs.List>
            <Tabs.Tab
              value="details"
              leftSection={<IdentificationCardIcon size={16} />}
            >
              Account details
            </Tabs.Tab>
            <Tabs.Tab
              value="transactions"
              leftSection={<TableIcon size={16} />}
              rightSection={
                transactions.length > 0 ? (
                  <Badge size="xs" variant="light" circle>
                    {transactions.length}
                  </Badge>
                ) : null
              }
            >
              Transactions
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="details" pt="md">
            <Stack gap="md">
              <FormSection title="Account">
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
              </FormSection>

              <FormSection title="Period & Opening">
                <Group grow>
                  <DateInput
                    label="Statement from"
                    description="First day of the statement period."
                    valueFormat="YYYY-MM-DD"
                    clearable
                    {...form.getInputProps("statement_start_date")}
                    disabled={isLoading}
                  />
                  <DateInput
                    label="Statement to"
                    description="Last day of the statement period."
                    valueFormat="YYYY-MM-DD"
                    clearable
                    {...form.getInputProps("statement_end_date")}
                    disabled={isLoading}
                  />
                </Group>
                <Group grow>
                  <DateInput
                    label="Opening balance date"
                    valueFormat="YYYY-MM-DD"
                    value={computed.statements_opening_date || null}
                    description="Synced from the first transaction."
                    disabled
                    readOnly
                  />
                  <NumberInput
                    label="Opening balance"
                    hideControls
                    decimalScale={2}
                    thousandSeparator=","
                    value={computed.statements_opening_bal}
                    description="Synced from the first transaction."
                    disabled
                    readOnly
                  />
                </Group>
                <Group grow>
                  <NumberInput
                    label="Interest rate (%)"
                    description="Default rate for inserted Interest rows."
                    placeholder="6.5"
                    hideControls
                    decimalScale={2}
                    min={0}
                    {...form.getInputProps("statement_interest")}
                    disabled={isLoading}
                  />
                  <NumberInput
                    label="Tax rate (%)"
                    description="Default rate for inserted Tax rows."
                    placeholder="5"
                    hideControls
                    decimalScale={2}
                    min={0}
                    {...form.getInputProps("statement_tax")}
                    disabled={isLoading}
                  />
                </Group>
              </FormSection>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="transactions" pt="md">
            <Stack gap="sm">
              <Group justify="space-between" align="center" gap="sm">
                <Text size="xs" c="dimmed">
                  Row 1 is the opening balance. Interest &amp; Tax rows are
                  inserted as a pair, compute themselves from the rows above at
                  each row&rsquo;s own rate, and re-sync when those rows change.
                </Text>
                <Group gap="xs" wrap="nowrap">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<PlusCircleIcon size={14} />}
                    onClick={addTransaction}
                    disabled={isLoading}
                  >
                    Add row
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="teal"
                    leftSection={<PercentIcon size={14} />}
                    onClick={addInterestAndTax}
                    disabled={isLoading || transactions.length === 0}
                  >
                    Interest &amp; Tax
                  </Button>
                </Group>
              </Group>

              <TransactionGrid
                form={form}
                computed={computed}
                onAddRow={addTransaction}
                isLoading={isLoading}
              />

              <Text size="xs" c="dimmed">
                Enter moves down a column · Shift+Enter moves up · Enter on the
                last row adds another.
              </Text>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Button type="submit" loading={isLoading} fullWidth>
          Save Statement
        </Button>
      </Stack>
    </form>
  );
}

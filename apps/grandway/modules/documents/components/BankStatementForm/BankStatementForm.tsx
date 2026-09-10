"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Box,
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
  BankTransaction,
  DocumentFormProps,
} from "../../documents.types";
import { computeBankStatement } from "../../utils/bankStatement";
import { withOpeningRow } from "./BankStatementForm.utils";
import { TransactionGrid } from "./components/TransactionGrid";
import {
  TransactionImport,
  type TransactionImportMode,
} from "./components/TransactionImport";

type StatementTab = "details" | "transactions";

export function BankStatementForm({
  initialContent,
  onSubmit,
  isLoading,
  onModalSizeChange,
}: DocumentFormProps) {
  const existing = (initialContent ?? {}) as BankStatementContent;

  const [tab, setTab] = useState<StatementTab>("details");

  // Account details is a two-column form; the transactions sheet is a spreadsheet and
  // keeps its full 72rem. The host modal follows the tab rather than sitting at one
  // compromise width.
  useEffect(() => {
    onModalSizeChange?.(tab === "transactions" ? "72rem" : "lg");
  }, [tab, onModalSizeChange]);

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
      // Row 1 is the opening balance — always present, never typed by hand.
      transactions: withOpeningRow(existing),
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

  // A new row carries the last row's date — entries are worked through in order, so
  // continuing from where the sheet left off beats jumping to the period end. Falls back
  // to the period end, then today, so a row never renders "Invalid Date" on the statement.
  const nextRowDate = () => {
    const values = form.getValues();
    const rows = values.transactions ?? [];
    return (
      rows[rows.length - 1]?.date ||
      values.statement_end_date ||
      new Date().toISOString().split("T")[0]
    );
  };

  const addTransaction = () => {
    form.insertListItem("transactions", {
      date: nextRowDate(),
      description: "",
      debit: 0,
      credit: 0,
      type: "normal",
    });
  };

  // Interest is always followed by the tax deducted on it, so the pair is inserted
  // together. Neither row stores an amount — computeBankStatement derives both from the
  // rows above (at each row's own rate), so they re-sync when those rows change.
  const addInterestAndTax = () => {
    const date = nextRowDate();
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

  /**
   * Applies an imported sheet.
   *
   * `replace` rebuilds the sheet from the file and runs it back through `withOpeningRow`,
   * so row 1 is normalised to the opening entry however the file was written. `append`
   * leaves the existing sheet — opening row included — untouched and adds the file below
   * it, where every row is an ordinary entry.
   */
  const applyImport = (
    rows: BankTransaction[],
    mode: TransactionImportMode,
  ) => {
    const values = form.getValues();
    const next =
      mode === "replace"
        ? withOpeningRow({ ...values, transactions: rows })
        : [...(values.transactions ?? []), ...rows];
    form.setFieldValue("transactions", next);
  };

  // The required fields all live on Details, so a failed submit from the sheet must
  // surface them rather than fail silently behind the tab.
  const handleSubmit = form.onSubmit(
    (values) => onSubmit(values as never),
    () => setTab("details"),
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={0}>
        <Tabs
          value={tab}
          onChange={(value) => setTab((value as StatementTab) ?? "details")}
          keepMounted={false}
        >
          <Tabs.List px="md">
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

          <Tabs.Panel value="details" px="md" pt="md">
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

          <Tabs.Panel value="transactions" px="md" pt="md">
            <Stack gap="sm">
              <Group justify="space-between" align="center" gap="sm">
                <Text size="xs" c="dimmed">
                  Row 1 is the opening balance — its description is fixed; set
                  its date and amount. Interest &amp; Tax rows are inserted as a
                  pair, compute themselves from the rows above at each
                  row&rsquo;s own rate, and re-sync when those rows change.
                  Working in Excel instead? Download the sample, fill it in, and
                  import it back.
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
                    disabled={isLoading}
                  >
                    Interest &amp; Tax
                  </Button>
                  <TransactionImport
                    onImport={applyImport}
                    existingRowCount={transactions.length}
                    isLoading={isLoading}
                  />
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

        <Box p="md">
          <Button type="submit" loading={isLoading} fullWidth>
            Save Statement
          </Button>
        </Box>
      </Stack>
    </form>
  );
}

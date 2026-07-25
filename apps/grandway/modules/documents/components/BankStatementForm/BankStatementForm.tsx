"use client";

import {
  ActionIcon,
  Badge,
  Button,
  DateInput,
  Divider,
  Group,
  NumberInput,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  useForm,
} from "@peppermint/ui";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/csr/PlusCircle";
import { MinusCircleIcon } from "@phosphor-icons/react/dist/csr/MinusCircle";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { ArrowDownIcon } from "@phosphor-icons/react/dist/csr/ArrowDown";
import { PercentIcon } from "@phosphor-icons/react/dist/csr/Percent";
import { ReceiptIcon } from "@phosphor-icons/react/dist/csr/Receipt";
import type {
  BankStatementContent,
  DocumentFormProps,
} from "../../documents.types";
import { computeBankStatement } from "../../utils/bankStatement";

const money = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function BankStatementForm({
  initialContent,
  onSubmit,
  isLoading,
}: DocumentFormProps) {
  const existing = (initialContent ?? {}) as BankStatementContent;

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

  // Interest & tax rows carry no stored amount — computeBankStatement derives them from the
  // rows above, so they re-sync when those rows change. Disabled until an opening row exists.
  const addInterest = () => {
    form.insertListItem("transactions", {
      date: fallbackDate(),
      description: "Interest Deposit",
      debit: 0,
      credit: 0,
      type: "interest",
    });
  };

  const addTax = () => {
    form.insertListItem("transactions", {
      date: fallbackDate(),
      description: "Tax Deduction",
      debit: 0,
      credit: 0,
      type: "tax",
      tax_rate: Number(form.getValues().statement_tax) || 0,
    });
  };

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values as never))}>
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

        <Divider />
        <Text fw={600} size="sm">
          Period &amp; Opening
        </Text>
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
            description="Applied to inserted Interest rows."
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

        <Divider />
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={600} size="sm">
              Transactions
            </Text>
            <Text size="xs" c="dimmed">
              First row is the opening balance. Insert Interest / Tax rows
              anywhere — each is computed from the rows above it and re-syncs
              automatically.
            </Text>
          </div>
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              leftSection={<PlusCircleIcon size={14} />}
              onClick={addTransaction}
              disabled={isLoading}
            >
              Add transaction
            </Button>
            <Button
              size="xs"
              variant="light"
              color="teal"
              leftSection={<PercentIcon size={14} />}
              onClick={addInterest}
              disabled={isLoading || transactions.length === 0}
            >
              Interest Deposit
            </Button>
            <Button
              size="xs"
              variant="light"
              color="orange"
              leftSection={<ReceiptIcon size={14} />}
              onClick={addTax}
              disabled={isLoading || transactions.length === 0}
            >
              Tax Deduction
            </Button>
          </Group>
        </Group>

        <Table.ScrollContainer minWidth={560}>
          <Table
            withTableBorder
            verticalSpacing={4}
            horizontalSpacing={6}
            layout="fixed"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={130}>Date</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th w={110}>Debit</Table.Th>
                <Table.Th w={110}>Credit</Table.Th>
                <Table.Th w={96} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {transactions.map((t, index) => {
                const type = t.type ?? "normal";
                const isOpening = index === 0;
                // workedStatements excludes the opening row, so row `index` maps to `index - 1`.
                const derived =
                  index === 0
                    ? undefined
                    : computed.workedStatements[index - 1];
                const isInterest = type === "interest";
                const isTax = type === "tax";

                return (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <DateInput
                        valueFormat="YYYY-MM-DD"
                        size="xs"
                        {...form.getInputProps(`transactions.${index}.date`)}
                      />
                    </Table.Td>
                    <Table.Td>
                      {isInterest ? (
                        <Group gap={6} wrap="nowrap">
                          <Badge size="xs" variant="light" color="teal">
                            Interest
                          </Badge>
                          <Text size="xs">Interest Deposit</Text>
                        </Group>
                      ) : isTax ? (
                        <Group gap={6} wrap="nowrap">
                          <Badge size="xs" variant="light" color="orange">
                            Tax
                          </Badge>
                          <Text size="xs">Tax Deduction</Text>
                          <NumberInput
                            size="xs"
                            hideControls
                            suffix="%"
                            min={0}
                            decimalScale={2}
                            w={72}
                            aria-label={`Tax rate for row ${index + 1}`}
                            {...form.getInputProps(
                              `transactions.${index}.tax_rate`,
                            )}
                          />
                        </Group>
                      ) : (
                        <TextInput
                          size="xs"
                          placeholder={
                            isOpening ? "Opening Balance" : "Description"
                          }
                          {...form.getInputProps(
                            `transactions.${index}.description`,
                          )}
                        />
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isInterest || isTax ? (
                        <NumberInput
                          size="xs"
                          hideControls
                          decimalScale={2}
                          thousandSeparator=","
                          value={derived ? derived.debit : ""}
                          readOnly
                          disabled
                        />
                      ) : (
                        <NumberInput
                          size="xs"
                          hideControls
                          min={0}
                          decimalScale={2}
                          thousandSeparator=","
                          placeholder="0.00"
                          disabled={isOpening}
                          {...form.getInputProps(`transactions.${index}.debit`)}
                        />
                      )}
                    </Table.Td>
                    <Table.Td>
                      {isInterest || isTax ? (
                        <NumberInput
                          size="xs"
                          hideControls
                          decimalScale={2}
                          thousandSeparator=","
                          value={derived ? derived.credit : ""}
                          readOnly
                          disabled
                        />
                      ) : (
                        <NumberInput
                          size="xs"
                          hideControls
                          min={0}
                          decimalScale={2}
                          thousandSeparator=","
                          placeholder="0.00"
                          {...form.getInputProps(
                            `transactions.${index}.credit`,
                          )}
                        />
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={2} wrap="nowrap" justify="flex-end">
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          aria-label={`Move transaction ${index + 1} up`}
                          disabled={index === 0}
                          onClick={() =>
                            form.reorderListItem("transactions", {
                              from: index,
                              to: index - 1,
                            })
                          }
                        >
                          <ArrowUpIcon size={14} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          aria-label={`Move transaction ${index + 1} down`}
                          disabled={index === transactions.length - 1}
                          onClick={() =>
                            form.reorderListItem("transactions", {
                              from: index,
                              to: index + 1,
                            })
                          }
                        >
                          <ArrowDownIcon size={14} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          aria-label={`Remove transaction ${index + 1}`}
                          onClick={() =>
                            form.removeListItem("transactions", index)
                          }
                        >
                          <MinusCircleIcon size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Paper withBorder p="xs" bg="var(--mantine-color-gray-0)">
          <Group justify="space-between" gap="xl">
            <Text size="xs" c="dimmed">
              Total Debit: <b>{money(computed.statement_debit_total)}</b>
            </Text>
            <Text size="xs" c="dimmed">
              Total Credit: <b>{money(computed.statement_credit_total)}</b>
            </Text>
            <Text size="xs" c="dimmed">
              Closing Balance: <b>{money(computed.statement_balance_total)}</b>
            </Text>
          </Group>
        </Paper>

        <Button type="submit" loading={isLoading} fullWidth>
          Save Statement
        </Button>
      </Stack>
    </form>
  );
}

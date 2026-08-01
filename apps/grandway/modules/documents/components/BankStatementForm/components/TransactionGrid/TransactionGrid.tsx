"use client";

import {
  ActionIcon,
  Badge,
  Group,
  NumberInput,
  DateInput,
  Text,
  TextInput,
  VisuallyHidden,
} from "@peppermint/ui";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { ArrowDownIcon } from "@phosphor-icons/react/dist/csr/ArrowDown";
import { MinusCircleIcon } from "@phosphor-icons/react/dist/csr/MinusCircle";
import type { TransactionGridProps } from "./TransactionGrid.types";
import { useGridNavigation } from "./TransactionGrid.hooks";
import classes from "./TransactionGrid.module.css";

const money = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Spreadsheet-style transactions editor.
 *
 * Every cell is a borderless input inside a bordered grid cell, so the sheet reads like
 * Excel rather than a stack of form controls: numbered row gutter, pinned header, pinned
 * totals row, right-aligned monospace figures, and a read-only running balance column.
 *
 * Row 1 is always the opening balance (its credit seeds the balance). Interest and Tax
 * rows carry no typed amount — `computeBankStatement` derives them from the rows above,
 * so their Debit/Credit/Balance cells render as computed text, not inputs.
 */
export function TransactionGrid({
  form,
  computed,
  onAddRow,
  isLoading,
}: TransactionGridProps) {
  const transactions = form.getValues().transactions ?? [];
  const { gridRef, cellProps } = useGridNavigation(
    transactions.length,
    onAddRow,
  );

  return (
    <div className={classes.wrapper} ref={gridRef}>
      <div className={classes.scroll}>
        <table className={classes.table}>
          <colgroup>
            <col style={{ width: 38 }} />
            <col style={{ width: 124 }} />
            <col />
            <col style={{ width: 108 }} />
            <col style={{ width: 108 }} />
            <col style={{ width: 116 }} />
            <col style={{ width: 92 }} />
          </colgroup>
          <thead className={classes.head}>
            <tr>
              <th className={classes.gutter} scope="col">
                <span aria-hidden>#</span>
              </th>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              <th scope="col" className={classes.numericHead}>
                Debit
              </th>
              <th scope="col" className={classes.numericHead}>
                Credit
              </th>
              <th scope="col" className={classes.numericHead}>
                Balance
              </th>
              <th scope="col">
                <VisuallyHidden>Row actions</VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td className={classes.empty} colSpan={7}>
                  <Text size="xs" c="dimmed">
                    No rows yet — add a transaction to seed the opening balance.
                  </Text>
                </td>
              </tr>
            ) : (
              transactions.map((transaction, index) => {
                const type = transaction.type ?? "normal";
                const isOpening = index === 0;
                const isInterest = type === "interest";
                const isTax = type === "tax";
                // workedStatements excludes the opening row, so row `index` maps to `index - 1`.
                const derived = isOpening
                  ? undefined
                  : computed.workedStatements[index - 1];
                const balance = isOpening
                  ? computed.statements_opening_bal
                  : derived?.balance;

                return (
                  <tr
                    key={index}
                    className={
                      isOpening
                        ? classes.openingRow
                        : isInterest
                          ? classes.interestRow
                          : isTax
                            ? classes.taxRow
                            : undefined
                    }
                  >
                    <th className={classes.gutter} scope="row">
                      {index + 1}
                    </th>

                    <td className={classes.cell} {...cellProps(index, "date")}>
                      <DateInput
                        variant="unstyled"
                        valueFormat="YYYY-MM-DD"
                        size="xs"
                        aria-label={`Date, row ${index + 1}`}
                        disabled={isLoading}
                        {...form.getInputProps(`transactions.${index}.date`)}
                      />
                    </td>

                    <td
                      className={
                        isInterest || isTax ? classes.label : classes.cell
                      }
                      {...(isInterest || isTax
                        ? {}
                        : cellProps(index, "description"))}
                    >
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
                            variant="unstyled"
                            size="xs"
                            hideControls
                            suffix="%"
                            min={0}
                            decimalScale={2}
                            w={64}
                            aria-label={`Tax rate, row ${index + 1}`}
                            disabled={isLoading}
                            {...form.getInputProps(
                              `transactions.${index}.tax_rate`,
                            )}
                          />
                        </Group>
                      ) : (
                        <TextInput
                          variant="unstyled"
                          size="xs"
                          placeholder={
                            isOpening ? "Opening Balance" : "Description"
                          }
                          aria-label={`Description, row ${index + 1}`}
                          disabled={isLoading}
                          {...form.getInputProps(
                            `transactions.${index}.description`,
                          )}
                        />
                      )}
                    </td>

                    {isInterest || isTax ? (
                      <td className={classes.computed}>
                        {derived ? money(derived.debit) : ""}
                      </td>
                    ) : (
                      <td
                        className={`${classes.cell} ${classes.numeric}`}
                        {...cellProps(index, "debit")}
                      >
                        <NumberInput
                          variant="unstyled"
                          size="xs"
                          hideControls
                          min={0}
                          decimalScale={2}
                          thousandSeparator=","
                          placeholder="0.00"
                          aria-label={`Debit, row ${index + 1}`}
                          disabled={isLoading || isOpening}
                          {...form.getInputProps(`transactions.${index}.debit`)}
                        />
                      </td>
                    )}

                    {isInterest || isTax ? (
                      <td className={classes.computed}>
                        {derived ? money(derived.credit) : ""}
                      </td>
                    ) : (
                      <td
                        className={`${classes.cell} ${classes.numeric}`}
                        {...cellProps(index, "credit")}
                      >
                        <NumberInput
                          variant="unstyled"
                          size="xs"
                          hideControls
                          min={0}
                          decimalScale={2}
                          thousandSeparator=","
                          placeholder="0.00"
                          aria-label={`Credit, row ${index + 1}`}
                          disabled={isLoading}
                          {...form.getInputProps(
                            `transactions.${index}.credit`,
                          )}
                        />
                      </td>
                    )}

                    <td className={classes.computed}>
                      {balance === undefined ? "" : money(balance)}
                    </td>

                    <td className={classes.actions}>
                      <Group gap={2} wrap="nowrap" justify="flex-end">
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          aria-label={`Move row ${index + 1} up`}
                          disabled={isLoading || index === 0}
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
                          aria-label={`Move row ${index + 1} down`}
                          disabled={
                            isLoading || index === transactions.length - 1
                          }
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
                          aria-label={`Remove row ${index + 1}`}
                          disabled={isLoading}
                          onClick={() =>
                            form.removeListItem("transactions", index)
                          }
                        >
                          <MinusCircleIcon size={14} />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className={classes.footer}>
            <tr>
              <td className={classes.gutter} />
              <td className={classes.label} colSpan={2}>
                <Text size="xs" fw={600}>
                  Totals
                </Text>
              </td>
              <td className={classes.computed}>
                {money(computed.statement_debit_total)}
              </td>
              <td className={classes.computed}>
                {money(computed.statement_credit_total)}
              </td>
              <td className={classes.computed}>
                {money(computed.statement_balance_total)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

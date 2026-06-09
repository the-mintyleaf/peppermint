"use client";

import { useContext } from "react";
//mantine
import {
  Grid,
  GridCol,
  Group,
  Paper,
  Space,
  Stack,
  Table,
  Text,
} from "@zetsel/ui";
//pageProps
import { configPageProps } from "@/components/templates/templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { BankPaddingSpace } from "@/components/templates/bank/BankPaddingSpace";
//style
import classesTemplate from "../template.module.css";
import classes from "./statement.module.css";
import { dayjs } from "@zetsel/ui";
import { chunkArray } from "@/components/helper/chunkArray";
import { FormHandler } from "@/components/framework/FormHandler";

export function TemplateTribeniStatement() {
  // * DEFINITION
  const form = FormHandler.useForm();

  // * PRE STATES

  // * STATES

  // * CONTEXT

  const { state, dispatch } = useContext(ContextEditor.Context);
  const { details } = state;

  // * PRELOAD

  // * FUNCTIONS

  // * COMPONENTS

  const _boldTriggers = ["opening balance", "interest", "tax deduction"];
  const _textReplace: any = {
    "opening balance": "Balance Forwarded",
    interest: "Interest Deposit",
    "tax deduction": "Tax Deduction @" + form.values?.statement_interest + "%",
  };
  const _defaultTextProps = {
    size: "12px",
    lh: ".17in",
  };

  const headers = [
    {
      label: "Date",
      value: "date",
      halign: "left",
      align: "left",
      width: 80,
    },
    {
      label: "Description",
      value: "description",
      halign: "left",
      align: "left",
    },
    {
      label: "Code",
      value: "code",
      halign: "center",
      align: "center",
      width: 50,
    },
    {
      label: "Debit",
      value: "debit",
      halign: "right",
      align: "right",
      width: 80,
    },
    {
      label: "Credit",
      value: "credit",
      halign: "right",
      align: "right",
      width: 80,
    },
    {
      label: "Balance",
      value: "balance",
      halign: "right",
      align: "right",
      width: 100,
    },
  ];

  const DocumentHeader = () => {
    return (
      <>
        <Grid gutter="5px" mb="md">
          <Grid.Col span={12}>
            <Group justify="space-between">
              <Text ta="right" {..._defaultTextProps} mb=".1in"></Text>
              <Text ta="right" {..._defaultTextProps} mb=".1in">
                <b> Date</b> :{" "}
                {dayjs(form.values?.statement_end_date).add(1, "day").format("YYYY/MM/DD")}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="xl" td="underline" ta="center">
              <b>
                Statement of Account From{" "}
                {dayjs(form.values?.statement_start_date).format("YYYY/MM/DD")}{" "}
                To{" "}
                {dayjs(form.values?.statement_end_date).format("YYYY/MM/DD")}
              </b>
            </Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Group justify="space-between">
              <Text {..._defaultTextProps} fw={800}>
                Name
              </Text>
              <Text {..._defaultTextProps}>:</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={4} pl="xs">
            <Text {..._defaultTextProps}>
              {form.values?.statement_account_holder}
            </Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Group justify="flex-end">
              <Text {..._defaultTextProps} fw={800}>
                Currency
              </Text>
              <Text {..._defaultTextProps}>:</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={4} pl="xs">
            <Text {..._defaultTextProps}>NPR</Text>
          </Grid.Col>

          <Grid.Col span={2}>
            <Group justify="space-between">
              <Text {..._defaultTextProps} fw={800}>
                Address
              </Text>
              <Text {..._defaultTextProps}>:</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={10}>
            <Text {..._defaultTextProps} pl="6">
              {form.values?.statement_account_address}
            </Text>
          </Grid.Col>

          <Grid.Col span={2}>
            <Group justify="space-between">
              <Text {..._defaultTextProps} fw={800}>
                A/C No.
              </Text>
              <Text {..._defaultTextProps}>:</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={6} pl="xs">
            <Text {..._defaultTextProps}>
              {form.values?.statement_account_no}
            </Text>
          </Grid.Col>
          <Grid.Col span={2}></Grid.Col>
          <Grid.Col span={2} pl="xs"></Grid.Col>

          <Grid.Col span={2}>
            <Group justify="space-between">
              <Text {..._defaultTextProps} fw={800}>
                Interest Rate
              </Text>
              <Text {..._defaultTextProps}>:</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={1} pl="xs">
            <Text {..._defaultTextProps}>
              {form.values?.statement_interest} %
            </Text>
          </Grid.Col>

          <Grid.Col span={2}>
            <Group justify="flex-end">
              <Text {..._defaultTextProps} fw={800}>
                Tax
              </Text>
              <Text {..._defaultTextProps}>:</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={1} pl="xs">
            <Text {..._defaultTextProps}>{form.values?.statement_tax} %</Text>
          </Grid.Col>

          <Grid.Col span={2}>
            <Group justify="flex-end">
              <Text {..._defaultTextProps} fw={800}>
                A/C Type
              </Text>
              <Text {..._defaultTextProps}>:</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={4} pl="xs">
            <Text {..._defaultTextProps}>
              {form.values?.statement_account_type}
            </Text>
          </Grid.Col>
        </Grid>
      </>
    );
  };

  const TableHeader = () => (
    <tr>
      {headers.map((headerinfo: any, index: number) => (
        <th
          style={{
            textAlign: headerinfo.halign,
            fontWeight: 700,
            fontSize: 13,
          }}
          key={index}
        >
          {headerinfo.label}
        </th>
      ))}
    </tr>
  );

  const RenderTableStart = () => {
    return (
      <>
        <tr>
          <td style={{ fontVariantNumeric: "tabular-nums" }}>
            {dayjs(form.values?.statements_opening_date).format("DD-MM-YYYY")}
          </td>
          <td style={{ width: "2.6in" }}>Opening Balance</td>
          <td></td>
          <td></td>
          <td></td>
          <td
            style={{
              textAlign: "right",
            }}
          >
            {(form.values?.statements_opening_bal || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </td>
        </tr>
      </>
    );
  };

  const RenderTable = ({ data = [] }: { data: any[] }) => {
    return (
      <>
        {data.map((datainfo: any, index: number) => {
          return (
            <tr
              key={index}
              style={{
                fontWeight: _boldTriggers.includes(
                  datainfo.description.toLowerCase()
                )
                  ? 700
                  : "",
              }}
            >
              {headers.map((headerinfo: any, index: number) => {
                let _data: any;
                const isNumericCol = ["debit", "credit", "balance"].includes(headerinfo.value);
                if (headerinfo.value == "date") {
                  _data = dayjs(new Date(datainfo[headerinfo.value])).format("DD-MM-YYYY");
                } else if (["debit", "credit", "balance"].includes(headerinfo.value)) {
                  _data = datainfo[headerinfo.value] || 0;
                } else {
                  _data = datainfo[headerinfo.value];
                }

                return (
                  <td
                    style={{
                      width: headerinfo.width,
                      textAlign: headerinfo.align,
                      fontVariantNumeric:
                        headerinfo.value == "date" ? "tabular-nums" : undefined,
                    }}
                    key={index}
                  >
                    {_data instanceof Date
                      ? _data
                      : isNumericCol
                        ? typeof _data === "number" && _data !== 0
                          ? _data.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : _data === 0
                          ? ""
                          : _data
                        : _data && _data !== 0
                          ? _data
                          : ""}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </>
    );
  };

  const TableSummary = () => {
    return (
      <>
        <tr
          style={{
            marginTop: "1in",
            height: ".8in",
            border: "none",
          }}
        />

        <tr>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td colSpan={4}>
            <Text {..._defaultTextProps} fw={800} ta="center">
              Summary of Transactions
            </Text>
          </td>
        </tr>
        <tr>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td colSpan={3}>
            <Text {..._defaultTextProps} fw={800}>
              Opening Balance
            </Text>
          </td>
          <td colSpan={2}>
            <Text {..._defaultTextProps} fw={800} ta="right">
              {(form.values?.statements_opening_bal || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </td>
        </tr>
        <tr>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td colSpan={3}>
            <Text {..._defaultTextProps} fw={800}>
              Debit Amount
            </Text>
          </td>
          <td colSpan={2}>
            <Text {..._defaultTextProps} fw={800} ta="right">
              {(form.values?.statement_debit_total || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </td>
        </tr>
        <tr>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td colSpan={3}>
            <Text {..._defaultTextProps} fw={800}>
              Credit Amount
            </Text>
          </td>
          <td colSpan={2}>
            <Text {..._defaultTextProps} fw={800} ta="right">
              {(form.values?.statement_credit_total || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </td>
        </tr>
        <tr>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td colSpan={3}>
            <Text {..._defaultTextProps} fw={800}>
              Closing Balance
            </Text>
          </td>
          <td colSpan={2}>
            <Text {..._defaultTextProps} fw={800} ta="right">
              {(form.values?.statement_balance_total || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </td>
        </tr>
      </>
    );
  };

  const PageNumber = ({ page }: { page: number }) => {
    return (
      <>
        <Text
          {..._defaultTextProps}
          pos="absolute"
          w="100%"
          ta="center"
          style={{
            bottom: ".8in",
            right: "0",
          }}
        >
          Page {page} of{" "}
          {chunkedStatements[chunkedStatements.length - 1]?.length < 25
            ? chunkedStatements.length
            : chunkedStatements.length + 1}
        </Text>
      </>
    );
  };

  const chunkedStatements = chunkArray(
    (form.values?.workedStatements as any[]) ?? [],
    34 - (state?.headerProps?.height - 1) / 0.2
  );

  return (
    <>
      <Stack gap={0}>
        {chunkedStatements.map((stChunk: any, index: number) => (
          <Paper
            key={index}
            pos="relative"
            className={classesTemplate.root}
            py=".6in"
            px=".4in"
            {...configPageProps}
          >
            <BankPaddingSpace position="top" />

            <DocumentHeader />

            <table className={classes.st_table}>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {index == 0 && <RenderTableStart />}
                <RenderTable data={stChunk} />
                {index == chunkedStatements.length - 1 && stChunk.length < 25 && (
                  <TableSummary />
                )}
              </tbody>
            </table>

            <PageNumber page={index + 1} />
          <BankPaddingSpace position="bottom" />
          </Paper>
        ))}

        {chunkedStatements[chunkedStatements.length - 1]?.length >= 25 && (
          <Paper
            pos="relative"
            className={classesTemplate.root}
            py=".6in"
            px=".4in"
            {...configPageProps}
          >
            <BankPaddingSpace position="top" />

            <DocumentHeader />

            <table className={classes.st_table}>
              <tbody>
                <TableSummary />
              </tbody>
            </table>

            <PageNumber page={chunkedStatements.length + 1} />
          <BankPaddingSpace position="bottom" />
          </Paper>
        )}
      </Stack>
    </>
  );
}

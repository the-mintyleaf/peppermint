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
} from "@peppermint/ui";
//pageProps
import { configPageProps } from "@/components/templates/templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { BankPaddingSpace } from "@/components/templates/bank/BankPaddingSpace";
//style
import classesTemplate from "../template.module.css";
import classes from "./statement.module.css";
import { dayjs } from "@peppermint/ui";
import { chunkArray } from "@/components/helper/chunkArray";
import { FormHandler } from "@/components/framework/FormHandler";

export function TemplateBirendranagarStatement() {
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
    "tax deduction":
      "Tax Deduction on Interest " + form.values?.statement_interest + "%",
  };
  const _defaultTextProps = {
    size: "13px",
    lh: ".17in",
  };

  const headers = [
    {
      label: "Date",
      value: "date",
      halign: "center",
      align: "left",
    },
    {
      label: "Description",
      value: "description",
      halign: "center",
      align: "left",
    },
    {
      label: "Debit",
      value: "debit",
      halign: "center",
      align: "center",
    },
    {
      label: "Credit",
      value: "credit",
      halign: "center",
      align: "center",
    },
    {
      label: "Balance",
      value: "balance",
      halign: "center",
      align: "center",
    },
  ];

  const DocumentHeader = () => {
    return (
      <>
        <Grid gap="5px" mb="md">
          <Grid.Col span={12}>
            <Group justify="space-between">
              <Text ta="right" {..._defaultTextProps} mb=".1in">
                <b>Reference No.</b> : {form.values?.statement_ref_no_statement}
              </Text>
              <Text ta="right" {..._defaultTextProps} mb=".1in">
                <b>Print Date</b> :{" "}
                {dayjs(form.values?.statement_end_date, "YYYY/MM/DD")
                  .add(1, "day")
                  .format("YYYY-MM-DD")}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={12}>
            <Paper bg="dark.8" radius={0}>
              <Text c="gray.0" size="sm" ta="center">
                <b>Account Statement</b>
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Grid gap={0}>
              <Grid.Col span={4.5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps} fw={800}>
                    Name
                  </Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7.5}>
                <Text {..._defaultTextProps} pl={3}>
                  {form.values?.statement_account_holder}
                </Text>
              </Grid.Col>

              <Grid.Col span={4.5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps} fw={800}>
                    A.C No.
                  </Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7.5}>
                <Text {..._defaultTextProps} pl={3}>
                  {form.values?.statement_account_no}
                </Text>
              </Grid.Col>

              <Grid.Col span={4.5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps} fw={800}>
                    Interest Rate
                  </Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7.5}>
                <Text {..._defaultTextProps} pl={3}>
                  {form.values?.statement_interest} %
                </Text>
              </Grid.Col>

              <Grid.Col span={4.5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps} fw={800}>
                    Current Address
                  </Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7.5}>
                <Text {..._defaultTextProps} pl={3}>
                  {form.values?.statement_account_address}
                </Text>
              </Grid.Col>
            </Grid>
          </Grid.Col>
          <Grid.Col span={6}>
            <Grid gap={0}>
              <Grid.Col span={12}>
                <Text {..._defaultTextProps} style={{ color: "transparent" }}>
                  {form.values?.statement_account_type}
                </Text>
              </Grid.Col>

              <Grid.Col span={4.5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps} fw={800}>
                    Account Type
                  </Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7.5}>
                <Text {..._defaultTextProps} pl={3}>
                  {form.values?.statement_account_type}
                </Text>
              </Grid.Col>

              <Grid.Col span={4.5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps} fw={800}>
                    Interest Tax Rate
                  </Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7.5}>
                <Text {..._defaultTextProps} pl={3}>
                  {form.values?.statement_tax} %
                </Text>
              </Grid.Col>
            </Grid>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text {..._defaultTextProps} ta="center">
              <b>Statement From </b> :{" "}
              {dayjs(form.values?.statement_start_date).format("YYYY/MM/DD")}{" "}
              <b>To</b>{" "}
              {dayjs(form.values?.statement_end_date).format("YYYY/MM/DD")}
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
          <td style={{}}>
            {dayjs(form.values?.statements_opening_date).format("YYYY/MM/DD")}
          </td>
          <td style={{}}>Balance Forwarded</td>
          <td></td>
          <td></td>
          <td
            style={{
              textAlign: "center",
            }}
          >
            {(form.values?.statements_opening_bal || 0).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
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
                  datainfo.description.toLowerCase(),
                )
                  ? 700
                  : "",
              }}
            >
              {headers.map((headerinfo: any, index: number) => {
                let _data: any;
                const isNumericCol = ["debit", "credit", "balance"].includes(
                  headerinfo.value,
                );
                if (headerinfo.value == "date") {
                  _data = dayjs(new Date(datainfo[headerinfo.value])).format(
                    "YYYY/MM/DD",
                  );
                } else if (
                  ["debit", "credit", "balance"].includes(headerinfo.value)
                ) {
                  _data = datainfo[headerinfo.value] || 0;
                } else {
                  _data = datainfo[headerinfo.value];
                }

                return (
                  <td
                    style={{
                      textAlign: headerinfo.align,
                      fontVariantNumeric: isNumericCol
                        ? "tabular-nums"
                        : undefined,
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
          <td></td>
          <td>
            <Text {..._defaultTextProps} fw={800}>
              Total Summary
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              Debit
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              Credit
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              Closing Balance
            </Text>
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <Text {..._defaultTextProps} fw={800}>
              Available Balance
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              {(form.values?.statement_debit_total || 0).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              {(form.values?.statement_credit_total || 0).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              {(form.values?.statement_balance_total || 0).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
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
            bottom: ".85in",
            right: "0",
          }}
        >
          Page {page} of{" "}
          {chunkedStatements[chunkedStatements.length - 1]?.length < 32
            ? chunkedStatements.length
            : chunkedStatements.length + 1}
        </Text>
      </>
    );
  };

  const chunkedStatements = chunkArray(
    (form.values?.workedStatements as any[]) ?? [],
    32 - (state?.headerProps?.height - 1) / 0.2,
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
                {index == chunkedStatements.length - 1 &&
                  stChunk.length < 32 && <TableSummary />}
              </tbody>
            </table>

            <PageNumber page={index + 1} />
            <BankPaddingSpace position="bottom" />
          </Paper>
        ))}

        {chunkedStatements[chunkedStatements.length - 1]?.length >= 32 && (
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

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
} from "@mantine/core";
//pageProps
import { configPageProps } from "@/components/templates/templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
//style
import classesTemplate from "../template.module.css";
import classes from "./statement.module.css";
import dayjs from "dayjs";
import { chunkArray } from "@/components/helper/chunkArray";
import { FormHandler } from "@/components/framework/FormHandler";

export function TemplateHimchuliStatement() {
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
    size: "13px",
    lh: ".17in",
  };

  const headers = [
    {
      label: "Date",
      value: "date",
      halign: "center",
      align: "left",
      width: "1in",
    },
    {
      label: "Particulars",
      value: "description",
      halign: "left",
      align: "left",
    },
    {
      label: "Cheque No.",
      value: "cheque",
      halign: "center",
      align: "left",
      width: "1in",
    },
    {
      label: "Debit",
      value: "debit",
      halign: "right",
      align: "right",
      width: "1in",
    },
    {
      label: "Credit",
      value: "credit",
      halign: "right",
      align: "right",
      width: "1in",
    },
    {
      label: "Balance",
      value: "balance",
      halign: "right",
      align: "right",
      width: "1in",
    },
  ];

  const DocumentHeader = () => {
    return (
      <>
        <Group justify="space-between">
          <Text ta="right" {..._defaultTextProps} mb=".1in"></Text>
        </Group>

        <div
          style={{
            border: "1px solid black",
            padding: ".05in .05in",
          }}
        >
          <Grid gutter="5px">
            <Grid.Col span={8}>
              <Grid gutter={3}>
                <Grid.Col span={2}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      Name
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={10}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_account_holder}
                  </Text>
                </Grid.Col>

                <Grid.Col span={2}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      Address
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={10}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_account_address}
                  </Text>
                </Grid.Col>

                <Grid.Col span={2}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700} w={60}>
                      Currency
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={10}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    NPR
                  </Text>
                </Grid.Col>
              </Grid>
            </Grid.Col>
            <Grid.Col span={4}>
              <Grid gutter={0}>
                <Grid.Col span={4}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      Account No
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_account_no}
                  </Text>
                </Grid.Col>

                <Grid.Col span={4}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      A/C Type
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_account_type}
                  </Text>
                </Grid.Col>

                <Grid.Col span={4}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      Int. Rate.
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_interest} %
                  </Text>
                </Grid.Col>

                <Grid.Col span={4}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700} w={60}>
                      Tax. Rate.
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_tax} %
                  </Text>
                </Grid.Col>
              </Grid>
            </Grid.Col>

            <Grid.Col span={12}>
              <Text {..._defaultTextProps} fw={700} pl={4} ta="center">
                Statement of Account : From{" "}
                {form.values?.statement_start_date ? dayjs(form.values.statement_start_date).format("DD-MMM-YYYY") : "N/A"}{" "}
                To{" "}
                {form.values?.statement_end_date ? dayjs(form.values.statement_end_date).format("DD-MMM-YYYY") : "N/A"}
              </Text>
            </Grid.Col>
          </Grid>
        </div>
      </>
    );
  };

  const TableHeader = () => (
    <tr
      className={classes.headerRow}
      style={{
        borderTop: "1px solid black",
      }}
    >
      {headers.map((headerinfo: any, index: number) => (
        <th
          className={classes.headerRow}
          style={{
            textAlign: headerinfo.halign,
            fontWeight: 700,
            fontSize: 13,
            width: headerinfo.width || "auto",
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
            {form.values?.statements_opening_date ? dayjs(form.values.statements_opening_date).format("DD-MM-YYYY") : "N/A"}
          </td>
          <td style={{}}>Balance B/D</td>
          <td></td>
          <td></td>
          <td></td>
          <td
            style={{
              textAlign: "right",
            }}
          >
            {(form.values?.statements_opening_bal ?? 0)?.toLocaleString?.(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
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
                if (headerinfo.value == "date" && datainfo[headerinfo.value]) {
                  _data = dayjs(new Date(datainfo[headerinfo.value])).format("DD-MM-YYYY");
                } else if (["debit", "credit", "balance"].includes(headerinfo.value)) {
                  _data = datainfo[headerinfo.value] || 0;
                } else {
                  _data = datainfo[headerinfo.value];
                }

                return (
                  <td
                    style={{
                      textAlign: headerinfo.align,
                      textTransform:
                        headerinfo.value == "date" ? "uppercase" : undefined,
                      fontVariantNumeric: isNumericCol ? "tabular-nums" : undefined,
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
        ></tr>

        <tr>
          <td
            style={{
              border: "none",
            }}
          ></td>
          <td
            colSpan={4}
            style={{
              fontWeight: 600,
              textAlign: "center",
              textTransform: "none",
            }}
          >
            Summary of Statement
          </td>
        </tr>
        <tr
          style={{
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          <td
            style={{
              border: "none",
            }}
          />
          <td></td>
          <td>DR</td>
          <td>CR</td>
          <td>C/B</td>
        </tr>
        <tr
          style={{
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <td
            style={{
              border: "none",
            }}
          />
          <td>
            Closing Date:{" "}
            {form.values?.statement_end_date ? dayjs(form.values.statement_end_date).format("DD-MMM-YYYY") : "N/A"}
          </td>
          <td>
            {(form.values?.statement_debit_total ?? 0)?.toLocaleString?.(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </td>
          <td>
            {(form.values?.statement_credit_total ?? 0)?.toLocaleString?.(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </td>
          <td>
            {(form.values?.statement_balance_total ?? 0)?.toLocaleString?.(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
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
            bottom: "1in",
            right: "0",
          }}
        >
          Page {page} of{" "}
          {chunkedStatements[chunkedStatements.length - 1]?.length < 27
            ? chunkedStatements.length
            : chunkedStatements.length + 1}
        </Text>
      </>
    );
  };

  const chunkedStatements = chunkArray(
    form.values?.workedStatements,
    36 - (state?.headerProps?.height - 1) / 0.2
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
            <Space h={state?.headerProps?.height + "in" || "1in"} />
            <Group justify="flex-end">
              <Text {..._defaultTextProps}>
                <b>Date</b>:{" "}
                {form.values?.statement_end_date ? dayjs(form.values.statement_end_date).add(1, "day").format("YYYY-MM-DD") : "N/A"}
              </Text>
            </Group>

            <DocumentHeader />

            <table className={classes.st_table}>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {index == 0 && <RenderTableStart />}
                <RenderTable data={stChunk} />
                {index == chunkedStatements.length - 1 && stChunk.length < 27 && (
                  <TableSummary />
                )}
              </tbody>
            </table>

            <PageNumber page={index + 1} />
          </Paper>
        ))}

        {chunkedStatements[chunkedStatements.length - 1]?.length >= 27 && (
          <Paper
            pos="relative"
            className={classesTemplate.root}
            py=".6in"
            px=".4in"
            {...configPageProps}
          >
            <Space h={state?.headerProps?.height + "in" || "1in"} />
            <Group justify="flex-end">
              <Text {..._defaultTextProps}>
                <b>Date</b>:{" "}
                {form.values?.statement_end_date ? dayjs(form.values.statement_end_date).add(1, "day").format("DD-MMM-YYYY") : "N/A"}
              </Text>
            </Group>
            <DocumentHeader />

            <table className={classes.st_table}>
              <TableSummary />
            </table>

            <PageNumber page={chunkedStatements.length + 1} />
          </Paper>
        )}
      </Stack>
    </>
  );
}

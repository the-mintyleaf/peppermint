/* eslint-disable react/no-unescaped-entities */
"use client";

import { useContext } from "react";
//mantine
import { Grid, Group, Paper, Space, Stack, Table, Text } from "@mantine/core";
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

export function TemplateVyasStatement() {
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

  const _boldTriggers = [
    "opening balance",
    "interest",
    "tax deduction",
    "closing balance",
  ];
  const _textReplace: any = {
    "opening balance": "Balance Forwarded",
    interest: "Interest Deposit",
    "tax deduction": "Tax Deduction @" + details.statement_interest + "%",
    "closing balance": "Closing Balance",
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
      align: "right",
    },
    {
      label: "Credit",
      value: "credit",
      halign: "center",
      align: "right",
    },
    {
      label: "Balance",
      value: "balance",
      halign: "center",
      align: "right",
    },
  ];

  const DocumentHeader = () => {
    return (
      <>
        <Group justify="flex-end">
          <Text ta="right" {..._defaultTextProps} mb=".1in">
            <b>Print Date</b> :{" "}
            {dayjs(form.values?.statement_end_date, "YYYY/MM/DD")
              .add(1, "day")
              .format("YYYY/MM/DD")}
          </Text>
        </Group>
        <Paper
          radius={0}
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderRight: "1px solid black",
          }}
          bg="gray.1"
          p=".08in"
        >
          <Grid gutter="5px">
            <Grid.Col span={8}>
              <Grid gutter={3}>
                <Grid.Col span={5}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      Account Holder's Name
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={7}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_account_holder}
                  </Text>
                </Grid.Col>

                <Grid.Col span={5}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      Account Number
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={7}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_account_no}
                  </Text>
                </Grid.Col>

                <Grid.Col span={5}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      Account Holder's Address
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={7}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_account_address}
                  </Text>
                </Grid.Col>
              </Grid>
            </Grid.Col>
            <Grid.Col span={4} style={{}}>
              <Grid gutter={0}>
                <Grid.Col span={12}>
                  <Group justify="flex-end" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      Account Type
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                    <Text {..._defaultTextProps} fw={500} pl={4}>
                      {form.values?.statement_account_type}
                    </Text>
                  </Group>
                </Grid.Col>

                <Space h=".4in" />

                <Grid.Col span={12}>
                  <Group justify="center" gap={0}>
                    <Text {..._defaultTextProps} fw={700}>
                      Statement From :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text ta="center" {..._defaultTextProps} fw={500} pl={4}>
                    {dayjs(form.values?.statement_start_date).format(
                      "YYYY/MM/DD"
                    )}{" "}
                    to{" "}
                    {dayjs(form.values?.statement_end_date).format(
                      "YYYY/MM/DD"
                    )}
                  </Text>
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>
        </Paper>
      </>
    );
  };

  const TableHeader = () => (
    <tr>
      {headers.map((headerinfo: any, index: number) => (
        <td
          style={{
            textAlign: headerinfo.halign,
            fontWeight: 700,
            fontSize: 13,
          }}
          key={index}
        >
          {headerinfo.label}
        </td>
      ))}
    </tr>
  );

  const RenderTableStart = () => {
    return (
      <>
        <tr>
          <td style={{}}>
            {dayjs(details.statements_opening_date).format("YYYY/MM/DD")}
          </td>
          <td style={{}}>Balance B/D</td>
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
          {chunkedStatements[chunkedStatements.length - 1]?.length < 36
            ? chunkedStatements.length
            : chunkedStatements.length + 1}
        </Text>
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
                  _data = dayjs(new Date(datainfo[headerinfo.value])).format("YYYY/MM/DD");
                } else if (isNumericCol) {
                  _data = datainfo[headerinfo.value] || 0;
                } else {
                  _data = datainfo[headerinfo.value];
                }

                return (
                  <td
                    style={{
                      textAlign: headerinfo.align,
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

  const chunkedStatements = chunkArray(
    form.values?.workedStatements,
    36 - (state?.headerProps?.height - 1) / 0.2
  );

  const marginUnit = ".2in";

  return (
    <>
      <Stack gap={0}>
        {chunkedStatements.map((stChunk: any, index: number) => (
          <Paper
            withBorder
            key={index}
            pos="relative"
            className={classesTemplate.root}
            py=".6in"
            px=".4in"
            {...configPageProps}
          >
            <Space h={state?.headerProps?.height + "in" || "1in"} />

            <DocumentHeader />

            <table className={classes.st_table}>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {index == 0 && <RenderTableStart />}
                <RenderTable data={stChunk} />
              </tbody>
            </table>

            <PageNumber page={index + 1} />
          </Paper>
        ))}
      </Stack>
    </>
  );
}

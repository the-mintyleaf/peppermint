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

export function TemplateKarnaliStatement() {
  // * DEFINITIONå
  const form = FormHandler.useForm();

  // * PRE STATESD

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
    interest: "Interest Posted",
    "tax deduction": "Tax deduction",
  };

  const _defaultTextProps = {
    size: "15px",
    lh: ".17in",
    fw: 600,
  };

  const headers = [
    {
      label: "Date",
      value: "date",
      halign: "center",
      align: "left",
    },
    {
      label: "Particular",
      value: "description",
      halign: "center",
      align: "left",
    },
    {
      label: "Withdraw",
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
        <Group justify="space-between">
          <Text ta="right" {..._defaultTextProps} mb=".1in"></Text>
          <Text ta="right" {..._defaultTextProps} mb=".1in">
            <b>Date</b> :{" "}
            {dayjs(form.values?.statement_end_date)
              .add(1, "day")
              .format("YYYY/MM/DD")}
          </Text>
        </Group>
        <div
          style={{
            border: "1px solid black",
          }}
        >
          <Grid gap="5px">
            <Grid.Col
              span={7}
              style={{
                padding: "16px 8px",
              }}
            >
              <Grid gap={3}>
                <Grid.Col span={2}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={600}>
                      Name
                    </Text>
                    <Text {..._defaultTextProps} fw={600}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={10}>
                  <Text {..._defaultTextProps} fw={600} pl={4}>
                    {form.values?.statement_account_holder}
                  </Text>
                </Grid.Col>

                <Grid.Col span={2}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={600}>
                      Address
                    </Text>
                    <Text {..._defaultTextProps} fw={600}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={10}>
                  <Text {..._defaultTextProps} fw={600} pl={4}>
                    {form.values?.statement_account_address}
                  </Text>
                </Grid.Col>

                <Grid.Col span={2}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={600} w={60}>
                      A/C No.
                    </Text>
                    <Text {..._defaultTextProps} fw={600}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={10}>
                  <Text {..._defaultTextProps} fw={600} pl={4}>
                    {form.values?.statement_account_no}
                  </Text>
                </Grid.Col>
              </Grid>
            </Grid.Col>
            <Grid.Col span={5}>
              <Paper
                bg="none"
                radius={0}
                style={{
                  borderLeft: "1px solid black",
                  padding: "16px 8px",
                }}
              >
                <Grid gap={0}>
                  <Grid.Col span={5}>
                    <Group justify="space-between" gap={0}>
                      <Text {..._defaultTextProps} fw={600} w={65}>
                        Int. Rate
                      </Text>
                      <Text {..._defaultTextProps} fw={600}>
                        :
                      </Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={7}>
                    <Text {..._defaultTextProps} fw={600} pl={4}>
                      {form.values?.statement_interest} %
                    </Text>
                  </Grid.Col>

                  <Grid.Col span={5}>
                    <Group justify="space-between" gap={0}>
                      <Text {..._defaultTextProps} fw={600} w={65}>
                        Tax. Rate
                      </Text>
                      <Text {..._defaultTextProps} fw={600}>
                        :
                      </Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={7}>
                    <Text {..._defaultTextProps} fw={600} pl={4}>
                      {form.values?.statement_tax} %
                    </Text>
                  </Grid.Col>

                  <Grid.Col span={5}>
                    <Group justify="space-between" gap={0}>
                      <Text {..._defaultTextProps} fw={600} w={65}>
                        A/C Type
                      </Text>
                      <Text {..._defaultTextProps} fw={600}>
                        :
                      </Text>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={7}>
                    <Text {..._defaultTextProps} fw={600} pl={4}>
                      {form.values?.statement_account_type}
                    </Text>
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <Group justify="space-between" gap={0}>
                      <Text {..._defaultTextProps} fw={600} c="transparent">
                        A/C Type
                      </Text>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Paper>
            </Grid.Col>
          </Grid>
        </div>
        <Text
          {..._defaultTextProps}
          ta="center"
          size="md"
          mt="sm"
          mb={2}
          //td="underline"
        >
          Statement From :{" "}
          {dayjs(form.values?.statement_start_date).format("YYYY/MM/DD")} To{" "}
          {dayjs(form.values?.statement_end_date).format("YYYY/MM/DD")}
        </Text>
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
          <td style={{}}>Previous Balance</td>
          <td></td>
          <td></td>
          <td
            style={{
              textAlign: "right",
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
          {chunkedStatements[chunkedStatements.length - 1]?.length < 32
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
                      fontVariantNumeric: "tabular-nums",
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
    return <></>;
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
                  stChunk.length < 26 && <TableSummary />}
              </tbody>
            </table>

            <PageNumber page={index + 1} />
            <BankPaddingSpace position="bottom" />
          </Paper>
        ))}

        {chunkedStatements[chunkedStatements.length - 1]?.length >= 26 && (
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

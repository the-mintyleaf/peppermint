"use client";

import { useContext } from "react";
//mantine
import {
  Divider,
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
//style
import classesTemplate from "../template.module.css";
import classes from "./statement.module.css";
import { dayjs } from "@zetsel/ui";
import { chunkArray } from "@/components/helper/chunkArray";
import { FormHandler } from "@/components/framework/FormHandler";

export function TemplateBigyalaxmiStatement() {
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
  const _defaultTextProps = {
    size: "14px",
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
      halign: "left",
      align: "left",
    },
    {
      label: "Debit",
      value: "debit",
      halign: "right",
      align: "right",
    },
    {
      label: "Credit",
      value: "credit",
      halign: "right",
      align: "right",
    },
    {
      label: "Balance",
      value: "balance",
      halign: "right",
      align: "right",
    },
  ];

  const DocumentHeader = () => {
    return (
      <>
        <Group justify="space-between">
          <Text ta="right" {..._defaultTextProps} mb=".1in"></Text>
          <Text ta="right" {..._defaultTextProps} mb=".1in">
            <b> Date</b> :{" "}
            {dayjs(form.values?.statement_end_date, "YYYY/MM/DD")
              .add(1, "day")
              .format("YYYY-MM-DD")}
          </Text>
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
                    <Text {..._defaultTextProps} fw={500}>
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
                    <Text {..._defaultTextProps} fw={500}>
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
                    <Text {..._defaultTextProps} fw={500} w={60}>
                      A/C No.
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={10}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    {form.values?.statement_account_no}
                  </Text>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={700} w={60}>
                      Period
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={10}>
                  <Text {..._defaultTextProps} fw={700} pl={4}>
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
            <Grid.Col span={4}>
              <Grid gutter={0}>
                <Grid.Col span={4}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={500}>
                      Currency
                    </Text>
                    <Text {..._defaultTextProps} fw={500}>
                      :
                    </Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text {..._defaultTextProps} fw={500} pl={4}>
                    NPR.
                  </Text>
                </Grid.Col>

                <Grid.Col span={4}>
                  <Group justify="space-between" gap={0}>
                    <Text {..._defaultTextProps} fw={500}>
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
                    <Text {..._defaultTextProps} fw={500}>
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
                    <Text {..._defaultTextProps} fw={500} w={60}>
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
          </Grid>
        </div>
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
          <td style={{}}>Balance F/D</td>
          <td></td>
          <td></td>
          <td
            style={{
              textAlign: "right",
            }}
          >
            {(form.values?.statements_opening_bal ?? 0).toLocaleString(undefined, {
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
          <td colSpan={5}>
            <Text {..._defaultTextProps} fw={800} size="sm" ta="center">
              Summary of Statement
            </Text>
          </td>
        </tr>
        <tr>
          <td rowSpan={2} colSpan={2}>
            <Text {..._defaultTextProps} fw={800} ta="center" size="xs">
              Closing Date :{" "}
              {String(new Date(form.values?.statement_end_date)).substring(
                0,
                15
              )}
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              DR
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              CR
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              C/B
            </Text>
          </td>
        </tr>
        <tr>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              {(form.values?.statement_debit_total ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              {(form.values?.statement_credit_total ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </td>
          <td>
            <Text ta="center" {..._defaultTextProps} fw={800}>
              {(form.values?.statement_balance_total ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </td>
        </tr>
      </>
    );
  };

  const chunkedStatements = chunkArray(
    form.values?.workedStatements,
    36 - (state?.headerProps?.height - 1) / 0.2
  );

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

            <DocumentHeader />

            <table className={classes.st_table}>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {index == 0 && <RenderTableStart />}
                <RenderTable data={stChunk} />
              </tbody>
              {index == chunkedStatements.length - 1 && stChunk.length < 27 && (
                <tfoot>
                  <TableSummary />
                </tfoot>
              )}
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

            <DocumentHeader />

            <table className={classes.st_table}>
              <tfoot>
                <TableSummary />
              </tfoot>
            </table>

            <PageNumber page={chunkedStatements.length + 1} />
          </Paper>
        )}
      </Stack>
    </>
  );
}

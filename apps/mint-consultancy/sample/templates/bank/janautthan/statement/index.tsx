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

export function TemplateJanautthanStatement() {
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
  const _defaultTextProps = {
    size: "14px",
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
          <Grid gutter="5px">
            <Grid.Col
              span={8}
              style={{
                padding: "16px 8px",
              }}
            >
              <Grid gutter={3}>
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
            <Grid.Col span={4}>
              <Paper
                radius={0}
                bg="gray.2"
                style={{
                  padding: "16px 8px",
                }}
              >
                <Grid gutter={0}>
                  <Grid.Col span={5}>
                    <Group justify="space-between" gap={0}>
                      <Text {..._defaultTextProps} fw={600}>
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
                      <Text {..._defaultTextProps} fw={600} w={60}>
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
                      <Text {..._defaultTextProps} fw={600}>
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
          {dayjs(form.values?.statement_start_date).format("DD/MM/YYYY")} To{" "}
          {dayjs(form.values?.statement_end_date).format("DD/MM/YYYY")}
        </Text>
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
          {chunkedStatements[chunkedStatements.length - 1]?.length < 33
            ? chunkedStatements.length
            : chunkedStatements.length + 1}
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
            {dayjs(form.values?.statements_opening_date).format("DD/MM/YYYY")}
          </td>
          <td style={{}}>Balance F/D</td>
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
                  _data = dayjs(new Date(datainfo[headerinfo.value])).format("DD/MM/YYYY");
                } else if (["debit", "credit", "balance"].includes(headerinfo.value)) {
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
    return <></>;
  };

  const chunkedStatements = chunkArray(
    form.values?.workedStatements,
    33 - (state?.headerProps?.height - 1) / 0.2
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
            <DocumentHeader />

            <table className={classes.st_table}>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {index == 0 && <RenderTableStart />}
                <RenderTable data={stChunk} />
                {index == chunkedStatements.length - 1 && stChunk.length < 33 && (
                  <TableSummary />
                )}
              </tbody>
            </table>

            <PageNumber page={index + 1} />
          </Paper>
        ))}

        {chunkedStatements[chunkedStatements.length - 1]?.length >= 33 && (
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
              <tbody>
                <TableSummary />
              </tbody>
            </table>

            <PageNumber page={chunkedStatements.length + 1} />
          </Paper>
        )}
      </Stack>
    </>
  );
}

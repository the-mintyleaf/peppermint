/* eslint-disable react/no-unescaped-entities */
"use client";

import { useContext } from "react";
//mantine
import { Grid, Paper, Space, Stack, Table, Text } from "@mantine/core";
//pageProps
import { configPageProps } from "@/components/templates/templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
//style
import classesTemplate from "../template.module.css";
import classes from "./statement.module.css";
import dayjs from "dayjs";

export function TemplateVyasStatement() {
  // * DEFINITION

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
        <Grid gutter="5px">
          <Grid.Col span={12}>
            <Text ta="right" {..._defaultTextProps} mb=".1in">
              <b>Print Date</b> :{" "}
              {dayjs(details.statement_end_date, "YYYY/MM/DD").format(
                "YYYY-MM-DD"
              )}
            </Text>
          </Grid.Col>
          <Grid.Col span={8.3}>
            <div
              style={{
                border: "2px solid black",
                padding: ".1in",
                borderRadius: ".2in",
              }}
            >
              <Stack gap={3}>
                <Text {..._defaultTextProps}>
                  <b>Account Holder&apos;s Name</b> :{" "}
                  {details.statement_account_holder}
                </Text>
                <Text {..._defaultTextProps}>
                  <b>Account Number</b> : {details.statement_account_no}
                </Text>
                <Text {..._defaultTextProps}>
                  <b>Account Holder&apos;s Address</b> :{" "}
                  {details.statement_account_address}
                </Text>
              </Stack>
            </div>
          </Grid.Col>
          <Grid.Col span={3.7}>
            <div
              style={{
                border: "2px solid black",
                padding: ".1in",
              }}
            >
              <Stack gap={3}>
                <Text ta="center" {..._defaultTextProps}>
                  <b>Account Type</b> : {details.statement_account_type}
                </Text>
                <Text ta="center" {..._defaultTextProps} mt=".15in">
                  <b>Statement from:</b>
                </Text>
                <Text ta="center" {..._defaultTextProps}>
                  {details.statement_start_date} to {details.statement_end_date}
                </Text>
              </Stack>
            </div>
          </Grid.Col>
        </Grid>
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
              {headers.map((headerinfo: any, index: number) => (
                <td
                  style={{
                    textAlign: headerinfo.align,
                  }}
                  key={index}
                >
                  {datainfo[headerinfo.value]}
                </td>
              ))}
            </tr>
          );
        })}
      </>
    );
  };

  return (
    <>
      <Stack>
        <Paper
          pos="relative"
          className={classesTemplate.root}
          py=".6in"
          px=".4in"
          {...configPageProps}
        >
          <Space h="1in" />

          <DocumentHeader />

          <Space h=".04in" />

          <table className={classes.st_table}>
            <TableHeader />
            <RenderTable data={details.statements} />
          </table>
        </Paper>

        <Paper
          pos="relative"
          className={classesTemplate.root}
          py=".6in"
          px=".4in"
          {...configPageProps}
        >
          <Space h="1in" />

          <DocumentHeader />

          <Space h=".2in" />

          <table className={classes.st_table}>
            <TableHeader />
            <RenderTable data={details.statements} />
          </table>
        </Paper>
      </Stack>
    </>
  );
}

/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useContext } from "react";
//mantine
import {
  Divider,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Space,
  Stack,
  Text,
} from "@peppermint/ui";
//pageprops
import { configPageProps } from "../../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { BankPaddingSpace } from "@/components/templates/bank/BankPaddingSpace";
//style
import classesTemplate from "../template.module.css";
import classes from "./statement.module.css";
import { dayjs } from "@peppermint/ui";
import { chunkArray } from "@/components/helper/chunkArray";
import { FormHandler } from "@/components/framework/FormHandler";
//templateprops

export function TemplateShahabhagiStatement() {
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

  const initialdetails = [
    [
      {
        label: "A/C Holder's Name",
        value: form.values?.statement_account_holder,
      },
      {
        label: "Address",
        value: form.values?.statement_account_address,
      },
      {
        label: "A/C Type",
        value: form.values?.statement_account_type,
      },
    ],
    [
      {
        label: "A/c No.",
        value: form.values?.statement_account_no,
      },
      {
        label: "Interest Calculation",
        value: form.values?.statement_interest_method,
      },
      {
        label:
          "Interest Rate : " + String(form.values?.statement_interest) + "%",
        value: "Tax Rate : " + String(form.values?.statement_tax) + "%",
      },
    ],
  ];

  const _defaultTextProps = {
    size: "12.5px",
    lh: ".17in",
  };

  const DocHeader = () => {
    return (
      <thead>
        <tr>
          <td
            colSpan={6}
            style={{
              background: "var(--mantine-color-gray-2)",
            }}
          >
            <Text size="sm" ta="center" fw={600}>
              STATEMENT OF ACCOUNT FROM{" "}
              {dayjs(form.values?.statement_start_date).format("YYYY/MM/DD")} TO{" "}
              {dayjs(form.values?.statement_end_date).format("YYYY/MM/DD")}
            </Text>
          </td>
        </tr>
        <tr
          style={{
            border: "1px solid ",
          }}
        >
          <td colSpan={3} style={{ border: "none" }}>
            <Grid gap={3}>
              <Grid.Col span={4}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps}>A/C No.</Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text {..._defaultTextProps}>
                  {form.values?.statement_account_no}
                </Text>
              </Grid.Col>

              <Grid.Col span={4}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps}>A/C Holder's Name</Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text {..._defaultTextProps}>
                  {form.values?.statement_account_holder}
                </Text>
              </Grid.Col>

              <Grid.Col span={4}>
                <Group gap={0} justify="space-between">
                  <Text {..._defaultTextProps}>A/C Holder's Address</Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text {..._defaultTextProps}>
                  {form.values?.statement_account_address}
                </Text>
              </Grid.Col>

              <Grid.Col span={4}>
                <Group justify="space-between">
                  <Text fw={600} {..._defaultTextProps}>
                    {" "}
                    Balance
                  </Text>
                  <Text fw={600} {..._defaultTextProps}>
                    :
                  </Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text {..._defaultTextProps}>
                  {(form.values?.statement_balance_total || 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}
                </Text>
              </Grid.Col>
            </Grid>
          </td>
          <td style={{ border: "none" }} colSpan={2}>
            <Grid gap={2}>
              <Grid.Col span={5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps}> A/C Type</Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text {..._defaultTextProps}>
                  {form.values?.statement_account_type}
                </Text>
              </Grid.Col>
              <Grid.Col span={5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps}> Intrest Rate</Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text {..._defaultTextProps}>
                  {form.values?.statement_interest} %
                </Text>
              </Grid.Col>
              <Grid.Col span={5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps}> Tax Rate</Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text {..._defaultTextProps}>
                  {form.values?.statement_tax} %
                </Text>
              </Grid.Col>

              <Grid.Col span={5}>
                <Group justify="space-between">
                  <Text fw={600} {..._defaultTextProps}>
                    {" "}
                    Dr. Total
                  </Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text fw={600} {..._defaultTextProps}>
                  {form.values?.statement_debit_total}
                </Text>
              </Grid.Col>

              <Grid.Col span={5}>
                <Group justify="space-between">
                  <Text fw={600} {..._defaultTextProps}>
                    {" "}
                    Cr. Total
                  </Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text fw={600} {..._defaultTextProps}>
                  {form.values?.statement_credit_total}
                </Text>
              </Grid.Col>
            </Grid>
          </td>
        </tr>
      </thead>
    );
  };

  const chunkedStatements = chunkArray(
    (form.values?.workedStatements as any[]) ?? [],
    36 - (state?.headerProps?.height - 1) / 0.2,
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

            <div className={classes.container}>
              <table className={classes.st_table}>
                <DocHeader />

                <tbody>
                  <tr
                    style={{
                      height: ".2in",
                    }}
                  ></tr>
                  <tr>
                    <th
                      style={{
                        width: ".9in",
                        textAlign: "left",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        width: "2.6in",
                        textAlign: "left",
                      }}
                    >
                      Description
                    </th>

                    <th
                      style={{
                        width: "1in",
                        textAlign: "right",
                      }}
                    >
                      Debit
                    </th>
                    <th
                      style={{
                        width: "1in",
                        textAlign: "right",
                      }}
                    >
                      Credit
                    </th>
                    <th
                      style={{
                        width: "1in",
                        textAlign: "right",
                      }}
                    >
                      Balance
                    </th>
                  </tr>
                </tbody>
                <tbody>
                  {index == 0 && (
                    <tr
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      <td style={{}}>
                        {dayjs(form.values?.statements_opening_date).format(
                          "YYYY-MM-DD",
                        )}
                      </td>
                      <td>Opening Balance</td>
                      <td></td>

                      <td></td>
                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {(
                          form.values?.statements_opening_bal || 0
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  )}
                  {stChunk.map((item: any, index: number) => (
                    <tr
                      key={index}
                      style={{
                        fontWeight: _boldTriggers.includes(
                          item.description.toLowerCase(),
                        )
                          ? 700
                          : 400,
                      }}
                    >
                      <td style={{ textAlign: "left" }}>
                        {dayjs(item.date).format("YYYY-MM-DD")}
                      </td>
                      <td
                        style={{
                          textAlign: "left",
                        }}
                      >
                        {item.description}
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {(item.debit || 0) !== 0
                          ? (item.debit || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })
                          : ""}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {(item.credit || 0) !== 0
                          ? (item.credit || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })
                          : ""}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {(item.balance || 0) !== 0
                          ? (item.balance || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Text size="12px" className={classes.pagenumber} ta="center">
                Page {index + 1}
              </Text>
            </div>
            <BankPaddingSpace position="bottom" />
          </Paper>
        ))}
      </Stack>
    </>
  );
}

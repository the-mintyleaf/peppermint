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

export function TemplateMataBageshworiStatement() {
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
          <td colSpan={6}>
            <Text size="md" ta="center" fw={600}>
              Account Statement From{" "}
              {dayjs(form.values?.statement_start_date).format("YYYY/MM/DD")} to{" "}
              {dayjs(form.values?.statement_end_date).format("YYYY/MM/DD")}
            </Text>
          </td>
        </tr>
        <tr>
          <td colSpan={3} style={{ border: "none" }}>
            <Grid gap={3}>
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
                <Group justify="space-between">
                  <Text {..._defaultTextProps}>Address</Text>
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
                  <Text {..._defaultTextProps}> A/C Type</Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text {..._defaultTextProps}>
                  {form.values?.statement_account_type}
                </Text>
              </Grid.Col>
            </Grid>
          </td>
          <td style={{ border: "none", paddingLeft: ".in" }} colSpan={3}>
            <Grid gap={2}>
              <Grid.Col span={5}>
                <Group justify="space-between">
                  <Text {..._defaultTextProps}> A/C No</Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text {..._defaultTextProps}>
                  {form.values?.statement_account_no}
                </Text>
              </Grid.Col>

              <Grid.Col span={5}>
                <Group justify="space-between" align="flex-start">
                  <Text {..._defaultTextProps}>Int. Calculation</Text>
                  <Text {..._defaultTextProps}>:</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={7}>
                <Text {..._defaultTextProps}>
                  {form.values?.statement_interest_method}
                </Text>
              </Grid.Col>

              <Grid.Col span={12}>
                <Group>
                  <Text {..._defaultTextProps}>
                    Intrest Rate : {form.values?.statement_interest}%
                  </Text>
                  <Text {..._defaultTextProps}>
                    Tax Rate : {form.values?.statement_tax}%
                  </Text>
                </Group>
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
                  <tr>
                    <th
                      style={{
                        width: ".9in",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        width: "2.6in",
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        width: ".8in",
                      }}
                    >
                      Cheque
                    </th>
                    <th
                      style={{
                        width: "1in",
                      }}
                    >
                      Debit
                    </th>
                    <th
                      style={{
                        width: "1in",
                      }}
                    >
                      Credit
                    </th>
                    <th
                      style={{
                        width: "1in",
                      }}
                    >
                      Balance
                    </th>
                  </tr>
                </tbody>
                <tbody>
                  {index == 0 && (
                    <tr>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>
                        {dayjs(form.values?.statements_opening_date).format(
                          "YYYY/MM/DD",
                        )}
                      </td>
                      <td style={{}}>Opening Balance</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td
                        style={{
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
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
                        fontWeight: 400,
                      }}
                    >
                      <td
                        style={{
                          textAlign: "left",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {dayjs(item.date).format("YYYY/MM/DD")}
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
                        {item.cheque || ""}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {(item.debit || 0) !== 0
                          ? (item.debit || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
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
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ""}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
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

              {index == chunkedStatements.length - 1 && stChunk.length < 26 && (
                <>
                  <div
                    style={{
                      border: "1px solid black",
                      borderTop: "none",
                    }}
                  >
                    <Text size="xs" ta="center" mb="sm" pt=".3in">
                      Transaction Summary
                    </Text>

                    <Group justify="center">
                      <div>
                        <Text size="xs" ta="center">
                          Opening Balance
                        </Text>
                        <Text size="xs" ta="center">
                          {(
                            form.values?.statements_opening_bal || 0
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </div>
                      <div>
                        <Text size="xs" ta="center">
                          Debit
                        </Text>
                        <Text size="xs" ta="center">
                          {(
                            form.values?.statement_debit_total || 0
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </div>
                      <div>
                        <Text size="xs" ta="center">
                          Credit
                        </Text>
                        <Text size="xs" ta="center">
                          {(
                            form.values?.statement_credit_total || 0
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </div>
                      <div>
                        <Text size="xs" ta="center">
                          Closing Balance
                        </Text>
                        <Text size="xs" ta="center">
                          {(
                            form.values?.statement_balance_total || 0
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </div>
                    </Group>
                  </div>
                </>
              )}

              <Text size="12px" className={classes.pagenumber} ta="center">
                Page {index + 1}
              </Text>
            </div>
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
            style={{
              fontFamily: `"Rubik", sans-serif`,
            }}
          >
            <BankPaddingSpace position="top" />

            <div className={classes.container}>
              <table className={classes.st_table}>
                <DocHeader />
              </table>
              <div
                style={{
                  border: "1px solid black",
                  borderTop: "none",
                }}
              >
                <Text size="xs" ta="center" mb="sm" pt=".3in">
                  Transaction Summary
                </Text>

                <Group justify="center">
                  <div>
                    <Text size="xs" ta="center">
                      Opening Balance
                    </Text>
                    <Text size="xs" ta="center">
                      {(
                        form.values?.statements_opening_bal || 0
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" ta="center">
                      Debit
                    </Text>
                    <Text size="xs" ta="center">
                      {(form.values?.statement_debit_total || 0).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" ta="center">
                      Credit
                    </Text>
                    <Text size="xs" ta="center">
                      {(
                        form.values?.statement_credit_total || 0
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" ta="center">
                      Closing Balance
                    </Text>
                    <Text size="xs" ta="center">
                      {(
                        form.values?.statement_balance_total || 0
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                </Group>
              </div>

              <Text size="12px" className={classes.pagenumber} ta="center">
                Page {chunkedStatements.length + 1}
              </Text>
            </div>
            <BankPaddingSpace position="bottom" />
          </Paper>
        )}
      </Stack>
    </>
  );
}

"use client";

import React, { useContext } from "react";
//mantine
import {
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Space,
  Stack,
  Text,
} from "@zetsel/ui";
//pageprops
import { configPageProps } from "../../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { BankPaddingSpace } from "@/components/templates/bank/BankPaddingSpace";
//style
import classesTemplate from "../template.module.css";
import classes from "./statement.module.css";
import { table } from "console";
import { chunkArray } from "@/components/helper/chunkArray";
import { dayjs } from "@zetsel/ui";
import { FormHandler } from "@/components/framework/FormHandler";
//templateprops

export function TemplateSumnimaStatement() {
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
    "tax deduction": "Tax Deduction",
  };

  const initialdetails = [
    [
      {
        label: "Name",
        value: form.values?.statement_account_holder,
      },
      {
        label: "Address",
        value: form.values?.statement_account_address,
      },
      {
        label: "Member ID",
        value: form.values?.statement_member_id,
      },
      {
        label: "A/c No.",
        value: form.values?.statement_account_no,
      },
    ],
    [
      {
        label: "A/c Type",
        value: form.values?.statement_account_type,
      },
      {
        label: "Interest %",
        value:
          String(
            Number(form.values?.statement_interest).toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })
          ) + "%",
      },
      {
        label: "Tax %",
        value:
          String(
            Number(form.values?.statement_tax).toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })
          ) + "%",
      },
    ],
  ];

  const _defaultTextProps = {
    size: "14px",
    lh: ".17in",
  };

  function roundHalfToEven(num: any) {
    const factor = Math.pow(10, 2);
    return Math.round(num * factor) / factor;
  }

  const calculateBalance = (id: number) => {
    let balance = state.details?.statements_opening_bal;

    for (const [index, item] of state.details?.statements
      .slice(0, id + 1)
      .entries()) {
      balance += (item.credit || 0) - (item.debit || 0);
    }

    return balance;
  };

  const DocHeader = () => {
    return (
      <>
        <div className={classes.header}>
          <Group mb={-2} pl="1.05in" pr=".1in" justify="space-between">
            <Text {..._defaultTextProps} fw={600}>
              Ledger statement dated from
            </Text>
            <Text {..._defaultTextProps}>
              {dayjs(form.values?.statement_start_date).format("DD/MM/YYYY")}
            </Text>
            <Text {..._defaultTextProps} fw={600}>
              to
            </Text>
            <Text {..._defaultTextProps}>
              {" "}
              {dayjs(form.values?.statement_end_date).format("DD/MM/YYYY")}
            </Text>
          </Group>
        </div>
        <Space h=".2in" />
        <Grid>
          <Grid.Col span={7}>
            <Grid gutter={0}>
              <table className={classes.infotable}>
                {initialdetails[0].map((item: any, index: number) => (
                  <tr key={index}>
                    <td
                      style={{
                        width: 90,
                      }}
                    >
                      <Group gap={0} justify="space-between">
                        <Text {..._defaultTextProps} fw={600}>
                          {item.label}
                        </Text>
                        <Text {..._defaultTextProps} fw={600} mr="4px">
                          :
                        </Text>
                      </Group>
                    </td>
                    <td>
                      <Text {..._defaultTextProps}>{item.value}</Text>
                    </td>
                  </tr>
                ))}
              </table>
            </Grid>
          </Grid.Col>
          <Grid.Col span={5} offset={0}>
            <Group justify="flex-end">
              <table className={classes.table}>
                {initialdetails[1].map((item: any, index: number) => (
                  <tr key={index}>
                    <td
                      style={{
                        width: 100,
                      }}
                    >
                      <Group gap={6} justify="flex-end">
                        <Text {..._defaultTextProps} fw={600}>
                          {item.label}
                        </Text>
                        <Text {..._defaultTextProps} fw={600} mr="4px">
                          :
                        </Text>
                      </Group>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        paddingLeft: "6px",
                      }}
                    >
                      <Text {..._defaultTextProps}>{item.value}</Text>
                    </td>
                  </tr>
                ))}
              </table>
            </Group>
          </Grid.Col>
        </Grid>
      </>
    );
  };

  const chunkedStatements = chunkArray(
    (form.values?.workedStatements as any[]) ?? [],
    36 - (state?.headerProps?.height - 1) / 0.2
  );

  return (
    <>
      <Stack gap={12}>
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

            <DocHeader />

            <Space h=".1in" />
            <Text {..._defaultTextProps} ta="center">
              <b>Account Status : </b> {form.values?.statement_account_status}
            </Text>
            <table className={classes.st_table}>
              <thead>
                <tr
                  style={{
                    borderTop: "2px solid black",
                    borderLeft: "2px solid black",
                    borderRight: "2px solid black",
                  }}
                >
                  <th
                    style={{
                      width: ".9in",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      width: "2.9in",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Debit
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Credit
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {index == 0 && (
                  <tr>
                    <td style={{}}>
                      {dayjs(form.values?.statements_opening_date).format(
                        "YYYY/MM/DD"
                      )}
                    </td>
                    <td style={{}}>Opening Balance</td>
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
                        }
                      )}
                    </td>
                  </tr>
                )}
                {stChunk.map((item: any, index: number) => {
                  return (
                    <tr
                      key={index}
                      style={{
                        fontWeight: _boldTriggers.includes(
                          item.description.toLowerCase()
                        )
                          ? 600
                          : "",
                      }}
                    >
                      <td>{dayjs(item.date).format("YYYY/MM/DD")}</td>
                      <td>
                        {_boldTriggers.includes(item.description.toLowerCase())
                          ? _textReplace[item.description.toLowerCase()]
                          : item.description}
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
                  );
                })}
              </tbody>
            </table>

            <Space h=".8in" />

            {index == chunkedStatements.length - 1 && stChunk.length < 27 && (
              <>
                <Grid gutter={0}>
                  <Grid.Col span={7.5}>
                    <Text ml={120} {..._defaultTextProps} fw={600}>
                      Transaction Summary
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={4.5}>
                    <SimpleGrid cols={3}>
                      <div>
                        <Text ta="center" {..._defaultTextProps} fw={600}>
                          Dr. Entries:
                        </Text>
                        <Text ta="center" {..._defaultTextProps} fw={600}>
                          {(form.values?.statement_debit_total || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </Text>
                      </div>
                      <div>
                        <Text ta="center" {..._defaultTextProps} fw={600}>
                          Cr. Entries:
                        </Text>
                        <Text ta="center" {..._defaultTextProps} fw={600}>
                          {(form.values?.statement_credit_total || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </Text>
                      </div>
                      <div>
                        <Text ta="center" {..._defaultTextProps} fw={600}>
                          Balance:
                        </Text>
                        <Text ta="center" {..._defaultTextProps} fw={600}>
                          {(form.values?.statement_balance_total || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </Text>
                      </div>
                    </SimpleGrid>
                  </Grid.Col>
                </Grid>

                <Space h=".2in" />

                <Grid gutter={0}>
                  <Grid.Col span={2.75} offset={6}>
                    <Text ta="right" {..._defaultTextProps} fw={600}>
                      Date of Issue :
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={3.25} ta="center">
                    <Text ta="center" {..._defaultTextProps} fw={600}>
                      {dayjs(form.values?.statement_end_date).add(1, "day").format(
                        "DD/MM/YYYY"
                      )}
                    </Text>
                  </Grid.Col>
                </Grid>

                <Space h=".1in" />

                <Grid gutter={0}>
                  <Grid.Col span={2.75} offset={6}>
                    <Text ta="right" {..._defaultTextProps} fw={600}>
                      Verified By :
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={3.25} ta="center">
                    <Text ta="center" {..._defaultTextProps} fw={600}>
                      {form.values?.statement_spokesperson} (
                      {form.values?.statement_spokesperson_post})
                    </Text>
                  </Grid.Col>
                </Grid>
              </>
            )}

            <Text
              size="12px"
              className={classes.pagenumber}
              ta="center"
              pos={"absolute"}
              style={{
                bottom: "1in",
              }}
            >
              Page {index + 1}
            </Text>
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

            <DocHeader />

            <Space h=".2in" />

            <Grid gutter={0}>
              <Grid.Col span={7.5}>
                <Text ml={120} {..._defaultTextProps} fw={600}>
                  Transaction Summary
                </Text>
              </Grid.Col>
              <Grid.Col span={4.5}>
                <SimpleGrid cols={3}>
                  <div>
                    <Text ta="center" {..._defaultTextProps} fw={600}>
                      Dr. Entries:
                    </Text>
                    <Text ta="center" {..._defaultTextProps} fw={600}>
                      {(form.values?.statement_debit_total || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                  <div>
                    <Text ta="center" {..._defaultTextProps} fw={600}>
                      Cr. Entries:
                    </Text>
                    <Text ta="center" {..._defaultTextProps} fw={600}>
                      {(form.values?.statement_credit_total || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                  <div>
                    <Text ta="center" {..._defaultTextProps} fw={600}>
                      Balance:
                    </Text>
                    <Text ta="center" {..._defaultTextProps} fw={600}>
                      {(form.values?.statement_balance_total || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                </SimpleGrid>
              </Grid.Col>
            </Grid>

            <Space h=".2in" />

            <Grid gutter={0}>
              <Grid.Col span={2.75} offset={6}>
                <Text ta="right" {..._defaultTextProps} fw={600}>
                  Date of Issue :
                </Text>
              </Grid.Col>
              <Grid.Col span={3.25} ta="center">
                <Text ta="center" {..._defaultTextProps} fw={600}>
                  {dayjs(form.values?.statement_end_date).add(1, "day").format("DD/MM/YYYY")}
                </Text>
              </Grid.Col>
            </Grid>

            <Space h=".1in" />

            <Grid gutter={0}>
              <Grid.Col span={2.75} offset={6}>
                <Text ta="right" {..._defaultTextProps} fw={600}>
                  Verified By :
                </Text>
              </Grid.Col>
              <Grid.Col span={3.25} ta="center">
                <Text ta="center" {..._defaultTextProps} fw={600}>
                  {form.values?.statement_spokesperson} (
                  {form.values?.statement_spokesperson_post})
                </Text>
              </Grid.Col>
            </Grid>
          <BankPaddingSpace position="bottom" />
          </Paper>
        )}
      </Stack>
    </>
  );
}

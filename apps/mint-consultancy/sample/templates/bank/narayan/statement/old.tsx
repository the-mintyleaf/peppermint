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
} from "@mantine/core";
//pageprops
import { configPageProps } from "../../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
//style
import classesTemplate from "../template.module.css";
import classes from "./statement.module.css";
import { table } from "console";
//templateprops

export function TemplateNarayanStatement() {
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

  const initialdetails = [
    [
      {
        label: "",
        value: "",
      },
      {
        label: "Name",
        value: details.statement_account_holder,
      },
      {
        label: "Address",
        value: details.statement_account_address,
      },

      {
        label: "A/C No.",
        value: details.statement_account_no,
      },
    ],
    [
      {
        label: "Currency",
        value: "NPR",
      },
      {
        label: "A/C Type",
        value: details.statement_account_type,
      },
      {
        label: "Int. Rate",
        value:
          String(
            Number(details.statement_interest).toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })
          ) + "%",
      },
      {
        label: "Tax Rate",
        value:
          String(
            Number(details.statement_tax).toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })
          ) + "%",
      },
      {
        label: "Period",
        value:
          details.statement_start_date + " to " + details.statement_end_date,
      },
    ],
  ];

  const _defaultTextProps = {
    size: "13px",
    lh: ".2in",
  };

  const DocHeader = () => {
    return (
      <>
        <Group justify="space-between">
          <Text {..._defaultTextProps}>
            <b>Ref No.</b>: {details.statement_ref_no}
          </Text>

          <Text {..._defaultTextProps}>
            <b>Date</b>: {details.statement_end_date}
          </Text>
        </Group>

        <Space h=".2in" />

        <div className={classes.header}>
          <Grid px={4}>
            <Grid.Col span={7}>
              {initialdetails[0].map((item: any, index: number) => (
                <Text fw={400} {..._defaultTextProps} key={index}>
                  {item.label} : {item.value}
                </Text>
              ))}
            </Grid.Col>
            <Grid.Col span={5} offset={0}>
              {initialdetails[1].map((item: any, index: number) => (
                <Text fw={400} {..._defaultTextProps} key={index} ta="right">
                  {item.label} : {item.value}
                </Text>
              ))}
            </Grid.Col>
          </Grid>
          <Space h=".2in" />
        </div>
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

          <DocHeader />

          <table className={classes.st_table}>
            <thead>
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
                    width: "2.9in",
                    textAlign: "left",
                  }}
                >
                  Particulars
                </th>
                <th
                  style={{
                    textAlign: "right",
                  }}
                >
                  Debit
                </th>
                <th
                  style={{
                    textAlign: "right",
                  }}
                >
                  Credit
                </th>
                <th
                  style={{
                    textAlign: "right",
                  }}
                >
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {details.statements
                .slice(0, 39)
                .map((item: any, index: number) => (
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
                    <td>{item.date}</td>
                    <td>{item.description}</td>
                    <td
                      style={{
                        textAlign: "right",
                      }}
                    >
                      {item.debit !== 0
                        ? item.debit.toLocaleString(undefined, {
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
                      {item.credit !== 0
                        ? item.credit.toLocaleString(undefined, {
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
                      {" "}
                      {item.balance !== 0 ? item.balance : ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <Space h=".3in" />

          <Text size="12px" className={classes.pagenumber} ta="center">
            Page 1
          </Text>
        </Paper>

        <Paper
          pos="relative"
          className={classesTemplate.root}
          py=".6in"
          px=".4in"
          {...configPageProps}
        >
          <Space h="1in" />

          <DocHeader />

          <table className={classes.st_table}>
            <thead>
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
                    width: "2.9in",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    textAlign: "right",
                  }}
                >
                  Debit
                </th>
                <th
                  style={{
                    textAlign: "right",
                  }}
                >
                  Credit
                </th>
                <th
                  style={{
                    textAlign: "right",
                  }}
                >
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {details.statements
                .slice(0, 20)
                .map((item: any, index: number) => (
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
                    <td>{item.date}</td>
                    <td>{item.description}</td>
                    <td
                      style={{
                        textAlign: "right",
                      }}
                    >
                      {item.debit !== 0
                        ? item.debit.toLocaleString(undefined, {
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
                      {item.credit !== 0
                        ? item.credit.toLocaleString(undefined, {
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
                      {" "}
                      {item.balance !== 0 ? item.balance : ""}
                    </td>
                  </tr>
                ))}

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
                <td>Date of Issue: {details.statement_end_date}</td>
                <td>{details.statement_debit_total}</td>
                <td>{details.statement_credit_total}</td>
                <td>{details.statement_balance_total}</td>
              </tr>
            </tbody>
          </table>
        </Paper>
      </Stack>
    </>
  );
}

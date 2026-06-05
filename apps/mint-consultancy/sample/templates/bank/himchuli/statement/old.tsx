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

export function TemplateHimchuliStatement() {
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
    size: "12px",
    lh: ".17in",
  };

  const DocHeader = () => (
    <>
      <tr
        className={classes.headerRow}
        style={{
          borderTop: "1px solid black",
        }}
      >
        <td
          colSpan={2}
          style={{
            border: "none",
          }}
        >
          <i>
            <Text fw={700} {..._defaultTextProps}>
              Name : {details.statement_account_holder}
            </Text>
          </i>
        </td>
        <td
          colSpan={4}
          style={{
            border: "none",
          }}
        >
          <i>
            <Text fw={700} {..._defaultTextProps} ta="right">
              Account No : {details.statement_account_no}
            </Text>
          </i>
        </td>
      </tr>

      <tr className={classes.headerRow}>
        <td
          colSpan={6}
          style={{
            border: "none",
          }}
        >
          <i>
            <Text fw={700} {..._defaultTextProps}>
              Addres : {details.statement_account_address}
            </Text>
          </i>
        </td>
      </tr>

      <tr className={classes.headerRow}>
        <td
          colSpan={2}
          style={{
            border: "none",
          }}
        >
          <i>
            <Text fw={700} {..._defaultTextProps}>
              Currency : NPR
            </Text>
          </i>
        </td>
        <td
          colSpan={1}
          style={{
            border: "none",
          }}
        >
          <i>
            <Text fw={700} {..._defaultTextProps}>
              Int Rate : {details.statement_interest}%
            </Text>
          </i>
        </td>
        <td
          colSpan={1}
          style={{
            border: "none",
          }}
        >
          <i>
            <Text ta="center" fw={700} {..._defaultTextProps}>
              Tax Rate : {details.statement_tax}%
            </Text>
          </i>
        </td>

        <td
          colSpan={2}
          style={{
            border: "none",
          }}
        >
          <i>
            <Text ta="right" fw={700} {..._defaultTextProps}>
              Account Type : {details.statement_account_type}%
            </Text>
          </i>
        </td>
      </tr>

      <tr className={classes.headerRow}>
        <td
          colSpan={6}
          style={{
            border: "none",
          }}
        >
          <i>
            <Text ta="center" fw={700} {..._defaultTextProps}>
              Statement of Account : From {details.statement_start_date} to{" "}
              {details.statement_end_date}
            </Text>
          </i>
        </td>
      </tr>
    </>
  );

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

          <i>
            <Text fw={700} {..._defaultTextProps} ta="right">
              Date : {details.statement_end_date}
            </Text>
          </i>

          <Space h=".2in" />

          <table className={classes.st_table}>
            <DocHeader />

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
                  width: "2.4in",
                }}
              >
                Description
              </th>
              <th
                style={{
                  textAlign: "right",
                  width: "1in",
                }}
              >
                Cheque No.
              </th>
              <th
                style={{
                  textAlign: "right",
                  width: "1in",
                }}
              >
                Debit
              </th>
              <th
                style={{
                  textAlign: "right",
                  width: "1in",
                }}
              >
                Credit
              </th>
              <th
                style={{
                  textAlign: "right",
                  width: "1in",
                }}
              >
                Balance
              </th>
            </tr>

            {details.statements.map((item: any, index: number) => (
              <tr
                key={index}
                style={{
                  fontWeight: _boldTriggers.includes(
                    item.description.toLowerCase()
                  )
                    ? 700
                    : "",
                }}
              >
                <td>{item.date}</td>
                <td>{item.description}</td>
                <td style={{ textAlign: "right" }}>{item.cheque}</td>
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
          </table>
        </Paper>

        <Paper
          pos="relative"
          className={classesTemplate.root}
          py=".6in"
          px=".4in"
          {...configPageProps}
        >
          <i>
            <Text fw={700} {..._defaultTextProps} ta="right">
              Date : {details.statement_end_date}
            </Text>
          </i>

          <Space h=".2in" />

          <table className={classes.st_table}>
            <DocHeader />

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
                  width: "2.3in",
                }}
              >
                Particulars
              </th>
              <th
                style={{
                  textAlign: "right",
                }}
              >
                Cheque No.
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

            {details.statements.slice(0, 20).map((item: any, index: number) => (
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
                <td>{item.cheque}</td>
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
                height: ".4in",
                border: "none",
              }}
            ></tr>

            <tr>
              <td
                colSpan={6}
                style={{
                  fontWeight: 700,
                  textAlign: "center",
                  textTransform: "none",
                }}
              >
                <Text fw={900} {..._defaultTextProps}>
                  Transaction Summary
                </Text>
              </td>
            </tr>
            <tr
              style={{
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              <td
                colSpan={3}
                style={{
                  fontWeight: 800,
                }}
              >
                Balance Forwardrd
              </td>
              <td
                style={{
                  fontWeight: 800,
                }}
              >
                Dr. Entries
              </td>
              <td
                style={{
                  fontWeight: 800,
                }}
              >
                Cr. Entries
              </td>
              <td
                style={{
                  fontWeight: 800,
                }}
              >
                Balance
              </td>
            </tr>
            <tr
              style={{
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <td colSpan={3}>Date of Issue: {details.statement_end_date}</td>
              <td>{details.statement_debit_total}</td>
              <td>{details.statement_credit_total}</td>
              <td>{details.statement_balance_total}</td>
            </tr>
          </table>

          <Space h=".4in" />

          <div
            style={{
              display: "block",
              width: "100%",
              border: "1px solid black",
            }}
          >
            <Text {..._defaultTextProps} ta="center">
              It is understood and agreed that unless we recieve notice in
              writing of any exception or objection on your part in respect to
              the contents of this stateent within fifteen (15) days from the
              date thereof it is seemed to be correct and final.
            </Text>
          </div>
        </Paper>
      </Stack>
    </>
  );
}

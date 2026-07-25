"use client";

import { useContext } from "react";
//mantine
import {
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
import classes from "./certificate.module.css";
import { FormHandler } from "@/components/framework/FormHandler";
import { dayjs } from "@peppermint/ui";
//templateprops

export function TemplateHimchuliCertificate() {
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

  // * MISC

  const _defaultTextProps = {
    size: "14px",
    lh: ".17in",
  };

  const applicantDetails: any[] = [
    {
      label: "Name of the Account Holder",
      value: form.values?.statement_account_holder,
    },
    {
      label: "Address",
      value: form.values?.statement_account_address,
    },
    {
      label: "Account Type",
      value: form.values?.statement_account_type,
    },
    {
      label: "Account No.",
      value: form.values?.statement_account_no,
    },
    {
      label: "Interest Rate",
      value: `${form.values?.statement_interest}%`,
    },
    {
      label: "Interest Post",
      value: form.values?.statement_interest_post,
    },
    {
      label: "Interest Calculation",
      value: form.values?.statement_interest_method,
    },
    {
      label: "Tax Rate",
      value: `${form.values?.statement_tax}%`,
    },
    {
      label: "Current Balance",
      value: (form.values?.statement_total_balance || 0).toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      ),
    },
    {
      label: "Currency",
      value: "NPR",
    },
    {
      label: "In Words",
      value: form.values?.statement_total_balance_words,
    },
    {
      label: "Which is equivalent to",
      value:
        "US $ " +
        (
          form.values?.statement_balance_total_number /
          form.values?.statement_usdrate
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      label: "Exchange Rate",
      value:
        "1 USD $ = NPR " +
        form.values?.statement_usdrate?.toFixed(2).toLocaleString("en-US"),
    },
  ];

  return (
    <>
      <Paper p="1in" className={classesTemplate.root} {...configPageProps}>
        <BankPaddingSpace position="top" />

        <Group justify="space-between">
          <i>
            <Text {..._defaultTextProps}>
              <b>Ref. No.</b>: {form.values?.statement_ref_no}
            </Text>
          </i>
          <i>
            <Text {..._defaultTextProps}>
              <b>Date of Issue</b>:{" "}
              {dayjs(form.values?.statement_end_date)
                .add(1, "day")
                .format("YYYY/MM/DD")}
            </Text>
          </i>
        </Group>

        <Space h=".5in" />

        <Text
          lh=".3in"
          ta="center"
          size="xl"
          tt="capitalize"
          td="underline"
          fw={700}
        >
          Balance Certificate
          <br />
          To Whom it May Concern
        </Text>

        <Space h=".6in" />

        <Text {..._defaultTextProps} ta="justify">
          This is to certify that under mentioned an account maintained with us.
          Details of account are as follows.
        </Text>

        <Space h=".3in" />

        <table className={classes.table}>
          <tbody>
            {applicantDetails.map((data: any, index: number) => (
              <tr key={index}>
                <td>
                  <Text ta="left" {..._defaultTextProps} w={200}>
                    {data.label}
                  </Text>
                </td>
                <td>
                  <Text ta="left" {..._defaultTextProps} w={20}>
                    :
                  </Text>
                </td>
                <td>
                  <Text w={300} {..._defaultTextProps}>
                    {data.value}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Space h=".5in" />

        <Text {..._defaultTextProps} pr=".5in" ta="justify">
          This certificate has been issued on the request of the account holder
          without any obligation to the part of the co-operative officials.
        </Text>

        <Space h="1in" />

        <Stack gap={0}>
          <div
            style={{
              display: "block",
              width: "150px",
              borderBottom: "2px dotted black",
              marginBottom: ".01in",
            }}
          />

          <Text {..._defaultTextProps} mt=".1in">
            {form.values?.statement_spokesperson}
          </Text>
          <Text {..._defaultTextProps}>
            {form.values?.statement_spokesperson_post}
          </Text>
        </Stack>
        <BankPaddingSpace position="bottom" />
      </Paper>
    </>
  );
}

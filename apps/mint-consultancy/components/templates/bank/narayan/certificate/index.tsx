/* eslint-disable react/no-unescaped-entities */
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
} from "@zetsel/ui";
//pageprops
import { configPageProps } from "../../../templateprops";
//context
import { ContextEditor } from "@/components/layout/editor/editor.context";
import { BankPaddingSpace } from "@/components/templates/bank/BankPaddingSpace";
//style
import classesTemplate from "../template.module.css";
import classes from "./certificate.module.css";
import { dayjs } from "@zetsel/ui";
import { FormHandler } from "@/components/framework/FormHandler";
//templateprops

export function TemplateNarayanCertificate() {
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
    size: "15px",
    lh: ".17in",
    fw: 400,
  };

  const applicantDetails: any[] = [
    {
      label: "Name",
      value: form.values?.statement_account_holder,
    },
    {
      label: "Address",
      value: form.values?.statement_account_address,
    },
    {
      label: "A/c Type",
      value: form.values?.statement_account_type,
    },
    {
      label: "A/c No.",
      value: form.values?.statement_account_no,
    },
    {
      label: "Int. Rate",
      value: `${form.values?.statement_interest}%`,
    },
    {
      label: "Tax Rate",
      value: `${form.values?.statement_tax}%`,
    },

    {
      label: "Currency",
      value: "NPR",
    },
    {
      label: "Total Credit Balance in NPR.",
      value: (form.values?.statement_total_balance || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    {
      label: "[In words NPR.]",
      value: form.values?.statement_total_balance_words,
    },
    {
      label: "Total Credit Balance in USD.",
      value: (
        form.values?.statement_balance_total_number /
        form.values?.statement_usdrate
      ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    {
      label: "[In words USD]",
      value: form.values?.statement_total_balance_words_usd,
    },
  ];

  return (
    <>
      <Paper p=".9in" className={classesTemplate.root} {...configPageProps}>
        <BankPaddingSpace position="top" />

        <Group justify="space-between">
          <Text {..._defaultTextProps}>
            <b>Ref. No.</b>: {form.values?.statement_ref_no}
          </Text>
          <Text {..._defaultTextProps}>
            <b>Date </b>:{" "}
            {dayjs(form.values?.statement_end_date)
              .add(1, "day")
              .format("YYYY-MM-DD")}
          </Text>
        </Group>

        <Space h="1in" />

        <Text
          {..._defaultTextProps}
          lh=".3in"
          ta="center"
          tt="uppercase"
          td="underline"
          fw={700}
          size="lg"
        >
          Balance Certificate
          <br />
          To Whom SO EVER it May Concern
        </Text>

        <Space h=".5in" />

        <Text {..._defaultTextProps} ta="justify">
          This is to certify that the balance in the credit of the under
          mentioned account holder is
          mentioned below:
        </Text>

        <Space h=".3in" />

        <table className={classes.table}>
          <tbody>
            {applicantDetails?.map((data: any, index: number) => (
              <tr key={index} style={{ height: 23 }}>
                <td>
                  <Text w={200} {..._defaultTextProps}>
                    {data.label}:
                  </Text>
                </td>
                <td>
                  <Text w={300} {..._defaultTextProps} fw={600}>
                    {data.value}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Space h=".3in" />

        <Text {..._defaultTextProps} fw={600}>
          Today&apos;s exchange rate is 1 USD equivalent to NPR{" "}
          {form.values?.statement_usdrate?.toFixed(2).toLocaleString("en-US")}
        </Text>

        <Space h=".3in" />

        <Text {..._defaultTextProps} pr=".5in" ta="justify">
          This letter is issued upon the request of account holder and this
          co-operative holds no liability in future on the co-operative or any
          of its officer.
        </Text>

        <Space h="1in" />

        <Stack gap={0}>
          <div
            style={{
              width: 200,
              display: "block",

              borderBottom: "2px dotted black",
              marginBottom: ".01in",
            }}
          />

          <Text {..._defaultTextProps} mt=".1in">
            {form.values?.statement_spokesperson}
          </Text>
          <Text {..._defaultTextProps} fw={600}>
            {form.values?.statement_spokesperson_post}
          </Text>
        </Stack>
      <BankPaddingSpace position="bottom" />
      </Paper>
    </>
  );
}

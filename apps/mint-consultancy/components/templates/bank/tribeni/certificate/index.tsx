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

export function TemplateTribeniCertificate() {
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
    size: "16px",
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
      label: "A/C Number",
      value: form.values?.statement_account_no,
    },

    {
      label: "Interest Rate",
      value: `${form.values?.statement_interest}%`,
    },
    {
      label: "A/C Type",
      value: form.values?.statement_account_type,
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
      label: "Has balance of",
      value:
        "NPR " +
        (form.values?.statement_total_balance || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      label: "In words",
      value: form.values?.statement_total_balance_words,
    },
    {
      label: "Has balance of",
      value:
        "USD " +
        (
          form.values?.statement_balance_total_number /
          form.values?.statement_usdrate
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
  ];

  return (
    <>
      <Paper p="1in" className={classesTemplate.root} {...configPageProps}>
        <BankPaddingSpace position="top" />

        <Group justify="space-between">
          <Text {..._defaultTextProps}>
            <b>Reference No.</b> : {form.values?.statement_ref_no}
          </Text>

          <Text {..._defaultTextProps}>
            <b>Date</b> :{" "}
            {dayjs(form.values?.statement_end_date, "DD/MM/YYYY")
              .add(1, "day")
              .format("YYYY/MM/DD")}
          </Text>
        </Group>

        <Space h="1in" />

        <Text
          {..._defaultTextProps}
          size="24px"
          lh=".2in"
          ta="center"
          td="underline"
          fw={600}
        >
          BALANCE CERTIFICATE
          <br /> <br />
          To Whom it May Concern
        </Text>

        <Space h=".6in" />

        <Text {..._defaultTextProps} lh=".25in">
          This is to certify that account holder as mentioned below:
        </Text>

        <Space h=".3in" />

        <table className={classes.table}>
          <tbody>
            {applicantDetails?.map((data: any, index: number) => (
              <tr
                key={index}
                style={{
                  height: 24,
                }}
              >
                <td>
                  <Text ta="left" {..._defaultTextProps} w={200}>
                    {data.label}
                  </Text>
                </td>
                <td>
                  <Text ta="left" {..._defaultTextProps}>
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
        <Text {..._defaultTextProps} lh=".2in">
          As per today's currency exchange of 1 USD equivalent to NPR{" "}
          {form.values?.statement_usdrate?.toFixed(2).toLocaleString("en-US")}
        </Text>

        <Space h=".1in" />

        <Text {..._defaultTextProps} lh=".2in">
          Without incurring any responsibility on the part of the co-operative
          and its representatives. This certificate has been issued at the
          request of the aforementioned account holder.
        </Text>

        <Space h="1in" />

        <Group justify="flex-end">
          <div>
            <Group justify="flex-end">
              <div
                style={{
                  display: "block",
                  width: "150px",
                  borderBottom: "2px dotted black",
                  marginBottom: ".01in",
                }}
              />
            </Group>

            <Text {..._defaultTextProps} fw={600} ta="right" mt=".1in">
              {form.values?.statement_spokesperson}
            </Text>
            <Text {..._defaultTextProps} ta="right">
              {form.values?.statement_spokesperson_post}
            </Text>
          </div>
        </Group>
      <BankPaddingSpace position="bottom" />
      </Paper>
    </>
  );
}

"use client";

import { useContext, useEffect } from "react";
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
import classes from "./certificate.module.css";
import dayjs from "dayjs";
import { FormHandler } from "@/components/framework/FormHandler";
//templateprops

export function TemplateVyasertificate() {
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
      label: "Account Number",
      value: form.values?.statement_account_no,
    },

    {
      label: "Account Type",
      value: form.values?.statement_account_type,
    },
    {
      label: "Account Currency",
      value: "NPR",
    },

    {
      label: "Interest Rate",
      value: `${form.values?.statement_interest}%`,
    },
    {
      label: "Tax Rate",
      value: `${form.values?.statement_tax}%`,
    },
  ];

  return (
    <>
      <Paper p="1in" className={classesTemplate.root} {...configPageProps}>
        <Space h={state?.headerProps?.height + "in" || "1in"} />

        <Group justify="space-between">
          <Text {..._defaultTextProps}>
            Ref. No. : {form.values?.statement_ref_no}
          </Text>

          <Text {..._defaultTextProps}>
            Print Date :{" "}
            {dayjs(form.values?.statement_end_date, "YYYY/MM/DD")
              .add(1, "day")
              .format("YYYY-MM-DD")}
          </Text>
        </Group>

        <Space h=".5in" />

        <Text
          lh=".3in"
          ta="center"
          size="22px"
          tt="capitalize"
          td="underline"
          fw={700}
        >
          BALANCE CERTIFICATE
          <br />
          To Whom it May Concern
        </Text>
        <Space h=".65in" />

        <Text {..._defaultTextProps} lh=".25in" ta="justify">
          This is to certify that <b>{form.values?.statement_account_holder}</b>
          , the resident of <b>{form.values?.statement_account_address}</b> is
          the account holder of this co-operative limited. The details are as
          follows:
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
                  <Text ta="left" {..._defaultTextProps} w={40}>
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

        <Space h=".3in" />

        <Text {..._defaultTextProps} lh=".25in">
          Has the balance of <b>NPR {(form.values?.statement_total_balance || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</b>
        </Text>

        <Space h=".2in" />

        <Text {..._defaultTextProps} lh=".25in">
          {form.values?.statement_total_balance_words}
        </Text>

        <Space h=".1in" />

        <Text {..._defaultTextProps} lh=".25in">
          Equivalent to US${" "}
          {(
            form.values?.statement_balance_total_number /
            form.values?.statement_usdrate
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Space h=".1in" />

        <Text {..._defaultTextProps} lh=".25in">
          At the prevailing exchange rate of USD 1 = NPR{" "}
          {form.values?.statement_usdrate?.toFixed(2).toLocaleString("en-US")}
        </Text>

        <Space h=".1in" />

        <Text {..._defaultTextProps} pr=".5in">
          This certificate has been issued on the request of the account holder
          without any obligation to the part of the co-operative.
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

          <Text {..._defaultTextProps} ta="left" mt=".1in" fw={700}>
            {form.values?.statement_spokesperson}
          </Text>
          <Text {..._defaultTextProps} ta="left">
            {form.values?.statement_spokesperson_post}
          </Text>
        </Stack>
      </Paper>
    </>
  );
}

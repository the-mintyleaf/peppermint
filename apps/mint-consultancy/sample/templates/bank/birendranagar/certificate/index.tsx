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

export function TemplateBirendranagarCertificate() {
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
      label: "Account Holder",
      value: form.values?.statement_account_holder,
    },
    {
      label: "Address",
      value: form.values?.statement_account_address,
    },
    {
      label: "Account Number",
      value: form.values?.statement_account_no,
    },

    {
      label: "Account Type",
      value: form.values?.statement_account_type,
    },
    {
      label: "Interest Rate",
      value: `${form.values?.statement_interest}%`,
    },
    {
      label: "Tax Rate",
      value: `${form.values?.statement_tax}%`,
    },
    {
      label: "Account Currency",
      value: "NPR",
    },
    {
      label: "Current Balance",
      value: (form.values?.statement_total_balance || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
    {
      label: "Equivalent USD",
      value: (
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
        <Space h={state?.headerProps?.height + "in" || "1in"} />

        <Group justify="space-between">
          <Text {..._defaultTextProps}>
            <b>Reference No.</b> : {form.values?.statement_ref_no}
          </Text>

          <Text {..._defaultTextProps}>
            <b>Date</b> :{" "}
            {dayjs(form.values?.statement_end_date)
              .add(1, "day")
              .format("YYYY/MM/DD")}
          </Text>
        </Group>

        <Space h=".8in" />

        <Text
          {..._defaultTextProps}
          lh=".3in"
          ta="center"
          tt="uppercase"
          td="underline"
          fw={700}
          size="20px"
        >
          BALANCE CERTIFICATE
          <br /> To Whom it May Concern
        </Text>

        <Space h=".4in" />

        <Text {..._defaultTextProps} lh=".25in" tt="uppercase">
          This is to certify that our customer has following details:_
        </Text>

        <Space h=".3in" />

        <table className={classes.table}>
          <tbody>
            {applicantDetails?.map((data: any, index: number) => (
              <tr key={index}>
                <td>
                  <Text
                    tt="uppercase"
                    ta="left"
                    {..._defaultTextProps}
                    w={200}
                    fw={700}
                  >
                    {data.label}
                  </Text>
                </td>
                <td>
                  <Text ta="left" {..._defaultTextProps} w={40}>
                    :
                  </Text>
                </td>
                <td>
                  <Text tt="uppercase" w={300} {..._defaultTextProps}>
                    {data.value}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Space h=".3in" />

        <Text {..._defaultTextProps} lh=".2in" tt="uppercase">
          At the prevailing exchange rate of USD 1 = NPR{" "}
          {form.values?.statement_usdrate?.toFixed(2).toLocaleString("en-US")}
        </Text>
        <Text {..._defaultTextProps} lh=".2in" tt="uppercase">
          <b>in words:</b> {form.values?.statement_total_balance_words}
        </Text>

        <Space h=".3in" />

        <Text {..._defaultTextProps} lh=".2in" tt="uppercase" ta="justify">
          This certificate has been issued on the request of the account holder
          without any liability on the part of the bank or its officials.
        </Text>

        <Space h="1in" />

        <Stack w={150} gap={0}>
          <div
            style={{
              display: "block",
              width: "100%",
              borderBottom: "2px dotted black",
              marginBottom: ".01in",
            }}
          />
          <Text {..._defaultTextProps} ta="center" mt=".1in">
            {form.values?.statement_spokesperson}
          </Text>
          <Text {..._defaultTextProps} ta="center">
            {form.values?.statement_spokesperson_post}
          </Text>
        </Stack>
      </Paper>
    </>
  );
}
